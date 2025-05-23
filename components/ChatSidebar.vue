<template>
	<div class="sidebar-container">
		<div class="sidebar" :class="{ 'sidebar-open': isOpen }" :style="{ width: `${sidebarWidth}px` }">
			<div class="sidebar-content">
				<div class="sidebar-header">
					<h3 class="sidebar-title">{{ headerTitle }}</h3>
				</div>

				<!-- Settings Section -->
				<div v-if="activeTab === 'settings'" class="sidebar-section">
					<form @submit.prevent="handleConfigSubmit" class="form">
						<div class="form-group">
							<label class="label">Name:</label>
							<input v-model="tempConfig.userName" type="text" required class="input">
						</div>
						<div class="form-group">
							<label class="label">Model:</label>
							<select v-model="tempConfig.model" required class="input">
								<option v-for="model in sortedModels" :key="model.value" :value="model.value">
									{{ model.name }}
								</option>
							</select>
						</div>
						<div class="form-group">
							<label class="label">Max History:</label>
							<input v-model.number="tempConfig.maxHistory" type="number" min="1" max="1000" required class="input">
						</div>
						<div class="form-group">
							<label class="label">Temperature:</label>
							<input v-model.number="tempConfig.temperature" type="number" min="0" max="1" step="0.1" required class="input">
						</div>
						<div class="form-group">
							<label class="label">System Prompt:</label>
							<textarea v-model="tempConfig.systemPrompt" class="input" rows="3"></textarea>
						</div>
						<div class="sidebar-actions">
							<button type="submit" class="btn-primary">Save Configuration</button>
						</div>
					</form>
				</div>

				<!-- Load Chat Section -->
				<div v-if="activeTab === 'load'" class="sidebar-section">
					<div class="saved-chats">
						<div v-for="chat in sortedChats" :key="chat.name" class="saved-chat" :class="{ 'saved-chat-active': chat.name === currentChatName }">
							<div>
								<div class="saved-chat-name">{{ chat.name }}</div>
								<div class="saved-chat-info">
									<span class="saved-chat-date">{{ chat.date }}</span>
									<span class="saved-chat-model">{{ chat.config.model }}</span>
									<template v-if="chat.totalTokens?.inputTokens && chat.totalTokens?.outputTokens">
										<span class="saved-chat-tokens">{{ (chat.totalTokens.inputTokens + chat.totalTokens.outputTokens) / 1000 }}k tokens</span>
										<span v-if="chat.totalTokens.cost > 0" class="saved-chat-cost">${{ chat.totalTokens.cost.toFixed(3) }}</span>
									</template>
								</div>
							</div>
							<div class="saved-chat-actions">
								<button @click="$emit('load', chat.name)" class="btn-primary btn-sm" title="Load Chat">
									<i class="ri-folder-open-line"></i>
								</button>
								<button @click="$emit('delete', chat.name)" class="btn-danger btn-sm" title="Delete Chat">
									<i class="ri-delete-bin-line"></i>
								</button>
							</div>
						</div>
						<div v-if="sortedChats.length === 0" class="no-chats">
							No saved chats
						</div>
					</div>
				</div>

				<!-- Save Chat Section -->
				<div v-if="activeTab === 'save'" class="sidebar-section">
					<template v-if="mode === 'overwrite'">
						<div class="save-options">
							<button @click="$emit('close')" class="btn-text">Cancel</button>
							<button @click="handleSaveAs" class="btn-text">Save As...</button>
							<button @click="$emit('save', currentChatName)" class="btn-primary">Save</button>
						</div>
					</template>
					<template v-else-if="chatToLoad">
						<div class="save-options">
							<button @click="$emit('close')" class="btn-text">Cancel</button>
							<button @click="$emit('skip')" class="btn-text">Discard</button>
							<button @click="handleSaveAs" class="btn-text">Save As...</button>
							<button @click="$emit('save', currentChatName)" class="btn-primary">Save</button>
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
						<div class="sidebar-actions">
							<button v-if="mode === 'new'" @click="$emit('skip')" class="btn-text">
								Don't Save
							</button>
							<button @click="$emit('close')" class="btn-text">Cancel</button>
							<button @click="handleSave" class="btn-primary" :disabled="!chatName.trim()">
								Save
							</button>
						</div>
					</template>
				</div>
			</div>
			<div 
				v-if="isOpen"
				class="resize-handle"
				@mousedown="startResize"
			></div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { MODELS } from '~/composables/useChat'

const props = defineProps<{
	isOpen: boolean
	activeTab: 'settings' | 'load' | 'save' | 'new'
	config?: any
	isConfigured?: boolean
	currentChatName?: string | null
	savedChats?: Array<{
		name: string
		date: string
		config: {
			model: string
		}
		totalTokens?: {
			inputTokens: number
			outputTokens: number
			cost: number
		}
	}>
	mode?: 'new' | 'save' | 'overwrite'
	chatToLoad?: string | null
}>()

const emit = defineEmits<{
	'close': []
	'update': [config: any]
	'load': [name: string]
	'delete': [name: string]
	'save': [name: string]
	'cancel': []
	'skip': []
	'resize': [width: number]
	'save-as': []
}>()

const tempConfig = ref(props.config ? { ...props.config } : {})
const chatName = ref('')
const sidebarWidth = ref(400) // Default width
const isResizing = ref(false)
const startX = ref(0)
const startWidth = ref(0)

const startResize = (e: MouseEvent) => {
	isResizing.value = true
	startX.value = e.clientX
	startWidth.value = sidebarWidth.value
	document.addEventListener('mousemove', handleMouseMove)
	document.addEventListener('mouseup', stopResize)
}

