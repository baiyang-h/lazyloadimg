// 是否在可视区内
function isInSight(el) {
  const bound = el.getBoundingClientRect();
  const clientHeight = window.innerHeight;
  return bound.top <= clientHeight + 100;
}

// 在可视区内的 img 加载 图片
let index = 0;
function checkImgs() {
  const imgs = document.querySelectorAll('.my-photo');
  for (let i = index; i < imgs.length; i++) {
    if (isInSight(imgs[i])) {
      loadImg(imgs[i]);
      index = i;
    }
  }
}

// 加载图片
function loadImg(el) {
  // 如果没有 src 属性，则给 相应 img 标签 加上 src和值
  if (!el.src) {
    const source = el.dataset.src;
    el.src = source;
  }
}

// 进行一个节流
function throttle(fn, mustRun = 500) {
  const timer = null;
  let previous = null;
  return function() {
    const now = new Date();
    const context = this;
    const args = arguments;
    if (!previous) {
      previous = now;
    }
    const remaining = now - previous;
    if (mustRun && remaining >= mustRun) {
      fn.apply(context, args);
      previous = now;
    }
  }
}