const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

router.use(protect);

// Create order
router.post('/', async (req, res) => {
    try {
        const { shippingAddress, paymentMethod = 'cod', notes = '' } = req.body;

        const user = await User.findById(req.user._id).populate('cart.product');
        if (!user.cart || user.cart.length === 0) {
            return res.status(400).json({ success: false, message: 'Cart is empty' });
        }

        if (!shippingAddress || !shippingAddress.street || !shippingAddress.city ||
            !shippingAddress.state || !shippingAddress.zip || !shippingAddress.country) {
            return res.status(400).json({ success: false, message: 'Complete address required' });
        }

        const items = [];
        for (const cartItem of user.cart) {
            const product = cartItem.product;
            if (!product) continue;
            if (product.stock < cartItem.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for ${product.name}`
                });
            }
            items.push({
                product: product._id,
                name: product.name,
                price: product.price,
                quantity: cartItem.quantity,
                image: product.image
            });
        }

        if (items.length === 0) {
            return res.status(400).json({ success: false, message: 'No valid items in cart' });
        }

        const itemsTotal = items.reduce((sum, i) => sum + (i.price * i.quantity), 0);
        const shippingCost = itemsTotal > 50 ? 0 : 9.99;
        const tax = Number((itemsTotal * 0.08).toFixed(2));
        const totalAmount = Number((itemsTotal + shippingCost + tax).toFixed(2));

        const order = await Order.create({
            user: req.user._id,
            items,
            shippingAddress,
            paymentMethod,
            itemsTotal,
            shippingCost,
            tax,
            totalAmount,
            notes,
            paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid'
        });

        // Reduce stock
        for (const item of items) {
            await Product.findByIdAndUpdate(item.product, {
                $inc: { stock: -item.quantity }
            });
        }

        // Clear cart
        user.cart = [];
        await user.save();

        res.status(201).json({ success: true, order });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get user orders
router.get('/', async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json({ success: true, orders });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get single order
router.get('/:id', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
        if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }
        res.json({ success: true, order });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/orders/:id/track — User checks latest status
router.get('/:id/track', protect, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
        if (order.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }
        res.json({
            success: true,
            tracking: {
                orderId: order._id,
                status: order.status,
                paymentStatus: order.paymentStatus,
                trackingNumber: order.trackingNumber,
                updatedAt: order.updatedAt
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;