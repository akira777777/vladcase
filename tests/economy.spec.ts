import { test, expect } from '@playwright/test';
import { ITEMS } from '../data/mockData';

const key = 'vladcase_state_v2';
test.beforeEach(async ({ page }) => {
  page.on('pageerror', (error) => {
    throw error;
  });
});
test('Upgrader navigation is internal and leads to the upgrade page', async ({
  page,
}) => {
  await page.goto('/');
  const links = page.getByRole('link', { name: 'Upgrader' });
  await expect(links.first()).toBeVisible();
  for (const link of await links.all()) {
    await expect(link).toHaveAttribute('href', '/upgrade');
  }
  await links.first().click();
  await expect(
    page.getByRole('heading', { name: /Upgrade your/ })
  ).toBeVisible();
});

test('upgrader commits the outcome before animation and survives reload', async ({
  page,
  context,
}) => {
  // Deterministic roll: with input $0.50 and Glock-18 | Water Elemental
  // ($24.50) the chance is (50/2450)*95 ≈ 1.94%, so 0.05*100 = 5 > 1.94 →
  // deterministic LOSS. The test asserts the loss path end-to-end.
  await page.addInitScript(() => {
    Math.random = () => 0.05;
  });
  await page.addInitScript(
    ({ key, input }) => {
      localStorage.setItem(
        key,
        JSON.stringify({
          version: 2,
          balanceCents: 100000,
          xp: 0,
          history: [],
          stats: {
            totalOpens: 0,
            totalSpentCents: 0,
            totalDropValueCents: 0,
            realizedCents: 0,
            removedValueCents: 0,
            rarityCounts: { Consumer: 1, Industrial: 0, 'Mil-Spec': 0, Restricted: 0, Classified: 0, Covert: 0, 'Special Item': 0 },
            caseCounts: {},
            currentRareStreak: 0,
            bestRareStreak: 0,
            bestDropInstanceId: null,
          },
          favoriteIds: [],
          goalIds: [],
          inventory: [{ ...input, instanceId: 'seed-input', unboxedAt: 1 }],
        })
      );
    },
    { key, input: ITEMS.find((item) => item.id === 'item-nova-sanddune')! }
  );
  await page.goto('/upgrade');
  // Select the seeded input item.
  await page.getByRole('button', { name: 'Nova | Sand Dune' }).first().click();
  // M4A4 | Howl costs $4,200 — the 0.85 -> 4.00 plan cannot reach it; pick a
  // reachable target instead: Glock-18 | Water Elemental ($24.50) via All list.
  await page.getByRole('button', { name: 'All', exact: true }).click();
  await page.getByRole('button', { name: 'Glock-18 | Water Elemental' }).click();
  await page.getByRole('button', { name: 'Upgrade', exact: true }).click();
  // The wheel spins on the page (~4.2s) before the result dialog opens.
  const dialog = page.getByRole('dialog', { name: /^Upgrade (won|lost)/ });
  await expect(dialog).toBeVisible({ timeout: 10000 });
  await expect(
    dialog.getByText(/Upgrade (successful|failed)/)
  ).toBeVisible();
  // Outcome already committed: the input was removed from saved storage.
  await expect
    .poll(() =>
      page.evaluate(
        (k) =>
          JSON.parse(localStorage.getItem(k) || '{}').inventory?.length ?? -1,
        key
      )
    )
    .toBe(0);
  // A fresh page in the same context shares localStorage but does not re-run
  // the seed init script, so this proves the outcome persisted on disk.
  const second = await context.newPage();
  await second.goto('/inventory');
  await expect(
    second.getByRole('heading', { name: 'No items in your inventory' })
  ).toBeVisible();
  // Lifetime upgrader stats reflect the committed loss.
  await second.goto('/stats');
  await expect(second.getByRole('heading', { name: 'Upgrader performance' })).toBeVisible();
  await expect(second.getByText('Losses', { exact: true })).toBeVisible();
  await expect(
    second.locator('section', { hasText: 'Upgrader performance' }).getByText('1', { exact: true }).first()
  ).toBeVisible();
});

