const { searchProducts } = require('../services/searchService');

async function searchProductsController(req, res) {
  try {
    const { q } = req.query;

    const products = await searchProducts(q);

    return res.json(products);
  } catch (error) {
    console.error(
      '[Search Controller Error]:',
      error.message
    );

    if (
      error.message.includes('Query') ||
      error.message.includes('required') ||
      error.message.includes('characters')
    ) {
      return res.status(400).json({
        error: error.message,
      });
    }

    return res.status(502).json({
      error:
        'Upstream search service unavailable',
    });
  }
}

module.exports = {
  searchProductsController,
};