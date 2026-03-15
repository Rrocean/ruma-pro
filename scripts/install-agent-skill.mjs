// 安装脚本 - 将 skill 安装到不同 agent
import { readFileSync, writeFileSync, mkdirSync, existsSync, cpSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

const targets = {
  claude: {
    skillDir: join(process.env.USERPROFILE || process.env.HOME, '.claude/skills'),
    adapter: 'claude'
  },
  openclaw: {
    skillDir: join(process.env.USERPROFILE || process.env.HOME, '.openclaw/skills'),
    adapter: 'openclaw'
  }
};

// 可安装的 skills 列表
const availableSkills = [
  'ruma-pro',
  'ruma',
  'eternal',
  'autowork',
  'pua',
  'ruma-en',
  'ruma-ja'
];

function install(target, skill = null) {
  const config = targets[target];
  if (!config) {
    console.error(`Unknown target: ${target}`);
    console.log(`Available targets: ${Object.keys(targets).join(', ')}`);
    process.exit(1);
  }

  if (skill) {
    // 安装单个 skill
    installSingleSkill(config, target, skill);
  } else {
    // 安装所有 skills
    installAllSkills(config, target);
  }
}

function installSingleSkill(config, target, skill) {
  const sourceAdapter = join(rootDir, 'adapters', config.adapter, skill);

  if (!existsSync(sourceAdapter)) {
    console.error(`Skill not found: ${skill}`);
    console.log(`Available skills: ${availableSkills.join(', ')}`);
    process.exit(1);
  }

  const destDir = join(config.skillDir, skill);
  console.log(`Installing ${skill} to ${target}...`);

  mkdirSync(destDir, { recursive: true });

  const files = readdirSync(sourceAdapter);
  files.forEach(file => {
    const source = join(sourceAdapter, file);
    const dest = join(destDir, file);
    if (existsSync(source)) {
      cpSync(source, dest);
      console.log(`  ✓ ${file}`);
    }
  });

  console.log(`\n✅ Installed to ${destDir}`);
  console.log(`\nUsage: /${skill}`);
}

function installAllSkills(config, target) {
  console.log(`Installing ALL skills to ${target}...\n`);

  availableSkills.forEach(skill => {
    const sourceAdapter = join(rootDir, 'adapters', config.adapter, skill);

    if (existsSync(sourceAdapter)) {
      const destDir = join(config.skillDir, skill);

      try {
        mkdirSync(destDir, { recursive: true });

        const files = readdirSync(sourceAdapter);
        files.forEach(file => {
          const source = join(sourceAdapter, file);
          const dest = join(destDir, file);
          if (existsSync(source)) {
            cpSync(source, dest);
          }
        });

        console.log(`  ✓ ${skill}`);
      } catch (e) {
        console.log(`  ✗ ${skill} - ${e.message}`);
      }
    }
  });

  console.log(`\n✅ All skills installed to ${config.skillDir}`);
  console.log(`\nAvailable commands:`);
  availableSkills.forEach(skill => {
    console.log(`  /${skill}`);
  });
}

// 主入口
const targetArg = process.argv[2];
const skillArg = process.argv[3];

if (!targetArg) {
  console.log(`
📦 RuMa-Pro Skill Installer

Usage: node install-agent-skill.mjs <target> [skill]

Targets:
  claude     - Claude Code
  openclaw   - OpenClaw

Skills (optional):
  ruma-pro   - 百分之一千潜能
  ruma       - 基础辱骂模式
  eternal    - 7*24h永动机
  autowork   - 自主工作
  pua        - 高压执行
  ruma-en    - English version
  ruma-ja    - Japanese version

Examples:
  # Install all skills to Claude Code
  node install-agent-skill.mjs claude

  # Install single skill
  node install-agent-skill.mjs claude ruma-pro

  # Install to OpenClaw
  node install-agent-skill.mjs openclaw
`);
  process.exit(1);
}

install(targetArg, skillArg);
