const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

router.use(protect);

// Get cart
router.get('/', async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .populate('cart.product', 'name price image stock');
        const validCart = user.cart.filter(item => item.product != null);
        res.json({ success: true, cart: validCart });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Add to cart
router.post('/', async (req, res) => {
    try {
        const { productId, quantity = 1 } = req.body;
        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
        if (product.stock < quantity) return res.status(400).json({ success: false, message: 'Insufficient stock' });

        const user = await User.findById(req.user._id);
        const existing = user.cart.find(i => i.product.toString() === productId);

        if (existing) {
            existing.quantity = Math.min(existing.quantity + Number(quantity), product.stock);
        } else {
            user.cart.push({ product: productId, quantity: Number(quantity) });
        }

        await user.save();
        const updated = await User.findById(req.user._id)
            .populate('cart.product', 'name price image stock');
        res.json({ success: true, cart: updated.cart });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Update cart item
router.put('/:productId', async (req, res) => {
    try {
        const { quantity } = req.body;
        const user = await User.findById(req.user._id);

        if (quantity <= 0) {
            user.cart = user.cart.filter(i => i.product.toString() !== req.params.productId);
        } else {
            const item = user.cart.find(i => i.product.toString() === req.params.productId);
            if (item) item.quantity = Number(quantity);
        }

        await user.save();
        const updated = await User.findById(req.user._id)
            .populate('cart.product', 'name price image stock');
        res.json({ success: true, cart: updated.cart });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Remove from cart
router.delete('/:productId', async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        user.cart = user.cart.filter(i => i.product.toString() !== req.params.productId);
        await user.save();
        const updated = await User.findById(req.user._id)
            .populate('cart.product', 'name price image stock');
        res.json({ success: true, cart: updated.cart });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Clear cart
router.delete('/', async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        user.cart = [];
        await user.save();
        res.json({ success: true, cart: [] });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;