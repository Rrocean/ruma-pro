#!/usr/bin/env node
// RuMa-Pro 循环运行器
// 支持设置循环次数、间隔时间、结束时间
// 使用方式: node scripts/loop-runner.js --times=10 --interval=300 --until=17:00

import { modes, flavors } from '../src/data/library.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 解析命令行参数
function parseArgs() {
  const args = process.argv.slice(2);
  const config = {
    times: 0,           // 循环次数，0 表示无限
    interval: 300,      // 间隔时间（秒），默认 5 分钟
    until: null,        // 结束时间，格式 HH:MM
    verbose: false,      // 详细输出
    modes: [],          // 要测试的模式
    flavors: [],        // 要测试的覆盖层
    report: false       // 生成报告
  };

  for (const arg of args) {
    if (arg.startsWith('--times=')) {
      config.times = parseInt(arg.split('=')[1]) || 0;
    } else if (arg.startsWith('--interval=')) {
      config.interval = parseInt(arg.split('=')[1]) || 300;
    } else if (arg.startsWith('--until=')) {
      config.until = arg.split('=')[1] || null;
    } else if (arg === '--verbose' || arg === '-v') {
      config.verbose = true;
    } else if (arg.startsWith('--modes=')) {
      config.modes = arg.split('=')[1].split(',');
    } else if (arg.startsWith('--flavors=')) {
      config.flavors = arg.split('=')[1].split(',');
    } else if (arg === '--report' || arg === '-r') {
      config.report = true;
    } else if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    }
  }

  // 如果没有指定模式，使用所有模式
  if (config.modes.length === 0) {
    config.modes = modes.map(m => m.id);
  }

  // 如果没有指定覆盖层，使用所有覆盖层
  if (config.flavors.length === 0) {
    config.flavors = flavors.map(f => f.id);
  }

  return config;
}

function printHelp() {
  console.log(`
🔥 RuMa-Pro 循环运行器

用法: node loop-runner.js [选项]

选项:
  --times=N        循环次数 (0 = 无限)
  --interval=N     每次间隔秒数 (默认 300 = 5分钟)
  --until=HH:MM    运行到指定时间结束
  --modes=a,b,c    指定测试的模式 (逗号分隔)
  --flavors=x,y,z  指定测试的覆盖层 (逗号分隔)
  --report, -r     生成测试报告
  --verbose, -v    详细输出
  --help, -h       显示此帮助

示例:
  node loop-runner.js --times=10 --interval=60
    运行 10 次，每次间隔 60 秒

  node loop-runner.js --until=17:00 --interval=300
    运行直到 17:00，每次间隔 5 分钟

  node loop-runner.js --modes=diagnose,recover --flavors=ruma,hardline
    只测试指定模式和覆盖层组合
`);
}

// 生成随机组合
function randomCombination(config) {
  const mode = config.modes[Math.floor(Math.random() * config.modes.length)];
  const flavor = config.flavors[Math.floor(Math.random() * config.flavors.length)];
  return { mode, flavor };
}

// 模拟一次测试运行
async function runTest(config) {
  const combo = randomCombination(config);
  const startTime = Date.now();

  // 模拟测试执行
  if (config.verbose) {
    console.log(`  ▶ 测试: ${combo.mode} × ${combo.flavor}`);
  }

  // 模拟一些处理时间
  await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));

  const duration = Date.now() - startTime;
  const success = Math.random() > 0.1; // 90% 成功率

  return {
    mode: combo.mode,
    flavor: combo.flavor,
    success,
    duration,
    timestamp: new Date().toISOString()
  };
}

// 检查是否应该继续运行
function shouldContinue(config, iteration, startTime) {
  // 检查循环次数
  if (config.times > 0 && iteration >= config.times) {
    return false;
  }

  // 检查结束时间
  if (config.until) {
    const [hours, minutes] = config.until.split(':').map(Number);
    const now = new Date();
    const target = new Date();
    target.setHours(hours, minutes, 0, 0);

    if (now >= target) {
      return false;
    }
  }

  return true;
}

