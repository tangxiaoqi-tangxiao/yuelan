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

                <!-- <div style="display: flex;align-items: center;margin-top: 20px;">
                    <span>开启CPU加速<span style="color: #8f95a2;font-size: 14px;">(重启软件生效)</span></span>
                    <el-switch v-model="_valueGPU" @change="switchChange_GPU" style="margin-left: auto;" />
                </div> -->

                <div style="display: flex;align-items: center;margin-top: 20px;">
                    <span>连接浏览器插件<span style="color: #8f95a2;font-size: 14px;">(用于和浏览器插件通信)</span></span>
                    <div style="margin-left: auto;">
                        <el-select v-model="_browser" placeholder="Select" size="small" style="width: 100px;margin-right: 20px;">
                            <el-option label="默认浏览器" value="0" />
                            <el-option label="edge" value="1" />
                            <el-option label="chrome" value="2" />
                        </el-select>
                        <el-button @click="OpenWebServerPort">连接</el-button>
                    </div>
                </div>

                <div style="display: flex;align-items: center;margin-top: 20px;">
                    <span>文件保存路径</span>
                    <el-input v-model="_path" style="margin-left: auto;width: 50%;" @input="reset" />
                </div>

                <div style="display: flex;align-items: center;margin-top: 20px;">
                    <span>日志保存路径</span>
                    <el-input v-model="_path" style="margin-left: auto;width: 50%;" @input="reset" />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';

const _value = ref(null);
const _valueGPU = ref(null);
const _path = ref("");
const _browser = ref("0");

let _IsSwitchChange = false;
let _resourcesPath = "";

onMounted(() => {
    _IsSwitchChange = true;

    Api.System.GetBootStart().then((data) => {
        if (data && data.Value == "1") {
            _value.value = true;
        } else {
            _value.value = false;
        }
    });

    Api.System.GetGPU().then((data) => {
        if (data && data.Value == "1") {
            _valueGPU.value = true;
        } else {
            _valueGPU.value = false;
        }
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

function switchChange_GPU(bool) {
    if (_IsSwitchChange) {
        Api.System.SaveGPU(bool);
    }
}

function OpenWebServerPort() {
    if (_IsSwitchChange) {
        Api.System.OpenWebServerPort(_browser.value);
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