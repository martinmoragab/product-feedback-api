const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new Schema({
  content: {
    type: String,
    required: true,
    trim: true,
  },
  date: {
    type: Date,
    default: Date.now,
  }
})

const feedbackSchema = new Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['UI', 'UX', 'Enhancement', 'Bug', 'Feature']
  },
  details: {
    type: String,
    required: [true, 'Details are required'],
    trim: true,
  },
  status: {
    // can be Planned, In Progress, Live
    type: String,
    enum: ['Not Started', 'Planned', 'In Progress', 'Live'],
    default: 'Not Started',
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  comments: [{
    type: commentSchema,
  }],
}, { timestamps: true });

const Feedback = mongoose.model('Feedback', feedbackSchema);

module.exports = Feedback;