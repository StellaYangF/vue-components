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
        height: 300px;
        overflow: scroll;
    }
    img {
        width: 100px;
        height: 100px;
    }
</style>