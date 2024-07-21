<template>
    <div class="background">
        <el-card style="margin: 0 20px;" shadow="never" class="card">
            <template #header>系统</template>
            <div style="display: flex; flex-direction: column;">
                <div style="display: flex;align-items: center;">
                    <span>开机自启动</span>
                    <el-switch v-model="value" style="margin-left: auto;" />
                </div>
                <el-divider />
                <div style="display: flex;align-items: center;">
                    <span>文件保存路径</span>
                    <el-input style="margin-left: auto;width: 50%;"/>
                </div>
            </div>
        </el-card>
    </div>
</template>

<script setup>
import { ref, onUnmounted, onMounted, nextTick } from 'vue';
const value = ref(null);
</script>

<style scoped>
.background{
    height: 100%;
}
.card{
    background-color: rgb(250, 250, 250);
}
</style>