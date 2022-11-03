const mongoose = require('mongoose');
const Comment = require('./comment');

const PostSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, minLenght: 2, maxLenght: 100, required: true },
    text: { type: String, minLength: 10, maxLength: 10000, required: true },
    published: { type: Boolean, required: true },
  },
  { timestamps: true }
);

PostSchema.virtual('comment_count').get(function () {
  // const documents = Comment.find({ post: this._id })
  //   .countDocuments()
  //   .exec(async (err, count) => {
  //     console.log('count inside', count);
  //     return await count;
  //   });
  // console.log('documents');
  // return documents;
});

module.exports = mongoose.model('Post', PostSchema);
