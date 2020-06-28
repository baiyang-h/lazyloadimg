# 图片懒加载

## 懒加载


### 什么是懒加载


懒加载其实就是延迟加载，是一种对网页性能优化的方式，比如当访问一个页面的时候，优先显示可视区域的图片而不一次性加载所有图片，当需要显示的时候再发送图片请求，避免打开网页时加载过多资源。


### 什么时候用懒加载


放页面中需要一次性载入很多图片的时候，往往都需要用懒加载的。


### 懒加载原理


页面中的 `<img>` 我们先不给其设置 `src` ，把图片真正的URL放在另一个容器中，比如 `data-src` 属性中，在需要的时候也就是图片进入可视区域之前，将 URL 取出放到 `src` 中。


## 实现


### HTML
```html
<div>
  <div>
    <img alt="loading" data-src="./img/img1.png">
  </div>
  <div>
    <img alt="loading" data-src="./img/img2.png">
  </div>
  <div>
    <img alt="loading" data-src="./img/img3.png">
  </div>
  <div>
    <img alt="loading" data-src="./img/img4.png">
  </div>
  <div>
    <img alt="loading" data-src="./img/img5.png">
  </div>
</div>
```
仔细观察一下，在 `<img>` 标签此时是没有 `src` 属性的，只有 `alt` 和 `data-src` 属性。
> data-* 全局属性：是一个H5的属性，构成一类名称为自定义数据属性的属性，可以通过 HTMLElement.dataset 来访问值。



### 如何判断元素是否在可视区域


#### 方法一


网上看到好多这种方法，稍微记录一下


1. 通过 `document.documentElement.clientHeight` 获取屏幕可视窗口高度。
1. 通过 `element.offsetTop` 获取元素相对于文档顶部的距离
1. 通过 `document.documentElement.scrollTop` 获取浏览器窗口顶部与文档顶部之间的距离，即滚动条滚动距离。



然后 ②-③<① 是否成立，如果成立，元素就在可视区域内。

