const Fs = require('fs');
const Path = require('path');
/**
 * 递归创建文件
 * @param {*} dirName 
 * @param {*} mode 
 */
function mkdirSync(dirName, mode) {
    if (Fs.existsSync(dirName)) {
        return true;
    }
    if (mkdirSync(Path.dirname(dirName), mode)) {
        Fs.mkdirSync(dirName, mode);
        return true;
    }
}
module.exports.mkdirSync = mkdirSync;

/**
 * 递归删除
 * @param {*} src 
 */
function rmSync(src) {
    if (Fs.existsSync(src)) {
        if (isFile(src)) {
            Fs.unlinkSync(src);
            return;
        }
        const files = Fs.readdirSync(src);
        files.forEach((file) => {
            const curPath = Path.join(src, file);
            if (isDirectory(curPath)) {
                rmSync(curPath);
            } else if (isFile(curPath)) {
                Fs.unlinkSync(curPath);
            }
        });
        Fs.rmdirSync(src);
    } else {
        console.error("删除文件失败，给定的路径不存在，请给出正确的路径", src);
    }
}
module.exports.rmSync = rmSync;

/**
 * 递归复制文件
 * @param {*} src 
 * @param {*} dst 
 */
function copySync(src, dst) {
    if (!Fs.existsSync(src)) {
        console.error('原路径不存在', src);
        return;
    }
    if (isFile(src)) {
        let dstDir = Path.parse(dst).dir;
        if (!Fs.existsSync(dstDir)) {
            mkdirSync(dstDir);
        }
        Fs.copyFileSync(src, dst);
    } else if (isDirectory(src)) {
        const files = Fs.readdirSync(src);
        files.forEach((file) => {
            const srcPath = Path.join(src, file);
            const dstPath = Path.join(dst, file);
            copySync(srcPath, dstPath);
        });
    }
}
module.exports.copySync = copySync;


/**
 * 获取文件夹下所有文件路径
 * @param {*} src 
 */
function readdirAllSync(src) {
    return _readdirSync(src, []);
}
module.exports.readdirAllSync = readdirAllSync;

module.exports.readdirSync = Fs.readdirSync;

function _readdirSync(src, paths) {
    paths = paths || [];
    const files = Fs.readdirSync(src);
    files.forEach((file) => {
        const filePath = Path.join(src, file);
        if (isFile(filePath)) {
            paths.push(filePath);
        } else if (isDirectory(filePath)) {
            _readdirSync(filePath, paths);
        }
    });
    return paths;
}


/**
 * 是否是文件
 * @param {*} path 
 */
function isFile(path) {
    const stat = Fs.statSync(path);
    return stat.isFile();
}

/**
 * 是否是文件夹
 * @param {*} path 
 */
function isDirectory(path) {
    const stat = Fs.statSync(path);
    return stat.isDirectory();
}

function size(path) {
    const stat = Fs.statSync(path);
    return stat.size;
}
module.exports.size = size;

function writeFileSync(p, data, option) {
    const dirName = Path.parse(p).dir;
    if (!Fs.existsSync(p)) {
        mkdirSync(dirName);
    }
    Fs.writeFileSync(p, data, option);
}
module.exports.writeFileSync = writeFileSync;

module.exports.readFileSync = Fs.readFileSync;

/**
 * 文件或文件夹是否存在
 * @param {*} dirName 
 */
module.exports.exists = Fs.existsSync;

/**
 * 拼接路径
 */
module.exports.join = Path.join;

/**
 * 读取后缀
 */
module.exports.extname = Path.extname;

module.exports.relative = Path.relative;

module.exports.parse = Path.parse;

module.exports.existsSync = Fs.existsSync;

module.exports.relative = Path.relative;
