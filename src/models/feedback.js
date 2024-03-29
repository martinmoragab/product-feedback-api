const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new Schema({
  content: {
    type: String,
    required: true,
    trim: true,
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
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
	votes: {
		type: Map,
		default: new Map(),
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
  commentsLength: {
    type: Number,
    required: true,
    default: 0,
  }
}, { timestamps: true });

feedbackSchema.statics.canUpdate = async (feedbackId, updates, userId) => {
  const feedback = await Feedback.findById(feedbackId).populate('product');
  const product = feedback.product;
  // User is not owner so cannot update the status
  if (updates.includes('status') && product.owner.toString() !== userId.toString()) throw new Error('Need higher privileges.');
  // User trying to update is not author
  if (feedback.author.toString() !== userId.toString()) throw new Error('User is not feedback\'s author.');

  return feedback;
}

feedbackSchema.statics.getRoadmapCounts = async (productId) => {
	const planned = await Feedback.countDocuments({
		product: productId,
		status: 'Planned'
	});
	const in_progress = await Feedback.countDocuments({
		product: productId,
		status: 'In Progress'
	});
	const live = await Feedback.countDocuments({
		product: productId,
		status: 'Live'
	});
	return {
		planned,
		in_progress,
		live
	}
}

const Feedback = mongoose.model('Feedback', feedbackSchema);

module.exports = Feedback;