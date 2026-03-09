require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Product = require('./models/Product');
const connectDB = require('./config/db');

const products = [
    {
        name: 'Wireless Noise-Cancelling Headphones',
        description: 'Premium over-ear headphones with active noise cancellation, 30-hour battery life, deep bass, and ultra-comfortable memory foam ear cushions. Perfect for music, calls, and travel.',
        price: 79.99,
        comparePrice: 149.99,
        category: 'Electronics',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop',
        stock: 50,
        rating: 4.5,
        numReviews: 234,
        featured: true
    },
    {
        name: 'Smart Watch Pro Max',
        description: 'Advanced smartwatch with heart rate monitor, GPS tracking, sleep analysis, blood oxygen sensor, and 7-day battery life. Water resistant to 50 meters.',
        price: 199.99,
        comparePrice: 299.99,
        category: 'Electronics',
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop',
        stock: 35,
        rating: 4.3,
        numReviews: 189,
        featured: true
    },
    {
        name: 'Premium Organic Cotton T-Shirt',
        description: '100% organic cotton crew neck t-shirt. Ultra-soft, breathable, and sustainably made. Available in classic fit with reinforced stitching for durability.',
        price: 24.99,
        comparePrice: 39.99,
        category: 'Clothing',
        image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=600&fit=crop',
        stock: 200,
        rating: 4.7,
        numReviews: 456,
        featured: true
    },
    {
        name: 'Ultra Boost Running Shoes',
        description: 'Lightweight performance running shoes with responsive Boost cushioning, breathable Primeknit upper, and Continental rubber outsole for maximum grip.',
        price: 129.99,
        comparePrice: 179.99,
        category: 'Sports',
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop',
        stock: 75,
        rating: 4.6,
        numReviews: 312,
        featured: true
    },
    {
        name: 'Clean Code: A Handbook',
        description: 'Even bad code can function. But if code isnt clean, it can bring a development organization to its knees. A must-read for every software developer.',
        price: 34.99,
        comparePrice: 49.99,
        category: 'Books',
        image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&h=600&fit=crop',
        stock: 120,
        rating: 4.8,
        numReviews: 567,
        featured: false
    },
    {
        name: 'Handcrafted Ceramic Mug Set',
        description: 'Set of 4 artisan ceramic mugs with minimalist design. Microwave and dishwasher safe. Each mug holds 12oz. Perfect for coffee, tea, or hot chocolate.',
        price: 34.99,
        comparePrice: 54.99,
        category: 'Home',
        image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600&h=600&fit=crop',
        stock: 60,
        rating: 4.4,
        numReviews: 178,
        featured: false
    },
    {
        name: 'Professional Yoga Mat',
        description: 'Extra thick 6mm eco-friendly yoga mat with non-slip texture on both sides. Includes carrying strap. Perfect for yoga, pilates, and floor exercises.',
        price: 39.99,
        comparePrice: 64.99,
        category: 'Sports',
        image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600&h=600&fit=crop',
        stock: 90,
        rating: 4.5,
        numReviews: 201,
        featured: false
    },
    {
        name: 'Fast Wireless Charger Pad',
        description: '15W Qi-certified fast wireless charging pad with anti-slip surface and LED indicator. Compatible with iPhone, Samsung, and all Qi-enabled devices.',
        price: 19.99,
        comparePrice: 34.99,
        category: 'Electronics',
        image: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=600&h=600&fit=crop',
        stock: 150,
        rating: 4.2,
        numReviews: 145,
        featured: false
    },
    {
        name: 'Vintage Denim Jacket',
        description: 'Classic fit denim jacket with authentic vintage wash. Features button closure, dual chest pockets, side hand pockets, and adjustable waist tabs.',
        price: 69.99,
        comparePrice: 99.99,
        category: 'Clothing',
        image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=600&h=600&fit=crop',
        stock: 45,
        rating: 4.3,
        numReviews: 87,
        featured: true
    },
    {
        name: 'Complete Skincare Essentials',
        description: 'Comprehensive skincare kit with gentle cleanser, hydrating toner, vitamin C serum, moisturizer, and SPF 50 sunscreen. All natural ingredients for all skin types.',
        price: 49.99,
        comparePrice: 89.99,
        category: 'Beauty',
        image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&h=600&fit=crop',
        stock: 65,
        rating: 4.7,
        numReviews: 289,
        featured: true
    },
    {
        name: 'Creative Building Blocks 500pc',
        description: '500-piece building block set for endless creative possibilities. Compatible with all major brands. Includes special pieces, wheels, and idea booklet. Ages 4+.',
        price: 29.99,
        comparePrice: 44.99,
        category: 'Toys',
        image: 'https://images.unsplash.com/photo-1587654780291-39c9404d7dd0?w=600&h=600&fit=crop',
        stock: 40,
        rating: 4.8,
        numReviews: 412,
        featured: false
    },
    {
        name: 'Luxury Aromatherapy Candle Set',
        description: 'Set of 3 hand-poured natural soy wax candles in premium scents: French Lavender, Madagascar Vanilla, and Australian Eucalyptus. 45-hour burn time each.',
        price: 32.99,
        comparePrice: 49.99,
        category: 'Home',
        image: 'https://images.unsplash.com/photo-1602028915047-37269d1a73f7?w=600&h=600&fit=crop',
        stock: 80,
        rating: 4.6,
        numReviews: 234,
        featured: false
    }
];

