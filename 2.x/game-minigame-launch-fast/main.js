'use strict';
const PACKAGE_NAME = '[GAME-MINIGAME-LAUNCH-FAST]';

const mfs = require('./lib/mfs');
const Fs = require('fs');
const Path = require('path');

/**
 * 将项目目录下所有 JPG/JPEG 复制到构建输出根目录。
 * @param {string} projectRoot 项目根路径。
 * @param {string} relativeDir 项目内相对目录（如 lib、settings）。
 * @param {string} destRoot 构建输出根目录。
 */
function copyProjectJpegsToDest(projectRoot, relativeDir, destRoot) {
    const dir = mfs.join(projectRoot, relativeDir);
    if (!mfs.existsSync(dir)) {
        return;
    }
    mfs.readdirSync(dir).forEach((name) => {
        const ext = mfs.extname(name).toLowerCase();
        if (ext !== '.jpg' && ext !== '.jpeg') {
            return;
        }
        mfs.copySync(mfs.join(dir, name), mfs.join(destRoot, name));
    });
}

function onBuildFinish(options, callback) {

    // 字节小游戏 微信小游戏
    let platform = options.actualPlatform;

    if (!['bytedance', 'wechatgame'].some(d => d == platform)) {
        Editor.log(PACKAGE_NAME, '该渠道暂不使用首屏渲染优化...');
        callback && callback();
        return;
    }

    /** 读取配置信息 */
    let configPath = Path.join(__dirname, './config.json');
    let configData = Fs.existsSync(configPath) ? JSON.parse(Fs.readFileSync(configPath, 'utf8')) : null;
    if (!configData || !configData[platform]) {
        Editor.log(PACKAGE_NAME, '配置文件不存在，创建默认配置文件...');
        let defaultConfig = {
            open: 1, /** 是否开启首屏渲染优化 */
        }

        configData = {
            'wechatgame': defaultConfig,
            'bytedance': defaultConfig
        }

        Fs.writeFileSync(configPath, JSON.stringify(configData))
    }
    let config = configData[platform];
    config['platform'] = platform; // 保存平台信息

    Editor.log(PACKAGE_NAME, '首屏渲染优化配置信息:', config);

    if (config.open === 0) {
        Editor.log(PACKAGE_NAME, '首屏渲染优化未开启...');
        callback && callback();
        return;
    }

    Editor.log(PACKAGE_NAME, '首屏渲染优化开始...');


    // 首屏优化
    // 1. 移动引擎文件
    const enginePath = mfs.join(options.dest, 'subpackages', 'engine');
    // 复制assets的脚本文件
    const assets = mfs.readdirAllSync(mfs.join(options.dest, 'assets'));
    assets.forEach((item) => {
        if (mfs.extname(item) === '.js') {
            const relative = mfs.relative(options.dest, item);
            mfs.copySync(item, mfs.join(enginePath, relative));
            // 删除脚本文件
            mfs.rmSync(item);
        }
    });
    // 复制cocos文件夹
    mfs.copySync(mfs.join(options.dest, 'cocos'), mfs.join(enginePath, 'cocos'));
    mfs.rmSync(mfs.join(options.dest, 'cocos'));
    // 复制src文件夹
    mfs.copySync(mfs.join(options.dest, 'src'), mfs.join(enginePath, 'src'));
    mfs.rmSync(mfs.join(options.dest, 'src'));
    // 复制引擎文件
    const files = mfs.readdirSync(options.dest);
    const extFiles = ['assets', 'subpackages', 'game.json', 'project.config.json'];
    files.forEach((item) => {
        if (extFiles.indexOf(item) !== -1) {
            return;
        }
        mfs.copySync(mfs.join(options.dest, item), mfs.join(enginePath, item));
        mfs.rmSync(mfs.join(options.dest, item));
    });
    // 加入定制文件：复制项目 lib 目录下全部 JPG/JPEG 到输出根目录
    copyProjectJpegsToDest(__dirname, 'lib', options.dest);
    const firstFiles = ['first-screen.js', 'game.js'];
    firstFiles.forEach((item) => {
        mfs.copySync(mfs.join(__dirname, 'lib', item), mfs.join(options.dest, item));
    });

    const gameConfig = JSON.parse(mfs.readFileSync(mfs.join(options.dest, 'game.json')));
    if (!gameConfig.subpackages) {
        gameConfig.subpackages = [];
    }
    let addSub = true;
    gameConfig.subpackages.forEach(item => {
        if (item.name === 'engine') {
            addSub = false;
        }
    });
    if (addSub) {
        gameConfig.subpackages.push({ name: 'engine', root: 'subpackages/engine' });
        mfs.writeFileSync(mfs.join(options.dest, 'game.json'), JSON.stringify(gameConfig));
    }

    Editor.log(PACKAGE_NAME, '首屏渲染优化结束...');

    callback();
}

module.exports = {
    load() {
        Editor.Builder.on('build-finished', onBuildFinish);
    },

    unload() {
        Editor.Builder.removeListener('build-finished', onBuildFinish);

        // execute when package unloaded
    },

    // register your ipc messages here
    messages: {
        'open'() {
            // open entry panel registered in package.json
            Editor.Panel.open('game-minigame-launch-fast');
        }
    },
};
