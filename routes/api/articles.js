// Article versioning middleware
router.post('/articles', authMiddleware, async (req, res) => {
    try {
        const { title, content, document_type, classification_level, object_class, tags } = req.body;

        // Validate required fields
        if (!title || !content || !document_type) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Validate user's classification level
        if (classification_level > req.user.classification_level) {
            return res.status(403).json({ 
                error: 'Cannot create content above your classification level' 
            });
        }

        // Process glossary terms
        const { processedContent, glossaryTerms } = await processGlossaryTerms(
            content,
            req.user.classification_level
        );

        // Create new article
        const newArticle = await db.articles.create({
            data: {
                title,
                content,
                content_html: processedContent,
                document_type,
                classification_level: classification_level || 1,
                object_class: object_class || 'STANDARD',
                author_id: req.user.id,
                status: 'Draft',
                glossary_terms: glossaryTerms,
                tags: tags || [],
                version_number: 1,
                is_current_version: true
            }
        });

        // Update term relationships
        if (glossaryTerms.length > 0) {
            await db.$transaction(
                glossaryTerms.map(termId =>
                    db.terms.update({
                        where: { term_id: termId },
                        data: { 
                            related_articles: {
                                push: newArticle.article_id
                            }
                        }
                    })
                )
            );
        }

        // Return the new article
        res.status(201).json({
            ...newArticle,
            author: {
                username: req.user.username,
                classification_level: req.user.classification_level
            }
        });
    } catch (error) {
        handleServerError(res, error);
    }
});

// Flag submission endpoint
router.post('/articles/:id/flags', authMiddleware, async (req, res) => {
    const { startOffset, endOffset, flagType, comment } = req.body;
    
    // Validate text selection bounds
    const article = await db.articles.findUnique({ 
        where: { article_id: req.params.id },
        select: { content: true }
    });
    
    if(endOffset > article.content.length) {
        return res.status(400).json({ error: 'Invalid text selection' });
    }
    
    const newFlag = await db.flags.create({
        data: {
            article_id: req.params.id,
            user_id: req.user.id,
            start_offset: startOffset,
            end_offset: endOffset,
            flag_type: flagType,
            comment: comment
        }
    });
    
    res.status(201).json(newFlag);
});

// Glossary processing utility
async function processGlossaryTerms(content, userLevel) {
    const glossaryTerms = await db.terms.findMany({
        where: { is_glossary_term: true }
    });
    
    let processedContent = content;
    const matchedTerms = [];
    
    glossaryTerms.forEach(term => {
        const regex = new RegExp(`\\b${term.term}\\b`, 'gi');
        processedContent = processedContent.replace(regex, (match) => {
            matchedTerms.push(term.term_id);
            return `<a href="/glossary/${term.slug}" class="glossary-term" 
                     data-term="${term.term_id}">${match}</a>`;
        });
    });
    
    return {
        processedContent,
        glossaryTerms: [...new Set(matchedTerms)] // Deduplicate
    };
}

router.get('/recent', async (req, res) => {
  try {
    const articles = await db.articles.findMany({
      take: 3,
      orderBy: { created_at: 'desc' },
      where: { status: 'Approved' }
    });
    res.json(articles);
  } catch (error) {
    handleServerError(res, error);
  }
});

router.post('/flags/:id/vote', authMiddleware, async (req, res) => {
    const { vote } = req.body;
    
    const existingVote = await db.flag_votes.findUnique({
        where: {
            flag_id_user_id: {
                flag_id: req.params.id,
                user_id: req.user.id
            }
        }
    });

    // Update net votes calculation
    const updateFlag = async (voteDiff) => {
        await db.flags.update({
            where: { flag_id: req.params.id },
            data: { net_votes: { increment: voteDiff } }
        });
    };

    if(existingVote) {
        if(existingVote.vote !== vote) {
            await updateFlag(vote === 1 ? 2 : -2);
            await db.flag_votes.update({
                where: { vote_id: existingVote.vote_id },
                data: { vote }
            });
        }
    } else {
        await updateFlag(vote);
        await db.flag_votes.create({
            data: {
                flag_id: req.params.id,
                user_id: req.user.id,
                vote
            }
        });
    }

    // Auto-approval/rejection logic
    const updatedFlag = await db.flags.findUnique({
        where: { flag_id: req.params.id }
    });

    if(updatedFlag.net_votes >= 5) {
        await db.flags.update({
            where: { flag_id: req.params.id },
            data: { resolved: true, approved: true }
        });
    } else if(updatedFlag.net_votes <= -3) {
        await db.flags.update({
            where: { flag_id: req.params.id },
            data: { resolved: true, approved: false }
        });
    }

    res.json(updatedFlag);
});

const APPROVAL_THRESHOLD = 10;
const REJECTION_THRESHOLD = -5;

router.post('/articles/:id/review', authMiddleware, async (req, res) => {
    const article = await db.articles.findUnique({
        where: { article_id: req.params.id },
        include: { flags: true }
    });

    const unresolvedFlags = article.flags.filter(f => !f.resolved);
    if(unresolvedFlags.length > 0) {
        return res.status(400).json({
            error: "All flags must be resolved before final approval"
        });
    }

    const score = article.approval_score + (req.body.approve ? 1 : -1);
    const community_approved = score >= APPROVAL_THRESHOLD;

    if(score <= REJECTION_THRESHOLD) {
        await db.articles.update({
            where: { article_id: req.params.id },
            data: { status: 'Archived' }
        });
    }

    const updatedArticle = await db.articles.update({
        where: { article_id: req.params.id },
        data: { 
            approval_score: score,
            community_approved,
            status: community_approved ? 'Approved' : 'Waiting Review'
        }
    });

    res.json(updatedArticle);
});

// Get single article with related data
router.get('/articles/:id', async (req, res) => {
    try {
        const article = await db.articles.findUnique({
            where: { 
                article_id: req.params.id,
                is_current_version: true
            },
            include: {
                author: {
                    select: {
                        username: true,
                        classification_level: true
                    }
                },
                flags: {
                    include: {
                        user: {
                            select: {
                                username: true
                            }
                        },
                        votes: true
                    }
                }
            }
        });

        if (!article) {
            return res.status(404).json({ error: 'Article not found' });
        }

        // Get related terms
        const relatedTerms = await db.terms.findMany({
            where: {
                term_id: {
                    in: article.glossary_terms
                }
            },
            select: {
                term_id: true,
                term: true,
                slug: true,
                category: true
            }
        });

        // Get comments/flags that have been approved
        const approvedFlags = article.flags.filter(flag => flag.approved);

        res.json({
            ...article,
            relatedTerms,
            comments: approvedFlags.map(flag => ({
                id: flag.flag_id,
                user: flag.user.username,
                date: flag.created_at,
                content: flag.comment,
                classification: `Level ${flag.user.classification_level}`,
                net_votes: flag.net_votes
            }))
        });
    } catch (error) {
        handleServerError(res, error);
    }
}); 