var VSHADER_SOURCE =
    'attribute vec4 a_Position;\n' +
    'attribute vec2 a_TexCoord;\n' +
    'varying vec2 v_TexCoord;\n' +
    'void main() {\n' +
    '  gl_Position = a_Position;\n' +
    '  v_TexCoord = a_TexCoord;\n' +
    '}\n';

var FSHADER_SOURCE =
    '#ifdef GL_ES\n' +
    'precision mediump float;\n' +
    '#endif\n' +
    'uniform sampler2D u_Sampler;\n' +
    'varying vec2 v_TexCoord;\n' +
    'void main() {\n' +
    '  gl_FragColor = texture2D(u_Sampler, v_TexCoord);\n' +
    '}\n';
var color = 255;
// 图片切换状态对象
var slideShowState = {
    images: [],           // 图片路径数组
    currentIndex: 0,      // 当前显示图片索引
    interval: 500,       // 切换间隔(毫秒)
    isPlaying: false,     // 是否正在播放
    timer: null,          // 定时器
    textures: [],         // 纹理对象数组
    imagesLoaded: 0,      // 已加载图片数量
    totalImages: 0,       // 总图片数量
    colors: [],            // 每张图片对应的底色数组 [r, g, b] 格式，值范围 0-255
    shouldAutoPlay: true, // 是否允许自动播放（用于处理异步加载竞态）
    hasBeenStopped: false // 是否已经收到停止信号
};

function initShaders(gl, vshader, fshader) {
    var program = createProgram(gl, vshader, fshader);
    if (!program) {
        console.log('Failed to create program');
        return false;
    }

    gl.useProgram(program);
    gl.program = program;

    return true;
}

function createProgram(gl, vshader, fshader) {
    // Create shader object
    var vertexShader = loadShader(gl, gl.VERTEX_SHADER, vshader);
    var fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fshader);
    if (!vertexShader || !fragmentShader) {
        return null;
    }

    // Create a program object
    var program = gl.createProgram();
    if (!program) {
        return null;
    }

    // Attach the shader objects
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);

    // Link the program object
    gl.linkProgram(program);

    // Check the result of linking
    var linked = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (!linked) {
        var error = gl.getProgramInfoLog(program);
        console.log('Failed to link program: ' + error);
        gl.deleteProgram(program);
        gl.deleteShader(fragmentShader);
        gl.deleteShader(vertexShader);
        return null;
    }
    return program;
}

function loadShader(gl, type, source) {
    // Create shader object
    var shader = gl.createShader(type);
    if (shader == null) {
        console.log('unable to create shader');
        return null;
    }

    // Set the shader program
    gl.shaderSource(shader, source);

    // Compile the shader
    gl.compileShader(shader);

    // Check the result of compilation
    var compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!compiled) {
        var error = gl.getShaderInfoLog(shader);
        console.log('Failed to compile shader: ' + error);
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}

function initVertexBuffers(gl, vertices) {
    var verticesTexCoords = vertices || new Float32Array([
        // Vertex coordinates, texture coordinate
        -1, 1, 0.0, 1.0,
        -1, -1, 0.0, 0.0,
        1, 1, 1.0, 1.0,
        1, -1, 1.0, 0.0,
    ]);

    var n = 4; // The number of vertices

    // Create the buffer object
    var vertexTexCoordBuffer = gl.createBuffer();
    if (!vertexTexCoordBuffer) {
        console.log('Failed to create the buffer object');
        return -1;
    }

    // Bind the buffer object to target
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexTexCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, verticesTexCoords, gl.STATIC_DRAW);

    var FSIZE = verticesTexCoords.BYTES_PER_ELEMENT;
    //Get the storage location of a_Position, assign and enable buffer
    var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return -1;
    }
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, FSIZE * 4, 0);
    gl.enableVertexAttribArray(a_Position);  // Enable the assignment of the buffer object

    // Get the storage location of a_TexCoord
    var a_TexCoord = gl.getAttribLocation(gl.program, 'a_TexCoord');
    if (a_TexCoord < 0) {
        console.log('Failed to get the storage location of a_TexCoord');
        return -1;
    }
    // Assign the buffer object to a_TexCoord variable
    gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, FSIZE * 4, FSIZE * 2);
    gl.enableVertexAttribArray(a_TexCoord);  // Enable the assignment of the buffer object

    return n;
}

/**
 * 批量创建纹理并异步加载图片；仅统计「已成功发起加载」的请求，成功或失败都会计入完成数。
 * @param {WebGLRenderingContext} gl - WebGL 上下文
 * @param {string[]} imagePaths - 图片路径数组
 * @param {function(): void} [onAllTexturesLoaded] - 所有已发起加载均结束后的回调
 * @returns {boolean} 着色器中 u_Sampler 是否可用（与图片是否加载成功无关）
 */
