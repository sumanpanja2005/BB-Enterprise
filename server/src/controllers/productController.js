const Product = require('../models/Product');
const { slugify } = require('./categoryController');

/**
 * GET /api/products — search, filter, sort, paginate
 */
async function listProducts(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 12));
    const skip = (page - 1) * limit;

    const filter = { isActive: true };
    if (req.query.category) {
      filter.category = req.query.category;
    }
    if (req.query.featured === 'true') {
      filter.featured = true;
    }
    if (req.query.minPrice || req.query.maxPrice) {
      filter.price = {};
      if (req.query.minPrice) filter.price.$gte = Number(req.query.minPrice);
      if (req.query.maxPrice) filter.price.$lte = Number(req.query.maxPrice);
    }

    const findQuery = { ...filter };
    let sortObj = { createdAt: -1 };

    if (req.query.keyword) {
      findQuery.$text = { $search: req.query.keyword };
      sortObj = { score: { $meta: 'textScore' } };
    } else {
      const sort = req.query.sort || 'createdAt';
      const order = req.query.order === 'asc' ? 1 : -1;
      if (['price', 'rating', 'createdAt', 'name'].includes(sort)) {
        sortObj = { [sort]: order };
      }
    }

    const total = await Product.countDocuments(findQuery);

    let query = Product.find(findQuery)
      .populate('category', 'name slug')
      .sort(sortObj)
      .skip(skip)
      .limit(limit);

    if (req.query.keyword) {
      query = query.select({ score: { $meta: 'textScore' } });
    }

    const products = await query;

    res.json({
      products,
      page,
      pages: Math.ceil(total / limit) || 1,
      total,
    });
  } catch (e) {
    next(e);
  }
}

/**
 * GET /api/products/featured
 */
async function featuredProducts(req, res, next) {
  try {
    const products = await Product.find({ isActive: true, featured: true })
      .populate('category', 'name slug')
      .limit(8)
      .sort({ createdAt: -1 });
    res.json(products);
  } catch (e) {
    next(e);
  }
}

/**
 * GET /api/products/:slug
 */
async function getProductBySlug(req, res, next) {
  try {
    const product = await Product.findOne({
      slug: req.params.slug,
      isActive: true,
    }).populate('category', 'name slug');
    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }
    res.json(product);
  } catch (e) {
    next(e);
  }
}

/**
 * GET /api/products/id/:id
 */
async function getProductById(req, res, next) {
  try {
    const product = await Product.findById(req.params.id).populate(
      'category',
      'name slug'
    );
    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }
    res.json(product);
  } catch (e) {
    next(e);
  }
}

/**
 * POST /api/products (admin)
 */
async function createProduct(req, res, next) {
  try {
    const slug = req.body.slug || slugify(req.body.name);
    const exists = await Product.findOne({ slug });
    if (exists) {
      res.status(400);
      throw new Error('Product slug already exists');
    }
    const product = await Product.create({
      ...req.body,
      slug,
    });
    await product.populate('category', 'name slug');
    res.status(201).json(product);
  } catch (e) {
    next(e);
  }
}

/**
 * PUT /api/products/:id (admin)
 */
async function updateProduct(req, res, next) {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }
    const allowed = [
      'name',
      'slug',
      'description',
      'shortDescription',
      'price',
      'compareAtPrice',
      'images',
      'category',
      'stock',
      'sku',
      'featured',
      'tags',
      'isActive',
    ];
    allowed.forEach((key) => {
      if (req.body[key] !== undefined) product[key] = req.body[key];
    });
    if (req.body.name && !req.body.slug) {
      product.slug = slugify(req.body.name);
    }
    await product.save();
    await product.populate('category', 'name slug');
    res.json(product);
  } catch (e) {
    next(e);
  }
}

/**
 * DELETE /api/products/:id (admin)
 */
async function deleteProduct(req, res, next) {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }
    res.json({ message: 'Product removed' });
  } catch (e) {
    next(e);
  }
}

module.exports = {
  listProducts,
  featuredProducts,
  getProductBySlug,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
