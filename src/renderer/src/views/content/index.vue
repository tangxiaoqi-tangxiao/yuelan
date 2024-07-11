<template>
    <div id="container" ref="_container">
        <div id="content" ref="_content">
            <template v-for="item in _dataArr">
                <el-card @contextmenu.prevent="showMenu($event, item.uuid)" style="max-width: 280px" class="card">
                    <el-text line-clamp="2" size="large" style="font-weight: bold;">{{ item.title }}</el-text><br>
                    <el-text line-clamp="3" size="small" style="color:rgb(130, 130, 130);width: 100%;">{{ item.Content
                        }}</el-text>
                    <img :src="item.cover" style="width: 70%;height: 70%;" /><br>
                    <el-text size="small">{{ item.date }}</el-text>
                </el-card>
            </template>
        </div>
        <div ref="_load" class="load">这里一片荒芜</div>
    </div>
    <RightClickMenu v-if="_menuVisible" :x="_menuX" :y="_menuY" :options="_menuOptions" @close="_menuVisible = false"
        @select="handleMenuSelect" />
</template>

<script setup>
import { useRoute } from 'vue-router';
import { ref, nextTick, onMounted, onUnmounted, watch } from 'vue'
import RightClickMenu from '@/components/RightClickMenu/RightClickMenu.vue';

const { query, params } = useRoute();


const _content = ref(null);
const _container = ref(null);
const _load = ref(null);
const _dataArr = ref([]);
const _filePath = "file:///" + Api.File.ResourcesPath;
const _imagePath = _filePath + "/imgs/";
const _WebPagePath = _filePath + "/WebPage/";
//右键菜单
const _menuVisible = ref(false)
const _menuX = ref(0)
const _menuY = ref(0)
const _menuOptions = ref([
    { label: '使用浏览器打开', value: '1' },
    { label: '导出', value: '2' },
    { label: '删除', value: '3' },
    { label: '重命名', value: '3' },
    { label: '移动', value: '4' },
    { label: '标签', value: '5' },
]);

let _index = 1;
let _UUID = "";

console.log(window.location.href);

watch(_dataArr.value, (newQuestion, oldQuestion) => {
    handleResize(_dataArr.value.length);
});

onMounted(() => {
    //更新数据
    // GetContent(index);
    loadContent(_index);
    // 组件挂载后添加监听器  
    window.addEventListener('resize', handleResize);

    //鼠标右键菜单取消事件
    window.addEventListener('click', handleClickOutside(false));//左键
    window.addEventListener('contextmenu', handleClickOutside(true));//右键
    window.addEventListener('blur', handleClickOutside(false));
    document.querySelector("#NewPage").addEventListener('scroll', handleClickOutside(false));
});

// 组件卸载前移除监听器
onUnmounted(() => {
    window.removeEventListener('resize', handleResize);

    //鼠标右键菜单取消事件
    window.removeEventListener('click', handleClickOutside(false));//左键
    window.removeEventListener('contextmenu', handleClickOutside(true));//右键
    window.removeEventListener('blur', handleClickOutside(false));
    document.querySelector("#NewPage").removeEventListener('scroll', handleClickOutside(false));
});

//打开右键菜单
const showMenu = function (event, UUID) {
    _menuVisible.value = false;
    nextTick(() => {
        _menuX.value = event.clientX;
        _menuY.value = event.clientY;
        _menuVisible.value = true;
        _UUID = UUID;
    });
}

//触发菜单事件
const handleMenuSelect = (optionValue) => {
    if (optionValue == "1") {
        Api.RightClickMenu.OpenWebPage(_UUID);
    }

    _menuVisible.value = false;
}

//关闭右键菜单
const handleClickOutside = (bool) => {
    return (event) => {
        // 检查事件目标是否是 class 为 'card' 的元素或其子元素
        if (bool && event.target.closest('.card')) {
            return; // 如果是，直接返回，不执行后续逻辑
        }

        if (_menuVisible.value) {
            _menuVisible.value = false;
        }
    }
}

function handleResize(length) {
    let cardLength = length && typeof length == 'number' ? length : document.querySelectorAll('.card').length;
    let container = _container.value.clientWidth;
    let cardWidth = (cardLength * 300);
    if (container - 40 > cardWidth) {
        _content.value.style.width = `${cardWidth}px`;
    } else {
        _content.value.style.width = "";
    }
}

function GetContent(index) {
    return new Promise((resolve, reject) => {
        Api.DB.GetContent({ index, keyword: query.keyword, tagsId: query.tagsId }).then(datas => {
            datas.forEach(data => {
                _dataArr.value.push({
                    title: data.Title,
                    uuid: data.UUID,
                    cover: `${_imagePath}${data.UUID}.png`,
                    Content: data.ContentText,
                    date: data.CreateDate
                });
            });
            if (datas.length > 0) {
                _index++;
                resolve(true);
            }
            resolve(false);
        });
    });
}

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

function isInViewPortOfTwo(el) {
    const screenHeight = window.innerHeight || document.documentElement.clientHeight
        || document.body.clientHeight;
    const top = el.getBoundingClientRect() && el.getBoundingClientRect().top;
    return top <= screenHeight + 100;
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
</style>