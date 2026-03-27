## game-minigame-launch-fast（Cocos Creator 3.x 首屏渲染优化）

`game-minigame-launch-fast` 是一个用于 **Cocos Creator 3.x** 的首屏渲染优化扩展，面向字节小游戏与微信小游戏场景。它提供一个配置面板，用于在构建后自动注入首屏相关逻辑，并按平台开关控制是否启用优化。

### 支持平台

- `wechatgame`（微信小游戏）
- `bytedance-mini-game`（字节小游戏）

### 配置面板（扩展内）

面板标题：`配置面板`

面板可配置项（保存在扩展目录下的 `config.json`）：

- `wechatgame.open`：是否启用首屏渲染优化（0/1）
- `bytedance-mini-game.open`：是否启用首屏渲染优化（0/1）

点击按钮：

- `保存配置`：将当前平台的开关写入 `config.json`

### 配置文件说明

配置文件路径（扩展目录内）：

- `extensions/game-minigame-launch-fast/config.json`

示例结构：

```json
{
  "wechatgame": {
    "open": 0
  },
  "bytedance-mini-game": {
    "open": 1
  }
}
```

当构建触发时，如果 `config.json` 或对应平台节点不存在，扩展会自动创建默认配置（`open: 1`）。

### 构建后做了什么（核心逻辑概述）

扩展在构建完成后的 `onAfterBuild` 阶段，会根据目标平台与 `config.json` 的 `open` 开关执行“首屏渲染优化”流程，主要包括：

1. **注入首屏脚本**
   - 将扩展内的 `source/lib/first-screen-replace.js` 写入构建输出目录的 `first-screen.js`
2. **调整资源与脚本引用路径**
   - 修改 `settings.json` 中 `src/effect` 相关路径到 `subpackages/engine/src/effect`
   - 修改 `application.js` 中 `settingsPath` 到 `subpackages/engine/src/...`
   - 修改虚拟目录 `cocos-js/` 到 `subpackages/engine/cocos-js/`
3. **移动/合并引擎相关目录到 `subpackages/engine`**
   - 将构建输出根目录下的 `cocos-js` 与 `src` 等移动到 `subpackages/engine`
   - 同时复制部分脚本与资源脚本到引擎目录
4. **清理启动屏资源**
   - 删除输出根目录的 `logo.png` 与 `slogan.png`（用于替换首屏展示逻辑）
5. **补充子包声明**
   - 如果 `game.json` 里未包含 `engine` 子包，会追加：
     - `name: "engine"`
     - `root: "subpackages/engine"`
6. **复制项目目录下的 JPG/JPEG**
   - 将扩展目录 `source/lib` 同级的 `lib` 下（即构建时把“项目 lib 目录”当作输入）所有 `*.jpg` / `*.jpeg` 复制到构建输出根目录

> 注意：如果 `config.json` 对应平台的 `open` 为 `0`，则构建后流程会直接跳过优化注入。

### 安装与构建

本扩展依赖 Node.js 与 TypeScript，构建脚本通过 `tsc` 编译输出到 `dist`。

安装依赖：

```bash
npm install
```

构建：

```bash
npm run build
```

首次安装时会运行 `scripts/preinstall.js`：用于校验 `@cocos/creator-types` 的版本对应关系，并在必要时提示导出接口定义。

### 使用步骤（建议）

1. 在 Cocos Creator 中安装/启用该扩展（对应面板可见）
2. 在扩展面板中选择需要启用优化的平台，并点击 `保存配置`
3. 在 Cocos Creator 中对项目进行构建（面板开关决定是否注入首屏优化）

## 版本记录

- `v1.0.0`（2026-03-25）：首次生成并发布 README；提供微信小游戏/字节小游戏首屏渲染优化配置面板，构建后按平台开关完成首屏脚本注入与引擎目录调整。

