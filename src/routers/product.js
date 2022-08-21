const express = require('express');
const router = new express.Router();

const auth = require('../middleware/auth');

const Product = require('../models/product');

// Get all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find({}).populate({ path: 'feedbacks', model: 'Feedback' });
    res.send({ products });
  } catch (e) {
    res.status(500).send(e);
  }
})

// Create new product
router.post('/', auth, async (req, res) => {
  try {
    const productInformation = {
      ...req.body.product,
      owner: req.user._id,
    };
    const product = await Product.create(productInformation);
    res.send({ product });
  } catch (e) {
    res.status(500).send(e);
  }
});

// Update product
router.patch('/:id', auth, async (req, res) => {
  const updates = Object.keys(req.body.product);
  try {
    const product = await Product.findById(req.params.id);
    if (product.owner.toString() === req.user._id.toString()) {
      updates.forEach((update) => product[update] = req.body.product[update]);
      await product.save();
      res.send({ product });
    } else {
      res.status(401).send({ message: 'You require higher privileges to perform this action.' });
    }
  } catch (e) {
    res.status(404).send(e);
  }
});

// Delete product
router.delete('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product.owner.toString() === req.user._id.toString()) {
      await product.remove();
      res.send({ product });
    } else {
      res.status(401).send({ message: 'You require higher privileges to perform this action.' });
    }
  } catch (e) {
    res.status(404).send(e);
  }
});


module.exports = router;