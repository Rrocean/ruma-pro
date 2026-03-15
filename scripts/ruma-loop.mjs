#!/usr/bin/env node
/**
 * RuMa-Pro 自动化循环脚本
 * 每5分钟执行一次自主测试和优化
 */

import { spawn } from 'child_process';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const logFile = join(__dirname, 'ruma-loop.log');

function log(msg) {
  const time = new Date().toLocaleString('zh-CN');
  const logMsg = `[${time}] ${msg}\n`;
  console.log(logMsg.trim());
  try {
    writeFileSync(logFile, logMsg, { flag: 'a' });
  } catch (e) {}
}

async function runCommand(cmd, args = []) {
  return new Promise((resolve, reject) => {
    const proc = spawn(cmd, args, { shell: true, cwd: __dirname });
    let output = '';
    proc.stdout.on('data', d => output += d);
    proc.stderr.on('data', d => output += d);
    proc.on('close', code => resolve({ code, output }));
    proc.on('error', reject);
  });
}

async function checkServer() {
  log('检查服务器状态...');
  const result = await runCommand('curl', ['-s', 'http://localhost:3000']);
  if (result.code === 0 && result.output.includes('RuMa')) {
    log('✓ 服务器正常运行');
    return true;
  } else {
    log('✗ 服务器未运行，启动中...');
    return false;
  }
}

async function testWebUI() {
  log('测试 Web UI 功能...');

  // 测试首页
  const home = await runCommand('curl', ['-s', 'http://localhost:3000']);
  const tests = [
    { name: '首页加载', pass: home.output.includes('RuMa-Pro') },
    { name: '模式选择器', pass: home.output.includes('modeSelect') },
    { name: '覆盖层选择', pass: home.output.includes('flavorSelect') },
    { name: 'RuMa 辱骂区', pass: home.output.includes('ruma') },
  ];

  tests.forEach(t => {
    log(`${t.pass ? '✓' : '✗'} ${t.name}`);
  });

  return tests.every(t => t.pass);
}

async function testSkill() {
  log('测试 Claude Code Skill...');
  const skillPath = join(__dirname, 'adapters/claude/ruma-pro/SKILL.md');
  if (existsSync(skillPath)) {
    const content = readFileSync(skillPath, 'utf-8');
    const tests = [
      { name: 'Skill 文件存在', pass: true },
      { name: '包含辱骂内容', pass: content.includes('你他妈的') },
      { name: '包含压力等级', pass: content.includes('L1') },
      { name: '包含7项清单', pass: content.includes('检查清单') },
    ];
    tests.forEach(t => {
      log(`${t.pass ? '✓' : '✗'} ${t.name}`);
    });
    return tests.every(t => t.pass);
  }
  return false;
}

async function installSkill() {
  log('安装 Skill 到 Claude Code...');
  const rootDir = join(__dirname, '..');
  const scriptPath = join(rootDir, 'scripts', 'install-agent-skill.mjs');
  const result = await runCommand('node', [scriptPath, 'claude']);
  log(result.output);
  return result.code === 0;
}

async function runPlaywrightTests() {
  log('运行 Playwright 测试...');
  const { execSync } = await import('child_process');
  const rootDir = join(__dirname, '..');
  try {
    const output = execSync('npx playwright test --reporter=list', { cwd: rootDir, encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] });
    log(`测试输出: ${output.substring(0, 200)}`);
    const passed = output.includes(' passed') && !output.includes(' failed');
    log(`${passed ? '✓' : '✗'} 测试完成`);
    return passed;
  } catch (e) {
    log(`测试输出(错误): ${e.stdout?.substring(0, 200) || e.message}`);
    const passed = e.stdout?.includes(' passed') && !e.stdout?.includes(' failed');
    log(`${passed ? '✓' : '✗'} 测试完成`);
    return passed;
  }
}

const tasks = [
  { name: '检查服务器', fn: checkServer },
  { name: '测试 Web UI', fn: testWebUI },
  { name: '测试 Skill', fn: testSkill },
  { name: '安装 Skill', fn: installSkill },
  { name: '运行测试', fn: runPlaywrightTests },
];

async function runLoop() {
  log('='.repeat(50));
  log('开始 RuMa-Pro 自动化循环');

  for (const task of tasks) {
    try {
      await task.fn();
    } catch (e) {
      log(`✗ ${task.name} 失败: ${e.message}`);
    }
  }

  log('循环完成');
  log('='.repeat(50));
}

// 如果直接运行
if (process.argv.includes('--once')) {
  runLoop();
} else {
  log('启动 RuMa-Pro 自动化循环 (每5分钟)...');
  runLoop();
  setInterval(runLoop, 5 * 60 * 1000);
}
