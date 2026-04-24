export const DEMO_LINKS = {
  'iphone 15': {
    'amazon': 'https://www.amazon.in/Apple-iPhone-15-128-GB/dp/B0CHX1W1XY',
    'flipkart': 'https://www.flipkart.com/apple-iphone-15-black-128-gb/p/itm6ac648551528c',
    'croma': 'https://www.croma.com/apple-iphone-15-128gb-black-/p/300652',
    'reliance': 'https://www.reliancedigital.in/apple-iphone-15-128-gb-black/p/493838405'
  },
  'samsung galaxy s24': {
    'amazon': 'https://www.amazon.in/Samsung-Galaxy-Ultra-Titanium-Storage/dp/B0CS5YGVQ6',
    'flipkart': 'https://www.flipkart.com/samsung-galaxy-s24-ultra-5g-titanium-gray-256-gb/p/itm5a511894a4c47',
    'croma': 'https://www.croma.com/samsung-galaxy-s24-ultra-5g-12gb-ram-256gb-titanium-gray-/p/303539'
  },
  'oneplus 12': {
    'amazon': 'https://www.amazon.in/OnePlus-Flowy-Emerald-512GB-Storage/dp/B0CQPM6YZH',
    'flipkart': 'https://www.flipkart.com/oneplus-12-flowy-emerald-512-gb/p/itm3d25425e982d6'
  },
  'oneplus nord': {
    'amazon': 'https://www.amazon.in/OnePlus-Nord-Lite-Chromatic-Storage/dp/B0BY8MCQ9S',
    'flipkart': 'https://www.flipkart.com/oneplus-nord-ce-3-lite-5g-chromatic-gray-256-gb/p/itm2cd5a4e659035',
    'croma': 'https://www.croma.com/oneplus-nord-ce-3-lite-5g-8gb-ram-256gb-chromatic-gray-/p/270659'
  },
  'samsung galaxy fold': {
    'amazon': 'https://www.amazon.in/Samsung-Galaxy-Fold5-Phantom-Storage/dp/B0CBYD7J4H',
    'flipkart': 'https://www.flipkart.com/samsung-galaxy-z-fold5-5g-phantom-black-512-gb/p/itm2a0468f3077aa',
    'croma': 'https://www.croma.com/samsung-galaxy-z-fold5-5g-12gb-ram-512gb-phantom-black-/p/275553'
  },
  'macbook air': {
    'amazon': 'https://www.amazon.in/Apple-2022-MacBook-Laptop-chip/dp/B0B3B8VCV1',
    'flipkart': 'https://www.flipkart.com/apple-2022-macbook-air-m2-8-gb-256-gb-ssd-mac-os-monterey-mly33hn-a/p/itm0b0a809462217'
  },
  'ipad air': {
    'amazon': 'https://www.amazon.in/Apple-iPad-Air-11-inch-M2/dp/B0D3J63P6F',
    'flipkart': 'https://www.flipkart.com/apple-ipad-air-6th-gen-11-inch-m2-chip-128-gb-wi-fi-blue/p/itmdb22b404c062c'
  },
  'sony wh-1000xm5': {
    'amazon': 'https://www.amazon.in/Sony-WH-1000XM5-Cancelling-Headphones-Connectivity/dp/B09XS7JWHH',
    'flipkart': 'https://www.flipkart.com/sony-wh-1000xm5-active-noise-cancellation-bluetooth-headset/p/itm9e6df81559e2b',
    'croma': 'https://www.croma.com/sony-wh-1000xm5-bluetooth-headset-with-active-noise-cancellation-mic-black-/p/260064'
  },
  'apple watch': {
    'amazon': 'https://www.amazon.in/Apple-Watch-Smartwatch-Midnight-Aluminum/dp/B0CHX31D61',
    'flipkart': 'https://www.flipkart.com/apple-watch-series-9-gps-41mm-midnight-aluminium-case-sport-band/p/itm9a3d460e4092b',
    'croma': 'https://www.croma.com/apple-watch-series-9-gps-41mm-midnight-aluminium-case-with-midnight-sport-band-s-m-/p/300762'
  },
  'ipod': { 
    'amazon': 'https://www.amazon.in/Apple-AirPods-Pro-2nd-Generation/dp/B0BDK4Z2K2',
    'flipkart': 'https://www.flipkart.com/apple-airpods-pro-2nd-gen-magsafe-charging-case-usb-c-bluetooth-headset/p/itm3c26cb5c76747'
  },
  'airpods': {
    'amazon': 'https://www.amazon.in/Apple-AirPods-Pro-2nd-Generation/dp/B0BDK4Z2K2',
    'flipkart': 'https://www.flipkart.com/apple-airpods-pro-2nd-gen-magsafe-charging-case-usb-c-bluetooth-headset/p/itm3c26cb5c76747'
  },
  'samsung refrigerator': {
    'amazon': 'https://www.amazon.in/Samsung-Convertible-Refrigerator-RT28C3733S8-HL/dp/B0BR4F6F4C',
    'flipkart': 'https://www.flipkart.com/samsung-236-l-frost-free-double-door-2-star-convertible-refrigerator-silver/p/itm4b23d9b0a1d6e',
    'croma': 'https://www.croma.com/samsung-236-litres-2-star-frost-free-double-door-convertible-refrigerator-with-digital-inverter-technology-2023-model-rt28c3733s8-hl-silver-elegant-inam-/p/270425'
  },
  'smart tv': { 
    'amazon': 'https://www.amazon.in/Sony-Bravia-inches-Google-KD-55X74L/dp/B0C1HZS3J6',
    'flipkart': 'https://www.flipkart.com/sony-bravia-x74l-138-8-cm-55-inch-ultra-hd-4k-led-smart-google-tv/p/itm5e43f0c103289',
    'croma': 'https://www.croma.com/sony-bravia-x74l-139-cm-55-inch-4k-ultra-hd-led-google-tv-with-x-protection-pro-2023-model-/p/272300'
  }
};

