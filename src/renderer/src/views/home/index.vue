<template>
    <div id="Home">
        <div id="Navigation">
            <div class="Menu">
                <el-menu active-text-color="#409eff" background-color="rgb(243, 243, 243)" :router="true"
                    :default-active="_Menu" @select="FavoritesSelect" text-color="rgb(84, 84, 93)">
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
                            <el-menu-item @contextmenu.prevent="showMenu($event)" @click="toggleFavorites(item.Id)"
                                class="background-menu" :index="`1-${index + 1}`">
                                <el-icon>
                                    <Tickets />
                                </el-icon>
                                <el-text style="width: 100%;" truncated>{{ item.Name
                                    }}</el-text>
                            </el-menu-item>
                        </template>
                    </el-sub-menu>
                    <el-menu-item disabled @contextmenu.prevent="showMenu($event)" class="background-menu" index="3">
                        <el-icon>
                            <PriceTag />
                        </el-icon>
                        <span>标签</span>
                    </el-menu-item>
                </el-menu>
            </div>
            <!-- 设置 -->
            <div class="setUp">
                <el-menu active-text-color="#409eff" background-color="rgb(243, 243, 243)" @select="SetUpSelect"
                    :router="true" :default-active="_setUp" text-color="rgb(84, 84, 93)">
                    <el-menu-item @click="toggleSetUp" class="background-menu" aria-selected="true" index="1">
                        <el-icon>
                            <el-icon>
                                <Tools />
                            </el-icon>
                        </el-icon>
                        <span>设置</span>
                    </el-menu-item>
                    <el-menu-item @click="toggleSetUp" class="background-menu" aria-selected="true" index="2">
                        <el-icon>
                            <el-icon>
                                <InfoFilled />
                            </el-icon>
                        </el-icon>
                        <span>关于</span>
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
                <div v-if="_SearchShow" style="margin-left: 20px;margin-top: 10px;">
                    <el-input v-model="_input" size="large" @keyup.enter="Submit" :suffix-icon="Search"
                        style="width: 400px" placeholder="搜索网页" />
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
import { ElMessage, ElMessageBox } from 'element-plus';
import { PriceTag, House, Collection, Search, Tickets, InfoFilled, Tools } from '@element-plus/icons-vue';
import WindowButton from '@/components/WindowButton/WindowButton.vue';
import RightClickMenu from '@/components/RightClickMenu/RightClickMenu.vue';
import { fa } from 'element-plus/es/locales.mjs';

const _router = useRouter();

const _input = ref(null);
const _FavoritesArr = ref([]);
const _indexKey = ref("");
const _Menu = ref("1");
const _setUp = ref("");
const _SearchShow = ref(true);
//右键菜单
const _menuVisible = ref(false);
const _menuX = ref(0);
const _menuY = ref(0);
const _menuOptions = ref([]);

//全局变量
let _Favorites_Id = 0;

onMounted(() => {
    Home();
    GetFavoritesList();

    //鼠标右键菜单事件
    document.querySelector(".Menu .el-sub-menu__title")?.addEventListener("contextmenu", (event) => { showMenu(event, 2) });
    window.addEventListener('click', handleClickOutside(false));//左键
    window.addEventListener('contextmenu', handleClickOutside(true));//右键
    window.addEventListener('blur', handleClickOutside(false));
    document.querySelector("#NewPage")?.addEventListener('scroll', handleClickOutside(false));
});

onUnmounted(() => {
    //鼠标右键菜单取消事件
    document.querySelector(".Menu .el-sub-menu__title")?.removeEventListener('contextmenu', showMenu);
    window.removeEventListener('click', handleClickOutside(false));//左键
    window.removeEventListener('contextmenu', handleClickOutside(true));//右键
    window.removeEventListener('blur', handleClickOutside(false));
    document.querySelector("#NewPage")?.removeEventListener('scroll', handleClickOutside(false));
});

