<template>
    <div id="Home">
        <div id="Navigation">
            <div class="Menu">
                <el-menu active-text-color="#409eff" background-color="rgb(239, 239, 242)" default-active="1"
                    text-color="rgb(84, 84, 93)">
                    <el-menu-item @contextmenu.prevent="showMenu($event)" class="background-menu" aria-selected="true"
                        index="1" @click="Home">
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
                            <el-menu-item @contextmenu.prevent="showMenu($event)" @click="GetTagContent(item.Id)"
                                class="background-menu" :index="`1-${index + 1}`">
                                <el-icon>
                                    <Tickets />
                                </el-icon>
                                <el-text style="width: 100%;" truncated>{{ item.Name
                                    }}</el-text>
                            </el-menu-item>
                        </template>
                    </el-sub-menu>
                    <el-menu-item @contextmenu.prevent="showMenu($event)" class="background-menu" index="3">
                        <el-icon>
                            <PriceTag />
                        </el-icon>
                        <span>标签</span>
                    </el-menu-item>
                </el-menu>
            </div>
            <RightClickMenu v-if="_menuVisible" :x="_menuX" :y="_menuY" :options="_menuOptions"
                @close="_menuVisible = false" @select="handleMenuSelect" />
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
                        placeholder="搜索网页" />
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
import { ref, onUnmounted, onMounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { PriceTag, House, Collection, Search, Tickets } from '@element-plus/icons-vue';
import WindowButton from '@/components/WindowButton/WindowButton.vue';
import RightClickMenu from '@/components/RightClickMenu/RightClickMenu.vue';

const _router = useRouter();

const _input = ref(null);
const _FavoritesArr = ref([]);
const _indexKey = ref("");
const _tagsId = ref(0);
//右键菜单
const _menuVisible = ref(false);
const _menuX = ref(0);
const _menuY = ref(0);
const _menuOptions = ref([
    { label: '导出', value: '1' },
    { label: '选项 2', value: 'option2' },
    { label: '清空', value: '3' }
]);

onMounted(() => {
    Home();
    GetFavoritesList();

    //鼠标右键菜单取消事件
    document.querySelector(".Menu .el-sub-menu__title").addEventListener("contextmenu",showMenu);
    window.addEventListener('click', handleClickOutside(false));//左键
    window.addEventListener('contextmenu', handleClickOutside(true));//右键
    window.addEventListener('blur', handleClickOutside(false));
    document.querySelector("#NewPage").addEventListener('scroll', handleClickOutside(false));
});

onUnmounted(() => {
    //鼠标右键菜单取消事件
    document.querySelector(".Menu .el-sub-menu__title").removeEventListener('contextmenu', showMenu);
    window.removeEventListener('click', handleClickOutside(false));//左键
    window.removeEventListener('contextmenu', handleClickOutside(true));//右键
    window.removeEventListener('blur', handleClickOutside(false));
    document.querySelector("#NewPage").removeEventListener('scroll', handleClickOutside(false));
});

//打开右键菜单
const showMenu = function (event) {
    event.preventDefault(); 
    _menuVisible.value = false;
    nextTick(() => {
        _menuX.value = event.clientX;
        _menuY.value = event.clientY;
        _menuVisible.value = true;
    });
}
//触发菜单事件
const handleMenuSelect = (optionValue) => {
    console.log(`父组件处理: 点击了 ${optionValue}`);
    _menuVisible.value = false;
}
//关闭右键菜单
const handleClickOutside = (bool) => {
    return (event) => {
        // 检查事件目标是否是 class 为 'card' 的元素或其子元素
        if (bool && (event.target.closest('.background-menu') || event.target.closest('.Menu .el-sub-menu__title'))) {
            return; // 如果是，直接返回，不执行后续逻辑
        }

        if (_menuVisible.value) {
            _menuVisible.value = false;
        }
    }
}

function Submit() {
    _router.push({ name: 'content', query: { keyword: _input.value, tagsId: _tagsId.value } }).then(() => {
        _indexKey.value = _input.value + _tagsId.value;
        console.log(_indexKey.value);
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
    /* -webkit-app-region: drag; */
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