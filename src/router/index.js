import Vue from 'vue';
import VueRouter from 'vue-router';
import AboutView from '@/views/AboutView.vue';
import PostListView from '@/views/PostListView.vue';
import PostDetailView from '@/views/PostDetailView.vue'

Vue.use(VueRouter);

const router = new VueRouter({
    mode: 'history',
    routes: [
        {
            path: '/',
            component: AboutView
        },
        {
            path: '/posts',
            component: PostListView
        },
        {
            path: '/post/:path',
            component: PostDetailView
        }
    ]
});

export default router;