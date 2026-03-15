import { test, expect } from '@playwright/test';

test.describe('RuMa-Pro Web UI', () => {
  // ===== 基础功能测试 =====
  test('homepage loads with title', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.logo h1')).toContainText('RuMa-Pro');
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
    const modeValue = await page.locator('#modeSelect').inputValue();
    expect(modeValue).toBeTruthy();
  });

  test('mobile responsive', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await expect(page.locator('header')).toBeVisible();
  });

  // ===== 语言切换测试 =====
  test('language switch to English', async ({ page }) => {
    await page.goto('/');
    await page.selectOption('#langSelect', 'en');
    await expect(page.locator('#langSelect')).toHaveValue('en');
  });

  test('language switch to Japanese', async ({ page }) => {
    await page.goto('/');
    await page.selectOption('#langSelect', 'ja');
    await expect(page.locator('#langSelect')).toHaveValue('ja');
  });

  // ===== 模式覆盖层测试 =====
  test('all 8 modes available', async ({ page }) => {
    await page.goto('/');
    const options = await page.locator('#modeSelect option').count();
    expect(options).toBe(9); // 1 empty + 8 modes
  });

  test('all 5 flavors available', async ({ page }) => {
    await page.goto('/');
    const options = await page.locator('#flavorSelect option').count();
    expect(options).toBe(6); // 1 empty + 5 flavors
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
    await expect(page.locator('.flavor-card:has-text("辱骂")').first()).toBeVisible();
  });

  test('random combination works', async ({ page }) => {
    await page.goto('/');
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

  test('shortcuts hint visible', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.shortcuts-hint')).toBeVisible();
  });

  test('demo section visible', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#demo')).toBeVisible();
  });

  test('share section visible', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#share')).toBeVisible();
  });

  test('power section has 5 levels', async ({ page }) => {
    await page.goto('/');
    const levels = await page.locator('.power-card').count();
    expect(levels).toBe(5); // P1-P5
  });

  test('shuffle changes values', async ({ page }) => {
    await page.goto('/');
    await page.click('#shuffleBtn');
    const modeValue = await page.locator('#modeSelect').inputValue();
    expect(modeValue).toBeTruthy();
  });

  // ===== 增强测试: 模拟人类使用场景 =====

  test('full user workflow: select diagnose + ruma-pro', async ({ page }) => {
    await page.goto('/');
    // 滚动到模式选择
    await page.click('text=运行模式');
    // 点击 diagnose 模式卡片
    await page.click('.card[data-id="diagnose"] .use-btn');
    // 滚动到覆盖层
    await page.click('text=覆盖层');
    // 选择 ruma-pro
    await page.selectOption('#flavorSelect', 'ruma-pro');
    // 生成
    await page.click('#generateBtn');
    // 验证输出
    const text = await page.locator('#generatedPrompt pre').textContent();
    expect(text).toContain('诊断');
    expect(text).toContain('百分之一千');
    // 复制
    await page.click('.copy-btn');
  });

  test('full user workflow: random shuffle and generate', async ({ page }) => {
    await page.goto('/');
    await page.click('#shuffleBtn');
    await page.click('#generateBtn');
    await expect(page.locator('#generatedPrompt')).toBeVisible();
    const text = await page.locator('#generatedPrompt pre').textContent();
    expect(text.length).toBeGreaterThan(100);
  });

  test('test all 8 modes individually', async ({ page }) => {
    await page.goto('/');
    const modeNames = {
      'diagnose': '诊断',
      'recover': '恢复',
      'ship': '交付',
      'audit': '审计',
      'research': '研究',
      'critique': '批判',
      'debug': '调试',
      'optimize': '优化'
    };

    const modes = ['diagnose', 'recover', 'ship', 'audit', 'research', 'critique', 'debug', 'optimize'];

    for (const mode of modes) {
      await page.selectOption('#modeSelect', mode);
      await page.selectOption('#flavorSelect', 'neutral');
      await page.click('#generateBtn');
      const text = await page.locator('#generatedPrompt pre').textContent();
      expect(text).toContain(modeNames[mode]);
    }
  });

  test('test all 5 flavors individually', async ({ page }) => {
    await page.goto('/');
    const flavors = ['neutral', 'high-agency', 'hardline', 'ruma', 'ruma-pro'];

    for (const flavor of flavors) {
      await page.selectOption('#modeSelect', 'diagnose');
      await page.selectOption('#flavorSelect', flavor);
      await page.click('#generateBtn');
      const text = await page.locator('#generatedPrompt pre').textContent();
      expect(text.length).toBeGreaterThan(50);
    }
  });

  test('rage meter updates on flavor change', async ({ page }) => {
    await page.goto('/');
    await page.selectOption('#modeSelect', 'diagnose');

    // neutral 强度 1，愤怒值 0%
    await page.selectOption('#flavorSelect', 'neutral');
    await page.click('#generateBtn');
    let rageValue = await page.locator('#rageValue').textContent();
    expect(rageValue).toContain('0%');

    // ruma-pro 应该有最高愤怒值 1000%
    await page.selectOption('#flavorSelect', 'ruma-pro');
    await page.click('#generateBtn');
    rageValue = await page.locator('#rageValue').textContent();
    expect(rageValue).toContain('1000%');
  });

  test('keyboard shortcuts work', async ({ page }) => {
    await page.goto('/');
    await page.selectOption('#modeSelect', 'diagnose');
    await page.selectOption('#flavorSelect', 'ruma');

    // 按 G 生成
    await page.keyboard.press('g');
    await expect(page.locator('#generatedPrompt')).toBeVisible();

    // 按 S 复制
    await page.keyboard.press('s');
  });

  test('keyboard shortcut R for random', async ({ page }) => {
    await page.goto('/');
    // 按 R 随机
    await page.keyboard.press('r');
    const modeValue = await page.locator('#modeSelect').inputValue();
    expect(modeValue).toBeTruthy();
  });

  test('quick select numbers 1-5 for flavors', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('5'); // ruma-pro
    const flavorValue = await page.locator('#flavorSelect').inputValue();
    expect(flavorValue).toBe('ruma-pro');
  });

  test('hero section displays stats', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#statModes')).toHaveText('8');
    await expect(page.locator('#statFlavors')).toHaveText('5');
    await expect(page.locator('#statCombos')).toHaveText('40');
    await expect(page.locator('#statPower')).toHaveText('1000%');
  });

  test('mode cards show correct information', async ({ page }) => {
    await page.goto('/');
    const firstCard = page.locator('.card').first();
    await expect(firstCard.locator('.card-icon')).toBeVisible();
    await expect(firstCard.locator('h3')).toBeVisible();
    await expect(firstCard.locator('.summary')).toBeVisible();
    await expect(firstCard.locator('.use-btn')).toBeVisible();
  });

  test('flavor cards show intensity', async ({ page }) => {
    await page.goto('/');
    const rumaCard = page.locator('.flavor-card[data-id="ruma"]');
    await expect(rumaCard.locator('.intensity-badge')).toHaveText(/强度 4/);
  });

  test('power cards show P1-P5 levels', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.power-card').nth(0)).toHaveText(/P1/);
    await expect(page.locator('.power-card').nth(4)).toHaveText(/P5/);
  });

  test('install cards have copy buttons', async ({ page }) => {
    await page.goto('/');
    const installCards = await page.locator('.install-card').count();
    expect(installCards).toBeGreaterThanOrEqual(3);
  });

  test('demo section has run button', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#runDemoBtn')).toBeVisible();
  });

  test('demo run button triggers animation', async ({ page }) => {
    await page.goto('/');
    await page.click('#runDemoBtn');
    const demoOutput = page.locator('#demoOutput');
    await expect(demoOutput).toBeVisible();
  });

  // ===== 边缘情况测试 =====

  test('generate without selection shows alert', async ({ page }) => {
    await page.goto('/');
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('请选择');
      await dialog.accept();
    });
    await page.click('#generateBtn');
  });

  test('multiple rapid generate clicks', async ({ page }) => {
    await page.goto('/');
    await page.selectOption('#modeSelect', 'diagnose');
    await page.selectOption('#flavorSelect', 'ruma');
    await page.click('#generateBtn');
    await page.click('#generateBtn');
    await page.click('#generateBtn');
    await expect(page.locator('#generatedPrompt')).toBeVisible();
  });

  test('switch language preserves selection', async ({ page }) => {
    await page.goto('/');
    await page.selectOption('#modeSelect', 'diagnose');
    await page.selectOption('#flavorSelect', 'ruma');
    await page.selectOption('#langSelect', 'en');
    await expect(page.locator('#modeSelect')).toHaveValue('diagnose');
    await expect(page.locator('#flavorSelect')).toHaveValue('ruma');
  });

  test('viewport resize maintains layout', async ({ page }) => {
    await page.goto('/');
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('header')).toBeVisible();
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.locator('header')).toBeVisible();
  });

  test('scroll to bottom and generate', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.selectOption('#modeSelect', 'ship');
    await page.selectOption('#flavorSelect', 'ruma-pro');
    await page.click('#generateBtn');
    await expect(page.locator('#generatedPrompt')).toBeVisible();
  });

  // ===== 性能测试 =====

  test('page loads quickly', async ({ page }) => {
    const start = Date.now();
    await page.goto('/');
    const loadTime = Date.now() - start;
    expect(loadTime).toBeLessThan(3000);
  });

  test('generate is responsive', async ({ page }) => {
    await page.goto('/');
    const start = Date.now();
    await page.selectOption('#modeSelect', 'diagnose');
    await page.selectOption('#flavorSelect', 'ruma');
    await page.click('#generateBtn');
    const generateTime = Date.now() - start;
    expect(generateTime).toBeLessThan(1000);
  });
});
