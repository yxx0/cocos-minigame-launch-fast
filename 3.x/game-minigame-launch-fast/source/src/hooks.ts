const PACKAGE_NAME = '[GAME-MINIGAME-LAUNCH-FAST]';

const mfs = require('../lib/mfs');
const Fs = require('fs');
const Path = require('path');

export const onAfterBuild = async function (options: any, result: any) {
    let platform = options.platform;

    // 字节小游戏 微信小游戏
    if (!['bytedance-mini-game', 'wechatgame'].some(d => d == platform)) {
        console.log(PACKAGE_NAME, '该渠道暂不使用首屏渲染优化...');
        return;
    }

    /** 读取配置信息 */
    let configPath = Path.join(__dirname, '../../config.json');
    let configData = Fs.existsSync(configPath) ? JSON.parse(Fs.readFileSync(configPath, 'utf8')) : null;
    if (!configData || !configData[platform]) {
        console.log(PACKAGE_NAME, '配置文件不存在，创建默认配置文件...');
        let defaultConfig = {
            open: 1, /** 是否开启首屏渲染优化 */
        }

        configData = {
            'wechatgame': defaultConfig,
            'bytedance-mini-game': defaultConfig,
        }

        Fs.writeFileSync(configPath, JSON.stringify(configData))
    }

    let config = configData[platform];
    config['platform'] = platform; // 保存平台信息

    console.log(PACKAGE_NAME, '首屏渲染优化配置信息:', config);

    if (config.open === 0) {
        console.log(PACKAGE_NAME, '首屏渲染优化未开启...');
        return;
    }

    console.log(PACKAGE_NAME, '首屏渲染优化开始...');

    const engineFirstScreenJSPath = mfs.join(result.dest, 'first-screen.js')
    mfs.writeFileSync(engineFirstScreenJSPath, mfs.readFileSync(mfs.join(__dirname, '../lib/first-screen-replace.js')));

    const settingsJSONPath = getFilePathByName(Path.join(result.dest, 'src'), 'settings.json') || '';
    replaceSettingJSONCode(settingsJSONPath);

    const engineApplicationJSPath = getFilePathByName(result.dest, 'application.js') || '';
    replaceApplicationJSCode(engineApplicationJSPath, settingsJSONPath.substring(Path.join(result.dest, 'src').length + 1));

    const virtualJSPath = getFuzzyFilePathByName(Path.join(result.dest, 'cocos-js'), '_virtual_cc-');
    replacevirtualJSCode(virtualJSPath);

    // 1. 移动引擎文件
    const enginePath = mfs.join(result.dest, 'subpackages', 'engine');
    // 复制assets的脚本文件
    const assets = mfs.readdirAllSync(mfs.join(result.dest, 'assets'));
    assets.forEach((item: string) => {
        if (mfs.extname(item) === '.js') {
            const relative = mfs.relative(result.dest, item);
            mfs.copySync(item, mfs.join(enginePath, relative));
            // 删除脚本文件
            mfs.rmSync(item);
        }
    });
    // 复制cocos-js文件夹
    mfs.copySync(mfs.join(result.dest, 'cocos-js'), mfs.join(enginePath, 'cocos-js'));
    mfs.rmSync(mfs.join(result.dest, 'cocos-js'));
    // 复制src文件夹
    mfs.copySync(mfs.join(result.dest, 'src'), mfs.join(enginePath, 'src'));
    mfs.rmSync(mfs.join(result.dest, 'src'));

    // 删除启动屏文件
    const rmFiles = ['logo.png', 'slogan.png'];
    rmFiles.forEach((item: string) => {
        mfs.existsSync(mfs.join(result.dest, item)) && mfs.rmSync(mfs.join(result.dest, item));
        
    });

    // 复制引擎文件
    const files = mfs.readdirSync(result.dest);
    const extFiles = ['assets', 'subpackages', 'game.json', 'project.config.json'];
    files.forEach((item: string) => {
        if (extFiles.indexOf(item) !== -1) {
            return;
        }
        mfs.copySync(mfs.join(result.dest, item), mfs.join(enginePath, item));
        mfs.rmSync(mfs.join(result.dest, item));
    });

    // 加入定制文件：复制项目 lib 目录下全部 JPG/JPEG 到输出根目录
    copyProjectJpegsToDest(__dirname, '../lib', result.dest);
    const firstFiles = ['first-screen.js', 'game.js'];
    firstFiles.forEach((item: string) => {
        mfs.copySync(mfs.join(__dirname, '../lib', item), mfs.join(result.dest, item));
    });

    const gameConfig = JSON.parse(mfs.readFileSync(mfs.join(result.dest, 'game.json')));
    if (!gameConfig.subpackages) {
        gameConfig.subpackages = [];
    }
    let addSub = true;
    gameConfig.subpackages.forEach((item: any) => {
        if (item.name === 'engine') {
            addSub = false;
        }
    });
    if (addSub) {
        gameConfig.subpackages.push({ name: 'engine', root: 'subpackages/engine' });
        mfs.writeFileSync(mfs.join(result.dest, 'game.json'), JSON.stringify(gameConfig));
    }

    console.log(PACKAGE_NAME, '首屏渲染优化结束...');
};

