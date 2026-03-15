// Codex 安装脚本
import { mkdirSync, existsSync, cpSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

const codexDir = join(process.env.USERPROFILE || process.env.HOME, '.codex/skills/ruma-pro');

console.log('Installing to Codex CLI...');

mkdirSync(codexDir, { recursive: true });

// 复制 Codex 适配器
const source = join(rootDir, 'adapters/codex/ruma-pro');
if (existsSync(source)) {
  cpSync(join(source, 'SKILL.md'), join(codexDir, 'SKILL.md'));
  console.log('  ✓ SKILL.md');
}

console.log(`\n✅ Installed to ${codexDir}`);
console.log('\nUsage: /ruma-pro [mode] [flavor]');
