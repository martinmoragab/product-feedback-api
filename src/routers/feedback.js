const express = require('express');
const router = new express.Router();

const auth = require('../middleware/auth');

const Feedback = require('../models/feedback');

// Create new feedback for a product
router.post('/', auth, async (req, res) => {
  try {
    const feedbackDetails = {
      ...req.body.feedback,
      author: req.user._id,
    }
    const feedback = await Feedback.create(feedbackDetails);
    res.send({ feedback });
  } catch (e) {
    res.status(500).send(e);
  }
});

// Get specific feedback
router.get('/:id', async (req, res) => {
  const feedbackId = req.params.id;
  try {
    const feedback = await Feedback.findOne({ _id: feedbackId })
			.populate({
				path: 'comments',
				populate: {
					path: 'author',
					model: 'User',
					select: '-products'
				}
			})
    res.send({ feedback });
  } catch (e) {
    res.status(404).send(e);
  }
});

// Get all feedbacks for a product
router.get('/all/:id', async (req, res) => {
  const productId = req.params.id;
  try {
		const roadmapCounts = await Feedback.getRoadmapCounts(productId);
		const feedbacks = await Feedback.find({ product: productId });
    res.send({ feedbacks, roadmapCounts });
  } catch (e) {
    res.status(404).send(e)
  }
});

// Update an specific feedback
router.patch('/:id', auth, async (req, res) => {
  const feedbackId = req.params.id;
  const updates = Object.keys(req.body.feedback);
  try {
    const feedback = await Feedback.canUpdate(feedbackId, updates, req.user._id);
    updates.forEach((update) => feedback[update] = req.body.feedback[update]);
    await feedback.save();
    const feedbackObject = feedback.toObject();
    delete feedbackObject.product;
    res.send({ feedbackObject });
  } catch (e) {
    res.status(500).send(e);
  }
});

// Delete a feedback
router.delete('/:id', auth, async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    if (feedback.author.toString() === req.user._id.toString()) {
      await feedback.remove();
      res.send({ feedback });
    } else {
      res.status(401).send({ message: 'You are not current feedback\'s author.' });
    }
  } catch (e) {
    res.status(404).send(e);
  }
});

// Post a comment on a feedback
router.post('/:id/new-comment', auth, async (req, res) => {
  const feedbackId = req.params.id;
  const userId = req.user;
	const commentContent = req.body.comment;
  const comment = {
    content: commentContent,
    author: userId,
  };
  try {
    const feedback = await Feedback.findByIdAndUpdate(
      { _id: feedbackId },
      { $push: { comments: comment }},
      { new: true }
    )
    res.send({ feedback });
  } catch (e) {
    res.status(500).send(e);
  }
});

// Add vote to feedback
router.patch('/:id/vote', auth, async (req, res) => {
	const feedbackId = req.params.id;
	const userId = req.user._id.toString();
	try {
		const feedback = await Feedback.findById(feedbackId);
		const hasUserVoted = feedback.votes.has(userId);
		// If user already votes, it will "unvote". Else, it will vote
		if (hasUserVoted) {
			feedback.votes.delete(userId);
		} else {
			feedback.votes.set(userId, 1);
		}
		feedback.save();
		res.send(feedback);
	} catch (e) {
		res.status(500).send(e);
	}
})

module.exports = router;