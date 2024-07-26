<template>
  <div ref="contextMenu" class="context-menu" :style="menuStyle" @click="closeMenu">
    <ul>
      <template v-for="option in options" :key="option.value">
        <li v-if="option.value != ''" @click="handleClick(option.value)">
          {{ option.label }}
        </li>
        <hr v-else style=" border:1px solid rgb(244, 244, 245);">
      </template>
    </ul>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, ref, onMounted } from 'vue'

const contextMenu = ref(null);

const props = defineProps({
  x: {
    type: Number,
    required: true,
  },
  y: {
    type: Number,
    required: true,
  },
  options: {
    type: Array,
    required: true,
  },
})

const emit = defineEmits(['select', 'close'])

const menuStyle = ref({
  position: 'absolute',
  zIndex: 1000,
})

const handleClick = (optionValue) => {
  emit('select', optionValue)
  emit('close')
}

const closeMenu = (event) => {
  event.stopPropagation()
}

onMounted(() => {
  const menu = menuStyle.value
  const menuWidth = contextMenu.value.offsetWidth
  const menuHeight = contextMenu.value.offsetHeight
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight

  // Adjust menu position to ensure it stays within viewport boundaries
  if (props.x + menuWidth > viewportWidth) {
    menu.left = props.x - menuWidth + 'px'
  } else {
    menu.left = props.x + 'px'
  }

  if (props.y + menuHeight > viewportHeight) {
    menu.top = props.y - menuHeight + 'px'
  } else {
    menu.top = props.y + 'px'
  }
})
</script>

<style scoped>
.context-menu {
  background: white;
  border: 1px solid #ccc;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border-radius: 7px;
  overflow: hidden;
  font-size: 15px;
}

.context-menu ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.context-menu li {
  padding: 8px 12px;
  cursor: pointer;
}

.context-menu li:hover {
  background-color: #f0f0f0;
}
</style>
