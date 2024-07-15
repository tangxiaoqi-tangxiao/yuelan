<template>
    <el-dialog v-model="_dialogTableVisible" title="选择收藏夹" :close-on-click-modal="false" width="50%">
        <div style="width: 95%;margin: 0 auto;">
            <el-input v-model="_input" :align-center="true" placeholder="搜索收藏夹" @input="search" />
        </div>

        <div class="box">
            <div v-for="(item, index) in _select_List" :class="{ 'box_select': item.select }" @click="select(index)">
                <el-icon :size="15" style="margin-left: 10px;">
                    <Tickets />
                </el-icon>
                <span style="margin-left: 5px;">{{ item.Name }}</span>
            </div>
        </div>
        <div class="button">
            <el-button @click="$emit('closeDialog',false)">取消</el-button>
            <el-button type="primary" @click="Classification">确定</el-button>
        </div>
    </el-dialog>
</template>

<script setup>
import { ref, defineProps, defineEmits, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Tickets } from '@element-plus/icons-vue';

const props = defineProps({
    Id: Number,
    WebPage_Id: Number
});

const emit = defineEmits();

const _dialogTableVisible = ref(true);
const _input = ref(null);
const _datas = ref([]);

let _Id = ref(props.Id);
let _select_List = ref([]);

onMounted(() => {
    getSelectList();
});

function getSelectList() {
    Api.DB.GetFavoritesList(1).then(datas => {
        _datas.value = datas;
        _select_List.value = datas;
        default_select();
    })
}

function search(value) {
    _datas.value.forEach(e => {
        e.select = false;
    });
    if (value == "") {
        _select_List.value = _datas.value;
        default_select();
    } else {
        let bool = true;
        _select_List.value = _datas.value.filter(e => {
            if (e.Name.includes(value)) {
                if (bool) {
                    e.select = true;
                    bool = false;
                }
                return true;
            }
            return false;
        });
    }
}

function select(index) {
    _select_List.value.forEach(e => {
        e.select = false;
    });
    _select_List.value[index].select = true;
    _Id.value = _select_List.value[index].Id;
}

function default_select() {
    if (props.Id && props.Id > 0) {
        _select_List.value.forEach(e => {
            if (e.Id == props.Id) {
                e.select = true;
            }
        });
    }
}

function Classification() {
    if (_Id.value && _Id .value> 0) {
        Api.DB.Classification({
            Favorites_Id: _Id.value,
            WebPage_Id: props.WebPage_Id
        }).then(result => {
            if (result.code == 0) {
                emit("closeDialog",true);
                ElMessage({
                    message: '移动成功',
                    type: 'success',
                });
            } else {
                ElMessage.error("移动失败");
            }
        });
    } else {
        ElMessage.error("请选择收藏夹");
    }
}

</script>

<style scoped>
.box {
    width: 95%;
    height: 45vh;
    margin: 0 auto;
    border: solid 1px rgb(202, 202, 202);
    margin-top: 20px;
    display: flex;
    align-items: center;
    /* 垂直居中 */
    flex-direction: column;
    /* 改为按列排列 */
    color: black;
    font-family: "Microsoft YaHei", "微软雅黑", "Heiti SC", "黑体", Arial, sans-serif;
}

.box>div {
    width: 95%;
    height: 20px;
    margin-top: 5px;
    display: flex;
    align-items: center;
    font-size: 13px;
    border-radius: 10px;
    border: 1px solid transparent;
}

.box>div:hover:not(.box_select) {
    background-color: rgb(236, 245, 255, 0.5);
    border-color: rgba(160, 207, 255);
}

.box_select {
    background-color: rgb(236, 245, 255);
    border-color: rgb(160, 207, 255) !important;
}

.button {
    width: 132px;
    margin-left: auto;
    margin-right: 10px;
    margin-top: 20px;
}
</style>