<template>
	<div class="modal">
		<div class="modal-content">
			<h3 class="modal-title">{{ title }}</h3>
			<template v-if="mode === 'overwrite'">
				<div class="modal-actions">
					<button @click="$emit('cancel')" class="btn-text">Cancel</button>
					<button @click="$emit('save')" class="btn-primary">Save</button>
				</div>
			</template>
			<template v-else>
				<input 
					v-model="chatName"
					type="text"
					placeholder="Enter chat name..."
					class="input"
					@keyup.enter="handleSave"
				>
				<div class="modal-actions">
					<button v-if="mode === 'new'" @click="$emit('skip')" class="btn-text">
						Don't Save
					</button>
					<button @click="$emit('cancel')" class="btn-text">Cancel</button>
					<button @click="handleSave" class="btn-primary" :disabled="!chatName.trim()">
						Save
					</button>
				</div>
			</template>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
	mode: 'new' | 'save' | 'overwrite'
	currentChatName: string | null
}>()

const emit = defineEmits<{
	'save': [name: string]
	'cancel': []
	'skip': []
}>()

const chatName = ref('')

const title = computed(() => {
	switch (props.mode) {
		case 'overwrite':
			return `Save over "${props.currentChatName}"?`
		case 'new':
			return 'Save current chat before starting new?'
		default:
			return 'Save Chat'
	}
})

const handleSave = () => {
	if (!chatName.value.trim()) return
	emit('save', chatName.value.trim())
}
</script> 