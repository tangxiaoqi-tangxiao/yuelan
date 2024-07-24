<template>
    <div id="button">
        <div class="backgroundColor" @click="Min">
            <el-icon :size="17">
                <Minus />
            </el-icon>
        </div>
        <div class="backgroundColor" @click="Max">
            <el-icon :size="17" v-if="Reduction">
                <CopyDocument />
            </el-icon>
            <el-icon :size="17" v-else>
                <FullScreen />
            </el-icon>
        </div>
        <div class="backgroundColor" @click="Close">
            <el-icon :size="17">
                <CloseIco />
            </el-icon>
        </div>
    </div>
</template>

<script setup>
import { Minus, FullScreen, Close as CloseIco, CopyDocument } from '@element-plus/icons-vue'
import { ref } from 'vue'

let Reduction = ref(false);

function Min() {
    Api.Winbutton.Min()
}

function Max() {
    if (!Reduction.value) { Reduction.value = true } else { Reduction.value = false }
    Api.Winbutton.Max()
}

function Close() {
    Api.Winbutton.Close()
}

Api.Winbutton.UpdateIcon((data)=>{
    Reduction.value = data
});
</script>

<style scoped>
#button {
    display: inline-flex;
    width: 111px;
}

.backgroundColor {
    padding: 10px;
    padding-bottom: 6px;
}

.backgroundColor:last-of-type:hover {
    background-color: rgba(255, 43, 78);
}

.backgroundColor:hover {
    background-color: rgba(231, 231, 231);
}
</style>