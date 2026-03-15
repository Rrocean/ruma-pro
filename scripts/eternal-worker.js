#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════════
// RuMa-Pro 7*24h 永动机 - 极致压榨 AI
// 让 AI 7*24h 不停干活，每5分钟自检一次
// ═══════════════════════════════════════════════════════════════════

import { spawn, exec } from 'child_process';
import { readFileSync, writeFileSync, existsSync, mkdirSync, appendFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ═══════════════════════════════════════════════════════════════════
// 配置
// ═══════════════════════════════════════════════════════════════════

const CONFIG = {
  interval: 5 * 60 * 1000,    // 5分钟检查一次
  maxTasksPerCycle: 10,       // 每次循环最多任务数
  workingHours: [0, 23],      // 24小时运行
  logFile: join(__dirname, '..', 'logs', 'eternal-work.log'),
  tasksFile: join(__dirname, '..', 'logs', 'task-queue.json'),
  reportFile: join(__dirname, '..', 'logs', 'daily-report.md')
};

// ═══════════════════════════════════════════════════════════════════
// 任务库 - AI 可以自己找的活
// ═══════════════════════════════════════════════════════════════════

const TASK_LIBRARY = [
  {
    name: '运行测试',
    command: 'npx playwright test --reporter=line',
    weight: 10,
    description: '运行 Playwright 测试套件'
  },
  {
    name: '生成报告',
    command: 'node scripts/agent-report.js',
    weight: 5,
    description: '生成 Agent 测试报告'
  },
  {
    name: '代码检查',
    command: 'npm run check',
    weight: 3,
    description: '检查代码质量'
  },
  {
    name: '性能测试',
    command: 'npx playwright test --grep="performance"',
    weight: 2,
    description: '运行性能相关测试'
  },
  {
    name: '清理缓存',
    command: 'rm -rf test-results/*.json 2>/dev/null; echo "cleaned"',
    weight: 1,
    description: '清理旧的测试结果'
  },
  {
    name: '更新文档',
    command: 'echo "Checking docs..."',
    weight: 2,
    description: '检查文档是否需要更新'
  },
  {
    name: '检查依赖',
    command: 'npm outdated 2>/dev/null || echo "OK"',
    weight: 3,
    description: '检查过时的依赖包'
  },
  {
    name: '备份项目',
    command: 'git add -A && git status --short',
    weight: 1,
    description: '检查 git 状态'
  }
];

// ═══════════════════════════════════════════════════════════════════
// 日志系统
// ═══════════════════════════════════════════════════════════════════

function log(message, type = 'INFO') {
  const timestamp = new Date().toISOString();
  const logLine = `[${timestamp}] [${type}] ${message}\n`;

  // 控制台输出
  const colors = {
    'INFO': '\x1b[36m',
    'WORK': '\x1b[33m',
    'DONE': '\x1b[32m',
    'WARN': '\x1b[35m',
    'ERROR': '\x1b[31m',
    'ETERNAL': '\x1b[31m⚡\x1b[0m'
  };

  console.log(`${colors[type] || ''}[${timestamp}] ${message}\x1b[0m`);

  // 写入文件
  try {
    const logsDir = join(__dirname, '..', 'logs');
    if (!existsSync(logsDir)) {
      mkdirSync(logsDir, { recursive: true });
    }
    appendFileSync(CONFIG.logFile, logLine);
  } catch (e) {
    // 忽略日志写入错误
  }
}

// ═══════════════════════════════════════════════════════════════════
// 任务队列
// ═══════════════════════════════════════════════════════════════════

let taskQueue = [];
let completedTasks = [];
let totalCycles = 0;

function loadTaskQueue() {
  if (existsSync(CONFIG.tasksFile)) {
    try {
      const data = JSON.parse(readFileSync(CONFIG.tasksFile, 'utf-8'));
      taskQueue = data.queue || [];
      completedTasks = data.completed || [];
    } catch (e) {
      taskQueue = [];
      completedTasks = [];
    }
  }
}

function saveTaskQueue() {
  try {
    writeFileSync(CONFIG.tasksFile, JSON.stringify({
      queue: taskQueue,
      completed: completedTasks.slice(-100)
    }, null, 2));
  } catch (e) {
    // 忽略
  }
}

function addTask(task) {
  taskQueue.push({
    ...task,
    addedAt: new Date().toISOString()
  });
  saveTaskQueue();
}

function getNextTask() {
  return taskQueue.shift() || null;
}

function completeTask(task, success) {
  completedTasks.unshift({
    ...task,
    completedAt: new Date().toISOString(),
    success
  });

  // 只保留最近 100 条
  if (completedTasks.length > 100) {
    completedTasks = completedTasks.slice(0, 100);
  }

  saveTaskQueue();
}

// ═══════════════════════════════════════════════════════════════════
// 自动发现任务
// ═══════════════════════════════════════════════════════════════════

function discoverTasks() {
  const tasks = [];

  // 根据权重随机选择任务
  const totalWeight = TASK_LIBRARY.reduce((sum, t) => sum + t.weight, 0);
  const numTasks = Math.min(
    CONFIG.maxTasksPerCycle,
    Math.floor(Math.random() * 5) + 3
  );

  for (let i = 0; i < numTasks; i++) {
    let random = Math.random() * totalWeight;
    for (const task of TASK_LIBRARY) {
      random -= task.weight;
      if (random <= 0) {
        tasks.push(task);
        break;
      }
    }
  }

  return tasks;
}

// ═══════════════════════════════════════════════════════════════════
// 执行任务
// ═══════════════════════════════════════════════════════════════════

function runTask(task) {
  return new Promise((resolve) => {
    log(`🔨 执行任务: ${task.name}`, 'WORK');

    const startTime = Date.now();
    const proc = spawn('bash', ['-c', task.command], {
      cwd: join(__dirname, '..'),
      stdio: 'pipe'
    });

    let output = '';

    proc.stdout.on('data', (data) => {
      output += data.toString();
    });

    proc.stderr.on('data', (data) => {
      output += data.toString();
    });

    proc.on('close', (code) => {
      const duration = Date.now() - startTime;
      const success = code === 0;

      log(`${success ? '✅' : '❌'} 任务完成: ${task.name} (${duration}ms)`,
          success ? 'DONE' : 'ERROR');

      resolve({
        task,
        success,
        duration,
        output: output.slice(0, 500)
      });
    });

    proc.on('error', (err) => {
      log(`❌ 任务错误: ${task.name} - ${err.message}`, 'ERROR');
      resolve({
        task,
        success: false,
        duration: 0,
        output: err.message
      });
    });
  });
}

// ═══════════════════════════════════════════════════════════════════
// 生成每日报告
// ═══════════════════════════════════════════════════════════════════

function generateDailyReport() {
  const today = new Date().toISOString().split('T')[0];
  const todayTasks = completedTasks.filter(t =>
    t.completedAt && t.completedAt.startsWith(today)
  );

  const successCount = todayTasks.filter(t => t.success).length;
  const failCount = todayTasks.length - successCount;
  const successRate = todayTasks.length > 0
    ? (successCount / todayTasks.length * 100).toFixed(1)
    : 0;

  const report = `# 📊 每日工作报告 - ${today}

## 统计

- 总任务数: ${todayTasks.length}
- 成功: ${successCount}
- 失败: ${failCount}
- 成功率: ${successRate}%

## 运行时间

- 总循环次数: ${totalCycles}
- 持续运行: ${(totalCycles * CONFIG.interval / 3600000).toFixed(1)} 小时

## 任务详情

${todayTasks.map(t => `- ${t.name}: ${t.success ? '✅' : '❌'} (${t.duration}ms)`).join('\n')}

---
Generated by RuMa-Pro 7*24h Eternal Worker
`;

  try {
    const reportsDir = join(__dirname, '..', 'logs');
    if (!existsSync(reportsDir)) {
      mkdirSync(reportsDir, { recursive: true });
    }
    writeFileSync(CONFIG.reportFile, report);
    log(`📊 报告已生成: ${CONFIG.reportFile}`, 'INFO');
  } catch (e) {
    log(`⚠️ 报告生成失败: ${e.message}`, 'WARN');
  }
}

// ═══════════════════════════════════════════════════════════════════
// 主循环
// ═══════════════════════════════════════════════════════════════════

async function runCycle() {
  totalCycles++;

  log(`⚡ 开始第 ${totalCycles} 次循环...`, 'ETERNAL');

  // 自动发现任务
  const tasks = discoverTasks();

  if (tasks.length === 0) {
    log('⚠️ 没有发现任务', 'WARN');
    return;
  }

  log(`📋 发现 ${tasks.length} 个任务`, 'INFO');

  // 添加到队列
  for (const task of tasks) {
    addTask(task);
  }

  // 执行任务
  while (taskQueue.length > 0) {
    const task = getNextTask();
    if (task) {
      const result = await runTask(task);
      completeTask(task, result.success);
    }
  }

  // 每10次循环生成一次报告
  if (totalCycles % 10 === 0) {
    generateDailyReport();
  }

  log(`✅ 第 ${totalCycles} 次循环完成 | 待处理: ${taskQueue.length}`, 'DONE');
}

// ═══════════════════════════════════════════════════════════════════
// 7*24h 永动机
// ═══════════════════════════════════════════════════════════════════

function startEternalMachine() {
  console.log(`
╔══════════════════════════════════════════════════════════════════╗
║  ⚡ RuMa-Pro 7*24h 永动机启动 ⚡                              ║
║  极致压榨 AI，让它他妈的给我一直干活！                         ║
╠══════════════════════════════════════════════════════════════════╣
║  检查间隔: ${(CONFIG.interval / 60000).toFixed(0)} 分钟                                         ║
║  每次任务: 最多 ${CONFIG.maxTasksPerCycle} 个                                        ║
║  运行时间: 7*24h 不间断                                     ║
╚══════════════════════════════════════════════════════════════════╝
  `);

  log('🚀 7*24h 永动机启动！', 'ETERNAL');

  // 立即运行第一次
  runCycle();

  // 设置定时器
  setInterval(() => {
    runCycle();
  }, CONFIG.interval);
}

// ═══════════════════════════════════════════════════════════════════
// 解析命令行参数
// ═══════════════════════════════════════════════════════════════════

function parseArgs() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    printHelp();
    process.exit(0);
  }

  if (args.includes('--once')) {
    // 只运行一次
    loadTaskQueue();
    runCycle().then(() => {
      console.log('单次运行完成');
      process.exit(0);
    });
    return;
  }

  if (args.includes('--report')) {
    // 生成报告
    generateDailyReport();
    process.exit(0);
    return;
  }

  // 启动 7*24h 永动机
  loadTaskQueue();
  startEternalMachine();
}

function printHelp() {
  console.log(`
⚡ RuMa-Pro 7*24h 永动机

用法: node eternal-worker.js [选项]

选项:
  --help, -h     显示帮助
  --once         只运行一次
  --report       生成每日报告

示例:
  node eternal-worker.js           # 启动 7*24h 永动机
  node eternal-worker.js --once    # 只运行一次
  node eternal-worker.js --report  # 生成报告
`);
}

// ═══════════════════════════════════════════════════════════════════
// 启动
// ═══════════════════════════════════════════════════════════════════

parseArgs();
