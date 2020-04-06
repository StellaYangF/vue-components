## vue-lazyload
- 实现图片的懒加载
- 鼠标滚动到视图的相对高度 ( preload: 比例 )，请求显示图片
- 鼠标滚动，节流方式请求数据

## 使用
- 注册 `vue-lazyload`
- 内部就是全局注册了 `v-lazy` 指令
- 选项参数
    - `preload`: 显示当前视口高度 (window.innerHeight | 100vh) 的比例
    - `loading`: 图片正在加载时显示的 loading 图片
    - `error`: 图片加载异常时显示的 error 图片

main.js
```js
import Vue from 'vue';
import VueLazylaod from './vue-lazyload';
import loading from './loading.jpg';

import App from './App.vue';

Vue.use(VueLazylaod, {
    preload: .8, 
    loading,
    // error,
});

new Vue({
    el: "#app",
    render: h => h(App),
})
```
> 注意：
第二个选项参数是传给 VueLazyload.install 的第二个参数。

App.vue
```js
<template>
    <div class="box">
        <li v-for='img in imgs' :key='img'>
            <img v-lazy='img'>
        </li>
    </div>
</template>
<script>
import axios from './api/axios';
export default {
    data(){
        return {
            name: "Stella",
            imgs: [],
        }
    },
    async created() {
         this.imgs = await axios.get('/api/img');
    },
}
</script>
<style>
    .box {
        height: 80vh;
        overflow: scroll;
    }
    li {
        list-style: none;
    }
    img {
        width: 100px;
        height: 100px;
        border-radius: 4px;
    }
</style>
```

api/axios.js
```js
import axios from 'axios';
import { baseURL } from '../typing';

axios.interceptors.request.use((config) => {
    return { 
        baseURL,
        ...config
     };
})

axios.interceptors.response.use(response => {
    return response.data.data;
})

export default axios;
```

## 实现
```bash
mkdir vue-lazyload
cd vue-lazyload
touch index.js
touch lazy.js
```

### index.js
- 导出一个对象，包含 `install` 方法，Vue.use 会自动调用，并传入参数。
- `Vue.directive` 全局自定义指令 API
- `bind` 钩子函数，参数有 `el`, `binding`, `vnode`
```js
import lazy from './lazy';

export default {
    install(Vue, options) {
        const LazyClass = lazy(Vue);
        const lazyInstance = new LazyClass(options);
        Vue.directive('lazy', {
            bind: lazyInstance.add.bind(lazyInstance),
        })
    }
}
```

### lazy.js
- 鼠标滚动会动态发送请求 img src
- 将触发逻辑放在 lodash.throttle 节流函数中，间隔时间内触发。
- 节约浏览器开销

```js
import { throttle } from 'lodash';
import ReactiveListener from './reactiveListener';

export default function (Vue) {
    return class Lazy {
        constructor(options) {
            this.options = options;
            this.listenerQueue = []; 
            this.bindHandler = false; // 避免给父组件多次绑定 srcoll 事件
        }

        lazyLoadHandler = throttle(() => {
            let catIn = false;
            this.listenerQueue.forEach(listener => {
                // 滚动后，已加载的图片不必再次发送请求
                if (listener.state.loaded) return;
                catIn = listener.checkInView();
                catIn && listener.load();
            })
        })

        add(el, binding) {
            // 当前事件环结束，获取真实 DOM
            Vue.nextTick(() => {
                function scrollParent() {
                    let parent = el.parentNode;
                    while (parent) {
                        if (/scroll/.test(getComputedStyle(parent)['overflow'])) {
                            return parent;
                        }
                        parent = parent.parentNode;
                    }
                    return parent;
                }
                let parent = scrollParent();
                let src = binding.value;
                let listener = new ReactiveListener({
                    el,
                    src,
                    elRenderer: this.elRenderer.bind(this),
                    options: this.options,
                });
                // 订阅 el 的动态监听函数
                this.listenerQueue.push(listener);
                if (!this.bindHandler) {
                    this.bindHandler = true;
                    parent.addEventListener('scroll', this.lazyLoadHandler);
                }
                this.lazyLoadHandler();
            })
        }

        elRenderer(listener, state) {
            let { el } = listener;
            let src = '';
            switch (state) {
                case 'loading':
                    src = listener.options.loading || "";
                    break;
                case 'error':
                    console.log('error');
                    src = listener.options.error || "";
                    break;
                default:
                    src = listener.src;
                    break;
            }
            el.setAttribute('src', src);
        }


    }
}

```

### reactiveListener.js
```js
import loadImageAsync from './loadImageAsync';

export default class ReactiveListener {
    constructor({ el, src, elRenderer, options }) {
        this.el = el;
        this.src= src;
        this.elRenderer = elRenderer;
        this.options = options;
        this.state = { loaded: false };
    }

    checkInView() {
        let { top } = this.el.getBoundingClientRect();
        return top < window.innerHeight * this.options.preload
    }
    
    load() {
        this.elRenderer(this, 'loading');
        loadImageAsync(this.src, () => {
            this.state.loaded = true;
            this.elRenderer(this, 'loaded');
        }, () => {
            this.elRenderer(this, 'error');
        })
    }
}

```

### loadImageAsync.js
- 绑定的
```js
export default function loadImageAsync(src, resolve, reject) {
    let image = new Image();
    image.src = src;
    image.onload = resolve;
    image.onerror = reject;
}
```