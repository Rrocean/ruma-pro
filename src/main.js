// RuMa-Pro 主入口
import { modes, flavors, puaRhetoric, categories } from './data/library.js';
import { initLanguage } from './i18n.js';

// 初始化语言
initLanguage();

// 渲染模式卡片
function renderModes() {
  const grid = document.getElementById('modesGrid');
  const select = document.getElementById('modeSelect');

  modes.forEach(mode => {
    // 添加到选择器
    const option = document.createElement('option');
    option.value = mode.id;
    option.textContent = `${mode.name}`;
    select.appendChild(option);

    // 渲染卡片
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.id = mode.id;
    card.innerHTML = `
      <div class="card-icon">${mode.icon}</div>
      <h3>${mode.name}</h3>
      <p class="summary">${mode.summary}</p>
      <p class="description">${mode.description}</p>
      <button class="use-btn" data-mode="${mode.id}">使用此模式</button>
    `;
    grid.appendChild(card);
  });
}

// 渲染覆盖层
function renderFlavors() {
  const grid = document.getElementById('flavorsGrid');
  const select = document.getElementById('flavorSelect');

  flavors.forEach(flavor => {
    // 添加到选择器
    const option = document.createElement('option');
    option.value = flavor.id;
    option.textContent = flavor.name;
    select.appendChild(option);

    // 渲染卡片
    const card = document.createElement('div');
    card.className = `flavor-card intensity-${flavor.intensity}`;
    card.dataset.id = flavor.id;
    card.innerHTML = `
      <div class="intensity-badge">强度 ${flavor.intensity}</div>
      <h3>${flavor.name}</h3>
      <p class="strapline">${flavor.strapline}</p>
      <p class="intro">${flavor.introCN || flavor.intro}</p>
      <button class="use-btn" data-flavor="${flavor.id}">使用此覆盖层</button>
    `;
    grid.appendChild(card);
  });
}

// 渲染 RuMa 压力等级
function renderPressureLevels() {
  const grid = document.getElementById('levelsGrid');

  puaRhetoric.pressureLevels.forEach(level => {
    const card = document.createElement('div');
    card.className = `level-card level-${level.level.toLowerCase()}`;
    card.innerHTML = `
      <div class="level-badge">${level.level}</div>
      <h4>${level.name}</h4>
      <p class="trigger">触发: ${level.trigger}</p>
      <p class="action">${level.action}</p>
      <blockquote>${level.quote}</blockquote>
    `;
    grid.appendChild(card);
  });
}

// 渲染 RuMa 风味
function renderRuMaFlavors() {
  const list = document.getElementById('flavorsList');

  puaRhetoric.flavors.forEach(flavor => {
    const item = document.createElement('div');
    item.className = 'ruma-flavor-item';
    item.innerHTML = `
      <h4>${flavor.name}</h4>
      <p class="desc">${flavor.description}</p>
      <div class="quotes">
        ${flavor.quotes.map(q => `<blockquote>${q}</blockquote>`).join('')}
      </div>
    `;
    list.appendChild(item);
  });
}

// 渲染检查清单
function renderChecklist() {
  const ul = document.getElementById('checklist');

  puaRhetoric.checklist7.forEach((item, i) => {
    const li = document.createElement('li');
    li.innerHTML = `<span class="num">${i + 1}</span> ${item}`;
    ul.appendChild(li);
  });
}

// 生成组合 Prompt
function generatePrompt() {
  const modeSelect = document.getElementById('modeSelect');
  const flavorSelect = document.getElementById('flavorSelect');

  const modeId = modeSelect.value;
  const flavorId = flavorSelect.value;

  if (!modeId || !flavorId) {
    alert('请选择模式和覆盖层');
    return;
  }

  const mode = modes.find(m => m.id === modeId);
  const flavor = flavors.find(f => f.id === flavorId);

  let prompt = mode.prompt;

  // 如果选择了 PUA 或 Hardline，添加覆盖层内容
  if (flavorId === 'ruma' || flavorId === 'hardline') {
    prompt = `# ${flavor.name}\n\n${flavor.introCN || flavor.intro}\n\n---\n\n${mode.prompt}\n\n---\n\n## 执行标准\n${flavor.outro}`;
  } else if (flavorId === 'high-agency') {
    prompt = `# ${flavor.name}\n\n${flavor.intro}\n\n---\n\n${mode.prompt}\n\n---\n\n## 高能动要求\n${flavor.outro}`;
  } else {
    prompt = `# ${flavor.name}\n\n${flavor.intro}\n\n---\n\n${mode.prompt}\n\n---\n\n## 输出要求\n${flavor.outro}`;
  }

  const promptBox = document.getElementById('generatedPrompt');
  promptBox.querySelector('pre').textContent = prompt;
  promptBox.classList.remove('hidden');
}

// 复制到剪贴板
function copyToClipboard() {
  const text = document.querySelector('#generatedPrompt pre').textContent;
  navigator.clipboard.writeText(text).then(() => {
    const btn = document.querySelector('.copy-btn');
    btn.textContent = '已复制!';
    setTimeout(() => btn.textContent = '复制到剪贴板', 2000);
  });
}

// 复制安装命令
function copyInstall(type) {
  const commands = {
    claude: 'npm run install:claude',
    codex: 'npm run install:codex',
    openclaw: 'npm run install:openclaw'
  };
  navigator.clipboard.writeText(commands[type]).then(() => {
    alert(`已复制: ${commands[type]}`);
  });
}

