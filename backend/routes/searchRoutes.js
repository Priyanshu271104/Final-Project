const express = require('express');
const {
  searchProductsController,
} = require('../controllers/searchController');
const {
  searchLimiter,
} = require('../middleware/rateLimiter');

const router = express.Router();

router.get(
  '/search',
  searchLimiter,
  searchProductsController
);

module.exports = router;