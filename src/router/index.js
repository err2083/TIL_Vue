import Vue from 'vue';
import VueRouter from 'vue-router';
import AboutView from '@/views/AboutView.vue';
import PostListView from '@/views/PostListView.vue';

Vue.use(VueRouter);

const router = new VueRouter({
    mode: 'history',
    routes: [
        {
            path: '/',
            component: AboutView,
        },
        {
            path: '/list',
            component: PostListView
        }
    ]
});

export default router;