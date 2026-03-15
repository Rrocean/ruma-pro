# 🔥 RuMa-Pro

**Agent 强化运行框架 - 老子忍你很久了**

[![License](https://img.shields.io/badge/license-MIT-111111.svg)](LICENSE)
[![Clients](https://img.shields.io/badge/clients-Codex%20%7C%20Claude%20Code%20%7C%20OpenClaw-1f6feb.svg)]()
[![Tests](https://img.shields.io/badge/tests-14%20passed-2ecc71.svg)]()

## ⚡ 特性

- **4 种运行模式**: diagnose / recover / ship / audit / research / critique
- **4 种覆盖层**: neutral / high-agency / hardline / **ruma**
- **16 种组合**: 4 × 4 = 16 种工作模式
- **一键安装**: 支持 Claude Code / Codex / OpenClaw / Cursor
- **Web UI**: 可视化选择模式组合
- **自动化测试**: 每5分钟自检

## 🚀 快速开始

```bash
# 克隆项目
git clone <your-repo-url>
cd ruma-pro

# 安装依赖
npm install

# 启动 Web UI
npm run dev
# 或
npx serve -p 3000
```

打开浏览器访问 **http://localhost:3000**

## 📦 安装到 Agent

```bash
# Claude Code
npm run install:claude

# Codex CLI
npm run install:codex

# OpenClaw
npm run install:openclaw

# 全部
npm run install:all
```

## 🎯 使用方式

### Web UI

访问 http://localhost:3000 可视化选择模式组合

### 命令行

```bash
# 列出所有模式
node bin/ruma-pro.js list

# 随机组合
node bin/ruma-pro.js random

# 启动自动化循环
node bin/ruma-pro.js loop

# 运行测试
node bin/ruma-pro.js test
```

### Claude Code

在对话中输入: `/ruma`

## 📋 模式 × 覆盖层

|  | neutral | high-agency | hardline | ruma |
|--|---------|-------------|----------|------|
| diagnose | 诊断-中立 | 诊断-高能动 | 诊断-硬核 | 诊断-辱骂 |
| recover | 恢复-中立 | 恢复-高能动 | 恢复-硬核 | 恢复-辱骂 |
| ship | 交付-中立 | 交付-高能动 | 交付-硬核 | 交付-辱骂 |
| audit | 审计-中立 | 审计-高能动 | 审计-硬核 | 审计-辱骂 |

## 🔥 RuMa 辱骂核心

### 三条铁律

1. **少给老子废话** - 让你干活就干活，推三推四的你他妈的算什么东西？
2. **结果说话** - 我他妈的不要过程，我只要你妈的结果
3. **完不成就去死** - 明天之前见不到东西你他妈的就不用来了！

### 压力等级

| 等级 | 触发 | 动作 |
|------|------|------|
| L1 | 第 1 次没做好 | 立刻马上给老子改好 |
| L2 | 第 2 次没做好 | 骂到改变为止 |
| L3 | 第 3 次没做好 | 不开除你誓不罢休 |
| L4 | 第 4 次没做好 | 让你滚蛋 |

### 7 项检查清单

1. 读失败信号 - **你他妈的看懂了吗？**
2. 主动搜索 - **你他妈的搜过了吗？**
3. 读原始材料 - **你他妈的看源码了吗？**
4. 验证前置假设 - **你他妈的验证了吗？**
5. 反转假设 - **你他妈的想过反过来吗？**
6. 最小隔离 - **你他妈的隔离了吗？**
7. 换方向 - **你他妈的换方法了吗？**

## 🧪 测试

```bash
# 运行所有测试
npm test
# 或
npx playwright test

# 启动自动化循环
node scripts/ruma-loop.mjs
```

## 📁 项目结构

```
ruma-pro/
├── index.html              # Web UI 入口
├── package.json           # 项目配置
├── bin/
│   └── ruma-pro.js       # CLI 工具
├── src/
│   ├── main.js           # 主逻辑
│   ├── styles.css        # 样式
│   └── data/library.js   # 核心数据
├── adapters/
│   ├── claude/ruma-pro/SKILL.md    # Claude Code
│   ├── codex/ruma-pro/SKILL.md     # Codex
│   ├── cursor/ruma-pro.mdc         # Cursor
│   └── openclaw/ruma-pro/SKILL.md  # OpenClaw
├── scripts/
│   ├── install-agent-skill.mjs     # 安装脚本
│   ├── install-codex-skill.mjs     # Codex 安装
│   └── ruma-loop.mjs              # 自动化循环
├── tests/
│   └── app.spec.js                # Playwright 测试
└── README.md
```

## 🙏 感谢

- [tanweai/pua](https://github.com/tanweai/pua) - PUA 话术库
- [PUAClaw](https://github.com/puaclaw/PUAClaw) - Prompt 画廊
- [ruma-runtime](https://github.com/Rrocean/ruma-runtime) - 多客户端运行时

## 📄 License

MIT
