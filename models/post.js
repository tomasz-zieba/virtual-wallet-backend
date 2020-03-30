const mongoose = require('mongoose');

const { Schema } = mongoose;

const postSchema = new Schema({
  title: {
    type: String,
    require: true,
  },
  imageUrl: {
    type: String,
    require: true,
  },
  content: {
    type: String,
    required: true,
  },
  creator: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    require: true,
  },
}, { timestamps: true });


module.exports = mongoose.model('Post', postSchema);
