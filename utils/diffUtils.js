const { diff_match_patch } = require('diff-match-patch');
const dmp = new diff_match_patch();

function generatePatch(original, updated) {
    const diffs = dmp.diff_main(original, updated);
    dmp.diff_cleanupSemantic(diffs);
    return dmp.patch_toText(dmp.patch_make(diffs));
}

function applyPatch(original, patchText) {
    const patches = dmp.patch_fromText(patchText);
    const [result] = dmp.patch_apply(patches, original);
    return result;
}

// Article version storage optimization
async function storeArticleVersion(articleId, patch) {
    await db.articleVersions.create({
        data: {
            article_id: articleId,
            patch,
            created_at: new Date()
        }
    });
} 