function initTextures(gl, imagePaths, onAllTexturesLoaded) {
    slideShowState.textures = [];
    slideShowState.imagesLoaded = 0;

    // 获取采样器统一变量位置
    var u_Sampler = gl.getUniformLocation(gl.program, 'u_Sampler');
    if (!u_Sampler) {
        console.log('Failed to get the storage location of u_Sampler');
        return false;
    }

    /** @type {number} 实际发起加载的图片数量（与 imagePaths.length 可能不等） */
    var startedLoads = 0;

    // 为每张图片创建纹理；使用 let 保证每次循环的 texture/image 绑定独立，避免 var 异步闭包问题
    for (let i = 0; i < imagePaths.length; i++) {
        let texture = gl.createTexture();
        if (!texture) {
            console.log('Failed to create the texture object');
            continue;
        }

        let image = wx.createImage();
        if (!image) {
            console.log('Failed to create the image object');
            continue;
        }

        startedLoads++;

        /**
         * 单次加载结束（成功写入纹理或失败），统一递增计数并判断是否全部完成。
         */
        function tryFinish() {
            slideShowState.imagesLoaded++;
            if (slideShowState.imagesLoaded === startedLoads && onAllTexturesLoaded) {
                onAllTexturesLoaded();
            }
        }

        image.onload = function () {
            loadTexture(gl, texture, image);
            slideShowState.textures[i] = texture;
            tryFinish();
        };
        image.onerror = function () {
            console.log('Failed to load image:', imagePaths[i]);
            tryFinish();
        };

        image.src = imagePaths[i];
    }

    slideShowState.totalImages = startedLoads;

    // 没有任何一张进入加载流程时也要通知，避免永远等待
    if (startedLoads === 0 && onAllTexturesLoaded) {
        onAllTexturesLoaded();
    }

    return true;
}

function loadTexture(gl, texture, image) {
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Set the texture parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    // Set the texture image
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
}

function drawCurrentTexture(gl, n) {
    if (slideShowState.textures.length === 0) return;

    // 获取当前纹理
    var currentTexture = slideShowState.textures[slideShowState.currentIndex];
    if (!currentTexture) return;

    // 获取采样器统一变量位置
    var u_Sampler = gl.getUniformLocation(gl.program, 'u_Sampler');
    if (!u_Sampler) return;

    // 绑定当前纹理
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, currentTexture);
    gl.uniform1i(u_Sampler, 0);

    // 清除并绘制
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, n);
}

/**
 * 切换到下一张幻灯片
 * @param {WebGLRenderingContext} gl - WebGL 上下文
 * @param {number} n - 顶点数量
 */
function nextSlide(gl, n) {
    if (slideShowState.textures.length === 0) return;

    // 切换到下一张图片
    slideShowState.currentIndex = (slideShowState.currentIndex + 1) % slideShowState.textures.length;

    // 更新底色
    updateBackgroundColor(gl);

    // 绘制当前纹理
    drawCurrentTexture(gl, n);
}

/**
 * 切换到上一张幻灯片
 * @param {WebGLRenderingContext} gl - WebGL 上下文
 * @param {number} n - 顶点数量
 */
function prevSlide(gl, n) {
    if (slideShowState.textures.length === 0) return;

    // 切换到上一张图片
    slideShowState.currentIndex = (slideShowState.currentIndex - 1 + slideShowState.textures.length) % slideShowState.textures.length;

    // 更新底色
    updateBackgroundColor(gl);

    // 绘制当前纹理
    drawCurrentTexture(gl, n);
}

/**
 * 根据当前索引更新背景颜色
 * @param {WebGLRenderingContext} gl - WebGL 上下文
 */
function updateBackgroundColor(gl) {
    var currentIndex = slideShowState.currentIndex;

    // 如果定义了颜色数组且当前索引有效
    if (slideShowState.colors && slideShowState.colors.length > 0 &&
        currentIndex < slideShowState.colors.length) {
        var bgColor = slideShowState.colors[currentIndex];

        // 支持 [r, g, b] 格式
        if (Array.isArray(bgColor) && bgColor.length >= 3) {
            gl.clearColor(bgColor[0] / 255, bgColor[1] / 255, bgColor[2] / 255, 1.0);
        }
        // 支持单个数值（灰度值）
        else if (typeof bgColor === 'number') {
            gl.clearColor(bgColor / 255, bgColor / 255, bgColor / 255, 1.0);
        }
    }
    // 如果没有定义颜色，使用默认颜色
    else {
        gl.clearColor(color / 255, color / 255, color / 255, 1.0);
    }
}

function startSlideShow(gl, n) {
    if (slideShowState.isPlaying || slideShowState.hasBeenStopped || !slideShowState.shouldAutoPlay) return;

    slideShowState.isPlaying = true;
    console.log('开始轮播，间隔:', slideShowState.interval + 'ms');

    slideShowState.timer = setInterval(() => {
        nextSlide(gl, n);
    }, slideShowState.interval);
}

