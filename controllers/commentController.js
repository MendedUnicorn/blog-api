const Comment = require('../models/comment');
const { body, validationResult } = require('express-validator');

exports.post_comment = [
  // Santeize
  body('name').trim().isLength({ min: 2, max: 20 }).escape(),
  body('text').trim().isLength({ min: 2, max: 500 }).escape(),

  (req, res, next) => {
    console.log('fewfwef', req.params.postid);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(errors);
    }
    const newComment = new Comment({
      name: req.body.name,
      text: req.body.text,
      post: req.params.postid,
    });
    newComment.save((err, data) => {
      if (err) {
        return next(err);
      }
      res.json(`Data was posted succesfully: ${data}`);
    });
  },
];

exports.get_comments = (req, res, next) => {
  Comment.find({ post: req.params.postid })
    //.populate('post')
    .exec((err, data) => {
      if (err) {
        return next(err);
      }
      res.json(data);
    });
};

exports.get_comment = (req, res, next) => {
  console.log('comment id', req.params.commentid);
  Comment.findById(req.params.commentid).exec((err, data) => {
    if (err) {
      return next(err);
    }
    res.json(data);
  });
};
