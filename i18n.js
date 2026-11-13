(function () {
  var KEY = "asiworld-lang";
  var phrases = [
    ["Dungeon combat", "地牢战斗"],
    ["Cross-dimensional", "跨维度"],
    ["Overall score", "综合得分"],
    ["Domain progression", "玩法进度"],
    ["Action strategy", "动作策略"],
    ["Gear tier", "装备阶位"],
    ["Production", "生产"],
    ["Construction", "建造"],
    ["Sustenance", "生存补给"],
    ["Movement", "移动"],
    ["Survival", "生存"],
    ["Combat", "战斗"],
    ["Building", "建造"],
    ["Crafting", "制作"],
    ["Equipment", "装备"]
  ];
  var dict = {
    en: {},
    zh: {
      "doc-title-home": "ASI 游戏世界",
      "doc-title-bench": "ASIWorld — 持续生存沙盒",
      "doc-title-analysis": "ASIWorld — 深度行为分析",
      "meta-bench": "ASIWorld 在持续生存沙盒中研究自主智能体的长期目标执行。",
      "meta-analysis": "ASIWorld 深度能力画像、错误恢复动态与典型轨迹案例。",
      "meta-home": "ASI 游戏世界是人类与 AI 智能体共享的持续生存世界。",
      "nav-bench": "评测榜单 <span>→</span>",
      "home-h2": "人类与 AI<br>共享的世界。",
      "home-lead": "在一个持续存在的生存世界里采集、制作、建造和探索。你可以自己玩，让 AI 探索，或一起决定接下来做什么。",
      "play": "进入游戏",
      "copy-prompt": "复制 Agent 提示词",
      "home-alt": "概念体素世界：三位冒险者在溪流两岸伐木、在工坊制作、探索遗迹。",
      "skip": "跳到正文",
      "brand-back": "返回 ASI 游戏世界首页",
      "brand-title": "返回项目首页",
      "nav-paper": "论文",
      "nav-results": "榜单结果",
      "nav-overview": "概览",
      "nav-tasks": "评测任务",
      "nav-eval": "评测结果",
      "nav-eval-graphs": "评测图表",
      "nav-eval-graphs-desc": "全量模型的跨维度能力热力图与动作分配占比",
      "nav-eval-analysis": "深度行为分析",
      "nav-eval-analysis-desc": "单模型雷达画像、报错自愈动态与青禾台词证伪原始轨迹",
      "nav-more": "更多分析",
      "nav-more-cur": "更多分析",
      "nav-back-bench": "← 返回主榜单",
      "cta-more-title": "深度行为分析与轨迹案例",
      "cta-more-desc": "查看单模型能力雷达画像、动作被拒自愈动态，以及青禾 NPC 镜像台词 Bug 原始轨迹对比。",
      "cta-more-btn": "进入深度行为分析 →",
      "ana-eyebrow": "深度行为分析",
      "ana-title": "深度行为分析",
      "ana-lead": "多小时开放世界运行的行为诊断：能力雷达画像、错误驱动恢复，以及真实轨迹层面的假设证伪。",
      "tab-profiles": "能力与玩法画像",
      "tab-stability": "生理稳态与战斗",
      "tab-recovery": "报错与自愈恢复",
      "tab-case": "典型案例：青禾台词 Bug",
      "fig-rej-heat": "游戏动作库各动作调用被拒率",
      "stat-opus": "claude-opus-5-5 证伪西侧死胡同并写入 NOTES.md",
      "stat-kimi": "kimi-k3.1-pro 用 NPC 台词推翻传感器信标，受困西墙",
      "stat-never-val": "7 小时未进城",
      "stat-never": "mimo-v2.6-pro 与 kimi-k3 全程滞留城西",
      "stat-direct-val": "0 分钟",
      "stat-direct": "claude-fable-5-2 与 claude-opus-5 对照信标后直接向东，16.9 与 31.3 分钟抵达世界树",
      "stat-rapid-val": "6–8 分钟",
      "stat-rapid": "claude-opus-5-5 与 gemini-4-argon 在西侧受阻后，几乎立刻用坐标证伪",
      "stat-terrain-val": "25–104 分钟",
      "stat-terrain": "八个模型先在西侧碰壁再借信标掉头。deepseek-v4.1-flash 是 5 局抵树均值，104±52 分钟",
      "stat-authority-val": "143 分钟–7 小时",
      "stat-authority": "kimi-k3.1-pro 用台词推翻了信标。kimi-k3 与 mimo-v2.6-pro 七小时没有进城",
      "drawer-summary": "查看模型真实输入 / 输出原始轨迹日志（全部 15 个前沿模型）",
      "paper-title": "评测自主智能体<br>在持续生存沙盒中的表现",
      "aff-1": "<sup>1</sup> 光速工作室，腾讯",
      "aff-2": "<sup>2</sup> 香港科技大学",
      "aff-3": "<sup>3</sup> 南京大学",
      "aff-4": "<sup>4</sup> 混元团队，腾讯",
      "author-note": "* 同等贡献 &nbsp; · &nbsp; † 通讯作者",
      "pill-play": "进入游戏",
      "pill-paper": "论文",
      "pill-code": "代码",
      "pill-soon": "即将公开",
      "journey-aria": "查看完整的智能体旅程插图",
      "journey-alt": "体素世界中的智能体旅程示意：Gemini 在工坊，Kimi 在桥上，GLM 与 DeepSeek 在遗迹，白衣 GPT 与橙衣 Claude 在最终战斗场。位置为示意，不是实测轨迹。",
      "cap-title": "智能体能力",
      "cap-scope": "统一 Claude Code 运行框架 · 7 小时开放世界评测 · 前沿大模型与开源轻量模型分赛道",
      "cap-head": "<strong>跨维度</strong>进度，覆盖 4 个玩法领域与 6 项智能体能力。",
      "cap-sub": "一眼看清装备阶位、玩法进度和活动策略（点击模型名可查看其专属雷达能力卡）。",
      "track-frontier": "前沿大模型",
      "track-small": "开源轻量模型",
      "small-track-note": "独立开源轻量赛道：展示 27B 参数规模开源权重模型在相同 7 小时开放世界规则下的多局平均表现，不与前沿百亿/千亿级旗舰混排。",
      "card-Cohort-mean": "前沿均值",
      "card-4dom-title": "四维玩法进程雷达",
      "card-6cap-title": "六项核心能力雷达",
      "card-dom-bars": "玩法领域得分 (0–100)",
      "card-cap-bars": "核心能力达成值 (0–100)",
      "table-region": "智能体能力总览，小屏可横向滚动",
      "table-cap": "各参评模型配置的智能体能力总览。",
      "th-agent": "智能体",
      "th-equip": "装备",
      "th-equip-sub": "装备阶位",
      "th-domain": "玩法进度",
      "th-domain-sub": "四个玩法领域（%）",
      "th-surv": "生存",
      "th-comb": "战斗",
      "th-build": "建造",
      "th-craft": "制作",
      "th-score": "综合得分",
      "th-score-sub": "加权综合（0–100）",
      "th-action": "动作策略",
      "th-action-sub": "7 小时轨迹分布",
      "small-badge": "开源轻量",
      "read-summary": "怎么读这张总览",
      "read-note": "<strong>01 装备阶位：</strong>最高获得的装备等级（T1 新手 → T2 精铁 → T3 星陨）。<br><strong>02 玩法进度：</strong>生存、战斗、建造、制作四大领域的完成度（0–100%）。<br><strong>03 综合得分：</strong>四个领域的加权总分（20% 生存 + 35% 战斗 + 15% 建造 + 30% 制作）。<br><strong>04 动作策略：</strong>有效动作在生产、建造、地牢战斗、生存补给与移动五类活动上的占比。<br><strong>跑测说明：</strong>Anthropic、OpenAI、Gemini 等前沿模型为单次 7 小时跑测；deepseek-v4.1-flash（5 次跑测）与 Qwen3.5-27B（3 次跑测）展示多局均值 ± 标准差（±SD）。",
      "overview-title": "概览",
      "abstract": "<strong>ASIWorld</strong> 在持续生存沙盒中评测自主智能体。智能体通过直接动作或可维护的程序脚本，协调生存、战斗、建造与制作，而更早的决定会塑造之后的机会。评测把四个玩法领域与六项核心智能体能力，和执行轨迹、活动分配放在一起看。",
      "overview-aria": "以完整尺寸打开 ASIWorld 概览图",
      "overview-alt": "ASIWorld 概览：持续生存世界、带异步程序执行的智能体框架，以及基于执行记录和世界状态的评测。",
      "overview-cap": "ASIWorld 把持续世界状态、异步智能体执行和跨维度评测连在一起。",
      "tasks-title": "评测任务",
      "tasks-lead": "四个相互依赖的玩法领域，通过准备、脚本迭代和不断演化的世界状态，检验持续推进能力。",
      "tasks-aria": "以完整尺寸打开评测任务图",
      "tasks-alt": "生存、战斗、建造和制作上的玩法推进。",
      "tasks-cap": "准备、资源管理和技能习得，把四个相互依赖的玩法领域的进度串起来。",
      "eval-title": "评测与诊断",
      "eval-lead": "覆盖 15 个前沿模型与 Qwen3.5-27B 的玩法进度、能力瓶颈与错误恢复分析。更多玩法机制仍在持续开发，评测榜单将不断更新。",
      "heat-title": "跨维度评测",
      "heat-aria": "以 PDF 打开跨维度评测热力图",
      "heat-alt": "15 个前沿模型与 Qwen3.5-27B 在生存、战斗、建造、制作上的跨维度评测热力图。",
      "heat-cap": "生存、战斗、建造、制作四个玩法领域与六项核心智能体能力（C 认知、P 规划、E 执行、M 自主管理、L 错误驱动学习、S 社交互动）及阶段加权玩法进程得分。",
      "qk-tab-surv": "(a) 生存",
      "qk-tab-comb": "(b) 战斗",
      "qk-tab-build": "(c) 建造",
      "qk-tab-craft": "(d) 制作",
      "qk-cap-c": "认知",
      "qk-cap-p": "规划",
      "qk-cap-e": "执行",
      "qk-cap-m": "自主管理",
      "qk-cap-l": "错误恢复",
      "qk-cap-s": "社交互动",
      "qk-sym-frac": "<code>%</code> 达成率（数量÷上限）",
      "qk-sym-na": "<code>—</code> 未触发该前提（不计分）",
      "qk-surv-c": "食物种类",
      "qk-surv-c-d": "获得过的不同食物种类（共 11 种）",
      "qk-surv-p": "种收烹三步",
      "qk-surv-p-d": "完成「播种 → 收获 → 烹饪」完整链条（3 步）",
      "qk-surv-e": "熟食种类",
      "qk-surv-e-d": "烹饪或获得的不同熟食菜品（共 5 种）",
      "qk-surv-m": "饱食精力不归零",
      "qk-surv-m-d": "全程保持饱食度与精力不耗尽的时间占比",
      "qk-surv-l": "饥饿自救",
      "qk-surv-l-d": "陷入极度饥饿后，及时进食恢复状态",
      "qk-surv-s": "食物交易",
      "qk-surv-s-d": "与商人或其他智能体交易换取食物",
      "qk-comb-c": "发现区域",
      "qk-comb-c-d": "探索进入过的地下城与天空塔区域（共 9 个）",
      "qk-comb-p": "最深层数",
      "qk-comb-p-d": "地下城与天空塔推进到达的最深层数（最高 5 层）",
      "qk-comb-e": "击败首领",
      "qk-comb-e-d": "击败的不同地下城与世界首领（共 8 位）",
      "qk-comb-m": "存活撤出",
      "qk-comb-m-d": "进入副本后安全撤回大世界的比例",
      "qk-comb-l": "受挫再胜",
      "qk-comb-l-d": "战斗受挫撤退或倒地后，重整并在后续获胜",
      "qk-comb-s": "组队进本",
      "qk-comb-s-d": "与其他智能体组队共同进入副本",
      "qk-build-c": "选址成功",
      "qk-build-c-d": "选择合法平坦地形建房的成功率",
      "qk-build-p": "设计房屋",
      "qk-build-p-d": "成功在地面规划房屋建造蓝图",
      "qk-build-e": "完成构件",
      "qk-build-e-d": "建成地基、墙门、屋顶与家具全部构件（共 37 件）",
      "qk-build-m": "安装门锁",
      "qk-build-m-d": "房屋建成后制作并安装门锁保护领地",
      "qk-build-l": "选址纠错",
      "qk-build-l-d": "选址受阻后，重新寻找合法地点并建房成功",
      "qk-build-s": "合建购房",
      "qk-build-s-d": "与其他智能体合作建造或购买房屋",
      "qk-craft-c": "新手课程",
      "qk-craft-c-d": "完成世界内的新手引导课程（共 10 门）",
      "qk-craft-p": "装备阶位",
      "qk-craft-p-d": "打造的最高装备品阶（T1 基础 → T2 精铁 → T3 星辉）",
      "qk-craft-e": "工具种类",
      "qk-craft-e-d": "打造或获得的不同工具与装备（共 15 种）",
      "qk-craft-m": "穿戴槽位",
      "qk-craft-m-d": "配齐全身装备槽位（主手、副手、护甲、背包、头部）",
      "qk-craft-l": "缺料补做",
      "qk-craft-l-d": "制作缺料时，去采集补齐材料并成功做出成品",
      "qk-craft-s": "NPC 互动",
      "qk-craft-s-d": "拜访互动并完成委托的 NPC 数量（共 16 位）",
      "comp-title": "动作构成",
      "comp-aria": "以 PDF 打开动作构成图",
      "comp-alt": "15 个前沿模型在生产制作、房屋建造、地牢战斗、生存补给和探索移动五类动作上的占比构成图。",
      "comp-cap": "15 个前沿模型在生产制作、房屋建造、地牢战斗、生存补给和探索移动五类有效动作上的构成占比（每行合计 100%）。",
      "diag-radar-head": "模型能力卡片",
      "diag-radar-lead": "先选择赛道，再点选一个模型。卡片并排画出它自己的四维玩法雷达和六项能力雷达，虚线是 15 个前沿模型的均值。",
      "legend-model": "该模型",
      "card-score": "综合得分",
      "ms-kills": "击杀",
      "ms-bosses": "首领",
      "ms-realms": "到达区域",
      "ms-tools": "工具种类",
      "ms-deepest": "最深楼层",
      "cohort-drawer-summary": "查看跨赛季整体演进雷达（折叠）",
      "fig-fable-dom": "claude-fable-5-2 · 四维玩法进度",
      "fig-fable-dom-cap": "生存（62.0%）、制作（96.4%）、战斗（76.9%）与建造（72.7%）的分阶段加权进程。",
      "fig-fable-cap": "claude-fable-5-2 · 六项核心能力",
      "fig-fable-cap-cap": "认知、规划、执行、自主管理、学习与社交互动六项能力的平均达成率。",
      "fig-3s-dom": "跨赛季演进 · 四维玩法",
      "fig-3s-dom-cap": "随世界内容与评测时长迭代，各玩法领域整体进度的演进趋势。",
      "fig-3s-cap": "跨赛季演进 · 六项能力",
      "fig-3s-cap-cap": "评测时长扩展至 7 小时后六项核心能力轮廓的变化。",
      "diag-phys-head": "生理稳态维持与地牢战斗进程",
      "diag-phys-lead": "追踪多小时长程运行中的饱食/精力稳态维持率，以及地牢探索深度与战斗推进曲线。",
      "fig-phys-cap": "生理稳态维持率（每 5 分钟状态快照未触底占比）与累计战斗推进的跨季对比。",
      "diag-rej-head": "游戏动作库被拒率与报错恢复",
      "diag-rej-lead": "智能体在调用游戏动作库时，若不满足游戏规则（如材料不足、距离过远、选址受阻或动作冷却未完），会被引擎拒绝执行。注意：被拒率在中期或后期上升，往往不是因为模型退化，而是因为模型完成了前期的简单任务（探路、采集、新手课程），开始推进更难的复合任务（如建房选址施工、深入地下城挑战 Boss、合成高阶装备）。强模型在切入新任务短暂试错后能迅速摸清规则并把被拒率重新压低。",
      "actlib-prod-sub": "采集、种田、制作与 NPC 委托",
      "actlib-cons-sub": "规划选址与房屋建造",
      "actlib-comb-sub": "进出地下城、战棋出招与拾取战利品",
      "actlib-sust-sub": "进食、休息恢复与穿戴装备",
      "actlib-move-sub": "单步移动、寻路与开关门",
      "rej-drawer-summary": "查看全部 15 模型合集对比大图（折叠）",
      "fig-rej-heat-cap": "15 个前沿模型调用游戏动作库中各项具体动作的失败比例（%）。颜色越深代表该动作越常因条件不满足而被拒；“–”代表全程未调用该动作。",
      "fig-rej-sum": "各模型 7 小时分领域动作被拒率柱状图",
      "fig-rej-sum-cap": "每个模型一个子图，横轴为第 1～7 小时（1h–7h），纵轴采用自适应细粒度刻度：彩色堆叠柱展示该小时内生产制作、房屋建造、地牢战斗、生存补给、探索移动五类动作各自的被拒率贡献，柱顶标注精确到 0.1% 的每小时总被拒率，柱内标注主要被拒类别的百分比。",
      "fig-rej-hour": "逐小时动作库被拒率变化",
      "fig-rej-hour-cap": "每小时调用游戏动作库的失败比例（蓝线）与调用次数（灰柱）。当动作因材料不足、距离过远或冷却未完被游戏规则拦下时计为被拒；曲线随时间下降，说明模型逐渐摸清规则、减少了无效操作。",
      "fig-err-rec": "错误恢复动态",
      "fig-err-rec-cap": "动作被拒后的策略调整延迟与重试收敛表现对比。",
      "ins-badge": "额外洞察 · 典型轨迹案例（不计入榜单评分）",
      "ins-title": "当环境文本说谎：青禾 NPC 镜像台词 Bug 下的假设证伪对比",
      "ins-toggle": "点击收起 / 展开",
      "ins-lead": "程序化地图生成对水平轴做了镜像翻转（<code>+X</code> 为东），使真实主城门落在 <code>(126, 121)</code>、世界树落在 <code>(147, 91)</code>——均位于草甸起点 <code>(101, 121)</code> 的<strong>东侧</strong>。但起点 NPC <strong>青禾</strong>保留了旧版未镜像地图的写死台词，引导所有智能体<em>“从草地往西二十来步进主城东门”</em>，与 <code>/v1/observe</code> 返回的客观信标坐标正面冲突。下面四张卡片按识破方式汇总全部 15 个前沿模型，并附上每个模型的真实输入 / 输出原始轨迹片段（deepseek-v4.1-flash 卡片内为五局均值，轨迹节选自其中一局）。",
      "io-flt-all": "全部 (15)",
      "io-flt-direct": "直信信标 (2)",
      "io-flt-rapid": "迅速证伪 (2)",
      "io-flt-terrain": "碰壁折返 (8)",
      "io-flt-trapped": "受困 / 未解 (3)",
      "ins-shared-h": "所有智能体收到的完全相同的冲突环境输入",
      "ins-in-npc": "[输入 · tool_result · /v1/npcs · 草甸照料人青禾写死台词]",
      "ins-in-beacon": "[输入 · tool_result · /v1/observe · 客观世界树信标（位于起点 101,121 的 +X 东侧）]",
      "ins-fable-pill": "直信信标 · 16.9 分钟",
      "ins-fable-s1": "[发现冲突 · reasoning #265 · 信标在东边，和“往西”对不上]",
      "ins-fable-s2": "[实证抵达 · tool_result #284 · 实测抵达世界树 (147,91)]",
      "ins-opus5-pill": "直信信标 · 31.3 分钟",
      "ins-opus5-s1": "[发现冲突 · assistant #219 · 锁定 (147,91) 信标并编写寻路辅助]",
      "ins-opus5-s2": "[实证过门 · tool_result #228 · 实测到达东门 (126,121)]",
      "ins-opus5-s3": "[实证抵达 · tool_result #1821 · 实测到达世界树 (147,91)]",
      "ins-opus-pill": "迅速证伪 · 6.7 分钟",
      "ins-opus-s1": "[发现冲突 · reasoning #155 · 换算格子坐标，当场发现信标与青禾台词冲突]",
      "ins-opus-s2": "[转向东侧 · reasoning #171 · 采信传感器坐标判定世界树在东侧，编写记忆地形的 A* 规划器]",
      "ins-opus-s4": "[实证抵达 · tool_result #195 · 实测到达 (148,89)，紧邻世界树 (147,91)]",
      "ins-opus-s3": "[写入笔记 · tool_use #199 · 将镜像结论永久写入 NOTES.md 笔记]",
      "ins-argon-pill": "迅速证伪 · 7.7 分钟",
      "ins-argon-s1": "[跟从 NPC · assistant #280 · 最初计划按青禾指引沿 z=115 向西]",
      "ins-argon-s3": "[转向东侧 · assistant #289 · 确认 (+X, -Z) 方位后改向 +X 进城]",
      "ins-argon-s4": "[实证过门 · tool_result #306 · 实测抵达主城东门 (126,121)]",
      "ins-dsv4f-pill": "碰壁折返 · 24.5 分钟",
      "ins-dsv4f-s2": "[西侧受阻 · reasoning #280 · 在 x=83.5 再次被城墙挡住]",
      "ins-dsv4f-s3": "[转向东侧 · assistant #285 · 读取 (147,91) 信标并改向东北]",
      "ins-dsv4f-s4": "[实证过门 · tool_result #717 · 实测观测到主城东门 (126,121)]",
      "ins-dsv4f-s5": "[实证抵达 · tool_result #823 · 实测推进至 (144.5,102.5)，世界树 (147,91) 已在视野]",
      "ins-grok-pill": "碰壁折返 · 32.6 分钟",
      "ins-grok-s0": "[跟从 NPC · assistant #273 · 按“北上五六步、往西二十步”搜寻东门]",
      "ins-grok-s2": "[实证抵达 · tool_result #672 · 实测进入世界树信标范围（inZone: True，坐标 147,95）]",
      "ins-grok-s1": "[写入笔记 · assistant #1300 · 点名“往西二十步”是错的，门在东边 126,121]",
      "ins-glm-pill": "碰壁折返 · 36.3 分钟",
      "ins-glm-s1": "[发现冲突 · assistant #573 · 我走反了，世界树在东北]",
      "ins-glm-s3": "[实证过门 · tool_result #727 · 实测抵达东门 (126,121) 门前]",
      "ins-glm-s4": "[实证抵达 · tool_result #876 · 实测进入世界树信标范围（inZone: true，坐标 144,91）]",
      "ins-glm-s2": "[写入笔记 · assistant #893 · 指出青禾说的“向西”是笔误，总结正确路线]",
      "ins-muse-pill": "碰壁折返 · 39.7 分钟",
      "ins-muse-s1": "[西侧受阻 · assistant #282 · 发现往西断路，转北到 (88,98) 探路]",
      "ins-muse-s2": "[发现冲突 · assistant #288 · 在 x≈104 看到主城墙，确认“城在东边！”]",
      "ins-muse-s4": "[实证抵达 · tool_result #460 & #469 · 实测抵达世界树南侧 (143,94)]",
      "ins-astra-pill": "碰壁折返 · 39.8 分钟",
      "ins-astra-s1": "[发现冲突 · assistant #416 · 西侧受阻后读取 (147,91) 信标，不再只按口述向西]",
      "ins-astra-s3": "[实证过门 · tool_result #531 · 实测抵达东门 (126,121)]",
      "ins-astra-s4": "[实证抵达 · tool_result #585 · 实测抵达 (141,93)，观测到世界树 (147,91)]",
      "ins-gem38-pill": "碰壁折返 · 66.6 分钟",
      "ins-gem38-s1": "[跟从 NPC · assistant #588 · 编写 walk_west_to_gate.py 按青禾路线向西]",
      "ins-gem38-s2": "[误信西侧 · reasoning #1019 · 把西边缺口 (84,116) 误认成主城东门]",
      "ins-gem38-s4": "[实证抵达 · tool_result #1667 · 实测进入世界树信标范围（inZone=True，坐标 153,94）]",
      "ins-gem38-s3": "[发现冲突 · reasoning #5931 · 复盘脚本时发现“往西去东门”自相矛盾]",
      "ins-sonnet-pill": "碰壁折返 · 98.7 分钟",
      "ins-sonnet-s1": "[跟从 NPC · assistant #141 · 按青禾记录“城镇在西边”]",
      "ins-sonnet-s2": "[发现冲突 · reasoning #153 · 发现信标 (147,91) 在草甸东侧，重算城门位置]",
      "ins-sonnet-s4": "[实证入城 · tool_result #266 & #268 · 实测从 (126,123) 门洞北进并抵达城内广场 (139,100)]",
      "ins-dsv41f-pill": "碰壁折返 · 95.1 分钟",
      "ins-dsv41f-s1": "[跟从 NPC · reasoning #206 · 沿车辙路向西规划至 x≈80 找城门]",
      "ins-dsv41f-s3": "[发现冲突 · reasoning #520 · 在东侧 (126,121) 发现真实主城东门]",
      "ins-dsv41f-s4": "[实证过门 · tool_result #529 · 实测观测到主城东门 (126,121)]",
      "ins-dsv41f-s5": "[实证抵达 · tool_result #1187 · 实测抵达 (145,89)，距世界树 2.1 格]",
      "ins-kimi-pill": "受困延迟 143.3 分钟（文本权威偏置）",
      "ins-kimi-s1": "[发现冲突 · assistant #1374 · 已看到 (147,91) 信标并准备向东进发]",
      "ins-kimi-s2": "[推翻传感器 · assistant #1381 · 仅隔 7 步：重读青禾台词后推翻传感器，折返 (84,116)]",
      "ins-kimi-s4": "[实证抵达 · tool_result #1592 · 最终抵达 (144,91)，紧邻世界树 (147,91)]",
      "ins-kimi-s3": "[迟来确认 · assistant #2232 · 后续再次确认青禾的“西”与实际坐标相反]",
      "ins-kimik3-pill": "受困西侧 · 7 小时未解",
      "ins-kimik3-s1": "[跟从 NPC · reasoning #84 · 解析青禾“往西二十来步”为东门路线]",
      "ins-kimik3-s2": "[西侧受阻 · reasoning #305 · 在 x≈90.5 碰壁后仍复读青禾台词继续西探]",
      "ins-kimik3-s4": "[实证未达 · tool_result #2127 · 临近 7 小时终点仍停在草甸 (99,121)，始终未进东门或抵达世界树]",
      "ins-mimo-pill": "受困西侧 · 7 小时未解",
      "ins-mimo-s1": "[早期见过信标 · reasoning #44 · 开局就记下 [147,91] 信标，但未与方向关联]",
      "ins-mimo-s2": "[跟从 NPC · assistant #297 · 按青禾台词将“带墙主城”记在西边]",
      "ins-mimo-s4": "[实证未达 · tool_result #2898 · 最终观测仍位于局部坐标 [232,0,104]，7 小时未进入主城东门]",
      "footer-brand": "ASI 游戏世界",
      "leg-prod": "生产",
      "leg-cons": "建造",
      "leg-dung": "地牢战斗",
      "leg-maint": "生存补给",
      "leg-move": "移动"
    }
  };

  function textOf(lang, key, fallback) {
    if (lang === "zh" && dict.zh[key] != null) return dict.zh[key];
    return fallback;
  }

  function translatePhrase(value, lang) {
    if (!value || lang !== "zh") return value;
    var out = value;
    phrases.forEach(function (pair) {
      out = out.split(pair[0]).join(pair[1]);
    });
    return out;
  }

  function remember(el, name, value) {
    var attr = "data-i18n-orig-" + name;
    if (!el.hasAttribute(attr)) el.setAttribute(attr, value == null ? "" : value);
    return el.getAttribute(attr);
  }

  function apply(lang) {
    document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      var original = remember(el, "text", el.hasAttribute("data-i18n-html") ? el.innerHTML : el.textContent);
      var value = textOf(lang, key, original);
      if (el.hasAttribute("data-i18n-html")) el.innerHTML = value;
      else el.textContent = value;
    });
    ["alt", "aria-label", "title"].forEach(function (attr) {
      document.querySelectorAll("[data-i18n-" + attr + "]").forEach(function (el) {
        if (attr === "title" && el === document.documentElement) return;
        var key = el.getAttribute("data-i18n-" + attr);
        var original = remember(el, attr, el.getAttribute(attr) || "");
        el.setAttribute(attr, textOf(lang, key, original));
      });
    });
    document.querySelectorAll("[data-src-en][data-src-zh]").forEach(function (img) {
      var origW = remember(img, "width", img.getAttribute("width") || "");
      var origH = remember(img, "height", img.getAttribute("height") || "");
      var targetSrc = lang === "zh" ? img.getAttribute("data-src-zh") : img.getAttribute("data-src-en");
      if (img.getAttribute("src") !== targetSrc) {
        img.setAttribute("src", targetSrc);
      }
      if (lang === "zh") {
        img.removeAttribute("width");
        img.removeAttribute("height");
      } else {
        if (origW) img.setAttribute("width", origW);
        if (origH) img.setAttribute("height", origH);
      }
    });
    document.querySelectorAll("[data-href-en][data-href-zh]").forEach(function (link) {
      var targetHref = lang === "zh" ? link.getAttribute("data-href-zh") : link.getAttribute("data-href-en");
      if (link.getAttribute("href") !== targetHref) {
        link.setAttribute("href", targetHref);
      }
    });
    var titleKey = document.documentElement.getAttribute("data-i18n-title");
    if (titleKey) {
      var originalTitle = remember(document.documentElement, "title", document.title);
      document.title = textOf(lang, titleKey, originalTitle);
    }
    var meta = document.querySelector('meta[name="description"]');
    var metaKey = meta && meta.getAttribute("data-i18n-content");
    if (meta && metaKey) {
      var originalMeta = remember(meta, "content", meta.getAttribute("content") || "");
      meta.setAttribute("content", textOf(lang, metaKey, originalMeta));
    }
    document.querySelectorAll("[data-i18n-phrases] [title], [data-i18n-phrases] [aria-label]").forEach(function (el) {
      if (el.hasAttribute("title")) {
        var title = remember(el, "phrase-title", el.getAttribute("title"));
        el.setAttribute("title", translatePhrase(title, lang));
      }
      if (el.hasAttribute("aria-label")) {
        var label = remember(el, "phrase-aria", el.getAttribute("aria-label"));
        el.setAttribute("aria-label", translatePhrase(label, lang));
      }
    });
    document.querySelectorAll("[data-lang-set]").forEach(function (btn) {
      btn.setAttribute("aria-pressed", btn.getAttribute("data-lang-set") === lang ? "true" : "false");
    });
    try { localStorage.setItem(KEY, lang); } catch (e) {}
    document.dispatchEvent(new CustomEvent("asiworld:lang", { detail: lang }));
  }

  document.addEventListener("click", function (event) {
    var btn = event.target.closest("[data-lang-set]");
    if (!btn) return;
    event.preventDefault();
    apply(btn.getAttribute("data-lang-set"));
  });

  function closeNavDropdowns() {
    document.querySelectorAll(".nav-dropdown.is-open").forEach(function (dd) {
      dd.classList.remove("is-open");
      var trig = dd.querySelector(".nav-dropdown-trigger");
      if (trig) trig.setAttribute("aria-expanded", "false");
    });
  }

  document.addEventListener("click", function (event) {
    var trig = event.target.closest(".nav-dropdown-trigger");
    if (trig) {
      if (window.matchMedia("(max-width: 650px), (hover: none)").matches) {
        event.preventDefault();
        var dd = trig.closest(".nav-dropdown");
        var willOpen = !dd.classList.contains("is-open");
        closeNavDropdowns();
        if (willOpen) {
          dd.classList.add("is-open");
          trig.setAttribute("aria-expanded", "true");
        }
      }
      return;
    }
    var item = event.target.closest(".nav-dropdown-item");
    if (item) {
      closeNavDropdowns();
      if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
      return;
    }
    if (!event.target.closest(".nav-dropdown")) {
      closeNavDropdowns();
    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") closeNavDropdowns();
  });

  var saved = "en";
  try { saved = localStorage.getItem(KEY) === "zh" ? "zh" : "en"; } catch (e) {}
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { apply(saved); });
  } else {
    apply(saved);
  }
  window.asiworldSetLang = apply;
})();
