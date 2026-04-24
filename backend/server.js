require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const axios = require('axios');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

const app = express();
const PORT = 5000;

const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173')
  .split(',')
  .map(o => o.trim());

const MAX_QUERY_LENGTH = 100;
const CRON_BATCH_SIZE = parseInt(process.env.CRON_BATCH_SIZE || '5', 10);
const PRICE_DROP_THRESHOLD_PCT = parseFloat(process.env.PRICE_DROP_THRESHOLD_PCT || '5');

function normalizePrivateKey(raw) {
  if (!raw) return '';
  let k = raw.trim();
  if (k.endsWith(',')) k = k.slice(0, -1).trim();
  if ((k.startsWith('"') && k.endsWith('"')) || (k.startsWith("'") && k.endsWith("'"))) {
    k = k.slice(1, -1);
  }
  return k.replace(/\\n/g, '\n');
}

let firestore = null;
try {
  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: normalizePrivateKey(process.env.FIREBASE_PRIVATE_KEY),
      }),
    });
    firestore = admin.firestore();
    console.log('✅ Firebase Admin initialized');
  } else {
    console.warn('⚠️  Firebase Admin NOT initialized (missing env vars). /api/cron/check-prices will be disabled.');
  }
} catch (e) {
  console.warn('⚠️  Firebase Admin init failed:', e.message);
}

let mailer = null;
if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
  mailer = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
  console.log('✅ Gmail SMTP configured');
} else {
  console.warn('⚠️  Gmail credentials missing. Alert emails will be logged but not sent.');
}

app.use(helmet());
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
    return cb(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST'],
}));
app.use(express.json({ limit: '10kb' }));

const searchLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again in a minute.' },
});

const extractPrice = (priceString) => {
  if (!priceString) return 0;
  return parseInt(priceString.toString().replace(/[^0-9]/g, ''), 10);
};

const generateMockHistory = (currentPrice) => {
  if (!currentPrice) return [];
  return [
    { date: 'Oct', price: Math.round(currentPrice * 1.12) },
    { date: 'Nov', price: Math.round(currentPrice * 1.05) },
    { date: 'Dec', price: Math.round(currentPrice * 1.02) },
    { date: 'Jan', price: currentPrice }
  ];
};

async function serpapiSearch(query) {
  const response = await axios.get('https://serpapi.com/search.json', {
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
  });
  return response.data.shopping_results || [];
}

app.get('/api/search', searchLimiter, async (req, res) => {
  const { q } = req.query;

  if (!q || typeof q !== 'string') {
    return res.status(400).json({ error: 'Query parameter "q" is required' });
  }

  const trimmed = q.trim();
  if (trimmed.length === 0) {
    return res.status(400).json({ error: 'Query cannot be empty' });
  }
  if (trimmed.length > MAX_QUERY_LENGTH) {
    return res.status(400).json({ error: `Query must be ${MAX_QUERY_LENGTH} characters or fewer` });
  }

  try {
    const results = await serpapiSearch(trimmed);

    const products = results.map((item, index) => {
      const price = extractPrice(item.price);
      return {
        id: item.product_id || `pos-${index}`,
        name: item.title,
        image: item.thumbnail,
        rating: item.rating || 4.5,
        reviews: item.reviews || Math.floor(Math.random() * 500),
        category: 'Electronics',
        currentPrice: price,
        stores: [
          {
            name: item.source || 'Unknown Store',
            price: price,
            logo: '📍',
            link: item.link,
          },
        ],
        history: generateMockHistory(price),
      };
    });

    res.json(products);
  } catch (error) {
    console.error('[Backend] Error:', error.message);
    res.status(502).json({ error: 'Upstream search service unavailable' });
  }
});

async function sendTargetReachedEmail({ to, displayName, productName, targetPrice, newPrice, link }) {
  const subject = `Target hit: ${productName} is now ₹${newPrice.toLocaleString('en-IN')}`;
  const text = [
    `Hi${displayName ? ' ' + displayName : ''},`,
    ``,
    `A product you're tracking just hit your target price:`,
    ``,
    `${productName}`,
    `Your target: ₹${targetPrice.toLocaleString('en-IN')}`,
    `Current price: ₹${newPrice.toLocaleString('en-IN')}`,
    ``,
    link ? `Buy it here: ${link}` : '',
    ``,
    `— Pricelens`,
  ].filter(Boolean).join('\n');

  if (!mailer) {
    console.log(`[email-stub] to=${to} subject="${subject}"`);
    return { stubbed: true };
  }

  await mailer.sendMail({
    from: `"Pricelens Alerts" <${process.env.GMAIL_USER}>`,
    to,
    subject,
    text,
  });
  return { sent: true };
}

