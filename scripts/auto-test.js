#!/usr/bin/env node
// RuMa-Pro 自动测试循环器
// 每5分钟自动运行测试，支持设置结束时间

import { spawn } from 'child_process';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 配置
const DEFAULT_INTERVAL = 5 * 60 * 1000; // 5分钟
const DEFAULT_UNTIL = '17:00'; // 默认到下午5点

// 解析参数
function parseArgs() {
  const args = process.argv.slice(2);
  const config = {
    interval: DEFAULT_INTERVAL,
    until: null,
    times: 0,
    verbose: false,
    report: true,
    browser: 'chromium'
  };

  for (const arg of args) {
    if (arg.startsWith('--interval=')) {
      const mins = parseInt(arg.split('=')[1]) || 5;
      config.interval = mins * 60 * 1000;
    } else if (arg.startsWith('--until=')) {
      config.until = arg.split('=')[1];
    } else if (arg.startsWith('--times=')) {
      config.times = parseInt(arg.split('=')[1]) || 0;
    } else if (arg === '--verbose' || arg === '-v') {
      config.verbose = true;
    } else if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    }
  }

  return config;
}

function printHelp() {
  console.log(`
🔥 RuMa-Pro 自动测试循环器

用法: node auto-test.js [选项]

选项:
  --interval=N    每次间隔分钟数 (默认 5)
  --until=HH:MM   运行到指定时间结束
  --times=N       运行次数 (0 = 无限)
  --verbose, -v    详细输出
  --help, -h      显示帮助

示例:
  node auto-test.js --until=17:00
    每5分钟运行一次测试，直到下午5点

  node auto-test.js --interval=10 --times=6
    每10分钟运行一次，运行6次
`);
}

// 检查是否应该继续
function shouldContinue(config, iteration) {
  const now = new Date();

  // 检查运行次数
  if (config.times > 0 && iteration >= config.times) {
    return false;
  }

  // 检查结束时间
  if (config.until) {
    const [hours, minutes] = config.until.split(':').map(Number);
    const target = new Date();
    target.setHours(hours, minutes, 0, 0);

    if (now >= target) {
      console.log(`\n⏰ 已到达结束时间 ${config.until}，停止运行`);
      return false;
    }
  }

  return true;
}

// 运行测试
function runTests(verbose) {
  return new Promise((resolve, reject) => {
    const args = ['test', '--reporter=line'];
    if (!verbose) {
      args.push('--quiet');
    }

    const proc = spawn('npx', args, {
      cwd: process.cwd(),
      shell: true,
      stdio: verbose ? 'inherit' : 'pipe'
    });

    let output = '';

    if (!verbose) {
      proc.stdout.on('data', (data) => {
        output += data.toString();
      });
      proc.stderr.on('data', (data) => {
        output += data.toString();
      });
    }

    proc.on('close', (code) => {
      resolve({ code, output });
    });

    proc.on('error', (err) => {
      reject(err);
    });
  });
}

// 保存测试结果
function saveResults(results, iteration) {
  const resultsDir = join(__dirname, '..', 'test-results');
  if (!existsSync(resultsDir)) {
    mkdirSync(resultsDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const result = {
    iteration,
    timestamp: new Date().toISOString(),
    passed: results.output.includes('passed'),
    summary: extractSummary(results.output)
  };

  const historyFile = join(resultsDir, 'history.json');
  let history = [];

  if (existsSync(historyFile)) {
    try {
      history = JSON.parse(readFileSync(historyFile, 'utf-8'));
    } catch (e) {
      history = [];
    }
  }

  history.push(result);

  // 只保留最近 100 条记录
  if (history.length > 100) {
    history = history.slice(-100);
  }

  writeFileSync(historyFile, JSON.stringify(history, null, 2));

  return result;
}

// 提取测试摘要
function extractSummary(output) {
  const match = output.match(/(\d+) passed/);
  if (match) {
    return `${match[1]} passed`;
  }
  const failMatch = output.match(/(\d+) failed/);
  if (failMatch) {
    return `${failMatch[1]} failed`;
  }
  return 'unknown';
}

// 格式化剩余时间
function formatRemaining(targetTime) {
  const now = new Date();
  const diff = targetTime - now;

  if (diff <= 0) {
    return '0 分钟';
  }

  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const remainingMins = mins % 60;

  if (hours > 0) {
    return `${hours} 小时 ${remainingMins} 分钟`;
  }
  return `${mins} 分钟`;
}

// 主函数
async function main() {
  const config = parseArgs();

  console.log(`
🔥 RuMa-Pro 自动测试循环器
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  运行间隔: ${config.interval / 60000} 分钟
  结束时间: ${config.until || '不限制'}
  运行次数: ${config.times === 0 ? '无限' : config.times}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);

  let iteration = 0;
  const results = [];

  while (shouldContinue(config, iteration)) {
    iteration++;

    // 显示进度
    if (config.until) {
      const [hours, minutes] = config.until.split(':').map(Number);
      const target = new Date();
      target.setHours(hours, minutes, 0, 0);
      console.log(`\n🧪 第 ${iteration} 次测试 | 剩余时间: ${formatRemaining(target)}`);
    } else {
      console.log(`\n🧪 第 ${iteration} 次测试`);
    }

    // 运行测试
    try {
      const result = await runTests(config.verbose);
      const saved = saveResults(result, iteration);
      results.push(saved);

      if (result.code === 0) {
        console.log(`  ✅ 测试通过!`);
      } else {
        console.log(`  ❌ 测试失败 (退出码: ${result.code})`);
      }
    } catch (err) {
      console.log(`  ❌ 测试运行错误: ${err.message}`);
    }

    // 检查是否继续
    if (shouldContinue(config, iteration)) {
      const waitSecs = config.interval / 1000;
      console.log(`  ⏳ 等待 ${waitSecs / 60} 分钟...`);
      await new Promise(resolve => setTimeout(resolve, config.interval));
    }
  }

  // 最终报告
  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 测试循环完成!
  总运行次数: ${iteration}
  通过: ${results.filter(r => r.passed).length}
  失败: ${results.filter(r => !r.passed).length}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);

  // 生成测试报告
  console.log('运行 npm run agent:report 查看详细报告');
}

main().catch(console.error);
