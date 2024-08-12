<template>
    <div id="container" ref="_container" style="height: 100%;">
        <template v-if="(!_dataArr || _dataArr.length == 0) && _nullImage">
            <div style="height: 100%;display: flex;flex-direction: column;align-content: flex-start;">
                <p style="color:#D1D1D1;padding-left: 50px;font-size:2vw">这里什么都没有,只有一片星辰大海</p>
                <img src="../../assets/image/an_astronaut.svg" alt="SVG Image"
                    style="margin: auto auto;display: block;width: 60vw;height: 60vh;user-select: none; pointer-events: none;-webkit-user-drag:none;" />
            </div>
        </template>
        <template v-else>
            <div id="content" ref="_content">
                <template v-for="item in _dataArr">
                    <el-card shadow="hover" @contextmenu.prevent="showMenu($event, item)"
                        style="max-width: 310px;cursor:pointer;user-select: none;" class="card"
                        @click="ClickOpenWebPage($event, item)">
                        <el-text line-clamp="2" size="large" style="font-weight: bold;">{{ item.title }}</el-text><br>
                        <el-text line-clamp="3" size="small" style="color:rgb(130, 130, 130);width: 100%;">{{
            item.content
        }}</el-text>
                        <el-image class="el_img" style="width:auto" :src="item.cover" :preview-src-list="[item.cover]"
                            fit="fill">
                            <template #error>
                                <div class="image-error">
                                    <el-icon :size="30"><icon-picture /></el-icon>
                                </div>
                            </template>
                        </el-image>
                        <br>
                        <span style="font-size: 16px;color:rgb(130, 130, 130);">收藏夹：</span>
                        <el-tag style="max-width: 120px;overflow:hidden">
                            {{ item.favoritesName ? item.favoritesName : "暂无"
                            }}</el-tag><br>
                        <el-text size="small">{{ item.date }}</el-text>
                    </el-card>
                </template>
            </div>
            <div ref="_load" class="load">这里一片荒芜</div>
        </template>
    </div>
    <RightClickMenu v-if="_menuVisible" :x="_menuX" :y="_menuY" :options="_menuOptions" @close="_menuVisible = false"
        @select="handleMenuSelect" />
    <mobileFavorites @closeDialog="closeDialog" v-if="_visible" :Id="_model.Id" :WebPage_Id="_model.WebPage_Id" />
</template>

<script setup>
import { useRoute } from 'vue-router';
import { ref, nextTick, onMounted, onUnmounted, watch } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Picture as IconPicture } from '@element-plus/icons-vue';
import RightClickMenu from '@/components/RightClickMenu/RightClickMenu.vue';
import mobileFavorites from './mobileFavorites.vue';

const { query, params } = useRoute();

const _content = ref(null);
const _container = ref(null);
const _load = ref(null);
const _dataArr = ref([]);
const _visible = ref(false);
const _model = ref({
    Id: 0,
    WebPage_Id: 0
});
const _nullImage = ref(false);
//右键菜单
const _menuVisible = ref(false);
const _menuX = ref(0);
const _menuY = ref(0);
const _menuOptions = ref([
    { label: '使用浏览器打开', value: '1' },
    { label: '导出', value: '2' },
    { label: '导出为 HTML 网页', value: '6' },
    { label: '移动', value: '5' },
    // { label: '标签', value: '6' },
    { label: '', value: '' },
    { label: '重命名', value: '4' },
    { label: '删除', value: '3' }
]);

let _filePath = "file:///";
let _imagePath = null;
let _WebPagePath = null;
let _index = 1;
let _WebPage = null;

console.log(window.location.href, query);

watch(_dataArr.value, (newQuestion, oldQuestion) => {
    handleResize(_dataArr.value.length);
});

onMounted(async () => {
    //获取文件地址
    initializeFilePath(await Api.FilePath.WebPageDataPath);

    //更新数据
    loadContent(_index);

    // 组件挂载后添加监听器
    window.addEventListener('resize', handleResize);

    //鼠标右键菜单取消事件
    window.addEventListener('click', handleClickOutside(false));//左键
    window.addEventListener('contextmenu', handleClickOutside(true));//右键
    window.addEventListener('blur', handleClickOutside(false));
    document.querySelector("#NewPage")?.addEventListener('scroll', handleClickOutside(false));
});

