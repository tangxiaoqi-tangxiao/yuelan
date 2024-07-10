<template>
    <div id="Home">
        <div id="Navigation">
            <div class="Menu">
                <el-menu active-text-color="#409eff" background-color="rgb(239, 239, 242)" default-active="1"
                    text-color="rgb(84, 84, 93)">
                    <el-menu-item class="background-menu" aria-selected="true" index="1" @click="Home">
                        <el-icon>
                            <House />
                        </el-icon>
                        <span>最近</span>
                    </el-menu-item>
                    <!-- <el-menu-item index="2">
                        <el-icon><Collection /></el-icon>
                        <span>收藏夹</span>
                    </el-menu-item> -->
                    <el-sub-menu index="2">
                        <template #title>
                            <el-icon>
                                <Collection />
                            </el-icon>
                            <span>收藏夹</span>
                        </template>
                        <template v-for="(item, index) in _FavoritesArr">
                            <el-menu-item @click="GetTagContent(item.Id)" class="background-menu"
                                :index="`1-${index + 1}`">
                                <el-icon>
                                    <Tickets />
                                </el-icon>
                                <el-text style="width: 100%;" truncated>{{ item.Name
                                    }}</el-text>
                            </el-menu-item>
                        </template>
                    </el-sub-menu>
                    <el-menu-item class="background-menu" index="3">
                        <el-icon>
                            <PriceTag />
                        </el-icon>
                        <span>标签</span>
                    </el-menu-item>
                </el-menu>
            </div>
            <!-- <ul id="First">
                <li @click="Home">
                    <el-icon :size="17">
                        <House />
                    </el-icon>
                    <span class="FontMargins">最近</span>
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
            </ul> -->
            <!-- <ul id="Second">
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
            </ul> -->
        </div>
        <div id="Content">
            <div>
                <div id="DragTitle">
                    <div id="Title">
                        <WindowButton></WindowButton>
                    </div>
                </div>
                <div style="margin-left: 50px;margin-top: 10px;">
                    <el-input v-model="_input" @keyup.enter="Submit" :suffix-icon="Search" style="width: 300px"
                        placeholder="搜索书籍" />
                    <span style="float: right;margin-right: 20px;">
                        <el-button type="primary" plain>上传网页</el-button>
                    </span>
                </div>
            </div>
            <div id="NewPage">
                <router-view :key="_indexKey"></router-view>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onUpdated, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { PriceTag, House, Collection, Search, Tickets } from '@element-plus/icons-vue';
import WindowButton from '@/components/WindowButton/WindowButton.vue';

const _router = useRouter();

const _input = ref(null);
const _FavoritesArr = ref([]);
const _indexKey = ref("");
const _tagsId = ref(0);

onMounted(() => {
    Home();
    GetFavoritesList();
})

function Submit() {
    _router.push({ name: 'content', query: { keyword: _input.value, tagsId: _tagsId.value } }).then(() => {
        _indexKey.value = _input.value + _tagsId.value;
        console.log(_indexKey.value)
    })
}

function Home() {
    _tagsId.value = 0;
    _input.value = "";
    _router.push({ name: 'content' }).then(() => {
        _indexKey.value = "";
    });
}

function GetTagContent(tagsId) {
    _tagsId.value = tagsId;
    _router.push({ name: 'content', query: { tagsId } }).then(() => {
        _indexKey.value = tagsId;
    })
}

function GetFavoritesList() {
    Api.DB.GetFavoritesList(1).then(datas => {
        _FavoritesArr.value = datas;
    })
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
    background-color: rgb(239, 239, 242);
    font-size: 15px;
    color: rgb(0, 0, 0);
    display: flex;
    flex-direction: column;
    /* 可拖拽 */
    -webkit-app-region: drag;
}

.Menu {
    margin-top: 90px;
    /* 不可拖拽 */
    -webkit-app-region: no-drag;
}

#Second {
    margin-top: auto;
    height: 91px;
}

/* 内容样式 */
#Content {
    width: calc(100% - 210px);
    height: 100%;
    background-color: rgb(255, 255, 255);
}

#Content>div {
    margin-bottom: 20px;
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

#NewPage {
    overflow-y: auto;
    width: 100%;
    height: calc(100% - 99px);
    ;
}

.background-menu:hover {
    background-color: rgba(197, 197, 197, 0.5);
}

.Menu /deep/.el-sub-menu__title:hover {
    background-color: rgba(197, 197, 197, 0.5);
}
</style>