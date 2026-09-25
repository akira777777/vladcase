import { expect, test } from '@playwright/test';

test('event countdown advances without a React maximum update loop', async ({
  page,
}) => {
  const updateLoopErrors: string[] = [];
  page.on('console', (message) => {
    if (
      message.type() === 'error' &&
      message.text().includes('Maximum update depth exceeded')
    ) {
      updateLoopErrors.push(message.text());
    }
  });

  await page.goto('/');
  const countdown = page.getByRole('timer', { name: 'Event countdown' });
  await expect(countdown).toBeVisible();
  const initialValue = await countdown.textContent();
  await expect
    .poll(() => countdown.textContent(), { timeout: 2_500 })
    .not.toBe(initialValue);

  expect(updateLoopErrors).toEqual([]);
});

test('mobile navigation does not cover the primary case-opening control', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/cases/case-budget-starter');

  const navigation = page.getByRole('navigation', {
    name: 'Mobile navigation',
  });
  const openButton = page.getByRole('button', { name: /Open 1/ });
  await expect(navigation).toBeVisible();
  await expect(openButton).toBeVisible();

  const navigationBox = await navigation.boundingBox();
  const openButtonBox = await openButton.boundingBox();
  expect(navigationBox).not.toBeNull();
  expect(openButtonBox).not.toBeNull();

  const openingControlBottom = openButtonBox!.y + openButtonBox!.height;
  expect(openingControlBottom).toBeLessThanOrEqual(navigationBox!.y - 8);
});

test('premium controls and skin cards animate on hover with a reduced-motion fallback', async ({
  page,
}) => {
  await page.goto('/');
  const eventCta = page.getByRole('link', { name: /Explore Event/ });
  await eventCta.hover();
  await expect
    .poll(() =>
      eventCta.evaluate((element) => getComputedStyle(element).transform)
    )
    .not.toBe('none');

  await page.goto('/cases/case-budget-starter');
  const skinCard = page.getByRole('group', {
    name: 'AWP | Asiimov skin',
  });
  await skinCard.hover();
  await expect
    .poll(() =>
      skinCard.evaluate((element) => getComputedStyle(element).transform)
    )
    .not.toBe('none');

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload();
  const reducedMotionCard = page.getByRole('group', {
    name: 'AWP | Asiimov skin',
  });
  await reducedMotionCard.hover();
  await expect
    .poll(() =>
      reducedMotionCard.evaluate((element) => getComputedStyle(element).transform)
    )
    .toBe('none');
});
