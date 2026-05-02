const express = require('express');

const {
  checkPricesController,
} = require('../controllers/cronController');

const {
  verifyFirebaseToken,
} = require('../middleware/authMiddleware');

const router = express.Router();

router.post(
  '/internal/cron/check-prices',
  checkPricesController
);
router.get(
  '/cron/run',
  checkPricesController
);

module.exports = router;