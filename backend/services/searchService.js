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

  if (!results.length) return [];

  // ✅ Find best matching product
  const primaryProduct =
    results.find((item) =>
      item.title?.toLowerCase().includes(trimmed.toLowerCase())
    ) || results[0];

  // ✅ Extract keyword safely
  const keyword =
    primaryProduct.title?.split(" ")[0]?.toLowerCase() ||
    trimmed.toLowerCase();

  // ✅ Filter similar items
  const similarResults = results.filter((item) =>
    item.title?.toLowerCase().includes(keyword)
  );

  // ✅ Extract store data with classification
  const storesRaw = similarResults
    .slice(0, 10)
    .map((item) => {
      const price = Number(extractPrice(item.price)) || 0;
      const title = item.title?.toLowerCase() || "";
      const source = (item.source || "").toLowerCase();

      if (price < 1000 || price > 200000) return null;

      const isResale =
        source.includes("cashify") ||
        source.includes("olx") ||
        source.includes("quikr") ||
        title.includes("refurbished") ||
        title.includes("used") ||
        title.includes("renewed");

      return {
        name: item.source || "Store",
        price,
        logo: item.source
          ? item.source.substring(0, 2).toUpperCase()
          : "🛒",
        link: item.product_link || item.link || "",
        type: isResale ? "resale" : "retail", // ✅ KEY ADDITION
      };
    })
    .filter(Boolean);

  // ✅ Deduplicate stores (lowest price per store)
  const uniqueStores = Object.values(
    storesRaw.reduce((acc, store) => {
      if (!acc[store.name] || acc[store.name].price > store.price) {
        acc[store.name] = store;
      }
      return acc;
    }, {})
  );

  // ✅ Split by type
  const retailStores = uniqueStores.filter((s) => s.type === "retail");
  const resaleStores = uniqueStores.filter((s) => s.type === "resale");

  // ✅ Choose baseline from retail (more reliable)
  const baselineSource =
    retailStores.length > 0 ? retailStores : uniqueStores;

  const prices = baselineSource.map((s) => s.price);

  const median = (arr) => {
    if (!arr.length) return 0;
    const sorted = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2
      ? sorted[mid]
      : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
  };

  const baseline = median(prices) || prices[0] || 0;

  // ✅ Filter only extreme outliers (loose range)
  const filteredStores = uniqueStores.filter(
    (s) => s.price >= baseline * 0.5 && s.price <= baseline * 1.8
  );

  const finalStores =
    filteredStores.length >= 2 ? filteredStores : uniqueStores;

  // ✅ Best price
  const bestPrice =
    finalStores.length > 0
      ? Math.min(...finalStores.map((s) => s.price))
      : Number(extractPrice(primaryProduct.price)) || 0;

  // ✅ Demo history
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
      stores: finalStores,
      history,
    },
  ];
}

module.exports = {
  searchProducts,
  serpapiSearch,
};