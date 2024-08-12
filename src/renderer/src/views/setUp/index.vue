<template>
    <div class="background">
        <h4 style="margin-left: 50px;">系统设置</h4>
        <el-divider />
        <div style="width: 80%;margin: 0 auto;">
            <div style="display: flex; flex-direction: column;">
                <div style="display: flex;align-items: center;">
                    <span>开机自启动</span>
                    <el-switch v-model="_value" @change="switchChange" style="margin-left: auto;" />
                </div>

                <div style="display: flex;align-items: center;margin-top: 20px;">
                    <span>文件保存路径</span>
                    <el-input v-model="_path" style="margin-left: auto;width: 50%;" @input="reset" />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
const _value = ref(null);
const _path = ref("");

let _IsSwitchChange = false;
let _resourcesPath = "";

onMounted(() => {
    Api.System.GetBootStart().then((data) => {
        if (data.Value == "1") {
            _value.value = true;
        } else {
            _value.value = false;
        }
        IsSwitchChange = true;
    });

    Api.FilePath.resourcesPath.then((data) => {
        _path.value = data;
        _resourcesPath = data;
    });
});

function switchChange(bool, str) {
    if (_IsSwitchChange) {
        Api.System.BootStart(bool);
    }
}

function reset() {
    _path.value = _resourcesPath;
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