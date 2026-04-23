function extractPrice(priceString) {
  if (!priceString) return 0;

  return (
    parseInt(
      priceString
        .toString()
        .replace(/[^0-9]/g, ''),
      10
    ) || 0
  );
}

function normalizePrivateKey(raw) {
  if (!raw) return '';

  let key = raw.trim();

  if (key.endsWith(',')) {
    key = key.slice(0, -1).trim();
  }

  if (
    (key.startsWith('"') &&
      key.endsWith('"')) ||
    (key.startsWith("'") &&
      key.endsWith("'"))
  ) {
    key = key.slice(1, -1);
  }

  return key.replace(/\\n/g, '\n');
}

module.exports = {
  extractPrice,
  normalizePrivateKey,
};