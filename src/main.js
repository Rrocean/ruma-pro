// RuMa-Pro 主入口
import { modes, flavors, puaRhetoric, categories } from './data/library.js';

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

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  renderModes();
  renderFlavors();
  renderPressureLevels();
  renderRuMaFlavors();
  renderChecklist();

  document.getElementById('generateBtn').addEventListener('click', generatePrompt);
  document.querySelector('.copy-btn').addEventListener('click', copyToClipboard);

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
    }
  });
});

// 导出供 Node.js 使用
if (typeof module !== 'undefined') {
  module.exports = { generatePrompt };
}
