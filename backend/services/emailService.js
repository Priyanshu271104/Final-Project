const mailer = require('../config/mailer');

async function sendEmail({
  to,
  subject,
  text,
}) {
  if (!mailer) {
    console.log(
      `[email-stub] to=${to} subject="${subject}"`
    );

    return {
      stubbed: true,
    };
  }

  await mailer.sendMail({
    from: `"Pricelens Alerts" <${process.env.GMAIL_USER}>`,
    to,
    subject,
    text,
  });

  return {
    sent: true,
  };
}

async function sendTargetReachedEmail({
  to,
  displayName,
  productName,
  targetPrice,
  newPrice,
  link,
}) {
  const subject = `Target hit: ${productName} is now ₹${newPrice.toLocaleString(
    'en-IN'
  )}`;

  const text = [
    `Hi${displayName ? ' ' + displayName : ''},`,
    '',
    `A product you're tracking just hit your target price:`,
    '',
    `${productName}`,
    `Your target: ₹${targetPrice.toLocaleString('en-IN')}`,
    `Current price: ₹${newPrice.toLocaleString('en-IN')}`,
    '',
    link ? `Buy it here: ${link}` : '',
    '',
    `— Pricelens`,
  ]
    .filter(Boolean)
    .join('\n');

  return sendEmail({
    to,
    subject,
    text,
  });
}

async function sendDropEmail({
  to,
  displayName,
  productName,
  oldPrice,
  newPrice,
  link,
}) {
  const dropPct = (
    ((oldPrice - newPrice) / oldPrice) *
    100
  ).toFixed(1);

  const subject = `Price drop: ${productName} is now ₹${newPrice.toLocaleString(
    'en-IN'
  )}`;

  const text = [
    `Hi${displayName ? ' ' + displayName : ''},`,
    '',
    `Good news — a product on your wishlist just dropped in price:`,
    '',
    `${productName}`,
    `Was: ₹${oldPrice.toLocaleString('en-IN')}`,
    `Now: ₹${newPrice.toLocaleString(
      'en-IN'
    )} (-${dropPct}%)`,
    '',
    link ? `Buy it here: ${link}` : '',
    '',
    `— Pricelens`,
  ]
    .filter(Boolean)
    .join('\n');

  return sendEmail({
    to,
    subject,
    text,
  });
}

module.exports = {
  sendDropEmail,
  sendTargetReachedEmail,
};