function stopSlideShow() {
    slideShowState.hasBeenStopped = true;
    slideShowState.shouldAutoPlay = false;
    slideShowState.isPlaying = false;
    if (slideShowState.timer) {
        clearInterval(slideShowState.timer);
        slideShowState.timer = null;
    }
    console.log('停止轮播');
}

function setSlideInterval(interval) {
    slideShowState.interval = interval;
    if (slideShowState.isPlaying) {
        stopSlideShow();
        startSlideShow(slideShowState.gl, slideShowState.n);
    }
}

function drawSlides(imgPaths, options = {}) {
    if (!imgPaths || imgPaths.length === 0) {
        console.log('请提供至少一张图片路径');
        return;
    }

    // 最多处理3张图片
    const imagesToLoad = imgPaths;
    slideShowState.images = imagesToLoad;
    slideShowState.currentIndex = 0;

    const {
        interval = 300,
        scale = 3,
        colors = null  // 底色数组，格式: [[r, g, b], ...] 或 [gray1, gray2, ...]
    } = options;

    // 初始化颜色数组
    if (colors && Array.isArray(colors) && colors.length > 0) {
        slideShowState.colors = colors.slice(0, imagesToLoad.length);
        // 如果颜色数量少于图片数量，用最后一个颜色填充
        while (slideShowState.colors.length < imagesToLoad.length) {
            slideShowState.colors.push(slideShowState.colors[slideShowState.colors.length - 1]);
        }
    } else {
        // 如果没有提供颜色，使用默认的渐变色或相同颜色
        // 默认使用不同的灰度值：200, 220, 240
        var defaultColors = [200, 220, 240];
        slideShowState.colors = defaultColors.slice(0, imagesToLoad.length);
        // 如果图片数量少于3张，用最后一个颜色填充
        while (slideShowState.colors.length < imagesToLoad.length) {
            slideShowState.colors.push(slideShowState.colors[slideShowState.colors.length - 1] || 255);
        }
    }

    slideShowState.interval = interval;

    const data = wx.getSystemInfoSync();
    let d_h = data.screenHeight;
    let d_w = data.screenWidth;

    let t_h = 200;
    let t_w = 200;

    let ratio1 = d_h / t_h;
    let ratio2 = d_w / t_w;
    let ratiomax = Math.min(ratio1, ratio2);

    let i_h = Math.round(t_h * ratiomax);
    let i_w = Math.round(t_w * ratiomax);

    let r_w = d_w / i_w;
    let r_h = d_h / i_h;

    r_w = r_w * scale;
    r_h = r_h * scale;

    let vertices = new Float32Array([
        -1 / r_w, 1 / r_h, 0.0, 1.0,
        -1 / r_w, -1 / r_h, 0.0, 0.0,
        1 / r_w, 1 / r_h, 1.0, 1.0,
        1 / r_w, -1 / r_h, 1.0, 0.0,
    ]);

    const config = globalThis.tt ? { alpha: true, stencil: true } : { stencil: true }
    const gl = wx.__first__canvas.getContext("webgl", config);
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    // Initialize shaders
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to intialize shaders.');
        return;
    }

    // Set the vertex information
    var n = initVertexBuffers(gl, vertices);
    if (n < 0) {
        console.log('Failed to set the vertex information');
        return;
    }

    // 初始化背景颜色（使用第一张图片对应的颜色）
    updateBackgroundColor(gl);

    // 初始化纹理
    initTextures(gl, imagesToLoad, function () {
        // 绘制第一张图片
        drawCurrentTexture(gl, n);

        // 存储gl和n引用
        slideShowState.gl = gl;
        slideShowState.n = n;

        // 如果设置了自动播放，开始轮播
        if (slideShowState.shouldAutoPlay && !slideShowState.hasBeenStopped) {
            startSlideShow(gl, n);
        }
    });
}

// 导出控制函数
exports.drawSlides = drawSlides;
exports.nextSlide = function () {
    if (slideShowState.gl && slideShowState.n) {
        nextSlide(slideShowState.gl, slideShowState.n);
    }
};
exports.prevSlide = function () {
    if (slideShowState.gl && slideShowState.n) {
        prevSlide(slideShowState.gl, slideShowState.n);
    }
};
exports.startSlideShow = function () {
    if (slideShowState.gl && slideShowState.n) {
        startSlideShow(slideShowState.gl, slideShowState.n);
    }
};
exports.stopSlideShow = stopSlideShow;
exports.setInterval = setSlideInterval;
exports.getCurrentIndex = function () {
    return slideShowState.currentIndex;
};
exports.getTotalImages = function () {
    return slideShowState.images.length;
};