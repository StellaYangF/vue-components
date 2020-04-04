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