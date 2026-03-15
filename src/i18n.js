// RuMa-Pro 国际化翻译
export const translations = {
  zh: {
    nav: {
      modes: "运行模式",
      flavors: "覆盖层",
      ruma: "RuMa 辱骂",
      install: "安装"
    },
    hero: {
      title: "选择你的模式组合",
      subtitle: "4 种运行模式 × 4 种覆盖层 = 16 种组合",
      selectMode: "选择模式...",
      selectFlavor: "选择覆盖层...",
      generate: "生成 Skill",
      copy: "复制到剪贴板"
    },
    modes: {
      title: "🎯 运行模式 (Modes)",
      desc: "选择你的任务类型"
    },
    flavors: {
      title: "⚡ 覆盖层 (Overlays)",
      desc: "选择执行强度"
    },
    ruma: {
      title: "🔥 RuMa 辱骂话术",
      subtitle: "老子忍你很久了",
      levelsTitle: "压力等级",
      flavorsTitle: "风味选择",
      checklistTitle: "7 项检查清单"
    },
    install: {
      title: "📦 安装到 Agent",
      copy: "复制命令"
    },
    footer: {
      credits: "基于 tanweai/pua × PUAClaw × ruma-runtime 构建"
    }
  },
  en: {
    nav: {
      modes: "Modes",
      flavors: "Overlays",
      ruma: "RuMa Abuse",
      install: "Install"
    },
    hero: {
      title: "Choose Your Mode Combo",
      subtitle: "4 Modes × 4 Overlays = 16 Combinations",
      selectMode: "Select mode...",
      selectFlavor: "Select overlay...",
      generate: "Generate Skill",
      copy: "Copy to Clipboard"
    },
    modes: {
      title: "🎯 Execution Modes",
      desc: "Select your task type"
    },
    flavors: {
      title: "⚡ Overlays",
      desc: "Select execution intensity"
    },
    ruma: {
      title: "🔥 RuMa Abuse Rhetoric",
      subtitle: "I've had enough of your bullshit",
      levelsTitle: "Pressure Levels",
      flavorsTitle: "Flavor Options",
      checklistTitle: "7-Point Checklist"
    },
    install: {
      title: "📦 Install to Agent",
      copy: "Copy Command"
    },
    footer: {
      credits: "Built with tanweai/pua × PUAClaw × ruma-runtime"
    }
  },
  ja: {
    nav: {
      modes: "モード",
      flavors: "オーバーレイ",
      ruma: "RuMa 罵倒",
      install: "インストール"
    },
    hero: {
      title: "モード組み合わせを選択",
      subtitle: "4 モード × 4 オーバーレイ = 16 組み合わせ",
      selectMode: "モードを選択...",
      selectFlavor: "オーバーレイを選択...",
      generate: "Skillを生成",
      copy: "クリップボードにコピー"
    },
    modes: {
      title: "🎯 実行モード",
      desc: "タスクタイプを選択"
    },
    flavors: {
      title: "⚡ オーバーレイ",
      desc: "実行強度を選択"
    },
    ruma: {
      title: "🔥 RuMa 罵倒話術",
      subtitle: "もう我慢ならねえ",
      levelsTitle: "圧力レベル",
      flavorsTitle: "フレーバー選択肢",
      checklistTitle: "7項目チェックリスト"
    },
    install: {
      title: "📦 Agentにインストール",
      copy: "コマンドをコピー"
    },
    footer: {
      credits: "tanweai/pua × PUAClaw × ruma-runtime で構築"
    }
  }
};

export function setLanguage(lang) {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const keys = key.split('.');
    let value = translations[lang];
    for (const k of keys) {
      value = value?.[k];
    }
    if (value) {
      el.textContent = value;
    }
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    const keys = key.split('.');
    let value = translations[lang];
    for (const k of keys) {
      value = value?.[k];
    }
    if (value) {
      el.placeholder = value;
    }
  });
  document.documentElement.lang = lang;
  localStorage.setItem('ruma-lang', lang);
}

export function initLanguage() {
  const saved = localStorage.getItem('ruma-lang') || 'zh';
  const select = document.getElementById('langSelect');
  if (select) {
    select.value = saved;
    select.addEventListener('change', (e) => {
      setLanguage(e.target.value);
    });
  }
  setLanguage(saved);
}
