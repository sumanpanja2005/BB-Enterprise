/**
 * Seed MongoDB with demo categories, products, and an admin user.
 * Run: npm run seed (from server/)
 */
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');

const IMG = 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600';

async function run() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('Set MONGODB_URI in server/.env');
    process.exit(1);
  }
  await mongoose.connect(uri);
  console.log('Connected');

  await Category.deleteMany({});
  await Product.deleteMany({});
  await User.deleteMany({ email: 'admin@bbenterprise.com' });

  const categories = await Category.insertMany([
    {
      name: 'Skincare',
      slug: 'skincare',
      description: 'Serums, creams, and daily care',
      image: IMG,
    },
    {
      name: 'Makeup',
      slug: 'makeup',
      description: 'Lips, eyes, and complexion',
      image: IMG,
    },
    {
      name: 'Fragrance',
      slug: 'fragrance',
      description: 'Eau de parfum and body mists',
      image: IMG,
    },
    {
      name: 'Hair Care',
      slug: 'hair-care',
      description: 'Shampoo, masks, and styling',
      image: IMG,
    },
  ]);

  const admin = await User.create({
    name: 'Admin',
    email: 'admin@bbenterprise.com',
    password: 'Admin123!',
    role: 'admin',
  });

  const findSlug = (name) => categories.find((c) => c.name === name)._id;

  await Product.insertMany([
    {
      name: 'Radiance Vitamin C Serum',
      slug: 'radiance-vitamin-c-serum',
      description:
        'Brightening serum with stabilized vitamin C and hyaluronic acid for glowing skin.',
      shortDescription: 'Daily brightening serum',
      price: 42,
      compareAtPrice: 54,
      images: [IMG],
      category: findSlug('Skincare'),
      stock: 120,
      sku: 'BB-SK-001',
      featured: true,
      tags: ['serum', 'vitamin-c', 'brightening'],
    },
    {
      name: 'Silk Finish Lipstick — Rosewood',
      slug: 'silk-finish-lipstick-rosewood',
      description:
        'Creamy formula with satin finish. Long-wearing comfort for all-day wear.',
      shortDescription: 'Satin lipstick',
      price: 28,
      images: [IMG],
      category: findSlug('Makeup'),
      stock: 200,
      sku: 'BB-MK-002',
      featured: true,
      tags: ['lipstick', 'satin'],
    },
    {
      name: 'Midnight Bloom Eau de Parfum',
      slug: 'midnight-bloom-edp',
      description:
        'Floral musk with notes of jasmine, vanilla, and sandalwood.',
      shortDescription: '50ml EDP',
      price: 89,
      compareAtPrice: 110,
      images: [IMG],
      category: findSlug('Fragrance'),
      stock: 45,
      sku: 'BB-FR-003',
      featured: true,
      tags: ['perfume', 'floral'],
    },
    {
      name: 'Hydra Repair Night Cream',
      slug: 'hydra-repair-night-cream',
      description:
        'Rich night cream with ceramides and peptides for barrier support.',
      shortDescription: 'Overnight repair',
      price: 56,
      images: [IMG],
      category: findSlug('Skincare'),
      stock: 80,
      sku: 'BB-SK-004',
      featured: false,
      tags: ['night-cream', 'ceramide'],
    },
    {
      name: 'Volume Lift Mascara',
      slug: 'volume-lift-mascara',
      description: 'Buildable volume without clumping. Ophthalmologist tested.',
      shortDescription: 'Black',
      price: 24,
      images: [IMG],
      category: findSlug('Makeup'),
      stock: 150,
      sku: 'BB-MK-005',
      featured: false,
      tags: ['mascara', 'eyes'],
    },
    {
      name: 'Keratin Smooth Shampoo',
      slug: 'keratin-smooth-shampoo',
      description: 'Sulfate-free shampoo for frizz control and shine.',
      shortDescription: '400ml',
      price: 22,
      images: [IMG],
      category: findSlug('Hair Care'),
      stock: 300,
      sku: 'BB-HC-006',
      featured: false,
      tags: ['shampoo', 'keratin'],
    },
    {
      name: 'Dew Glow Tinted Sunscreen SPF 50',
      slug: 'dew-glow-tinted-sunscreen-spf-50',
      description:
        'Lightweight broad-spectrum sunscreen with a natural tint and dewy finish.',
      shortDescription: 'Tinted SPF with glow',
      price: 34,
      compareAtPrice: 39,
      images: [IMG],
      category: findSlug('Skincare'),
      stock: 95,
      sku: 'BB-SK-007',
      featured: true,
      rating: 4.7,
      numReviews: 126,
      tags: ['sunscreen', 'spf', 'tinted'],
    },
    {
      name: 'Velvet Matte Blush Palette',
      slug: 'velvet-matte-blush-palette',
      description:
        'Four blendable blush shades in warm and cool tones for everyday looks.',
      shortDescription: '4-shade blush palette',
      price: 31,
      images: [IMG],
      category: findSlug('Makeup'),
      stock: 140,
      sku: 'BB-MK-008',
      featured: true,
      rating: 4.6,
      numReviews: 83,
      tags: ['blush', 'palette', 'matte'],
    },
    {
      name: 'Crystal Kiss Lip Oil',
      slug: 'crystal-kiss-lip-oil',
      description:
        'Nourishing lip oil with jojoba and vitamin E for shine and hydration.',
      shortDescription: 'Hydrating lip oil',
      price: 19,
      images: [IMG],
      category: findSlug('Makeup'),
      stock: 260,
      sku: 'BB-MK-009',
      featured: false,
      rating: 4.5,
      numReviews: 64,
      tags: ['lip-oil', 'hydrating', 'shine'],
    },
    {
      name: 'Soft Petal Body Mist',
      slug: 'soft-petal-body-mist',
      description:
        'Fresh floral body mist with peony, pear, and white musk notes.',
      shortDescription: 'Daily floral mist',
      price: 26,
      images: [IMG],
      category: findSlug('Fragrance'),
      stock: 170,
      sku: 'BB-FR-010',
      featured: false,
      rating: 4.3,
      numReviews: 41,
      tags: ['body-mist', 'floral', 'fresh'],
    },
    {
      name: 'Repair Bond Hair Mask',
      slug: 'repair-bond-hair-mask',
      description:
        'Weekly treatment mask that strengthens weak strands and smooths split ends.',
      shortDescription: 'Intense repair mask',
      price: 29,
      compareAtPrice: 35,
      images: [IMG],
      category: findSlug('Hair Care'),
      stock: 110,
      sku: 'BB-HC-011',
      featured: true,
      rating: 4.8,
      numReviews: 92,
      tags: ['hair-mask', 'repair', 'bond'],
    },
  ]);

  console.log('Seeded categories, products, admin user.');
  console.log('Admin login: admin@bbenterprise.com / Admin123!');
  console.log('Admin id:', admin._id.toString());
  await mongoose.disconnect();
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