// 组件卸载前移除监听器
onUnmounted(() => {
    window.removeEventListener('resize', handleResize);

    //鼠标右键菜单取消事件
    window.removeEventListener('click', handleClickOutside(false));//左键
    window.removeEventListener('contextmenu', handleClickOutside(true));//右键
    window.removeEventListener('blur', handleClickOutside(false));
    document.querySelector("#NewPage")?.removeEventListener('scroll', handleClickOutside(false));
});

function ClickOpenWebPage(event, data) {
    if (event.target.closest) {
        // 查找最近的 class 为 'el_img' 的祖先元素
        const el_imgElement = event.target.closest('.el_img');
        const el_image_viewerElement = event.target.closest('.el-image-viewer__wrapper');
        if (el_imgElement || el_image_viewerElement) {
            return;
        }
    }
    let nodeName = event.target.nodeName;
    if (nodeName == "svg" || nodeName == "path") {
        return;
    }
    Api.RightClickMenu.OpenWebPage(data.uuid).then(result => {
        if (result.code == 0) {
            ElMessage({
                message: '浏览器打开网页成功',
                type: 'success',
            });
        } else {
            ElMessage.error(result.message);
        }
    });
}

//打开右键菜单
const showMenu = function (event, data) {
    _menuVisible.value = false;
    nextTick(() => {
        _menuX.value = event.clientX;
        _menuY.value = event.clientY;
        _menuVisible.value = true;
        _WebPage = data;
    });
}

//触发菜单事件
const handleMenuSelect = (optionValue) => {
    if (optionValue == "1") {
        Api.RightClickMenu.OpenWebPage(_WebPage.uuid).then(result => {
            if (result.code == 0) {
                ElMessage({
                    message: '浏览器打开网页成功',
                    type: 'success',
                });
            } else {
                ElMessage.error(result.message);
            }
        });
    } else if (optionValue == "2") {
        Api.RightClickMenu.exportWebPage(_WebPage.id).then(result => {
            if (result.code == 0) {
                ElMessage({
                    message: '导出成功',
                    type: 'success',
                });
            } else if (result.code > 0) {
                ElMessage.error("导出失败");
            }
        });
    } else if (optionValue == "3") {
        ElMessageBox.confirm(
            `是否确定删除标题为：${_WebPage.title}`,
            '提示',
            {
                confirmButtonText: '是',
                cancelButtonText: '否',
                type: 'warning',
                closeOnClickModal: false
            }
        )
            .then(() => {
                Api.RightClickMenu.DelWebPage(_WebPage.id).then(result => {
                    if (result.code == 0) {
                        //同步删除数组元素
                        for (let i = _dataArr.value.length - 1; i >= 0; i--) {
                            if (_dataArr.value[i].id == result.data) {
                                _dataArr.value.splice(i, 1);
                            }
                        }
                        ElMessage({
                            message: '删除成功',
                            type: 'success',
                        });
                    } else {
                        ElMessage.error("删除失败");
                    }
                });
            }).catch(err => {

            });
    } else if (optionValue == "4") {
        ElMessageBox.prompt('重命名网页文件', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            inputValue: _WebPage.title
        })
            .then(({ value }) => {
                Api.RightClickMenu.RenameTitleWebPage({
                    id: _WebPage.id,
                    title: value
                }).then(result => {
                    if (result.code == 0) {
                        _dataArr.value.forEach(e => {
                            if (e.id == result.data) {
                                e.title = value;
                            }
                        });
                        ElMessage({
                            message: '重命名成功',
                            type: 'success',
                        });
                    } else {
                        ElMessage.error("重命名失败");
                    }
                })
            }).catch(err => {

            });
    } else if (optionValue == "5") {
        _model.value.Id = _WebPage.favorites_Id;
        _model.value.WebPage_Id = _WebPage.id;
        _visible.value = true;
    } else if (optionValue == "6") {
        Api.RightClickMenu.exportHtml(_WebPage.id).then(result => {
            if (result.code == 0) {
                ElMessage({
                    message: '导出Html成功',
                    type: 'success',
                });
            } else if (result.code > 0) {
                ElMessage.error("导出失败");
            }
        });
    }

    _menuVisible.value = false;
}

