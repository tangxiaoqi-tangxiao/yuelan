<template>
    <div id="content">
        <template v-for="item in datas">
            <el-card style="max-width: 280px">
                <el-text line-clamp="2" size="large" style="font-weight: bold;">{{ item.title }}</el-text>
                <el-text line-clamp="3" size="Small" style="color:rgb(130, 130, 130) ;">{{ item.Content }}</el-text>
                <img :src="item.cover" style="width: 70%;height: 70%;" />
            </el-card>
        </template>
    </div>
</template>

<script setup>
import { ref } from 'vue'

const datas = ref([]);
for (let index = 0; index < 10; index++) {
    datas.value.push({
        title: "10W+TPS高并发场景【我的浏览记录】系统设计 - 掘金10W+TPS高并发场景【我的浏览记录】系统设计 - 掘金",
        cover: "https://shadow.elemecdn.com/app/element/hamburger.9cf7b091-55e9-11e9-a976-7f4d0b07eef6.png",
        Content: "首页BOT沸点课程直播活动竞赛商城APP插件创作者中心会员Vue3.0新特性以及使用经验总结SandySY2021-03-17137,301阅读15分钟前言Vue3.0在去年9月正式发布了，看大家都有在热情的拥抱Vue3.0。今年初新项目也开始使用Vue3.0来开发，这篇文章就是在使用后的一个总结，包含Vue3新特性的使用以及一些使用经验分享。为什么要升级Vue3使用Vue2.x的小伙伴都熟悉，Vue2.x中所有数据都是定义在data中，方法定"
    });
}
</script>

<style scoped>
#content {
    margin: 0 20px;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
}
</style>