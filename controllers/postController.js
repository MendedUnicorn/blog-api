const Post = require('../models/post');
const { body, validationResult } = require('express-validator');
const async = require('async');
const Comment = require('../models/comment');
const jwt = require('jsonwebtoken');
// Get all posts
const get_posts_get = (req, res, next) => {
  //
};

exports.post_post = [
  // Sanetize
  //body('user').trim().isLength({ min: 2, max: 20 }).escape(),
  body('title').trim().isLength({ min: 2, max: 100 }).escape(),
  body('text').trim().isLength({ min: 10, max: 10000 }).escape(),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(errors);
    }
    // Retrieve ID from token in header and assign as poster
    const id = jwt.verify(
      req.headers.authorization.split(' ')[1],
      process.env.SECRET_KEY
    ).sub;
    const newPost = new Post({
      user: id,
      title: req.body.title,
      text: req.body.text,
      published: req.body.published,
    });
    newPost.save((err, data) => {
      if (err) {
        return next(err);
      }

      res.json(`Post created successfully: ${data}`);
    });
  },
];

exports.get_posts = async (req, res, next) => {
  // Post.find()
  //   .populate('user')
  //   .exec((err, data) => {
  //     if (err) {
  //       return next(err);
  //     }
  //     data.forEach((post) => {
  //       console.log('p cnt', post.comment_count);
  //     });
  //     res.json(data);
  //   });
  const posts = await Post.aggregate([
    {
      $lookup: {
        from: 'comments',
        let: { post: '$_id' },
        pipeline: [{ $match: { $expr: { $eq: ['$$post', '$post'] } } }],
        as: 'comment_count',
      },
    },
    { $addFields: { comment_count: { $size: '$comment_count' } } },
  ]);
  const p = await Post.populate(posts, 'user');
  res.json(posts);
};

exports.get_post = (req, res, next) => {
  async.series(
    [
      function (cb) {
        Post.findById(req.params.postid).populate('user').lean().exec(cb);
      },
      function (cb) {
        Comment.find({ post: req.params.postid })
          .countDocuments()
          .lean()
          .exec(cb);
      },
    ],
    (err, result) => {
      if (err) return next(err);
      res.json({ ...result[0], count: result[1] });
    }
  );
};

exports.update_post = [
  async (req, res, next) => {
    try {
      const data = await Post.findById(req.params.postid);
      req.body.title = req.body.title || data.title;
      req.body.text = req.body.text || data.text;
      req.body.published = req.body.published || data.published;
      next();
    } catch (err) {
      return next(err);
    }
  },
  body('title').trim().isLength({ min: 2, max: 100 }).escape(),
  body('text').trim().isLength({ min: 10, max: 10000 }).escape(),

  async (req, res, next) => {
    const errors = validationResult(req);
    const updatedPost = new Post({
      user: '635fc74a0756de7dad44b796',
      title: req.body.title,
      text: req.body.text,
      published: req.body.published,
      _id: req.params.postid,
    });
    console.log('updatepsot', updatedPost);

    if (!errors.isEmpty()) {
      console.log(errors);
      return next(errors);
    }
    Post.findByIdAndUpdate(req.params.postid, updatedPost, (err, data) => {
      if (err) {
        return next(err);
      }
      res.json(`Document has been updated to: ${data}`);
    });
  },
];

exports.delete_post = (req, res, next) => {
  Post.findByIdAndDelete(req.params.postid, (err, data) => {
    if (err) {
      return next(err);
    }
    res.json(`The following document has been deleted ${data}`);
  });
};
