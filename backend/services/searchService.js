const axios = require("axios");
const { extractPrice } = require("../utils/helpers");
const {
  validateSearchQuery,
} = require("../validators/searchValidator");

async function serpapiSearch(query) {
  const response = await axios.get(
    "https://serpapi.com/search.json",
    {
      timeout: 15000,
      params: {
        engine: "google_shopping",
        q: query,
        location: "India",
        google_domain: "google.co.in",
        gl: "in",
        hl: "en",
        api_key: process.env.SERPAPI_KEY,
      },
    }
  );

  return response.data.shopping_results || [];
}

async function searchProducts(query) {
  const trimmed = validateSearchQuery(query);

  const results = await serpapiSearch(trimmed);

  if (!results.length) {
    return [];
  }

  // Group by similar product title
  const primaryProduct = results[0];

  const stores = results
    .slice(0, 5) // top 5 ecommerce stores
    .map((item) => ({
      name: item.source || "Store",
      price: extractPrice(item.price),
      logo: item.source
        ? item.source.substring(0, 2).toUpperCase()
        : "🛒",
      link:
        item.product_link ||
        item.link ||
        "",
    }))
    .filter((store) => store.price);

  const bestPrice = Math.min(
    ...stores.map((s) => s.price)
  );

  // simple demo history (later from Firestore)
  history: [
  {
    date: "Jan",
    price: price + 4000,
  },
  {
    date: "Feb",
    price: price + 2800,
  },
  {
    date: "Mar",
    price: price + 1800,
  },
  {
    date: "Apr",
    price: price + 900,
  },
  {
    date: "Now",
    price: price,
  },
];
  return [
    {
      id:
        primaryProduct.product_id ||
        "main-product",
      name:
        primaryProduct.title ||
        trimmed,
      image:
        primaryProduct.thumbnail || "",
      rating:
        primaryProduct.rating || 4.5,
      reviews:
        primaryProduct.reviews || 0,
      category:
        primaryProduct.category ||
        "Electronics",
      currentPrice: bestPrice,
      stores,
      history,
    },
  ];
}

module.exports = {
  searchProducts,
  serpapiSearch,
};