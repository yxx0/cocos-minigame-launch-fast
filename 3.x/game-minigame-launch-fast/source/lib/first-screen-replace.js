function end() {
    return setProgress(1)
}

function setProgress(val) {
    return new Promise((resolve, reject) => {
       resolve();
    });
}

function start(alpha, antialias, useWebgl2) {
  return setProgress(0);
}
module.exports = { start, end, setProgress };
