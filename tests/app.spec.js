import { test, expect } from '@playwright/test';

test.describe('RuMa-Pro Web UI', () => {
  test('homepage loads with title', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('RuMa-Pro');
  });

  test('navigation works', async ({ page }) => {
    await page.goto('/');
    await page.click('text=运行模式');
    await expect(page.locator('#modes')).toBeVisible();
  });

  test('mode selector exists', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#modeSelect')).toBeVisible();
  });

  test('flavor selector exists', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#flavorSelect')).toBeVisible();
  });

  test('generate button works', async ({ page }) => {
    await page.goto('/');
    await page.selectOption('#modeSelect', 'diagnose');
    await page.selectOption('#flavorSelect', 'ruma');
    await page.click('#generateBtn');
    await expect(page.locator('#generatedPrompt')).toBeVisible();
  });

  test('modes section has cards', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.card').first()).toBeVisible();
  });

  test('flavors section has cards', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.flavor-card').first()).toBeVisible();
  });

  test('ruma section visible', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#ruma')).toBeVisible();
  });

  test('pressure levels displayed', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.level-card').first()).toBeVisible();
  });

  test('7 checklist items', async ({ page }) => {
    await page.goto('/');
    const items = await page.locator('.checklist li').count();
    expect(items).toBe(7);
  });

  test('install section has commands', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.install-card').first()).toBeVisible();
  });

  test('generate produces output', async ({ page }) => {
    await page.goto('/');
    await page.selectOption('#modeSelect', 'diagnose');
    await page.selectOption('#flavorSelect', 'ruma');
    await page.click('#generateBtn');
    await expect(page.locator('#generatedPrompt pre')).not.toBeEmpty();
  });

  test('card click works', async ({ page }) => {
    await page.goto('/');
    await page.click('.card:first-child .use-btn');
    // Should have scrolled or selected
    const modeValue = await page.locator('#modeSelect').inputValue();
    expect(modeValue).toBeTruthy();
  });

  test('mobile responsive', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await expect(page.locator('header')).toBeVisible();
  });
});
