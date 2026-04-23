const rateLimit = require('express-rate-limit');

const searchLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error:
      'Too many requests. Please try again in a minute.',
  },
});

module.exports = {
  searchLimiter,
};