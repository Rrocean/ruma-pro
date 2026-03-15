#!/usr/bin/env node
/**
 * RuMa-Pro CLI 工具
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, cpSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

const commands = {
  help: () => {
    console.log(`
🔥 RuMa-Pro CLI

用法: ruma-pro <command>

命令:
  serve        启动 Web 服务器
  install      安装到 Agent
  test         运行测试
  generate     生成 Skill 组合
  list         列出所有模式
  random       随机组合一次
  loop         启动自动化循环
  init         初始化 Git 仓库
  push         推送到 GitHub
  help         显示帮助
`.trim());
  },

  serve: () => {
    console.log('启动服务器: npx serve -p 3000');
    require('child_process').spawn('npx', ['serve', '-p', '3000'], {
      cwd: rootDir,
      stdio: 'inherit'
    });
  },

  install: (args) => {
    const target = args[0] || 'claude';
    console.log(`安装到 ${target}...`);
    const script = join(rootDir, 'scripts', 'install-agent-skill.mjs');
    require('child_process').spawn('node', [script, target], {
      cwd: rootDir,
      stdio: 'inherit'
    });
  },

  test: () => {
    console.log('运行测试...');
    require('child_process').spawn('npx', ['playwright', 'test'], {
      cwd: rootDir,
      stdio: 'inherit'
    });
  },

  list: () => {
    const lib = await import(join(rootDir, 'src/data/library.js'));
    console.log('\n覆盖层:');
    lib.flavors.forEach(f => console.log(`  ${f.id}: ${f.name} (强度 ${f.intensity})`));
    console.log('\n运行模式:');
    lib.modes.forEach(m => console.log(`  ${m.id}: ${m.name}`));
  },

  random: async () => {
    const lib = await import(join(rootDir, 'src/data/library.js'));
    const flavor = lib.flavors[Math.floor(Math.random() * lib.flavors.length)];
    const mode = lib.modes[Math.floor(Math.random() * lib.modes.length)];
    console.log(`\n随机组合: ${mode.id} + ${flavor.id}`);
    console.log(`模式: ${mode.name}`);
    console.log(`覆盖层: ${flavor.name}`);
    console.log(`\n开场白: ${flavor.introCN || flavor.intro}`);
  },

  loop: () => {
    console.log('启动自动化循环...');
    const script = join(rootDir, 'scripts', 'ruma-loop.mjs');
    require('child_process').spawn('node', [script], {
      cwd: rootDir,
      stdio: 'inherit'
    });
  },

  init: () => {
    console.log('初始化 Git 仓库...');
    const gitDir = join(rootDir, '.git');
    if (!existsSync(gitDir)) {
      require('child_process').spawnSync('git', ['init'], { cwd: rootDir });
      require('child_process').spawnSync('git', ['add', '.'], { cwd: rootDir });
      console.log('✓ Git 仓库已初始化');
    }
  },

  push: () => {
    console.log('请先在 GitHub 创建仓库，然后运行:');
    console.log('git remote add origin <your-repo-url>');
    console.log('git push -u origin main');
  }
};

const cmd = process.argv[2];
if (commands[cmd]) {
  commands[cmd](process.argv.slice(3));
} else {
  commands.help();
}