test('won upgrade chains into the next round with the reward preselected', async ({
  page,
}) => {
  // Deterministic win: 0.001 < 1.94% chance for 0.50 -> 24.50.
  await page.addInitScript(() => {
    Math.random = () => 0.001;
  });
  await page.addInitScript(
    ({ key, input }) => {
      localStorage.setItem(
        key,
        JSON.stringify({
          version: 2,
          balanceCents: 100000,
          xp: 0,
          history: [],
          stats: {
            totalOpens: 0,
            totalSpentCents: 0,
            totalDropValueCents: 0,
            realizedCents: 0,
            removedValueCents: 0,
            rarityCounts: { Consumer: 1, Industrial: 0, 'Mil-Spec': 0, Restricted: 0, Classified: 0, Covert: 0, 'Special Item': 0 },
            caseCounts: {},
            currentRareStreak: 0,
            bestRareStreak: 0,
            bestDropInstanceId: null,
          },
          favoriteIds: [],
          goalIds: [],
          inventory: [{ ...input, instanceId: 'seed-input', unboxedAt: 1 }],
        })
      );
    },
    { key, input: ITEMS.find((item) => item.id === 'item-nova-sanddune')! }
  );
  await page.goto('/upgrade');
  await page.getByRole('button', { name: 'Nova | Sand Dune' }).first().click();
  await page.getByRole('button', { name: 'All', exact: true }).click();
  await page.getByRole('button', { name: 'Glock-18 | Water Elemental' }).click();
  await page.getByRole('button', { name: 'Upgrade', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: /Upgrade won/ });
  await expect(dialog.getByText('Upgrade successful!')).toBeVisible({
    timeout: 10000,
  });
  // Chaining: "Upgrade Again" must preselect the won Glock as the next input.
  await dialog.getByRole('button', { name: 'Upgrade Again' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(
    page.getByText('Glock-18 | Water Elemental · $24.50')
  ).toBeVisible();
  // The target panel offers pricier targets for the $24.50 input immediately.
  await expect(
    page.getByRole('button', { name: 'AK-47 | Redline' }).first()
  ).toBeVisible();
});


test('opening saves before animation, survives reload, and sells once', async ({
  page,
}) => {
  await page.goto('/');
  await page
    .getByRole('button', { name: 'Open Case', exact: true })
    .first()
    .click();
  await expect
    .poll(() =>
      page.evaluate(
        (k) => JSON.parse(localStorage.getItem(k)!).inventory.length,
        key
      )
    )
    .toBe(1);
  await page.reload();
  await page.goto('/inventory');
  await expect(
    page.getByRole('button', { name: 'Sell', exact: true })
  ).toHaveCount(1);
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Sell', exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'Sell', exact: true })
  ).toHaveCount(0);
});

test('normal opening animates reel and does not skip prematurely', async ({
  page,
}) => {
  await page.goto('/');
  await page
    .getByRole('button', { name: 'Open Case', exact: true })
    .first()
    .click();
  const openingDialog = page.getByRole('dialog', { name: /^Opening / });
  await expect(openingDialog).toBeVisible();
  // The animation is ~4.8s. It must still be spinning after 2s and not aborted.
  await page.waitForTimeout(2000);
  await expect(openingDialog).toBeVisible();
  await expect(page.getByRole('dialog', { name: /^Won / })).toBeVisible({
    timeout: 6000,
  });
});
test('quick opening, keyboard dismissal, repeat opening, and selling', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByTitle('Instant Open').first().click();
  await expect(page.getByRole('dialog', { name: /^Won / })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.getByTitle('Instant Open').first().click();
  await page.getByRole('button', { name: 'Open Another Case' }).click();
  await expect(page.getByRole('dialog', { name: /^Opening / })).toBeVisible();
  await expect(page.getByRole('dialog', { name: /^Won / })).toBeVisible({
    timeout: 12000,
  });
  await page.getByRole('button', { name: /^Sell for/ }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
});
test('two tabs preserve concurrent credits', async ({ page, context }) => {
  await page.goto('/');
  const second = await context.newPage();
  await second.goto('/');
  await Promise.all([
    page
      .getByRole('button', { name: 'Add $500 free credits', exact: true })
      .click(),
    second
      .getByRole('button', { name: 'Add $500 free credits', exact: true })
      .click(),
  ]);
  await expect
    .poll(() =>
      page.evaluate(
        (k) => JSON.parse(localStorage.getItem(k)!).balanceCents,
        key
      )
    )
    .toBe(200000);
  await expect(page.locator('nav')).toContainText('$2,000.00');
  await expect(second.locator('nav')).toContainText('$2,000.00');
});
test('corrupt data stays untouched and blocks spending', async ({ page }) => {
  await page.addInitScript((k) => localStorage.setItem(k, '{broken'), key);
  await page.goto('/');
  await expect(
    page.getByRole('alert').filter({ hasText: 'Saved data was preserved' })
  ).toBeVisible();
  await expect(page.getByTitle('Instant Open').first()).toBeDisabled();
  expect(await page.evaluate((k) => localStorage.getItem(k), key)).toBe(
    '{broken'
  );
});
test('reduced motion skips the reel and mobile layout fits', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  await page
    .getByRole('button', { name: 'Open Case', exact: true })
    .first()
    .click();
  await expect(page.getByRole('dialog', { name: /^Won / })).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    )
  ).toBe(true);
});

