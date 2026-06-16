import { createApp } from 'vue';
import { router } from './router';
import '../style/general.scss';
import 'bootstrap/js/dist/collapse';
import 'bootstrap-icons/font/bootstrap-icons.css';
import App from '../App.vue';
import i18n from './i18n';
import scrollReveal from './scrollReveal';

createApp(App).use(i18n).use(router).directive('scroll-reveal', scrollReveal).mount('#app');
