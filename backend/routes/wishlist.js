const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

router.use(protect);

// Get wishlist
router.get('/', async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .populate('wishlist', 'name price image comparePrice rating numReviews category stock');
        res.json({ success: true, wishlist: user.wishlist });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Toggle wishlist item
router.post('/:productId', async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const exists = user.wishlist.some(id => id.toString() === req.params.productId);

        if (exists) {
            user.wishlist = user.wishlist.filter(id => id.toString() !== req.params.productId);
        } else {
            user.wishlist.push(req.params.productId);
        }

        await user.save();
        const updated = await User.findById(req.user._id)
            .populate('wishlist', 'name price image comparePrice rating numReviews category stock');
        res.json({ success: true, wishlist: updated.wishlist, added: !exists });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Remove from wishlist
router.delete('/:productId', async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        user.wishlist = user.wishlist.filter(id => id.toString() !== req.params.productId);
        await user.save();
        res.json({ success: true, message: 'Removed from wishlist' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;