/**
 * 将项目目录下所有 JPG/JPEG 复制到构建输出根目录。
 * @param {string} projectRoot 项目根路径。
 * @param {string} relativeDir 项目内相对目录（如 lib、settings）。
 * @param {string} destRoot 构建输出根目录。
 */
function copyProjectJpegsToDest(projectRoot: string, relativeDir: string, destRoot: string) {
    const dir = mfs.join(projectRoot, relativeDir);
    if (!mfs.existsSync(dir)) {
        return;
    }
    mfs.readdirSync(dir).forEach((name: string) => {
        const ext = mfs.extname(name).toLowerCase();
        if (ext !== '.jpg' && ext !== '.jpeg') {
            return;
        }
        mfs.copySync(mfs.join(dir, name), mfs.join(destRoot, name));
    });
}

/**
 * 根据目录和文件名查找文件路径，兼容 name.ext 与 name.<hash>.ext
 * @param dirPath 目录路径
 * @param fileName 文件名，例如 application.js
 */
function getFilePathByName(dirPath: string, fileName: string): string | null {
    const files = Fs.readdirSync(dirPath);

    const exactFile = files.find((file: string) => file === fileName);
    if (exactFile) {
        return Path.join(dirPath, exactFile);
    }

    const parsed = Path.parse(fileName);
    if (!parsed.name || !parsed.ext) {
        return null;
    }

    const escapedName = parsed.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const escapedExt = parsed.ext.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const hashPattern = new RegExp(`^${escapedName}\\.[^.]+${escapedExt}$`);
    const hashedFile = files.find((file: string) => hashPattern.test(file));
    if (hashedFile) {
        return Path.join(dirPath, hashedFile);
    }

    return null;
}

/**
 * 根据文件名关键字在目录中模糊查找文件路径（仅当前目录，不递归）
 * @param dirPath 目录路径
 * @param keyword 文件名关键字，例如 _virtual_cc-
 */
function getFuzzyFilePathByName(dirPath: string, keyword: string): string | null {
    if (!Fs.existsSync(dirPath)) {
        return null;
    }

    const files = Fs.readdirSync(dirPath);
    const matchedFile = files.find((file: string) => file.includes(keyword));
    if (!matchedFile) {
        return null;
    }

    return Path.join(dirPath, matchedFile);
}


/**
 * 调整settings.json文件代码
 */
function replaceSettingJSONCode(JSONPath: string | null) {
    var script = Fs.readFileSync(JSONPath, 'utf8');

    // 替换文本
    const beReplaceCode = `src/effect`;
    const replaceCode = `subpackages/engine/src/effect`;

    script = script.replace(beReplaceCode, replaceCode);

    Fs.writeFileSync(JSONPath, script, 'utf8');
}

/**
 * 调整application.js文件代码
 */
function replaceApplicationJSCode(JSPath: string, settingsJSONName: string) {
    var script = Fs.readFileSync(JSPath, 'utf8');

    // 替换文本
    const beReplaceCode = `this.settingsPath = 'src/${settingsJSONName}';`;
    const replaceCode = `this.settingsPath = 'subpackages/engine/src/${settingsJSONName}';`;

    script = script.replace(beReplaceCode, replaceCode);

    Fs.writeFileSync(JSPath, script, 'utf8');
}

/**
 * 调整virtual.js文件代码
 */
function replacevirtualJSCode(JSONPath: string | null) {
    var script = Fs.readFileSync(JSONPath, 'utf8');

    // 替换文本
    const beReplaceCode = `"cocos-js/"`;
    const replaceCode = `"subpackages/engine/cocos-js/"`;

    script = script.replace(beReplaceCode, replaceCode);

    Fs.writeFileSync(JSONPath, script, 'utf8');
}


