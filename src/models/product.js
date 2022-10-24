const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Feedback = require('./feedback');

const productSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Product\'s name is required'],
    trim: true,
  },
  mainColor: {
    type: String,
    required: false,
    default: '#AD1FEA',
    trim: true,
  },
  webpage: {
    type: String,
    required: [true, 'Webpage is required']
  },
  owner: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  feedbacks: [{
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Feedback',
  }],
}, { timestamps: true });

// Remove all tasks related to this product when deleting it
productSchema.pre('remove', async function (next) {
  const product = this;
  await Feedback.deleteMany({ product: product._id });
  next();
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;