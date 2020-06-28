function checkImgs() {
  const imgs = Array.from(document.querySelectorAll(".my-photo"));
                // 开始观察 每个img
  imgs.forEach(item => io.observe(item));
}

function loadImg(el) {
  if (!el.src) {
    const source = el.dataset.src;
    el.src = source;
  }
}
const io = new IntersectionObserver(ioes => {
  console.log(ioes)   //9张图片信息
  ioes.forEach(ioe => {
    const el = ioe.target;
    const intersectionRatio = ioe.intersectionRatio;
    if (intersectionRatio > 0 && intersectionRatio <= 1) {
      loadImg(el);
    }
    el.onload = el.onerror = () => io.unobserve(el);
  });
});