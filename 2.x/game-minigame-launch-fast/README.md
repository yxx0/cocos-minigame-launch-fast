# game-minigame-launch-fast

用于 Cocos Creator 2.x 构建后的“首屏渲染优化”插件，面向 `bytedance` 与 `wechatgame` 平台。

插件会在构建后阶段对引擎文件/资源进行拆分与重排，并在引擎子包加载前展示首屏画面，达到更快的启动体感。

## 功能概览

- 仅对 `bytedance`、`wechatgame` 启用首屏渲染优化。
- 构建后把引擎相关文件移动到 `subpackages/engine`（并更新 `game.json`）。
- 将插件 `lib/` 目录下的图片（`.jpg/.jpeg`）复制到构建输出根目录（例如 `/first.jpg`）。
- 将首屏相关脚本 `first-screen.js` 与启动脚本 `game.js` 复制到构建输出根目录。
- 通过 `config.json` 的 `open` 字段按平台控制是否启用。

## 运行机制

插件注册在构建后事件 `build-finished`（`onBuildFinish`），执行流程如下：

1. 读取 `config.json` 中当前平台配置；若不存在则自动生成默认配置。
2. 若当前平台不在支持列表（`bytedance`、`wechatgame`），则直接跳过。
3. 若 `open !== 1`，则跳过优化。
4. 若启用优化：
   1. 把构建产物根目录的 `assets/*.js` 脚本复制到 `subpackages/engine` 对应位置，并删除原位置脚本。
   2. 将 `cocos/`、`src/` 目录复制到 `subpackages/engine/`，并从根目录删除。
   3. 复制根目录除 `assets`、`subpackages`、`game.json`、`project.config.json` 以外的其它条目到 `subpackages/engine/`，并删除原位置。
   4. 把 `lib/*.jpg/.jpeg` 复制到构建输出根目录（文件名保持一致）。
   5. 复制 `lib/first-screen.js`、`lib/game.js` 到构建输出根目录。
   6. 检查 `game.json.subpackages` 中是否已存在 `engine` 子包；若不存在则追加 `{ name: "engine", root: "subpackages/engine" }`。

> 说明：`game.js` 会在非 `devtools` 环境下加载 `./first-screen.js`，并通过首屏逻辑使用根目录图片 `"/first.jpg"` 进行展示。

## 配置说明（config.json）

配置文件位于插件目录 `config.json`，结构示例：

```json
{
  "wechatgame": { "open": 0 },
  "bytedance": { "open": 1 }
}
```

- `open`: `1` 表示启用首屏渲染优化；`0` 表示关闭。

若 `config.json` 对应平台字段不存在，插件会自动创建默认配置（默认两端 `open=1`）。

## 使用建议

- 首屏画面当前默认展示根目录的 `first.jpg`，请确保 `lib/first.jpg` 与构建后产物根目录一致。
- 如果需要更换首屏展示图片，请在 `lib/first-screen.js` 中调整 `drawSlides` 使用的图片路径/列表。

## 版本记录

### 1.0.0 (2026-03-23)

- 首个版本发布。
- 支持构建后对引擎文件进行子包拆分与首屏展示，并支持按平台 `open` 开关控制启用。