//关闭右键菜单
const handleClickOutside = (bool) => {
    return (event) => {
        if (event.target.closest) {
            // 检查事件目标是否是 class 为 'card' 的元素或其子元素
            const cardElement = event.target.closest('.card');
            const elImageElement = event.target.closest('.el-image-viewer__wrapper');
            // 如果是 card 元素或其子元素且不是 .el-image，直接返回，不执行后续逻辑
            if (bool && cardElement && !elImageElement) {
                return; // 如果是，直接返回，不执行后续逻辑
            }
        }

        if (_menuVisible.value) {
            _menuVisible.value = false;
        }
    }
}

//监听窗口缩放
function handleResize(length) {
    let cardLength = length && typeof length == 'number' ? length : document.querySelectorAll('.card').length;
    if (cardLength <= 0) {
        return;
    }
    let container = _container.value.clientWidth;
    let cardWidth = (cardLength * 300) - 15;
    if (container - 40 > cardWidth) {
        _content.value.style.width = `${cardWidth}px`;
    } else {
        _content.value.style.width = "";
    }
}

//获取内容
function GetContent(index) {
    return new Promise((resolve, reject) => {
        Api.DB.GetWebPageList({ index, keyword: query.keyword, FavoritesId: query.Favorites_Id }).then(datas => {
            datas.forEach(data => {
                _dataArr.value.push(GetData(data));
            });

            //表示可以加载数据为空图片
            _nullImage.value = true;

            if (datas.length > 0) {
                _index++;
                resolve(true);
            }
            resolve(false);
        });
    });
}

//数据映射
function GetData(data) {
    return {
        id: data.Id,
        title: data.Title,
        uuid: data.UUID,
        cover: `${_imagePath}${data.UUID}.png`,
        content: data.ContentText,
        date: data.CreateDate,
        favorites_Id: data.Favorites_Id,
        favoritesName: data.FavoritesName
    }
}

//检测加载
function loadContent() {
    // 创建一个 IntersectionObserver 实例  
    const observer = new IntersectionObserver((entries, observer) => {
        // 检查目标元素是否在视口内  
        entries.forEach(async entry => {
            if (entry.isIntersecting) {
                await GetContent(_index);

                let IsContinue = true;
                while (IsContinue) {
                    if (isInViewPortOfTwo(entry.target)) {
                        IsContinue = await GetContent(_index);
                    } else {
                        IsContinue = false;
                    }
                }
            }
        });
    }, {
        rootMargin: '0px', // 边界区域  
        threshold: 0.5 // 交叉阈值  
        // 可以根据需要调整 threshold，比如设置为 1.0 表示完全可见  
    });

    // 开始观察目标元素  
    observer.observe(_load.value);
}

//判断是否到底部
function isInViewPortOfTwo(el) {
    const screenHeight = window.innerHeight || document.documentElement.clientHeight
        || document.body.clientHeight;
    const top = el.getBoundingClientRect() && el.getBoundingClientRect().top;
    return top <= screenHeight + 100;
}

//关闭移动收藏夹窗口
function closeDialog(bool, model) {
    console.log(model)
    _visible.value = false;
    //删除不在当前收藏夹的数据
    if (bool && query.Favorites_Id > 0) {
        //同步删除数组元素
        for (let i = _dataArr.value.length - 1; i >= 0; i--) {
            if (_dataArr.value[i].id == _model.value.WebPage_Id && _dataArr.value[i].favorites_Id != model.favoritesId) {
                _dataArr.value.splice(i, 1);
            }
        }
    }
    //如果移动成功更新数据
    if (bool && model) {
        //更新数据
        for (let i = _dataArr.value.length - 1; i >= 0; i--) {
            let value = _dataArr.value[i];
            if (value.id == model.webPageId) {
                value.favorites_Id = model.favoritesId;
                value.favoritesName = model.favoritesName;
            }
        }
    }
}

Api.WebContents.MonitorNewWebPage((data) => {
    if (query.Favorites_Id == 0) {
        _nullImage.value = true;
        _dataArr.value.unshift(GetData(data));
    }
});

function initializeFilePath(FilePath) {
    _filePath += FilePath;
    _imagePath = _filePath + "/imgs/";
    _WebPagePath = _filePath + "/WebPage/";
}
</script>

<style scoped>
#content {
    margin: 0 20px;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
}

.load {
    height: 40px;
    width: 100%;
    align-content: center;
    text-align: center;
    font-size: 15px;
    color: rgb(177, 177, 177);
}

.image-error {
    width: 150px;
    height: 100px;
    background-color: rgb(244, 247, 250);
    display: flex;
    justify-content: center;
    align-items: center;
    color: rgb(181, 185, 189);
}
</style>