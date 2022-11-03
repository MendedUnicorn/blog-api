const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema(
  {
    name: { type: String, minLength: 2, maxLength: 20, required: true },
    text: { type: String, minLength: 2, maxLength: 500, required: true },
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
    removed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// UserSchema.virtual('name').get(function () {
//   return this.first_namé + ' ' + this.last_name;
// });

module.exports = mongoose.model('Comment', CommentSchema);