export const getStoreLink = (storeName, productName) => {
  const lowerName = storeName.toLowerCase();
  const lowerProduct = productName.toLowerCase();

  const demoKey = Object.keys(DEMO_LINKS).find(key => lowerProduct.includes(key));
  
  if (demoKey) {
    if (lowerName.includes('amazon') && DEMO_LINKS[demoKey]['amazon']) return DEMO_LINKS[demoKey]['amazon'];
    if (lowerName.includes('flipkart') && DEMO_LINKS[demoKey]['flipkart']) return DEMO_LINKS[demoKey]['flipkart'];
    if (lowerName.includes('croma') && DEMO_LINKS[demoKey]['croma']) return DEMO_LINKS[demoKey]['croma'];
    if (lowerName.includes('reliance') && DEMO_LINKS[demoKey]['reliance']) return DEMO_LINKS[demoKey]['reliance'];
  }

  // Fallback search logic if exact product isn't in DEMO_LINKS
  const q = encodeURIComponent(productName);
  
  if (lowerName.includes('amazon')) return `https://www.amazon.in/s?k=${q}`;
  if (lowerName.includes('flipkart')) return `https://www.flipkart.com/search?q=${q}`;
  if (lowerName.includes('croma')) return `https://www.croma.com/search/?text=${q}`;
  if (lowerName.includes('reliance')) return `https://www.reliancedigital.in/search?q=${q}`;
  
  return `https://www.google.com/search?q=${q}+${storeName}`;
};

export const enrichProductWithCompetitors = (product) => {
  const rawStores = Array.isArray(product.stores) ? product.stores : [];
  const realStores = rawStores.map(s => ({
    ...s,
    link: s.link || getStoreLink(s.name, product.name)
  }));

  // If SerpAPI already returned multiple stores, we don't need to simulate them
  if (realStores.length > 1) return { ...product, stores: realStores };

  const basePrice = product.currentPrice;
  const competitors = [
    { name: 'Amazon', logo: 'AMZ', color: 'text-yellow-600', variance: 0 },
    { name: 'Flipkart', logo: 'FLP', color: 'text-blue-600', variance: 0.02 }, 
    { name: 'Croma', logo: 'CRO', color: 'text-teal-600', variance: -0.015 }, 
    { name: 'Reliance', logo: 'REL', color: 'text-red-600', variance: 0.03 }   
  ];

  const existingStoreName = realStores[0]?.name?.toLowerCase() || '';
  
  // Create 2 fake competitor listings to show comparison functionality
  const newStores = competitors
    .filter(c => !existingStoreName.includes(c.name.toLowerCase()))
    .slice(0, 2) 
    .map(c => ({
      name: c.name,
      logo: c.logo,
      color: c.color,
      price: Math.round(basePrice * (1 + c.variance)),
      link: getStoreLink(c.name, product.name) 
    }));

  return {
    ...product,
    stores: [...realStores, ...newStores].sort((a, b) => a.price - b.price)
  };
};