//打开右键菜单
const showMenu = function (event, index) {
    event.preventDefault();
    _menuVisible.value = false;
    nextTick(() => {
        _menuX.value = event.clientX;
        _menuY.value = event.clientY;

        switch (index) {
            case 1:

                break;
            case 2:
                _menuOptions.value = [
                    { label: '新建收藏夹', value: { index: 2, value: 1 } },
                ];
                _menuVisible.value = true;
                break;
            default:
                _menuOptions.value = [];
                _menuVisible.value = false;
                break;
        }
    });
}
//触发菜单事件
const handleMenuSelect = (optionValue) => {
    const index = optionValue.index;
    const value = optionValue.value;
    switch (index) {
        case 2:
            switch (value) {
                case 1:
                    NewFolder();
                    break;

                default:
                    break;
            }
            break;

        default:
            break;
    }
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
    _router.push({ name: 'content', query: { keyword: _input.value, Favorites_Id: _Favorites_Id} }).then(() => {
        SetindexKey("1_" + _input.value + _Favorites_Id);
    })
}

function Home() {
    _Favorites_Id = 0;
    _input.value = "";
    _router.push({ name: 'content', query: { Favorites_Id: _Favorites_Id } }).then(() => {
        SetindexKey(0);
    });
}

function toggleFavorites(Favorites_Id) {
    _Favorites_Id = Favorites_Id;
    _router.push({ name: 'content', query: { Favorites_Id: _Favorites_Id } }).then(() => {
        SetindexKey("2_" + Favorites_Id);
    });
}

function FavoritesSelect(index) {
    _Menu.value = index;
    _setUp.value = "";
    _SearchShow.value = true;
}

function toggleSetUp() {
    _router.push({ name: 'setUp' }).then(() => {
        SetindexKey(3);
    });
}

function SetUpSelect(index) {
    _setUp.value = index;
    _Menu.value = "";
    _SearchShow.value = false;
}
//获取收藏夹
function GetFavoritesList() {
    Api.DB.GetFavoritesList(1).then(datas => {
        _FavoritesArr.value = datas;
    });
}
//监听收藏夹更新
Api.WebContents.MonitorFavorites((data) => {
    GetFavoritesList();
});

function SetindexKey(value) {
    _indexKey.value = value;
}

function NewFolder() {
    ElMessageBox.prompt('收藏夹名称：', '', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
    })
        .then(({ value }) => {
            Api.RightClickMenu.InsertFavorites(value).then(result => {
                console.log(result)
                if (result.code == 0) {
                    ElMessage({
                        message: '创建收藏夹成功',
                        type: 'success',
                    });
                } else {
                    ElMessage.error("创建收藏夹失败");
                }
            })
        }).catch(err => {

        });
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
    /* background-color: rgb(239, 239, 242); */
    background-color: rgb(243, 243, 243);
    font-size: 15px;
    color: rgb(0, 0, 0);
    display: flex;
    flex-direction: column;
    -webkit-user-select: none;
    /* 可拖拽 */
    /* -webkit-app-region: drag; */
}

.Menu {
    margin-top: 90px;
    overflow-y: auto;
    /* 不可拖拽 */
    /* -webkit-app-region: no-drag; */
}

/* 滚动条样式 */
.Menu::-webkit-scrollbar {
    width: 8px;
    /* 滚动条的宽度 */
}

.Menu::-webkit-scrollbar-track {
    background: #f1f1f1;
    /* 滚动条轨道的颜色 */
}

.Menu::-webkit-scrollbar-thumb {
    background: #888;
    /* 滚动条的颜色 */
    border-radius: 4px;
    /* 滚动条圆角 */
}

.Menu::-webkit-scrollbar-thumb:hover {
    background: #555;
    /* 悬停时滚动条的颜色 */
}

.Menu>>>.el-menu--vertical {
    border-right: 0;
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
    /* background-color:rgb(241, 240, 240) ; */
    border-bottom: 1px solid rgba(230, 229, 229, 0.425);
    /* 可拖拽 */
    -webkit-app-region: drag;
}

#NewPage {
    overflow-y: auto;
    width: 100%;
    height: calc(100% - 108px);
}

.background-menu:hover {
    /* background-color: rgba(197, 197, 197, 0.5); */
    background-color: rgba(226, 225, 225, 0.5);
}

.Menu /deep/.el-sub-menu__title:hover {
    background-color: rgba(226, 225, 225, 0.5);
}

.setUp {
    width: 100%;
    margin-top: auto;
    background-color: bisque;
}

.setUp>>>.el-menu--vertical {
    border-right: 0;
}
</style>