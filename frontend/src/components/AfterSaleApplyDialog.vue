<template>
  <el-dialog
    :model-value="modelValue"
    title="申请售后"
    width="560px"
    @update:model-value="(v) => emit('update:modelValue', v)"
  >
    <div class="item" v-if="item">
      <el-image v-if="item.productImage" :src="item.productImage" class="thumb" fit="cover" />
      <div class="info">
        <div class="name">{{ item.productName }}</div>
        <div class="meta">¥ {{ item.price }} × {{ item.quantity }}</div>
      </div>
    </div>

    <el-form :model="form" label-width="90px">
      <el-form-item label="售后类型">
        <el-radio-group v-model="form.type">
          <el-radio v-for="(label, key) in afterSaleType" :key="key" :value="key" border>
            {{ label }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="问题标题">
        <el-input v-model="form.title" placeholder="一句话说明问题，如：收到商品破损" maxlength="100" show-word-limit />
      </el-form-item>
      <el-form-item label="问题描述">
        <el-input
          v-model="form.description"
          type="textarea"
          :rows="4"
          placeholder="请描述商品问题、期望的处理方式"
          maxlength="500"
          show-word-limit
        />
      </el-form-item>
      <el-form-item label="凭证图片">
        <el-upload
          :show-file-list="false"
          :http-request="uploadImage"
          accept="image/*"
        >
          <el-button>上传图片</el-button>
        </el-upload>
        <div class="previews" v-if="form.images.length">
          <div v-for="(img, i) in form.images" :key="i" class="preview">
            <el-image :src="img" class="preview-img" fit="cover" />
            <el-button link type="danger" size="small" @click="form.images.splice(i, 1)">删除</el-button>
          </div>
        </div>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="emit('update:modelValue', false)">取消</el-button>
      <el-button type="danger" :loading="submitting" @click="submit">提交申请</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import http from '../api'
import { afterSaleType } from '../utils/status'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  item: { type: Object, default: null }
})
const emit = defineEmits(['update:modelValue', 'submitted'])

const submitting = ref(false)
const form = ref(emptyForm())

function emptyForm() {
  return { type: 'RETURN_REFUND', title: '', description: '', images: [] }
}

watch(
  () => props.modelValue,
  (v) => {
    if (v) form.value = emptyForm()
  }
)

async function uploadImage(options) {
  const fd = new FormData()
  fd.append('file', options.file)
  try {
    const url = await http.post('/customer/upload', fd)
    form.value.images.push(url)
    ElMessage.success('图片已上传')
  } catch (e) {
    /* 拦截器已提示 */
  }
}

async function submit() {
  if (!form.value.title.trim()) return ElMessage.warning('请填写问题标题')
  if (!form.value.description.trim()) return ElMessage.warning('请填写问题描述')
  submitting.value = true
  try {
    await http.post('/customer/after-sales', {
      orderItemId: props.item.id,
      type: form.value.type,
      title: form.value.title.trim(),
      description: form.value.description.trim(),
      images: form.value.images
    })
    ElMessage.success('售后申请已提交，等待商家处理')
    emit('update:modelValue', false)
    emit('submitted')
  } catch (e) {
    /* 拦截器已提示 */
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.item { display: flex; gap: 12px; align-items: center; padding: 12px; background: #fdfbf8; border-radius: 8px; margin-bottom: 16px; }
.thumb { width: 54px; height: 54px; border-radius: 6px; flex: none; }
.name { color: #2b2622; }
.meta { font-size: 12px; color: #8a8178; margin-top: 4px; }
.previews { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 10px; }
.preview { text-align: center; }
.preview-img { width: 72px; height: 72px; border-radius: 6px; border: 1px solid #f0e9e0; }
</style>
