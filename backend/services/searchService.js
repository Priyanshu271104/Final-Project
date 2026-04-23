const axios = require('axios');
const { extractPrice } = require('../utils/helpers');
const {
  validateSearchQuery,
} = require('../validators/searchValidator');

async function serpapiSearch(query) {
  const response = await axios.get(
    'https://serpapi.com/search.json',
    {
      timeout: 15000,
      params: {
        engine: 'google_shopping',
        q: query,
        location: 'India',
        google_domain: 'google.co.in',
        gl: 'in',
        hl: 'en',
        api_key: process.env.SERPAPI_KEY,
      },
    }
  );

  return response.data.shopping_results || [];
}

async function searchProducts(query) {
  const trimmed =
  validateSearchQuery(query);

  const results = await serpapiSearch(trimmed);

  return results.map((item, index) => {
    const price = extractPrice(item.price);

    return {
      id: item.product_id || `pos-${index}`,
      name: item.title || 'Unknown Product',
      image: item.thumbnail || '',
      rating: item.rating || null,
      reviews: item.reviews || null,
      category: item.category || 'General',
      currentPrice: price,
      stores: [
        {
          name: item.source || 'Unknown Store',
          price,
          logo: '📍',
          link: item.link || '',
        },
      ],
      history: [], // REAL history will come from Firestore later
    };
  });
}

module.exports = {
  searchProducts,
  serpapiSearch,
};