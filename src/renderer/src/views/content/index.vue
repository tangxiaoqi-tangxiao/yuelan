<template>
    <div id="container">
        <div id="content">
            <template v-for="item in dataArr">
                <el-card style="max-width: 280px" class="card">
                    <el-text line-clamp="2" size="large" style="font-weight: bold;">{{ item.title }}</el-text><br>
                    <el-text line-clamp="3" size="Small" style="color:rgb(130, 130, 130);width: 100%;">{{ item.Content
                        }}</el-text>
                    <img :src="item.cover" style="width: 70%;height: 70%;" /><br>
                    <el-text size="small">{{ item.date }}</el-text>
                </el-card>
            </template>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const dataArr = ref([]);
const filePath = "file:///" + Api.File.ResourcesPath;
const imagePath = filePath + "/imgs/";
const WebPagePath = filePath + "/WebPage/";


onMounted(() => {
    let index = 1;
    Api.DB.GetContent(index).then(datas => {
        datas.forEach(data => {
            dataArr.value.push({
                title: data.Title,
                cover: `${imagePath}${data.UUID}.png`,
                Content: data.ContentText,
                date: data.CreateDate
            });
        });
    });

    // 组件挂载后添加监听器  
    window.addEventListener('resize', handleResize);
});

// 组件卸载前移除监听器  
onUnmounted(() => {
    window.removeEventListener('resize', handleResize);
});

function handleResize() {
    let cardLength = document.querySelectorAll('.card').length;
    let container = document.getElementById("container").clientWidth;
    let cardWidth = (cardLength * 300);
    if (container - 40 > cardWidth) {
        let content = document.getElementById("content");
        content.style.width = `${cardWidth}px`;
    } else {
        content.style.width = "";
    }
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