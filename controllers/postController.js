const Post = require('../models/post');
const { body, validationResult } = require('express-validator');
const async = require('async');
const Comment = require('../models/comment');
const jwt = require('jsonwebtoken');
const { castObject } = require('../models/user');
const { json } = require('express');
const validator = require('validator');

// Get all posts
const get_posts_get = (req, res, next) => {
  //
};

exports.post_post = [
  // Sanetize
  //body('user').trim().isLength({ min: 2, max: 20 }).escape(),
  body('title', 'You need to use more than 2 characters')
    .trim()
    .isLength({ min: 2, max: 100 })
    .escape(),
  body('text', 'You need to use more than 10 characters')
    .trim()
    .isLength({ min: 10, max: 10000 })
    .escape(),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log(errors.array()[0]);
      return res.status(303).json(errors.array()[0]);
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
  await Post.populate(posts, 'user');

  // Check if person sending request was logged in - valid jwt token
  try {
    jwt.verify(req.headers.authorization.split(' ')[1], process.env.SECRET_KEY);
    const unescapedPosts = posts.map((post) => {
      const p = validator.unescape(post.text);
      return { ...post, text: p };
    });
    console.log('unescaped', unescapedPosts);
    res.json(unescapedPosts);
  } catch (err) {
    console.log('not auth');
    const filteredPosts = posts.filter((post) => post.published);
    const unescapedPosts = filteredPosts.map((post) => {
      const p = validator.unescape(post.text);
      return { ...post, text: p };
    });

    res.json(unescapedPosts);
  }
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
      res.json({
        ...result[0],
        text: validator.unescape(result[0].text),
        count: result[1],
      });
    }
  );
};

exports.update_post = [
  async (req, res, next) => {
    console.log('the req', req.body);
    try {
      const data = await Post.findById(req.params.postid);
      req.body.title = req.body.title || data.title;
      req.body.text = req.body.text || data.text;
      req.body.published = req.body.published ?? data.published;
      console.log('assigned req', req.body);
      next();
    } catch (err) {
      return next(err);
    }
  },
  body('title').trim().isLength({ min: 2, max: 100 }).escape(),
  body('text').trim().isLength({ min: 10, max: 10000 }).escape(),

  async (req, res, next) => {
    // Retrieve ID from token in header and assign as poster
    const id = jwt.verify(
      req.headers.authorization.split(' ')[1],
      process.env.SECRET_KEY
    ).sub;
    const errors = validationResult(req);
    const updatedPost = new Post({
      user: id,
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
    Post.findByIdAndUpdate(
      req.params.postid,
      updatedPost,
      { new: true },
      (err, data) => {
        if (err) {
          return next(err);
        }
        res.json(data);
      }
    );
  },
];

exports.delete_post = (req, res, next) => {
  async.parallel(
    {
      postDelete: function (cb) {
        Post.findByIdAndDelete(req.params.postid, { new: true }, cb);
      },
      commentsDelete: function (cb) {
        Comment.deleteMany({ post: req.params.postid }, cb);
      },
    },
    (err, data) => {
      if (err) {
        return next(err);
      }
      res.json(data);
    }
  );
};
