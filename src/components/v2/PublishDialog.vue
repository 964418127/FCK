<template>
  <el-dialog
    :model-value="modelValue"
    title="发布新版本"
    width="620px"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <div class="pd">
      <div class="pd-head">
        <span class="from">当前 v{{ event?.currentVersion || 0 }}</span>
        <span class="arrow">→</span>
        <span class="to">v{{ (event?.currentVersion || 0) + 1 }}</span>
        <span class="sum">
          共 {{ diff.length }} 处改动：新增 {{ count.add }} · 删除 {{ count.del }} · 修改 {{ count.mod }}
        </span>
      </div>

      <div v-if="!diff.length" class="nothing">
        草稿和已发布版本没有差异，不用发布。
      </div>

      <div v-else class="diff-list">
        <div v-for="(d, i) in diff" :key="i" class="diff-row" :class="d.kind">
          <el-checkbox v-model="adopted[i]" size="small" />
          <span class="k">{{ kindText(d.kind) }}</span>
          <span class="scope">{{ scopeText(d.scope) }}</span>
          <span class="txt">{{ d.detail }}</span>
          <span class="tgt">{{ d.title }}</span>
        </div>
      </div>

      <div class="note-row">
        <label>发布说明</label>
        <el-input v-model="note" size="small" placeholder="例：面谈增加「是否愿意再入职」采集" maxlength="40" />
      </div>

      <div class="foot-tip">
        发布后只增不改：在途单仍跑发起时的快照，新单才用 v{{ (event?.currentVersion || 0) + 1 }}。
      </div>
    </div>

    <template #footer>
      <el-button size="small" @click="$emit('update:modelValue', false)">取消</el-button>
      <el-button size="small" type="primary" :disabled="!diff.length" @click="submit">发布 v{{ (event?.currentVersion || 0) + 1 }}</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
  modelValue: Boolean,
  event: { type: Object, default: null },
  diff: { type: Array, default: () => [] }
})
const emit = defineEmits(['update:modelValue', 'submit'])

const adopted = ref([])
const note = ref('')

watch(
  () => [props.modelValue, props.diff],
  () => {
    if (props.modelValue) {
      adopted.value = props.diff.map(() => true)
      note.value = ''
    }
  },
  { immediate: true }
)

const count = computed(() => ({
  add: props.diff.filter((d) => d.kind === 'add').length,
  del: props.diff.filter((d) => d.kind === 'del').length,
  mod: props.diff.filter((d) => d.kind === 'mod').length
}))

const kindText = (k) => ({ add: '新增', del: '删除', mod: '修改' }[k] || k)
const scopeText = (s) => ({ sub: '子事件', item: '事项', field: '字段' }[s] || s)

function submit () {
  const picked = props.diff.filter((_, i) => adopted.value[i])
  emit('submit', { note: note.value.trim(), adopted: picked })
  emit('update:modelValue', false)
}
</script>

<style scoped>
.pd { display: flex; flex-direction: column; gap: 12px; }
.pd-head { display: flex; align-items: center; gap: 8px; font-size: 12.5px; }
.pd-head .from { color: #8a8f99; }
.pd-head .arrow { color: #b0aebe; }
.pd-head .to { font-weight: 600; color: #534ab7; }
.pd-head .sum { margin-left: auto; font-size: 11.5px; color: #8a8f99; }

.nothing { font-size: 12.5px; color: #a3a0a1; background: #fafafb; border: 1px dashed #ececf0; border-radius: 10px; padding: 18px; text-align: center; }

.diff-list { max-height: 320px; overflow-y: auto; border: 1px solid #ececf0; border-radius: 10px; }
.diff-row { display: flex; align-items: center; gap: 8px; padding: 6px 10px; border-bottom: 1px solid #f4f4f7; }
.diff-row:last-child { border-bottom: none; }
.diff-row .k { font-size: 10.5px; border-radius: 6px; padding: 1px 6px; flex-shrink: 0; }
.diff-row.add .k { color: #0f6e56; background: #e1f5ee; }
.diff-row.del .k { color: #b23b3b; background: #fdecec; }
.diff-row.mod .k { color: #9a6b00; background: #fdf6e7; }
.diff-row .scope { font-size: 11px; color: #a3a0a1; width: 38px; flex-shrink: 0; }
.diff-row .txt { font-size: 12px; color: #333; flex: 1; }
.diff-row .tgt { font-size: 11px; color: #b0aebe; max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.note-row { display: flex; align-items: center; gap: 10px; }
.note-row label { font-size: 12.5px; color: #5f6368; flex-shrink: 0; }
.foot-tip { font-size: 11.5px; color: #a3a0a1; line-height: 1.7; }
</style>
