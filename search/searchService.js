const { Client } = require('@elastic/elasticsearch');
const client = new Client({ node: process.env.ES_URL });

// Initialize index mapping
async function initElasticSearch() {
    const indexExists = await client.indices.exists({ index: 'cosserary' });
    
    if (!indexExists) {
        await client.indices.create({
            index: 'cosserary',
            body: {
                mappings: {
                    properties: {
                        term: { type: 'text', analyzer: 'english' },
                        definition: { type: 'text', analyzer: 'english' },
                        category: { type: 'keyword' },
                        related_articles: { type: 'keyword' },
                        slug: { type: 'keyword' },
                        created_at: { type: 'date' }
                    }
                }
            }
        });
    }
}

async function indexTerm(term) {
    try {
        await client.index({
            index: 'cosserary',
            id: term.term_id,
            body: {
                term: term.term,
                definition: term.definition,
                category: term.category,
                related_articles: term.related_articles,
                slug: term.slug,
                created_at: term.created_at
            },
            refresh: true
        });
    } catch (error) {
        console.error('ElasticSearch indexing error:', error);
        throw new SearchError('Failed to index term');
    }
}

async function searchTerms(query) {
    try {
        const { body } = await client.search({
            index: 'cosserary',
            body: {
                query: {
                    multi_match: {
                        query,
                        fields: ['term^3', 'definition', 'category'],
                        fuzziness: 'AUTO',
                        operator: 'and'
                    }
                },
                highlight: {
                    fields: {
                        definition: {},
                        term: {}
                    }
                }
            }
        });

        return body.hits.hits.map(hit => ({
            id: hit._id,
            ...hit._source,
            highlights: hit.highlight
        }));
    } catch (error) {
        console.error('ElasticSearch query error:', error);
        throw new SearchError('Search failed');
    }
}

// Database sync hook (connect to your ORM)
db.terms.$use(async (params, next) => {
    const result = await next(params);
    
    if (params.action === 'create' || params.action === 'update') {
        if (Array.isArray(result)) {
            await Promise.all(result.map(term => indexTerm(term)));
        } else {
            await indexTerm(result);
        }
    }
    
    return result;
});

module.exports = {
    initElasticSearch,
    searchTerms,
    indexTerm
}; 