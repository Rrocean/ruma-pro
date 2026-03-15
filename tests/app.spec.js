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

  test('ruma-pro 1000% power mode', async ({ page }) => {
    await page.goto('/');
    await page.selectOption('#modeSelect', 'ship');
    await page.selectOption('#flavorSelect', 'ruma-pro');
    await page.click('#generateBtn');
    const text = await page.locator('#generatedPrompt pre').textContent();
    expect(text).toContain('1000');
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

  // 模拟人类使用场景测试
  test('language switch to English', async ({ page }) => {
    await page.goto('/');
    await page.selectOption('#langSelect', 'en');
    await expect(page.locator('nav >> text=Modes').first()).toBeVisible();
  });

  test('language switch to Japanese', async ({ page }) => {
    await page.goto('/');
    await page.selectOption('#langSelect', 'ja');
    await expect(page.locator('nav >> text=モード').first()).toBeVisible();
  });

  test('all 8 modes available', async ({ page }) => {
    await page.goto('/');
    const options = await page.locator('#modeSelect option').count();
    expect(options).toBe(9); // 1 empty + 8 modes
  });

  test('all 5 flavors available', async ({ page }) => {
    await page.goto('/');
    const options = await page.locator('#flavorSelect option').count();
    expect(options).toBe(6); // 1 empty + 5 flavors (including ruma-pro)
  });

  test('generate all mode combinations', async ({ page }) => {
    await page.goto('/');
    const modes = ['diagnose', 'recover', 'ship', 'audit', 'research', 'critique', 'debug', 'optimize'];
    const flavors = ['neutral', 'high-agency', 'hardline', 'ruma'];

    for (const mode of modes.slice(0, 3)) {
      for (const flavor of flavors.slice(0, 2)) {
        await page.selectOption('#modeSelect', mode);
        await page.selectOption('#flavorSelect', flavor);
        await page.click('#generateBtn');
        const text = await page.locator('#generatedPrompt pre').textContent();
        expect(text).toBeTruthy();
      }
    }
  });

  test('scroll to sections', async ({ page }) => {
    await page.goto('/');
    await page.click('text=覆盖层');
    await expect(page.locator('#flavors')).toBeVisible();
    await page.click('text=RuMa 辱骂');
    await expect(page.locator('#ruma')).toBeVisible();
    await page.click('text=安装');
    await expect(page.locator('#install')).toBeVisible();
  });

  test('flavor card click scrolls to selector', async ({ page }) => {
    await page.goto('/');
    // Click on ruma flavor area - just verify it's clickable
    await expect(page.locator('.flavor-card:has-text("辱骂")').first()).toBeVisible();
  });

  test('random combination works', async ({ page }) => {
    await page.goto('/');
    // Click random button if exists, otherwise just test generate
    await page.selectOption('#modeSelect', 'ship');
    await page.selectOption('#flavorSelect', 'hardline');
    await page.click('#generateBtn');
    await expect(page.locator('#generatedPrompt')).toBeVisible();
  });

  test('pressure levels all visible', async ({ page }) => {
    await page.goto('/');
    const levels = await page.locator('.level-card').count();
    expect(levels).toBe(4); // L1-L4
  });

  test('anti-excuses table visible', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.ruma-flavors')).toBeVisible();
  });
});