async function sendDropEmail({ to, displayName, productName, oldPrice, newPrice, link }) {
  const dropPct = (((oldPrice - newPrice) / oldPrice) * 100).toFixed(1);
  const subject = `Price drop: ${productName} is now ₹${newPrice.toLocaleString('en-IN')}`;
  const text = [
    `Hi${displayName ? ' ' + displayName : ''},`,
    ``,
    `Good news — a product on your Pricelens wishlist just dropped in price:`,
    ``,
    `${productName}`,
    `Was: ₹${oldPrice.toLocaleString('en-IN')}`,
    `Now: ₹${newPrice.toLocaleString('en-IN')}  (-${dropPct}%)`,
    ``,
    link ? `Buy it here: ${link}` : '',
    ``,
    `— Pricelens`,
  ].filter(Boolean).join('\n');

  if (!mailer) {
    console.log(`[email-stub] to=${to} subject="${subject}"`);
    return { stubbed: true };
  }

  await mailer.sendMail({
    from: `"Pricelens Alerts" <${process.env.GMAIL_USER}>`,
    to,
    subject,
    text,
  });
  return { sent: true };
}

async function checkPricesOnce() {
  if (!firestore) throw new Error('Firestore not initialized');

  const snapshot = await firestore.collectionGroup('wishlist').get();
  const items = snapshot.docs.map(d => ({ ref: d.ref, data: d.data() }));

  const groups = new Map();
  for (const it of items) {
    const key = it.data.id || it.data.name;
    if (!key) continue;
    if (!groups.has(key)) groups.set(key, { items: [], name: it.data.name, oldestCheckedAt: Infinity });
    const g = groups.get(key);
    g.items.push(it);
    const ts = it.data.lastCheckedAt?.toMillis ? it.data.lastCheckedAt.toMillis() : 0;
    if (ts < g.oldestCheckedAt) g.oldestCheckedAt = ts;
  }

  const sortedGroups = [...groups.values()].sort((a, b) => a.oldestCheckedAt - b.oldestCheckedAt);
  const toCheck = sortedGroups.slice(0, CRON_BATCH_SIZE);

  const report = { groupsChecked: 0, emailsSent: 0, emailsStubbed: 0, failures: 0 };

  for (const group of toCheck) {
    try {
      const results = await serpapiSearch(group.name);
      if (results.length === 0) {
        report.groupsChecked++;
        continue;
      }
      const newPrice = extractPrice(results[0].price);
      const newLink = results[0].link;
      if (!newPrice) {
        report.groupsChecked++;
        continue;
      }

      for (const it of group.items) {
        const baseline = it.data.baselinePrice || it.data.currentPrice;
        const lastNotified = it.data.lastNotifiedPrice || null;
        const dropPct = ((baseline - newPrice) / baseline) * 100;

        const notifyEnabled = it.data.notifyEmail !== false;

        const shouldNotifyDrop =
          notifyEnabled &&
          dropPct >= PRICE_DROP_THRESHOLD_PCT &&
          (lastNotified === null || newPrice < lastNotified);

        const targetPrice = typeof it.data.targetPrice === 'number' ? it.data.targetPrice : null;
        const lastTargetNotified = typeof it.data.lastTargetNotifiedPrice === 'number'
          ? it.data.lastTargetNotifiedPrice
          : null;

        const shouldNotifyTarget =
          notifyEnabled &&
          targetPrice !== null &&
          newPrice <= targetPrice &&
          (lastTargetNotified === null || newPrice < lastTargetNotified);

        const updates = {
          lastCheckedPrice: newPrice,
          lastCheckedAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        let user = null;
        if (shouldNotifyDrop || shouldNotifyTarget) {
          const userId = it.ref.parent.parent.id;
          const userDoc = await firestore.collection('users').doc(userId).get();
          user = userDoc.data();
        }

        if (shouldNotifyDrop && user?.email) {
          const result = await sendDropEmail({
            to: user.email,
            displayName: user.displayName,
            productName: it.data.name,
            oldPrice: baseline,
            newPrice,
            link: newLink,
          });
          if (result.sent) report.emailsSent++;
          if (result.stubbed) report.emailsStubbed++;
          updates.lastNotifiedPrice = newPrice;
        }

        if (shouldNotifyTarget && user?.email) {
          const result = await sendTargetReachedEmail({
            to: user.email,
            displayName: user.displayName,
            productName: it.data.name,
            targetPrice,
            newPrice,
            link: newLink,
          });
          if (result.sent) report.emailsSent++;
          if (result.stubbed) report.emailsStubbed++;
          updates.lastTargetNotifiedPrice = newPrice;
        }

        await it.ref.update(updates);
      }
      report.groupsChecked++;
    } catch (err) {
      console.error('[cron] group failed:', group.name, err.message);
      report.failures++;
    }
  }

  return report;
}

app.post('/api/cron/check-prices', async (req, res) => {
  const provided = req.get('x-cron-secret');
  if (!process.env.CRON_SECRET || provided !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  if (!firestore) {
    return res.status(503).json({ error: 'Firestore not configured' });
  }

  try {
    const report = await checkPricesOnce();
    res.json({ ok: true, ...report });
  } catch (err) {
    console.error('[cron] failed:', err.message);
    res.status(500).json({ error: 'Price check failed' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
