<template>
    <div id="container" ref="_container">
        <div id="content" ref="_content">
            <template v-for="item in _dataArr">
                <el-card style="max-width: 280px" class="card">
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
</template>

<script setup>
import { useRoute } from 'vue-router';
import { ref, reactive, onMounted, onUnmounted, watch } from 'vue'

const { query, params } = useRoute();


const _content = ref(null);
const _container = ref(null);
const _load = ref(null);
const _dataArr = ref([]);
const _filePath = "file:///" + Api.File.ResourcesPath;
const _imagePath = _filePath + "/imgs/";
const _WebPagePath = _filePath + "/WebPage/";

let _index = 1;

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
});

// 组件卸载前移除监听器
onUnmounted(() => {
    window.removeEventListener('resize', handleResize);
});

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
        Api.DB.GetContent({ index, keyword: query.keyword }).then(datas => {
            datas.forEach(data => {
                _dataArr.value.push({
                    title: data.Title,
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

                const rect = entry.target.getBoundingClientRect();
                const inViewport = (
                    rect.top >= 0 &&
                    rect.left >= 0 &&
                    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
                    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
                );
                let IsContinue = true;
                while (IsContinue) {
                    if (inViewport) {
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