const handleMouseMove = (e: MouseEvent) => {
	if (!isResizing.value) return
	const deltaX = e.clientX - startX.value
	const newWidth = Math.max(300, Math.min(800, startWidth.value + deltaX))
	sidebarWidth.value = newWidth
	emit('resize', newWidth)
}

const stopResize = () => {
	isResizing.value = false
	document.removeEventListener('mousemove', handleMouseMove)
	document.removeEventListener('mouseup', stopResize)
}

onUnmounted(() => {
	document.removeEventListener('mousemove', handleMouseMove)
	document.removeEventListener('mouseup', stopResize)
})

// Sort models by total price (input + output)
const sortedModels = computed(() => {
	return [...MODELS.value].sort((a, b) => {
		const priceA = a.priceInput + a.priceOutput
		const priceB = b.priceInput + b.priceOutput
		return priceB - priceA // Sort descending (most expensive first)
	})
})

const sortedChats = computed(() => {
	if (!props.savedChats) return []
	return [...props.savedChats].sort((a, b) => b.date.localeCompare(a.date))
})

const headerTitle = computed(() => {
	switch (props.activeTab) {
		case 'settings':
			return 'Configuration'
		case 'load':
			return 'Load Chat'
		case 'save':
			return title.value
		default:
			return ''
	}
})

const title = computed(() => {
	if (!props.mode) return ''
	switch (props.mode) {
		case 'overwrite':
			return `Save changes to "${props.currentChatName}"?`
		case 'new':
			return 'Save current chat?'
		default:
			return 'Save Chat'
	}
})

const handleConfigSubmit = () => {
	emit('update', tempConfig.value)
	emit('close')
}

const handleSave = () => {
	if (!chatName.value.trim()) return
	emit('save', chatName.value.trim())
}

const handleSaveAs = () => {
	chatName.value = props.currentChatName || ''
	emit('save-as')
}
</script>

<style>
.sidebar-container {
	position: relative;
}

.sidebar {
	position: fixed;
	top: 0;
	left: 0;
	height: 100vh;
	background: black;
	border-right: 1px solid rgba(239, 229, 192, 0.3);
	transform: translateX(-100%);
	z-index: 1000;
	display: flex;
	user-select: none;
	transition: transform 0.2s ease;
}

.sidebar-open {
	transform: translateX(0);
}

.sidebar-content {
	height: 100%;
	display: flex;
	flex-direction: column;
	flex: 1;
	overflow: hidden;
}

.resize-handle {
	width: 4px;
	height: 100%;
	background: transparent;
	cursor: col-resize;
	position: absolute;
	right: 0;
	top: 0;
}

.resize-handle:hover {
	background: rgba(239, 229, 192, 0.1);
}

.sidebar-header {
	padding: 1rem;
	display: flex;
	justify-content: space-between;
	align-items: center;
	border-bottom: 1px solid rgba(239, 229, 192, 0.3);
	height: 4.5rem;
}

.sidebar-title {
	font-size: 1.125rem;
	margin: 0;
}

.current-chat-name {
	font-size: 0.875rem;
	opacity: 0.75;
	margin-top: 0.25rem;
}

.sidebar-section {
	padding: 1rem;
	flex: 1;
	overflow-y: auto;
}

.sidebar-actions {
	display: flex;
	justify-content: flex-end;
	gap: 0.5rem;
	margin-top: 1rem;
}

.form {
	display: flex;
	flex-direction: column;
	gap: 1rem;
	user-select: text;
}

.form-group {
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
}

.label {
	font-size: 0.875rem;
	opacity: 0.75;
}

.input {
	background: black;
	border: 1px solid rgba(239, 229, 192, 0.5);
	border-radius: 0.25rem;
	padding: 0.5rem;
	color: #efe5c0;
	width: 100%;
	user-select: text;
}

.input:focus {
	border-color: #efe5c0;
}

.saved-chats {
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
}

.saved-chat {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	border: 1px solid rgba(239, 229, 192, 0.5);
	padding: 0.75rem;
	border-radius: 0.25rem;
	transition: border-color 0.2s ease;
}

.saved-chat-active {
	border-color: #efe5c0;
	background: rgba(239, 229, 192, 0.05);
}

.saved-chat-name {
	font-weight: 500;
	margin-bottom: 0.25rem;
}

.saved-chat-info {
	display: flex;
	flex-direction: column;
	gap: 0.25rem;
	font-size: 0.75rem;
	opacity: 0.75;
}

.saved-chat-date {
	color: rgba(239, 229, 192, 0.75);
}

.saved-chat-model {
	color: rgba(239, 229, 192, 0.5);
}

.saved-chat-tokens,
.saved-chat-cost {
	color: rgba(239, 229, 192, 0.5);
	display: inline-block;
}

.saved-chat-tokens {
	margin-right: 0.5rem;
}

.saved-chat-actions {
	display: flex;
	gap: 0.5rem;
	margin-left: 1rem;
}

.saved-chat-actions button {
	width: 2.5rem;
	height: 2.5rem;
	display: inline-flex;
	align-items: center;
	justify-content: center;
}

.saved-chat-actions button i {
	font-size: 1.25rem;
}

.no-chats {
	text-align: center;
	padding: 1rem;
	opacity: 0.75;
}

.save-options {
	display: flex;
	justify-content: flex-end;
	gap: 0.5rem;
}

.btn-danger {
	color: #ef5c5c;
	background: transparent;
	border: 1px solid #ef5c5c;
	border-radius: 4px;
	transition: all 0.2s ease;
}

.btn-danger:hover {
	background: rgba(239, 92, 92, 0.1);
}
</style> 