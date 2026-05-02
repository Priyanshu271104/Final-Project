const axios = require("axios");

const SERP_API_KEY = process.env.SERPAPI_KEY;

async function fetchPriceFromSerp(productName) {
  try {
    const response = await axios.get(
      "https://serpapi.com/search.json",
      {
        params: {
          engine: "google_shopping",
          q: productName,
          api_key: SERP_API_KEY,
          gl: "in", // India
          hl: "en",
        },
      }
    );

    const results = response.data.shopping_results;

    if (!results || results.length === 0) {
      console.log("❌ No results from SerpAPI");
      return null;
    }

    // 🔥 pick cheapest result
    const prices = results
      .map((item) => {
        const priceStr = item.price || "";
        const numeric = parseInt(
          priceStr.replace(/[^\d]/g, ""),
          10
        );
        return numeric;
      })
      .filter((p) => p > 0);

    if (prices.length === 0) return null;

    const bestPrice = Math.min(...prices);

    return bestPrice;
  } catch (err) {
    console.error("❌ SerpAPI Error:", err.message);
    return null;
  }
}

module.exports = fetchPriceFromSerp;