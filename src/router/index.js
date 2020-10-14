import Vue from 'vue';
import VueRouter from 'vue-router';
import AboutView from '@/views/AboutView.vue';

Vue.use(VueRouter);

const router = new VueRouter({
    mode: 'history',
    routes: [
        {
            path: '/',
            component: AboutView,
        }
    ]
});

export default router;