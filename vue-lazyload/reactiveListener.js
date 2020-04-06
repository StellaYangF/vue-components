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
