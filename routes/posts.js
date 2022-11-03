const router = require('express').Router();
const posts = require('../controllers/postController');
const authenticate = require('../passport').authenticate;

// POST a new post
router.post('/', authenticate, posts.post_post);
// GET all posts
router.get('/', posts.get_posts);
// GET single post
router.get('/:postid', posts.get_post);
// Update signle post
router.put('/:postid', authenticate, posts.update_post);
// DELETE single post
router.delete('/:postid', authenticate, posts.delete_post);

module.exports = router;
