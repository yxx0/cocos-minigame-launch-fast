"use strict";

const pf = globalThis.tt || globalThis.ks || globalThis.wx;

// 渲染首屏（开发者工具执行有渲染问题，所以开发者工具上不渲染）

const createCanvas = pf.createCanvas;

pf.__first__canvas = createCanvas();

let first = true;
pf.createCanvas = function () {
    if (first) {
        first = false;
        return wx.__first__canvas;
    } else {
        return createCanvas();
    }
}

const data = pf.getSystemInfoSync();
let first_scene = null;
if (data.platform != "devtools") {
    first_scene = require("./first-screen.js");

    // 本地包内图片请用「代码包根目录」为起点的绝对路径；「./」在部分运行时下解析不稳定
    first_scene.drawSlides([
        '/first.jpg',
    ], {
        colors: [[0, 0, 0]]
    });

}

if (pf.loadSubpackage) {
    let hasStoppedFirstScene = false;
    // 仅执行一次关闭，避免 success/fail 重复触发造成多次调用
    const stopFirstSceneIfNeeded = () => {
        if (hasStoppedFirstScene) {
            return;
        }
        hasStoppedFirstScene = true;
        if (data.platform != "devtools" && first_scene && first_scene.stopSlideShow) {
            first_scene.stopSlideShow();
        }
    };

    pf.loadSubpackage({
        name: 'engine',
        success: () => {
            stopFirstSceneIfNeeded();
        }
    })
} else {
    if (data.platform != "devtools" && first_scene && first_scene.stopSlideShow) first_scene.stopSlideShow();
    require('./subpackages/engine/game');
}