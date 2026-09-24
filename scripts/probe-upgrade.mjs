import { chromium } from '@playwright/test';

const key = 'vladcase_state_v2';
const base = 'http://127.0.0.1:3200';
const browser = await chromium.launch();
const context = await browser.newContext();
const page = await context.newPage();
page.on('pageerror', (e) => console.log('PAGEERROR:', e.message));
page.on('console', (m) => {
  if (m.type() === 'error') console.log('CONSOLE:', m.text());
});
await page.addInitScript(`
  Math.random = () => 0.001;
  localStorage.setItem('vladcase_state_v2', JSON.stringify({
    version: 2,
    balanceCents: 100000,
    xp: 0,
    history: [],
    stats: {
      totalOpens: 0, totalSpentCents: 0, totalDropValueCents: 0,
      realizedCents: 0, removedValueCents: 0,
      rarityCounts: { Consumer: 0, Industrial: 0, 'Mil-Spec': 0, Restricted: 0, Classified: 0, Covert: 0, 'Special Item': 0 },
      caseCounts: {}, currentRareStreak: 0, bestRareStreak: 0, bestDropInstanceId: null,
    },
    favoriteIds: [],
    goalIds: [],
    inventory: [{
      id: 'item-nova-sanddune', name: 'Nova | Sand Dune', weaponType: 'Shotgun',
      image: '/assets/item-nova-sanddune.webp', rarity: 'Consumer',
      demoValue: 0.5, dropChance: 50, instanceId: 'seed-input', unboxedAt: 1,
    }],
  }));
`);
await page.goto(`${base}/upgrade`);
await page.waitForTimeout(1500);
const stored = await page.evaluate((k) => localStorage.getItem(k), key);
console.log('STORED:', stored ? stored.slice(0, 200) : 'NULL');
const alert = await page.getByRole('alert').allTextContents();
console.log('ALERTS:', JSON.stringify(alert));
const alertHtml = await page.evaluate(() =>
  Array.from(document.querySelectorAll('[role="alert"], [aria-live]')).map(
    (el) => el.outerHTML.slice(0, 200)
  )
);
console.log('ALERT_HTML:', JSON.stringify(alertHtml, null, 2));
const pwAlerts = await page.getByRole('alert').evaluateAll((els) =>
  els.map((el) => ({
    tag: el.tagName,
    html: el.outerHTML.slice(0, 250),
  }))
);
console.log('PW_ALERTS:', JSON.stringify(pwAlerts, null, 2));
const lockSupport = await page.evaluate(() => Boolean(navigator.locks));
console.log('LOCKS:', lockSupport);
const bodyText = await page.getByRole('main').textContent();
console.log('MAIN has Nova:', bodyText?.includes('Nova | Sand Dune'));
console.log('MAIN has No skins:', bodyText?.includes('No skins available'));
console.log('MAIN snippet:', bodyText?.slice(0, 400));
await browser.close();
