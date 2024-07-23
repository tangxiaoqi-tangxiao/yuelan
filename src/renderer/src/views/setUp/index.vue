<template>
    <div class="background">
        <h4 style="margin-left: 50px;">系统设置</h4>
        <el-divider />
        <div style="width: 80%;margin: 0 auto;margin-top: 50px;">
            <div style="display: flex; flex-direction: column;">
                <div style="display: flex;align-items: center;">
                    <span>开机自启动</span>
                    <el-switch v-model="value" @change="switchChange" style="margin-left: auto;" />
                </div>

                <div style="display: flex;align-items: center;margin-top: 20px;">
                    <span>文件保存路径</span>
                    <el-input v-model="path" style="margin-left: auto;width: 50%;" />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
const value = ref(null);
const path = ref("");

let IsSwitchChange = false;

onMounted(() => {
    Api.System.GetBootStart().then((data) => {
        if (data.Value == "1") {
            value.value = true;
        } else {
            value.value = false;
        }
        IsSwitchChange = true;
    });
});

function switchChange(bool, str) {
    if (IsSwitchChange) {
        Api.System.BootStart(bool);
    }
}
</script>

<style scoped>
.background {
    height: 100%;
}

.card {
    background-color: rgb(250, 250, 250);
}
</style>