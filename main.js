import Vue from 'vue';
import VueLazyLaod from 'vue-lazyload';
import loading from './loading.jpg';
import App from './App.vue';

Vue.use(VueLazyLaod), {
    preload: 1.3, 
    loading,
};

new Vue({
    el: "#app",
    render: h => h(App),
})