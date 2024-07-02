<template>
    <div id="content">
        <template v-for="item in dataArr">
            <el-card style="max-width: 280px">
                <el-text line-clamp="2" size="large" style="font-weight: bold;">{{ item.title }}</el-text><br>
                <el-text line-clamp="3" size="Small" style="color:rgb(130, 130, 130);width: 100%;">{{ item.Content }}</el-text>
                <img :src="item.cover" style="width: 70%;height: 70%;" />
                <!-- <div class="image-container" style="width: 300px; height: 70%; overflow: hidden;">
                    <div class="image"
                        :style="`width: 100%; height: 100%; background-image: url('${item.cover}'); background-size: cover;`">
                    </div>
                </div> -->
            </el-card>
        </template>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const dataArr = ref([]);

onMounted(() => {
    Api.DB.GetContent(1).then(datas => {
        datas.forEach(data => {
            dataArr.value.push({
                title: data.Title,
                cover: "data:image/png;base64," + data.Cover,
                Content: data.ContentText
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