const axios = require("axios");
const { extractPrice } = require("../utils/helpers");
const { validateSearchQuery } = require("../validators/searchValidator");

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

  // ✅ Find best matching product
  const primaryProduct =
    results.find((item) =>
      item.title?.toLowerCase().includes(trimmed.toLowerCase())
    ) || results[0];

  // ✅ Safe keyword extraction
  const keyword =
    primaryProduct.title?.split(" ")[0]?.toLowerCase() ||
    trimmed.toLowerCase();

  // ✅ Filter similar products
  const similarResults = results.filter((item) =>
    item.title?.toLowerCase().includes(keyword)
  );

  // ✅ Extract stores safely
  const storesRaw = similarResults
    .slice(0, 5)
    .map((item) => {
      const price = Number(extractPrice(item.price)) || 0;

      // filter unrealistic values
      if (price < 1000 || price > 200000) return null;

      return {
        name: item.source || "Store",
        price,
        logo: item.source
          ? item.source.substring(0, 2).toUpperCase()
          : "🛒",
        link: item.product_link || item.link || "",
      };
    })
    .filter(Boolean);

  // ✅ Remove duplicate stores (keep lowest price)
  const uniqueStores = Object.values(
    storesRaw.reduce((acc, store) => {
      if (!acc[store.name] || acc[store.name].price > store.price) {
        acc[store.name] = store;
      }
      return acc;
    }, {})
  );

  // ✅ Safe best price fallback
  const bestPrice =
    uniqueStores.length > 0
      ? Math.min(...uniqueStores.map((s) => s.price))
      : Number(extractPrice(primaryProduct.price)) || 0;

  // ✅ Demo price history (frontend graph)
  const history = [
    { date: "Jan", price: bestPrice + 4000 },
    { date: "Feb", price: bestPrice + 2800 },
    { date: "Mar", price: bestPrice + 1800 },
    { date: "Apr", price: bestPrice + 900 },
    { date: "Now", price: bestPrice },
  ];

  return [
    {
      id: primaryProduct.product_id || "main-product",
      name: primaryProduct.title || trimmed,
      image: primaryProduct.thumbnail || "",
      rating: primaryProduct.rating || 4.5,
      reviews: primaryProduct.reviews || 0,
      category: primaryProduct.category || "Electronics",
      currentPrice: bestPrice,
      stores: uniqueStores,
      history,
    },
  ];
}

module.exports = {
  searchProducts,
  serpapiSearch,
};