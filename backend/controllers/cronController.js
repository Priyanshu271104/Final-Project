const { checkPricesOnce } = require('../services/priceCheckService');

async function checkPricesController(req, res) {
  const providedSecret = req.get("x-cron-secret");

if (!process.env.CRON_SECRET) {
  console.error("[CRON] Missing CRON_SECRET in environment");

  return res.status(500).json({
    error: "Server misconfiguration",
  });
}

if (!providedSecret) {
  return res.status(401).json({
    error: "Missing cron authorization",
  });
}

if (providedSecret !== process.env.CRON_SECRET) {
  return res.status(401).json({
    error: "Unauthorized",
  });
}

  try {
    const report =
      await checkPricesOnce();

    return res.json({
      ok: true,
      ...report,
    });
  } catch (error) {
    console.error(
      '[Cron Controller Error]:',
      error.message
    );

    return res.status(500).json({
      error:
        'Price check failed',
    });
  }
}

module.exports = {
  checkPricesController,
};