test('storage failure does not charge or award, and retry works', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.getByTitle('Instant Open').first()).toBeEnabled();
  await page.evaluate(() => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      if (key === 'vladcase_state_v2') {
        Storage.prototype.setItem = original;
        throw new DOMException('Full', 'QuotaExceededError');
      }
      original.call(this, key, value);
    };
  });
  await page.getByTitle('Instant Open').first().click();
  await expect(
    page.getByRole('alert').filter({ hasText: 'Nothing was charged' })
  ).toBeVisible();
  expect(
    await page.evaluate(
      (k) => JSON.parse(localStorage.getItem(k)!).balanceCents,
      key
    )
  ).toBe(100000);
  await page.getByTitle('Instant Open').first().click();
  await expect(page.getByRole('dialog', { name: /^Won / })).toBeVisible();
});

test('unsupported locks block mutations', async ({ page }) => {
  await page.addInitScript(() =>
    Object.defineProperty(navigator, 'locks', { value: undefined })
  );
  await page.goto('/');
  await expect(
    page.getByRole('alert').filter({ hasText: 'Web Locks support' })
  ).toBeVisible();
  await expect(page.getByTitle('Instant Open').first()).toBeDisabled();
});

test('large inventory paginates, filters, sorts, and resets visible count', async ({
  page,
}) => {
  await page.addInitScript(
    ({ key, items }) => {
      localStorage.setItem(
        key,
        JSON.stringify({
          version: 2,
          balanceCents: 100000,
          xp: 0,
          history: [],
          stats: {
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
          },
          favoriteIds: [],
          goalIds: [],
          inventory: Array.from({ length: 5000 }, (_, index) => ({
            ...items[index % items.length],
            instanceId: `seed-${index}`,
            unboxedAt: index,
          })),
        })
      );
    },
    { key, items: ITEMS }
  );
  await page.goto('/inventory');
  await expect(
    page.getByRole('button', { name: 'Sell', exact: true })
  ).toHaveCount(48);
  await page.getByRole('button', { name: /^Load more/ }).click();
  await expect(
    page.getByRole('button', { name: 'Sell', exact: true })
  ).toHaveCount(96);
  await page
    .getByRole('textbox', { name: 'Search inventory' })
    .fill('  slate  ');
  await expect(
    page.getByRole('button', { name: 'Sell', exact: true })
  ).toHaveCount(48);
  await expect(page.locator('h4').first()).toHaveText('AK-47 | Slate');
  await page.getByLabel('Sort inventory').selectOption('value_asc');
  await page.getByLabel('Filter rarity').selectOption('Special Item');
  await expect(page.getByText('No items match your filters')).toBeVisible();
});