const seedDB = async () => {
    try {
        await connectDB();
        console.log('\n  Clearing existing data...');
        await User.deleteMany({});
        await Product.deleteMany({});

        console.log('  Creating users...');
        await User.create({
            name: 'Admin User',
            email: 'admin@shop.com',
            password: 'admin123',
            role: 'admin',
            phone: '555-0100',
            address: { street: '123 Admin Street', city: 'New York', state: 'NY', zip: '10001', country: 'US' }
        });

        await User.create({
            name: 'Vuth Vatana',
            email: 'vatana@shop.com',
            password: '123',
            role: 'user',
            phone: '555-0101',
            address: { street: '456 User Avenue', city: 'Los Angeles', state: 'CA', zip: '90001', country: 'US' }
        });

        await User.create({
            name: 'Leng Sovathanak',
            email: 'vathanak@shop.com',
            password: '123',
            role: 'user',
            phone: '555-0102',
            address: { street: '789 Test Lane', city: 'Chicago', state: 'IL', zip: '60601', country: 'US' }
        })

        await User.create({
            name: 'Phol Pheas',
            email: 'pheas@shop.com',
            password: '123',
            role: 'user',
            phone: '555-1234',
            address: { street: '123 Main St', city: 'Anytown', state: 'CA', zip: '12345', country: 'US' }
        });

        await User.create({
            name: 'NOK Sreylinh',
            email: 'sreylinh@shop.com',
            password: '123',
            role: 'user',
            phone: '555-5555',
            address: { street: '123 Test Lane', city: 'Anytown', state: 'CA', zip: '12345', country: 'US' }
        });

        await User.create({
            name: 'CHHAY Udom',
            email: 'udom@shop.com',
            password: '123',
            role: 'user',
            phone: '555-1111',
            address: { street: '123', city: 'Anytown', state: 'CA', zip: '12345', country: 'US' }
        })

        console.log('  Creating products...');
        await Product.insertMany(products);

        console.log('\n  ✅ Database seeded successfully!');
        console.log('  ─────────────────────────────');
        console.log('  👤 Admin: admin@shop.com / admin123');
        console.log('  👤 User:  john@test.com / password123');
        console.log('  📦 Products: ' + products.length + ' items created');
        console.log('  ─────────────────────────────\n');
        process.exit(0);
    } catch (error) {
        console.error('\n  ❌ Seed error:', error.message);
        process.exit(1);
    }
};

seedDB();