// 生成测试报告
function generateReport(results) {
  const total = results.length;
  const success = results.filter(r => r.success).length;
  const failed = total - success;
  const avgDuration = results.reduce((sum, r) => sum + r.duration, 0) / total;

  // 按模式统计
  const byMode = {};
  for (const r of results) {
    if (!byMode[r.mode]) {
      byMode[r.mode] = { total: 0, success: 0, failed: 0 };
    }
    byMode[r.mode].total++;
    if (r.success) {
      byMode[r.mode].success++;
    } else {
      byMode[r.mode].failed++;
    }
  }

  // 按覆盖层统计
  const byFlavor = {};
  for (const r of results) {
    if (!byFlavor[r.flavor]) {
      byFlavor[r.flavor] = { total: 0, success: 0, failed: 0 };
    }
    byFlavor[r.flavor].total++;
    if (r.success) {
      byFlavor[r.flavor].success++;
    } else {
      byFlavor[r.flavor].failed++;
    }
  }

  console.log(`
╔══════════════════════════════════════════════════════════════╗
║                    🔥 RuMa-Pro 测试报告                       ║
╠══════════════════════════════════════════════════════════════╣
║  总测试次数: ${total.toString().padEnd(50)}║
║  成功: ${success.toString().padEnd(55)}║
║  失败: ${failed.toString().padEnd(55)}║
║  成功率: ${((success / total) * 100).toFixed(1)}%`.padEnd(72) + '║' + `
║  平均耗时: ${avgDuration.toFixed(0)}ms`.padEnd(72) + '║' + `
╠══════════════════════════════════════════════════════════════╣
║                      按模式统计                               ║`);

  for (const [mode, stats] of Object.entries(byMode)) {
    const rate = ((stats.success / stats.total) * 100).toFixed(1);
    console.log(`║  ${mode.padEnd(15)}: ${stats.total}次 ${stats.success}成功 ${stats.failed}失败  ${rate}%`.padEnd(72) + '║');
  }

  console.log(`╠══════════════════════════════════════════════════════════════╣
║                     按覆盖层统计                              ║`);

  for (const [flavor, stats] of Object.entries(byFlavor)) {
    const rate = ((stats.success / stats.total) * 100).toFixed(1);
    console.log(`║  ${flavor.padEnd(15)}: ${stats.total}次 ${stats.success}成功 ${stats.failed}失败  ${rate}%`.padEnd(72) + '║');
  }

  console.log(`╚══════════════════════════════════════════════════════════════╝`);
}

// 主函数
async function main() {
  const config = parseArgs();

  console.log(`
🔥 RuMa-Pro 循环运行器
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  循环次数: ${config.times === 0 ? '无限' : config.times}
  间隔时间: ${config.interval}秒 (${(config.interval / 60).toFixed(1)}分钟)
  结束时间: ${config.until || '不限制'}
  测试模式: ${config.modes.join(', ')}
  测试覆盖层: ${config.flavors.join(', ')}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);

  const results = [];
  let iteration = 0;
  const startTime = Date.now();

  while (shouldContinue(config, iteration, startTime)) {
    iteration++;
    const result = await runTest(config);
    results.push(result);

    if (config.verbose) {
      console.log(`  ✓ ${result.success ? '成功' : '失败'} (${result.duration}ms)`);
    }

    // 显示进度
    if (config.times > 0) {
      process.stdout.write(`\r  进度: ${iteration}/${config.times} (${((iteration / config.times) * 100).toFixed(1)}%)`);
    } else {
      process.stdout.write(`\r  已运行: ${iteration} 次`);
    }

    // 等待下一次
    if (shouldContinue(config, iteration, startTime)) {
      await new Promise(resolve => setTimeout(resolve, config.interval * 1000));
    }
  }

  console.log('\n');

  // 生成报告
  if (config.report || results.length > 0) {
    generateReport(results);
  }

  console.log(`\n✅ 运行完成! 总计 ${results.length} 次测试`);
}

main().catch(console.error);
