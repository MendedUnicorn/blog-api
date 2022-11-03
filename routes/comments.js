const router = require('express').Router({ mergeParams: true });
const comments = require('../controllers/commentController');

// POST new comment
router.post('/', comments.post_comment);
// GET all comments on post
router.get('/', comments.get_comments);
// GET one comment no post
router.get('/:commentid', comments.get_comment);

module.exports = router;
