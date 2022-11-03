const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    first_name: { type: String, minLength: 2, maxLength: 20, required: true },
    last_name: { type: String, minLength: 2, maxLength: 20, required: true },
    username: { type: String, minLength: 2, maxLength: 20, required: true },
    email: { type: String, minLength: 2, maxLength: 20, required: true },
    password: { type: String, minLength: 6, maxLength: 200, required: true },
  },
  { timestamps: true }
);

UserSchema.virtual('name').get(function () {
  return this.first_name + ' ' + this.last_name;
});

module.exports = mongoose.model('User', UserSchema);
