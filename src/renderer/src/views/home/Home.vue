<template>
    <div id="Home">
        <div id="Navigation">
            <ul id="First">
                <li>
                    <el-icon :size="17">
                        <House />
                    </el-icon>
                    <span class="FontMargins">首页</span>
                </li>
                <li>
                    <el-icon :size="17">
                        <Notebook />
                    </el-icon>
                    <span class="FontMargins">书架</span>
                    <div style="margin-left: auto;margin-right: 10px;">0</div>
                </li>
                <li>
                    <el-icon :size="17">
                        <Box />
                    </el-icon>
                    <span class="FontMargins">书源</span>
                    <div style="margin-left: auto;margin-right: 10px;">0</div>
                </li>
                <li>
                    <el-icon :size="17">
                        <Delete />
                    </el-icon>
                    <span class="FontMargins">删除</span>
                    <div style="margin-left: auto;margin-right: 10px;">0</div>
                </li>
            </ul>
            <ul id="Second">
                <li>
                    <el-icon :size="17">
                        <Setting />
                    </el-icon>
                    <span class="FontMargins">设置</span>
                </li>
                <li>
                    <el-icon :size="17">
                        <QuestionFilled />
                    </el-icon>
                    <span class="FontMargins">帮助</span>
                </li>
            </ul>
        </div>
        <div id="Content">
            <div id="DragTitle">
                <div id="Title">
                    <WindowButton></WindowButton>
                </div>
            </div>
            <div style="margin-left: 50px;margin-top: 10px;">
                <el-input v-model="input" @keyup.enter="Submit" :suffix-icon="Search" style="width: 300px"
                    placeholder="搜索书籍" />
                <span style="float: right;margin-right: 20px;">
                    <el-button type="primary" plain>上传书源</el-button>
                    <el-button type="primary" plain>上传本地书籍</el-button>
                </span>
            </div>
            <div id="NewPage">
                <router-view></router-view>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { Setting, House, Notebook, Box, Delete, QuestionFilled, Search } from '@element-plus/icons-vue'
import WindowButton from '@/components/WindowButton/WindowButton.vue'

const input = ref(null);

function Submit() {
    Api.Search(input.value);
}
</script>

<style scoped>
#Home {
    display: flex;
    width: 100%;
    height: 100vh;
}

/* 侧导航样式 */
#Navigation {
    width: 210px;
    height: 100%;
    background-color: rgb(230, 230, 230);
    font-size: 15px;
    color: rgb(0, 0, 0);
    display: flex;
    flex-direction: column;
    /* 可拖拽 */
    -webkit-app-region: drag;
}

ul {
    width: 100%;
    list-style: none;
    display: flex;
    flex-direction: column;
    /* 水平居中 */
    align-items: center;
}

#First {
    margin-top: 100px;
    height: 100%;
}

#Second {
    margin-top: auto;
    height: 91px;
}

li {
    list-style-type: none;
    text-align: center;
    display: flex;
    /* 水平居中 */
    align-items: center;
    width: calc(100% - 30px);
    height: 40px;
    padding-left: 30px;
    /* 不可拖拽 */
    -webkit-app-region: no-drag;
    /* 无法复制文本 */
    user-select: none;
}

li:hover {
    background-color: rgba(0, 0, 0, 0.247);
    cursor: pointer;
}

li>.FontMargins {
    margin-left: 10px;
}

/* 内容样式 */
#Content {
    width: calc(100% - 210px);
    height: 100%;
    background-color: rgb(255, 255, 255);
}

#Title {
    margin-left: auto;
    width: 111px;
    height: 37px;
    /* 不可拖拽 */
    -webkit-app-region: no-drag;
}

#DragTitle {
    width: 100%;
    /* 可拖拽 */
    -webkit-app-region: drag;
}
</style>