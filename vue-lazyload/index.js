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