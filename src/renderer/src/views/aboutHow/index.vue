<template>
    <div id="content">
        <img id="icon" src="../../assets/image/icon.png" alt="" srcset="">
        <h2 style="margin-top: 20px;">阅览</h2>
        <p style="margin-top: 10px;">版本：v{{ _Version }}</p>
        <div id="ButtonGroup">
            <el-button @click="GetCheckUpdates">{{ _UpdateStr }}</el-button>
            <el-button @click="OpenBrowser">意见反馈</el-button>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const _Version = ref("");
const _UpdateStr = ref("检查更新");

onMounted(() => {
    Api.AboutHow.GetVersion().then((data) => {
        console.log(data);
        if (data.code == 0) {
            _Version.value = data.data;
        }
    });
});


function OpenBrowser() {
    window.open("https://support.qq.com/products/666779");
}

function GetCheckUpdates() {
    _UpdateStr.value = "检查中...";
    Api.AboutHow.GetCheckUpdates().then(data => {
        if (data.code == 0) {
            if (data.data == true) {
                _UpdateStr.value = "有新版本";
            } else {
                _UpdateStr.value = "已经是最近版本";
            }
        } else {
            _UpdateStr.value = "检查更新";
        }
    });
}
</script>

<style scoped>
#content {
    width: 50%;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    margin-top: 10%;
}

#icon {
    width: 150px;
    height: 150px;
}

#ButtonGroup {
    margin-top: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
}

#ButtonGroup .el-button {
    width: 200px;
    margin-top: 10px;
    margin-left: 0;
}
</style>