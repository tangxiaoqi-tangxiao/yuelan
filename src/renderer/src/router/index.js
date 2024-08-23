import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
    {
        path: '/',
        name: 'home',
        component: () => import('@/views/home/index.vue'),
        children: [
            {
                path: 'content',
                name: 'content',
                component: () => import('@/views/content/index.vue')
            },
            {
                path: 'setUp',
                name: 'setUp',
                component: () => import('@/views/setUp/index.vue')
            },
            {
                path: 'aboutHow',
                name: 'aboutHow',
                component: () => import('@/views/aboutHow/index.vue')
            },
        ]
    },
    // {
    //     path:'/404',
    //     name:'404',
    //     component:()=>import('@/views/404/index')
    // }
]

// 创建路由对象
const router = createRouter({
    history: createWebHashHistory(),
    routes
});

//路由守卫
router.beforeEach((to, from, next) => {
    next();
});

export default router;