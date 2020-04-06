import { throttle } from 'lodash';
import ReactiveListener from './reactiveListener';

export default function (Vue) {
    return class Lazy {
        constructor(options) {
            this.options = options;
            this.listenerQueue = [];
            this.bindHandler = false;
        }
        lazyLoadHandler = throttle(() => {
            let catIn = false;
            this.listenerQueue.forEach(listener => {
                if (listener.state.loaded) return;
                catIn = listener.checkInView();
                catIn && listener.load();
            })
        })
        add(el, binding) {

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
