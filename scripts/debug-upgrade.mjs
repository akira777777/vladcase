import { chromium } from '@playwright/test';

const key = 'vladcase_state_v2';
const base = 'http://127.0.0.1:3200';
const nova = {
  id: 'item-nova-sanddune',
  name: 'Nova | Sand Dune',
  weaponType: 'Shotgun',
  image: '/assets/item-nova-sanddune.webp',
  rarity: 'Consumer',
  demoValue: 0.5,
  dropChance: 50,
};
const emptyStats = () => ({
  totalOpens: 0,
  totalSpentCents: 0,
  totalDropValueCents: 0,
  realizedCents: 0,
  removedValueCents: 0,
  rarityCounts: { Consumer: 0, Industrial: 0, 'Mil-Spec': 0, Restricted: 0, Classified: 0, Covert: 0, 'Special Item': 0 },
  caseCounts: {},
  currentRareStreak: 0,
  bestRareStreak: 0,
  bestDropInstanceId: null,
});

const results = [];
const check = (name, condition, detail = '') => {
  results.push({ name, ok: !!condition, detail });
  console.log(`${condition ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
};

async function newSession(browser, { random, seedItem } = {}) {
  const context = await browser.newContext();
  const page = await context.newPage();
  const problems = [];
  page.on('pageerror', (error) => problems.push(`pageerror: ${error}`));
  page.on('console', (message) => {
    if (message.type() === 'error') problems.push(`console: ${message.text()}`);
  });
  if (random !== undefined)
    await page.addInitScript(`Math.random = () => ${random};`);
  if (seedItem)
    await page.addInitScript(
      ([k, payload]) => {
        localStorage.setItem(k, payload);
      },
      [
        key,
        JSON.stringify({
          version: 2,
          balanceCents: 100000,
          xp: 0,
          history: [],
          stats: emptyStats(),
          favoriteIds: [],
          goalIds: [],
          inventory: [{ ...seedItem, instanceId: 'seed-input', unboxedAt: 1 }],
        }),
      ]
    );
  return { context, page, problems };
}

const state = (page) =>
  page.evaluate((k) => JSON.parse(localStorage.getItem(k) || 'null'), key);

const browser = await chromium.launch();

// ── Scenario 1: deterministic WIN ───────────────────────────────────────────
{
  const { context, page, problems } = await newSession(browser, {
    random: 0.001,
    seedItem: nova,
  });
  await page.goto(`${base}/upgrade`);
  check('win: wheel renders before selection', await page.getByText('Win chance', { exact: true }).isVisible());

  await page.getByRole('button', { name: 'Nova | Sand Dune' }).first().click();
  await page.getByRole('button', { name: 'All', exact: true }).click();
  await page.getByRole('button', { name: 'Glock-18 | Water Elemental' }).click();
  const upgradeButton = page.getByRole('button', { name: 'Upgrade', exact: true });
  check('win: upgrade button enabled after both picks', await upgradeButton.isEnabled());
  await upgradeButton.click();

  const dialog = page.getByRole('dialog');
  await dialog.waitFor({ timeout: 10000 });
  const banner = dialog.getByText('Upgrade successful!');
  await banner.waitFor({ timeout: 10000 });
  check('win: result dialog shows success banner', await banner.isVisible());
  check('win: dialog names the target', (await dialog.textContent('body'))?.includes('Glock-18 | Water Elemental') ?? false);

  const saved = await state(page);
  check('win: storage awarded the target', saved?.inventory?.[0]?.id === 'item-glock-water-elemental');
  check('win: upgradeWins incremented', saved?.stats?.upgradeWins === 1, `=${saved?.stats?.upgradeWins}`);
  check('win: wagered recorded (50 cents)', saved?.stats?.upgradeWageredCents === 50, `=${saved?.stats?.upgradeWageredCents}`);
  check('win: xp granted (+200)', saved?.xp === 200, `=${saved?.xp}`);

  await dialog.getByRole('button', { name: 'Upgrade Again' }).click();
  await page.waitForTimeout(300);
  check('win: upgrade again closes dialog', (await page.getByRole('dialog').count()) === 0);
  check('win: no real error alert after reset', (await page.locator('div[role="alert"]:not(#__next-route-announcer__)').count()) === 0);
  check('win: no console/page errors', problems.length === 0, problems.join(' | ').slice(0, 300));
  await context.close();
}

// ── Scenario 2: deterministic LOSS ──────────────────────────────────────────
{
  const { context, page, problems } = await newSession(browser, {
    random: 0.9,
    seedItem: nova,
  });
  await page.goto(`${base}/upgrade`);
  await page.getByRole('button', { name: 'Nova | Sand Dune' }).first().click();
  await page.getByRole('button', { name: 'All', exact: true }).click();
  await page.getByRole('button', { name: 'Glock-18 | Water Elemental' }).click();
  await page.getByRole('button', { name: 'Upgrade', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await dialog.waitFor({ timeout: 10000 });
  const banner = dialog.getByText('Upgrade failed');
  await banner.waitFor({ timeout: 10000 });
  check('loss: result dialog shows failure banner', await banner.isVisible());
  const saved = await state(page);
  check('loss: input burned', (saved?.inventory?.length ?? -1) === 0);
  check('loss: upgradeLosses incremented', saved?.stats?.upgradeLosses === 1, `=${saved?.stats?.upgradeLosses}`);
  check('loss: wagered recorded (50 cents)', saved?.stats?.upgradeWageredCents === 50, `=${saved?.stats?.upgradeWageredCents}`);
  check('loss: xp granted (+25)', saved?.xp === 25, `=${saved?.xp}`);
  check('loss: removedValue recorded', saved?.stats?.removedValueCents === 50, `=${saved?.stats?.removedValueCents}`);
  check('loss: no console/page errors', problems.length === 0, problems.join(' | ').slice(0, 300));
  await context.close();
}

// ── Scenario 3: empty inventory ─────────────────────────────────────────────
{
  const { context, page } = await newSession(browser, {});
  await page.goto(`${base}/upgrade`);
  check('empty: shows no-skins state', await page.getByText('No skins available').isVisible());
  await page.getByRole('link', { name: 'Go to Cases' }).click();
  await page.waitForURL(`${base}/`);
  check('empty: CTA navigates to cases', page.url() === `${base}/`);
  await context.close();
}

// ── Scenario 4: mobile viewport has no horizontal overflow ──────────────────
{
  const { context, page } = await newSession(browser, { seedItem: nova });
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto(`${base}/upgrade`);
  await page.getByRole('button', { name: 'Nova | Sand Dune' }).first().click();
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth
  );
  check('mobile: no horizontal overflow', overflow <= 0, `overflow=${overflow}px`);
  await context.close();
}

// ── Scenario 5: reduced motion completes almost instantly ───────────────────
{
  const { context, page } = await newSession(browser, { random: 0.001, seedItem: nova });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(`${base}/upgrade`);
  await page.getByRole('button', { name: 'Nova | Sand Dune' }).first().click();
  await page.getByRole('button', { name: 'All', exact: true }).click();
  await page.getByRole('button', { name: 'Glock-18 | Water Elemental' }).click();
  await page.getByRole('button', { name: 'Upgrade', exact: true }).click();
  const start = Date.now();
  await page.getByRole('dialog').getByText('Upgrade successful!').waitFor({ timeout: 5000 });
  check('reduced motion: result appears < 2s', Date.now() - start < 2000, `${Date.now() - start}ms`);
  await context.close();
}

// ── Scenario 6: chained upgrades, balance untouched, stats page reflects both ─
{
  // Deterministic roll alternates win (0.001) / loss (0.9) per navigation.
  const context = await browser.newContext();
  const page = await context.newPage();
  const problems = [];
  page.on('pageerror', (error) => problems.push(`pageerror: ${error}`));
  page.on('console', (message) => {
    if (message.type() === 'error') problems.push(`console: ${message.text()}`);
  });
  let roll = 0.001;
  void roll; // reserved for per-upgrade overrides if needed
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

  // Upgrade #1: Nova ($0.50) → Glock ($24.50), deterministic win.
  await page.getByRole('button', { name: 'Nova | Sand Dune' }).first().click();
  await page.getByRole('button', { name: 'All', exact: true }).click();
  await page.getByRole('button', { name: 'Glock-18 | Water Elemental' }).click();
  await page.getByRole('button', { name: 'Upgrade', exact: true }).click();
  const firstDialog = page.getByRole('dialog');
  await firstDialog.getByText('Upgrade successful!').waitFor({ timeout: 10000 });

  // Chain: upgrade the won Glock again (input stays selected as the new item).
  await firstDialog.getByRole('button', { name: 'Upgrade Again' }).click();
  await page.waitForTimeout(200);
  // After "Upgrade Again" the input selection is kept; pick a pricier target.
  await page.getByRole('button', { name: 'All', exact: true }).click();
  // Override the roll to a deterministic loss for upgrade #2.
  await page.evaluate(() => {
    Math.random = () => 0.9;
  });
  await page.getByRole('button', { name: 'AK-47 | Redline' }).click();
  await page.getByRole('button', { name: 'Upgrade', exact: true }).click();
  const secondDialog = page.getByRole('dialog');
  await secondDialog.getByText('Upgrade failed').waitFor({ timeout: 10000 });
  check('chain: second upgrade resolves as loss', await secondDialog.isVisible());
  await secondDialog.getByRole('button', { name: 'Close' }).click();
  await page.waitForTimeout(200);

  const saved = await state(page);
  check('chain: balance never charged by upgrades', saved?.balanceCents === 100000, `=${saved?.balanceCents}`);
  check('chain: wins=1 losses=1', saved?.stats?.upgradeWins === 1 && saved?.stats?.upgradeLosses === 1, `w=${saved?.stats?.upgradeWins} l=${saved?.stats?.upgradeLosses}`);
  check('chain: wagered sums both inputs (50+2450)', saved?.stats?.upgradeWageredCents === 2500, `=${saved?.stats?.upgradeWageredCents}`);
  check('chain: final xp 200+25', saved?.xp === 225, `=${saved?.xp}`);

  // A fresh page in the same context shares localStorage without re-running
  // this page's seed init script, so the stats reflect the committed data.
  const statsPage = await context.newPage();
  await statsPage.goto(`${base}/stats`);
  const statsText = await statsPage
    .locator('section', { hasText: 'Upgrader performance' })
    .textContent();
  check('chain: stats page shows wagered $25.00', statsText?.includes('$25.00') ?? false);
  check('chain: stats page shows 50% win rate', /50%/.test(statsText ?? ''), statsText?.slice(0, 160));
  check('chain: stats page shows wins=1 losses=1', /Wins1/.test(statsText ?? '') && /Losses1/.test(statsText ?? ''), statsText?.slice(0, 120));
  check('chain: no console/page errors', problems.length === 0, problems.join(' | ').slice(0, 300));
  await context.close();
}

await browser.close();

const failed = results.filter((entry) => !entry.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);