test('resize completes reveal once; preview focus stays inside dialog', async ({
  page,
}) => {
  await page.goto('/');
  const preview = page.getByRole('button', {
    name: 'View Starter Recruit contents',
  });
  await preview.click();
  await page.keyboard.press('Tab');
  expect(
    await page.evaluate(() => !!document.activeElement?.closest('dialog'))
  ).toBe(true);
  await page.keyboard.press('Escape');
  await expect(preview).toBeFocused();
  await page
    .getByRole('button', { name: 'Open Case', exact: true })
    .first()
    .click();
  await expect(page.getByRole('dialog', { name: /^Opening / })).toBeVisible();
  await page.setViewportSize({ width: 600, height: 900 });
  await expect(page.getByRole('dialog', { name: /^Won / })).toBeVisible({
    timeout: 12000,
  });
  expect(
    await page.evaluate(
      (k) => JSON.parse(localStorage.getItem(k)!).inventory.length,
      key
    )
  ).toBe(1);
});

test('local artwork loads and broken images have a stable fallback', async ({
  page,
}) => {
  await page.route('**/assets/case-budget-starter.webp', (route) =>
    route.abort()
  );
  await page.goto('/');
  await page
    .getByRole('img', { name: 'Starter Recruit', exact: true })
    .scrollIntoViewIfNeeded();
  await expect(
    page.locator('span[role="img"]').filter({ hasText: 'Starter Recruit' })
  ).toBeVisible();
  const image = page.getByRole('img', {
    name: 'Kalashnikov Special',
    exact: true,
  });
  await image.scrollIntoViewIfNeeded();
  await expect
    .poll(() =>
      image.evaluate((element) => (element as HTMLImageElement).naturalWidth)
    )
    .toBeGreaterThan(0);
});

test('simultaneous sales in two tabs credit an instance once', async ({
  page,
  context,
}) => {
  await page.goto('/');
  await page.getByTitle('Instant Open').first().click();
  await expect(page.getByRole('dialog', { name: /^Won / })).toBeVisible();
  const before = await page.evaluate(
    (k) => JSON.parse(localStorage.getItem(k)!),
    key
  );
  await page.goto('/inventory');
  const second = await context.newPage();
  await second.goto('/inventory');
  await expect(
    second.getByRole('button', { name: 'Sell', exact: true })
  ).toBeVisible();
  page.once('dialog', (dialog) => dialog.accept());
  second.once('dialog', (dialog) => dialog.accept());
  await Promise.all(
    [page, second].map((tab) =>
      tab
        .getByRole('button', { name: 'Sell', exact: true })
        .evaluate((element: HTMLButtonElement) => element.click())
    )
  );
  await expect
    .poll(() =>
      page.evaluate(
        (k) => JSON.parse(localStorage.getItem(k)!).inventory.length,
        key
      )
    )
    .toBe(0);
  expect(
    await page.evaluate(
      (k) => JSON.parse(localStorage.getItem(k)!).balanceCents,
      key
    )
  ).toBe(before.balanceCents + Math.round(before.inventory[0].demoValue * 100));
});

test('sell-all and reset honor confirmation; screenshots show local artwork', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'BUDGET', exact: true }).click();
  await expect(page.getByTitle('Instant Open')).toHaveCount(1);
  await page.getByTitle('Instant Open').click();
  await expect(page.getByRole('dialog', { name: /^Won / })).toBeVisible();
  await page.keyboard.press('Escape');
  await page.goto('/inventory');
  await page.screenshot({ path: 'test-results/inventory.png', fullPage: true });
  page.once('dialog', (dialog) => dialog.dismiss());
  await page.getByRole('button', { name: 'Sell All', exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'Sell', exact: true })
  ).toHaveCount(1);
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Sell All', exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'Sell', exact: true })
  ).toHaveCount(0);
  await page.goto('/');
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Reset progress' }).click();
  await expect
    .poll(() =>
      page.evaluate((k) => JSON.parse(localStorage.getItem(k)!).xp, key)
    )
    .toBe(0);
  await page.locator('#cases').scrollIntoViewIfNeeded();
  await expect
    .poll(() =>
      page
        .getByRole('img', { name: 'Starter Recruit', exact: true })
        .evaluate((image: HTMLImageElement) => image.naturalWidth)
    )
    .toBeGreaterThan(0);
  await page.screenshot({
    path: 'test-results/home-desktop.png',
    fullPage: true,
  });
  await page.setViewportSize({ width: 375, height: 812 });
  await page.screenshot({
    path: 'test-results/home-mobile.png',
    fullPage: true,
  });
});