// 随机选择功能
function shuffle() {
  const modeSelect = document.getElementById('modeSelect');
  const flavorSelect = document.getElementById('flavorSelect');

  // 随机选择模式
  const modeOptions = Array.from(modeSelect.options).filter(opt => opt.value);
  const randomMode = modeOptions[Math.floor(Math.random() * modeOptions.length)].value;
  modeSelect.value = randomMode;

  // 随机选择覆盖层
  const flavorOptions = Array.from(flavorSelect.options).filter(opt => opt.value);
  const randomFlavor = flavorOptions[Math.floor(Math.random() * flavorOptions.length)].value;
  flavorSelect.value = randomFlavor;

  // 生成并显示
  generatePrompt();

  // 更新愤怒值
  updateRageMeter();
}

// 愤怒值系统
function updateRageMeter() {
  const flavorSelect = document.getElementById('flavorSelect');
  const flavor = flavors.find(f => f.id === flavorSelect.value);
  const rageFill = document.getElementById('rageFill');
  const rageValue = document.getElementById('rageValue');

  if (flavor) {
    const rage = flavor.intensity * 20;
    rageFill.style.width = `${rage}%`;
    rageValue.textContent = `${rage}%`;
  }
}

// 演示功能
function runDemo() {
  const demoOutput = document.getElementById('demoOutput');
  const lines = demoOutput.querySelectorAll('.typing-effect');

  lines.forEach((line, index) => {
    line.style.animation = 'none';
    line.offsetHeight; // Trigger reflow
    line.style.animation = `typing 0.5s ease forwards ${index * 0.5}s`;
  });
}

// 分享功能
function shareTwitter() {
  const url = encodeURIComponent('https://github.com/Rrocean/ruma-pro');
  const text = encodeURIComponent('🔥 RuMa-Pro - Agent 强化运行框架！百分之一千潜能激发！');
  window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank');
}

function shareWechat() {
  alert('微信扫一扫访问: https://github.com/Rrocean/ruma-pro');
}

function copyLink() {
  navigator.clipboard.writeText('https://github.com/Rrocean/ruma-pro');
  alert('链接已复制！');
}

// 键盘快捷键
function initKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // 按 G 生成
    if (e.key === 'g' && !e.ctrlKey && !e.metaKey && document.activeElement.tagName !== 'SELECT') {
      const modeSelect = document.getElementById('modeSelect');
      const flavorSelect = document.getElementById('flavorSelect');
      if (modeSelect.value && flavorSelect.value) {
        generatePrompt();
        updateRageMeter();
      }
    }
    // 按 R 随机
    if (e.key === 'r' && !e.ctrlKey && !e.metaKey && document.activeElement.tagName !== 'SELECT') {
      shuffle();
    }
    // 按 S 复制
    if (e.key === 's' && !e.ctrlKey && !e.metaKey && document.activeElement.tagName !== 'SELECT') {
      const promptBox = document.getElementById('generatedPrompt');
      if (!promptBox.classList.contains('hidden')) {
        copyToClipboard();
      }
    }
    // 按 1-5 快速选择覆盖层
    if (e.key >= '1' && e.key <= '5' && !e.ctrlKey && !e.metaKey && document.activeElement.tagName !== 'SELECT') {
      const flavors = ['neutral', 'high-agency', 'hardline', 'ruma', 'ruma-pro'];
      const idx = parseInt(e.key) - 1;
      document.getElementById('flavorSelect').value = flavors[idx];
    }
  });
}

// 粒子效果
function createParticles() {
  const hero = document.querySelector('.hero');
  if (!hero) return;

  for (let i = 0; i < 30; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.cssText = `
      position: absolute;
      width: ${Math.random() * 6 + 2}px;
      height: ${Math.random() * 6 + 2}px;
      background: hsl(${Math.random() * 40 + 10}, 100%, 60%);
      border-radius: 50%;
      left: ${Math.random() * 100}%;
      top: ${Math.random() * 100}%;
      opacity: ${Math.random() * 0.5 + 0.3};
      animation: float ${Math.random() * 3 + 2}s infinite ease-in-out;
      pointer-events: none;
    `;
    hero.appendChild(particle);
  }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  renderModes();
  renderFlavors();
  renderPressureLevels();
  renderRuMaFlavors();
  renderChecklist();

  // 初始化键盘快捷键
  initKeyboardShortcuts();

  // 初始化粒子效果
  createParticles();

  document.getElementById('generateBtn').addEventListener('click', () => {
    generatePrompt();
    updateRageMeter();
  });
  document.getElementById('shuffleBtn').addEventListener('click', shuffle);
  document.querySelector('.copy-btn').addEventListener('click', copyToClipboard);

  // 演示按钮
  const runDemoBtn = document.getElementById('runDemoBtn');
  if (runDemoBtn) {
    runDemoBtn.addEventListener('click', runDemo);
  }

  // 分享按钮
  window.shareTwitter = shareTwitter;
  window.shareWechat = shareWechat;
  window.copyLink = copyLink;

  // 卡片点击事件
  document.getElementById('modesGrid').addEventListener('click', (e) => {
    if (e.target.classList.contains('use-btn')) {
      const modeId = e.target.dataset.mode;
      document.getElementById('modeSelect').value = modeId;
      document.getElementById('flavors').scrollIntoView({ behavior: 'smooth' });
    }
  });

  document.getElementById('flavorsGrid').addEventListener('click', (e) => {
    if (e.target.classList.contains('use-btn')) {
      const flavorId = e.target.dataset.flavor;
      document.getElementById('flavorSelect').value = flavorId;
      generatePrompt();
      updateRageMeter();
    }
  });
});

// 导出供 Node.js 使用
if (typeof module !== 'undefined') {
  module.exports = { generatePrompt };
}
