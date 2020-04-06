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