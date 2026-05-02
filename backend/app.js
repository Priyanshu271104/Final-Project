require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const searchRoutes =
  require('./routes/searchRoutes');
const cronRoutes =
  require('./routes/cronRoutes');

const {
  notFound,
  errorHandler,
} = require('./middleware/errorMiddleware');

const app = express();
app.set("trust proxy", 1);

const ALLOWED_ORIGINS = (
  process.env.ALLOWED_ORIGINS ||
  'http://localhost:5173'
)
  .split(',')
  .map((origin) => origin.trim());

app.use(helmet());

app.use(
  cors({
    origin: (origin, callback) => {
      if (
        !origin ||
        ALLOWED_ORIGINS.includes(origin)
      ) {
        return callback(null, true);
      }

      return callback(null, false);
    },
    methods: ['GET', 'POST'],
  })
);

app.use(
  express.json({
    limit: '10kb',
  })
);
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "PriceLens backend is running",
    timestamp: new Date().toISOString(),
  });
});
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "PriceLens API is running",
  });
});

app.get("/healthz", (req, res) => {
  res.status(200).send("OK");
});

app.use('/api', searchRoutes);
app.use('/api', cronRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;