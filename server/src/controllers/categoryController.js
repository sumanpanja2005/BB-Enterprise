const Category = require('../models/Category');

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '');
}

/**
 * GET /api/categories
 */
async function listCategories(req, res, next) {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (e) {
    next(e);
  }
}

/**
 * GET /api/categories/:slug
 */
async function getCategoryBySlug(req, res, next) {
  try {
    const cat = await Category.findOne({ slug: req.params.slug });
    if (!cat) {
      res.status(404);
      throw new Error('Category not found');
    }
    res.json(cat);
  } catch (e) {
    next(e);
  }
}

/**
 * POST /api/categories (admin — also exposed via /api/admin)
 */
async function createCategory(req, res, next) {
  try {
    const slug = req.body.slug || slugify(req.body.name);
    const exists = await Category.findOne({ slug });
    if (exists) {
      res.status(400);
      throw new Error('Category slug already exists');
    }
    const category = await Category.create({
      name: req.body.name,
      slug,
      description: req.body.description || '',
      image: req.body.image || '',
    });
    res.status(201).json(category);
  } catch (e) {
    next(e);
  }
}

/**
 * PUT /api/categories/:id
 */
async function updateCategory(req, res, next) {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      res.status(404);
      throw new Error('Category not found');
    }
    category.name = req.body.name ?? category.name;
    if (req.body.slug) category.slug = req.body.slug;
    else if (req.body.name) category.slug = slugify(req.body.name);
    category.description =
      req.body.description !== undefined
        ? req.body.description
        : category.description;
    category.image = req.body.image !== undefined ? req.body.image : category.image;
    await category.save();
    res.json(category);
  } catch (e) {
    next(e);
  }
}

/**
 * DELETE /api/categories/:id
 */
async function deleteCategory(req, res, next) {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      res.status(404);
      throw new Error('Category not found');
    }
    res.json({ message: 'Category removed' });
  } catch (e) {
    next(e);
  }
}

module.exports = {
  listCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
  slugify,
};
