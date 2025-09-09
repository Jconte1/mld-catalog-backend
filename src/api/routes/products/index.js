// src/api/routes/products/index.js
import express from 'express';
import filterOptions from './filterOptions.js';
import getProductBySlug from './getProductBySlug.js';
import listProducts from './listProducts.js';

const router = express.Router();

// Order matters: specific route first, then list, then slug
router.use('/filter-options', filterOptions); // GET /api/products/filter-options
router.use('/', listProducts);                // GET /api/products
router.use('/', getProductBySlug);            // GET /api/products/:slug

export default router;
