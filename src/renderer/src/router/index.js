import {createRouter,createWebHashHistory} from 'vue-router'

const routes = [
    {
        path:'/',
        name:'Home',
        component:()=>import('@/views/home/Home.vue'),
        // children:[
        //     {
        //         path:'recommend',
        //         name:'recommend',
        //         component:()=>import('@/views/recommend/recommend')
        //     },
        //     {
        //         path:'book_collection',
        //         name:'book_collection',
        //         component:()=>import('@/views/book_collection/book_collection')
        //     }
        // ]
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
})

//路由守卫
router.beforeEach((to, from, next) => {
    next();
})

export default router;