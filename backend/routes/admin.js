const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect, adminOnly);

// Dashboard stats
router.get('/stats', async (req, res) => {
    try {
        const [totalProducts, totalOrders, totalUsers, revenueResult, recentOrders, ordersByStatus, lowStock] = await Promise.all([
            Product.countDocuments(),
            Order.countDocuments(),
            User.countDocuments(),
            Order.aggregate([
                { $match: { status: { $ne: 'cancelled' } } },
                { $group: { _id: null, total: { $sum: '$totalAmount' } } }
            ]),
            Order.find().sort({ createdAt: -1 }).limit(5).populate('user', 'name email'),
            Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
            Product.find({ stock: { $lte: 5 }, active: true }).sort({ stock: 1 }).limit(10)
        ]);

        res.json({
            success: true,
            stats: {
                totalProducts,
                totalOrders,
                totalUsers,
                totalRevenue: revenueResult.length > 0 ? revenueResult[0].total : 0,
                recentOrders,
                ordersByStatus,
                lowStock
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get all products (admin)
router.get('/products', async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.json({ success: true, products });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Create product
router.post('/products', async (req, res) => {
    try {
        const product = await Product.create(req.body);
        res.status(201).json({ success: true, product });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Update product
router.put('/products/:id', async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
        res.json({ success: true, product });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Delete product
router.delete('/products/:id', async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
        res.json({ success: true, message: 'Product deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get all orders (admin)
router.get('/orders', async (req, res) => {
    try {
        let query = {};
        if (req.query.status) query.status = req.query.status;
        const orders = await Order.find(query).sort({ createdAt: -1 }).populate('user', 'name email');
        res.json({ success: true, orders });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// PUT /api/admin/orders/:id — Update order (status, payment, tracking)
router.put('/orders/:id', async (req, res) => {
    try {
        const { status, paymentStatus, trackingNumber, notes } = req.body;
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        // Track what changed for response message
        const changes = [];

        if (status && status !== order.status) {
            order.status = status;
            changes.push(`Status → ${status}`);
        }
        if (paymentStatus && paymentStatus !== order.paymentStatus) {
            order.paymentStatus = paymentStatus;
            changes.push(`Payment → ${paymentStatus}`);
        }
        if (trackingNumber !== undefined) {
            order.trackingNumber = trackingNumber;
            if (trackingNumber) changes.push(`Tracking → ${trackingNumber}`);
        }
        if (notes !== undefined) {
            order.notes = notes;
        }

        await order.save();

        // Return populated order
        const updated = await Order.findById(order._id).populate('user', 'name email');

        res.json({
            success: true,
            order: updated,
            message: changes.length ? changes.join(', ') : 'Order updated'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get all users (admin)
router.get('/users', async (req, res) => {
    try {
        const users = await User.find().select('-cart -wishlist').sort({ createdAt: -1 });
        res.json({ success: true, users });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;