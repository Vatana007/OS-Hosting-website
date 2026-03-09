const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

// Get all products with filters
router.get('/', async (req, res) => {
    try {
        const { search, category, sort, page = 1, limit = 12, featured, minPrice, maxPrice } = req.query;
        let query = { active: true };

        if (search) query.$text = { $search: search };
        if (category) query.category = category;
        if (featured === 'true') query.featured = true;
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        let sortOpt = {};
        switch (sort) {
            case 'price_asc': sortOpt = { price: 1 }; break;
            case 'price_desc': sortOpt = { price: -1 }; break;
            case 'rating': sortOpt = { rating: -1 }; break;
            case 'popular': sortOpt = { numReviews: -1 }; break;
            default: sortOpt = { createdAt: -1 };
        }

        const skip = (Number(page) - 1) * Number(limit);
        const total = await Product.countDocuments(query);
        const products = await Product.find(query).sort(sortOpt).skip(skip).limit(Number(limit));

        res.json({
            success: true,
            products,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit))
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get categories
router.get('/categories', async (req, res) => {
    try {
        const categories = await Product.distinct('category', { active: true });
        res.json({ success: true, categories });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Search suggestions
router.get('/suggestions', async (req, res) => {
    try {
        const { q } = req.query;
        if (!q || q.length < 2) return res.json({ success: true, suggestions: [] });
        const products = await Product.find({
            name: { $regex: q, $options: 'i' },
            active: true
        }).select('name price image category').limit(6);
        res.json({ success: true, suggestions: products });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get single product + related
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('reviews.user', 'name');
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        const related = await Product.find({
            category: product.category,
            _id: { $ne: product._id },
            active: true
        }).limit(4).select('name price comparePrice image rating numReviews category stock');
        res.json({ success: true, product, related });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Add review
router.post('/:id/reviews', protect, async (req, res) => {
    try {
        const { rating, comment } = req.body;
        if (!rating || !comment) {
            return res.status(400).json({ success: false, message: 'Rating and comment required' });
        }
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        const alreadyReviewed = product.reviews.find(
            r => r.user.toString() === req.user._id.toString()
        );
        if (alreadyReviewed) {
            return res.status(400).json({ success: false, message: 'Already reviewed this product' });
        }
        product.reviews.push({
            user: req.user._id,
            name: req.user.name,
            rating: Number(rating),
            comment
        });
        product.numReviews = product.reviews.length;
        product.rating = product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length;
        await product.save();
        res.status(201).json({ success: true, message: 'Review added successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;