![image.png](https://cdn.nlark.com/yuque/0/2020/png/312064/1593337334778-c7959231-25fb-462f-9561-b300c93d0322.png#align=left&display=inline&height=584&margin=%5Bobject%20Object%5D&name=image.png&originHeight=1500&originWidth=1892&size=287698&status=done&style=none&width=736)
#### 方法二 getBoundingingClientRect


通过 `getBoundingClientRect()` 方法来获取元素的大小以及位置，这个方法返回一个名为 `ClientRect` 的 `DOMRect` 对象，包含了 `top` 、`right`、`bottom`、`left`、`width`、`height` 这些值。
![image.png](https://cdn.nlark.com/yuque/0/2020/png/312064/1593337685460-26d89c87-67e5-4770-9656-4daccd600f03.png#align=left&display=inline&height=573&margin=%5Bobject%20Object%5D&name=image.png&originHeight=500&originWidth=500&size=26950&status=done&style=none&width=573)
可以看出返回的元素位置是相对于左上角而言的，而不是边距。


我们思考一下，什么清情况下图片进入可视区域。
```javascript
// 表示图片到可视区域顶部位置
const bound = el.getBoundingClientRect(); 

// 可视区域高度
const clientHeight = window.innerHeight;
```
随着滚动条的向下滚动， `bound.top` 会越来越小，也就是图片到可视区域顶部的距离越来越小，当`bound.top===clientHeight`时，图片的上沿应该是位于可视区域下沿的位置的临界点，再滚动一点点，图片就会进入可视区域。

也就是说，在`bound.top<=clientHeight`时，图片是在可视区域内的。
```javascript
// 是否在可视区
function isInSight(el) {
  const bound = el.getBoundingClientRect();
  const clientHeight = window.innerHeight;
  return bound.top <= clientHeight + 100;
}
```
这里有个+100是为了提前加载。

### 加载图片


页面打开时需要对所有图片进行检查，是否在可视区域内，如果是就加载。
```javascript
function checkImgs() {
  const imgs = document.querySelectorAll('.my-photo');
  Array.from(imgs).forEach(el => {
    // 如果在可视区，则加载图片
    if (isInSight(el)) {
      loadImg(el);
    }
  })
}

// 加载图片，如果没有src则添加src属性和值
function loadImg(el) {
  if (!el.src) {
    const source = el.dataset.src;
    el.src = source;
  }
}
```
这里应该是有一个优化的地方，设一个标识符标识已经加载图片的 index， 当滚动条滚动时就不需要遍历所有的图片，只需要遍历未加载的图片就可以。


### 函数节流


在类似于滚动条滚动等频繁的DOM操作时，总会提到“函数节流”、“函数去抖”。


所谓的函数节流，也就是让一个函数不要执行的太频繁，减少一些过快的调用来节流。


基本步骤：

1. 获取第一次触发事件的时间戳
1. 获取第二次触发事件的时间戳
1. 时间差如果大于某个阈值就执行事件，然后重置第一个时间
```javascript
function throttle(fn, mustRun = 500) {
  const timer = null;
  let previous = null;  // 初始化或上一次的时间
  return function() {
    const now = new Date();		// 当前时间
    const context = this;
    const args = arguments;
    if (!previous){			
      previous = 0;		// 默认时间从 0 开始
    }
    const remaining = now - previous;   // 在这个时间间隔里，不在触发事件（加载），默认 500
    if (mustRun && remaining >= mustRun) {  // 大于设定的时间间隔会触发
      fn.apply(context, args);
      previous = now;
    }
  }
}
```
这里的`mustRun`就是调用函数的时间间隔，无论多么频繁的调用`fn`，只有`remaining>=mustRun`时`fn`才能被执行。

## 实验


### 页面打开时


![image.png](https://cdn.nlark.com/yuque/0/2020/png/312064/1593347543483-debb297a-19c5-46f5-9b41-e75e72a0f993.png#align=left&display=inline&height=481&margin=%5Bobject%20Object%5D&name=image.png&originHeight=961&originWidth=1915&size=405130&status=done&style=none&width=957.5)
可以看出此时仅仅是加载了img1和img2，其它的img都没发送请求，看看此时的浏览器

### 页面滚动时


![image.png](https://cdn.nlark.com/yuque/0/2020/png/312064/1593347625199-442aa6ee-cca2-454e-afc0-62c247f47607.png#align=left&display=inline&height=475&margin=%5Bobject%20Object%5D&name=image.png&originHeight=950&originWidth=1915&size=531698&status=done&style=none&width=957.5)
加载接下来的图片


### 全部载入时


当滚动条滚动到最底下时，全部请求都应该是发出的，如图：
![image.png](https://cdn.nlark.com/yuque/0/2020/png/312064/1593347712713-5a8104e5-c38c-43c6-85e2-7097533458e5.png#align=left&display=inline&height=426&margin=%5Bobject%20Object%5D&name=image.png&originHeight=851&originWidth=950&size=252567&status=done&style=none&width=475)


## 方法三 IntersectionObserver


使用 `IntersectionObserver` API，可以自动观察元素是否在视口内
```javascript
var io = new IntersectionObserver(callback, option);
// 开始观察
io.observe(document.getElementById('example'));
// 停止观察
io.unobserve(element);
// 关闭观察器
io.disconnect();
```
callback的参数是一个数组，每个数组都是一个`IntersectionObserverEntry`对象，包括以下属性：

| **属性** | **描述** |
| --- | --- |
| time | 可见性发生变化的时间，单位为毫秒 |
| rootBounds | 与getBoundingClientRect()方法的返回值一样 |
| boundingClientRect | 目标元素的矩形区域的信息 |
| intersectionRect | 目标元素与视口（或根元素）的交叉区域的信息 |
| intersectionRatio | 目标元素的可见比例，即intersectionRect占boundingClientRect的比例，完全可见时为1，完全不可见时小于等于0 |
| target | 被观察的目标元素，是一个 DOM 节点对象 |


我们需要用到`intersectionRatio`来判断是否在可视区域内，当`intersectionRatio > 0 && intersectionRatio <= 1`即在可视区域内。



```javascript
function checkImgs() {
  const imgs = Array.from(document.querySelectorAll(".my-photo"));
  imgs.forEach(item => io.observe(item));
}

function loadImg(el) {
  if (!el.src) {
    const source = el.dataset.src;
    el.src = source;
  }
}

const io = new IntersectionObserver(ioes => {
  ioes.forEach(ioe => {
    const el = ioe.target;
    const intersectionRatio = ioe.intersectionRatio;
    if (intersectionRatio > 0 && intersectionRatio <= 1) {
      loadImg(el);
    }
    el.onload = el.onerror = () => io.unobserve(el);
  });
});
```
```html
<script>
  window.onload=checkImgs;
  // window.onscroll = throttle(checkImgs);  去掉 不需要滚动事件了，IntersectionObserver 自己会监听
</script>
```
注意观察 这种方法只会加载可视区，如果用上面那种方法，如果一开始就在最底部，那么9张图片都会加载，而使用 `IntersectionObserver` 只加载了可视区，如 该可视区 只有2张
![image.png](https://cdn.nlark.com/yuque/0/2020/png/312064/1593348772520-115dc198-662e-4e95-a0c3-b08e1a99f2e6.png#align=left&display=inline&height=469&margin=%5Bobject%20Object%5D&name=image.png&originHeight=937&originWidth=1889&size=344131&status=done&style=none&width=944.5)



参考文章：
基本是全部复制黏贴了   [原生JS实现最简单的图片懒加载](https://juejin.im/post/59cb634a6fb9a00a4843bea9)

[代码 github 地址](https://github.com/touH/lazyloadimg)

[语雀地址](!https://www.yuque.com/honghuaqi/zx2d4b/gbvobn)