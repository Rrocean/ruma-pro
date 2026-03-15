// 安装脚本 - 将 skill 安装到不同 agent
import { readFileSync, writeFileSync, mkdirSync, existsSync, cpSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

const targets = {
  claude: {
    skillDir: join(process.env.USERPROFILE || process.env.HOME, '.claude/skills/ruma-pro'),
    adapter: 'claude'
  },
  openclaw: {
    skillDir: join(process.env.USERPROFILE || process.env.HOME, '.openclaw/skills/ruma-pro'),
    adapter: 'openclaw'
  }
};

function install(target) {
  const config = targets[target];
  if (!config) {
    console.error(`Unknown target: ${target}`);
    console.log(`Available targets: ${Object.keys(targets).join(', ')}`);
    process.exit(1);
  }

  const sourceAdapter = join(rootDir, 'adapters', config.adapter, 'ruma-pro');

  if (!existsSync(sourceAdapter)) {
    console.error(`Adapter not found: ${sourceAdapter}`);
    process.exit(1);
  }

  console.log(`Installing to ${target}...`);

  // 创建目标目录
  mkdirSync(config.skillDir, { recursive: true });

  // 复制文件
  const files = ['SKILL.md'];
  files.forEach(file => {
    const source = join(sourceAdapter, file);
    const dest = join(config.skillDir, file);
    if (existsSync(source)) {
      cpSync(source, dest);
      console.log(`  ✓ ${file}`);
    }
  });

  console.log(`\n✅ Installed to ${config.skillDir}`);

  if (target === 'claude') {
    console.log(`\nUsage: /ruma-pro [mode] [flavor]`);
    console.log(`Example: /ruma-pro diagnose pua`);
  }
}

// 主入口
const targetArg = process.argv[2];
if (!targetArg) {
  console.log('Usage: node install-agent-skill.mjs <target>');
  console.log(`Targets: ${Object.keys(targets).join(', ')}`);
  process.exit(1);
}

install(targetArg);
