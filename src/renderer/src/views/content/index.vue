<template>
    <div id="content">
        <template v-for="item in dataArr">
            <el-card style="max-width: 280px">
                <el-text line-clamp="2" size="large" style="font-weight: bold;">{{ item.title }}</el-text><br>
                <el-text line-clamp="3" size="Small" style="color:rgb(130, 130, 130);width: 100%;">{{ item.Content
                    }}</el-text>
                <img :src="item.cover" style="width: 70%;height: 70%;" /><br>
                <el-text size="small">{{ item.date }}</el-text>
            </el-card>
        </template>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const dataArr = ref([]);
let filePath = "file:///" + Api.File.ResourcesPath;
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
})
</script>

<style scoped>
#content {
    margin: 0 20px;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
}
</style>