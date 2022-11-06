const router = require('express').Router({ mergeParams: true });
const comments = require('../controllers/commentController');
const authenticate = require('../passport').authenticate;

// POST new comment
router.post('/', comments.post_comment);
// GET all comments on post
router.get('/', comments.get_comments);
// GET one comment no post
router.get('/:commentid', comments.get_comment);
// UPDATE a comment - set it to be removed or not
router.put('/:commentid', authenticate, comments.update_comment);
// DELETE a comment
router.delete('/:commentid', authenticate, comments.delete_comment);

module.exports = router;
