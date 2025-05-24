<template>
	<div class="chat">
		<ChatHeader 
			:user-name="config.userName"
			:tokens="formatTokens"
			:active-tab="activeTab"
			:is-sidebar-open="isSidebarOpen"
			:current-chat-name="currentChatName"
			:is-modified="isModified"
			@new-chat="$emit('new-chat')"
			@configure="$emit('configure')"
			@save="$emit('save')"
			@load="$emit('load')"
		/>

		<div ref="messagesContainer" class="messages">
			<div v-for="(message, index) in messages" :key="index" class="message" :class="message.role === 'assistant' ? 'message-claude' : 'message-user'">
				<div class="message-inner">
					<div class="message-author">{{ message.role === 'assistant' ? 'Claude' : config.userName }}</div>
					<MarkdownMessage :content="message.content" />
				</div>
			</div>
			<div v-if="loading" class="message message-claude">
				<div class="message-inner">
					<div class="message-author">Claude</div>
					<MarkdownMessage content="<span class='typing-dots'><span>.</span><span>.</span><span>.</span></span>" />
				</div>
			</div>
		</div>

		<div 
			ref="chatBottom" 
			class="chat-bottom"
			:class="{ resizing: isResizing }"
			@mousedown="handleResizeStart"
		>
			<ChatInput 
				v-model="input"
				:loading="loading"
				@submit="handleSubmit"
			/>

			<div v-if="lastUsage" class="usage-info">
				<div class="usage-stats">
					<span>Last message: {{ lastUsage.tokensK }}k tokens (${{ lastUsage.cost }}) · {{ messages.length }} messages</span>
					<span class="usage-model">{{ currentModel }} · t={{ config.temperature }}</span>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useChat, MODELS } from '~/composables/useChat'
import ChatHeader from './ChatHeader.vue'
import ChatInput from './ChatInput.vue'
import MarkdownMessage from './MarkdownMessage.vue'

const props = defineProps<{
	messages: any[]
	config: any
	loading: boolean
	lastUsage: any
	formatTokens: {
		total: {
			tokensK: string
			cost: string
		}
	}
	activeTab: string
	isSidebarOpen: boolean
	currentChatName?: string | null
	isModified?: boolean
}>()

const emit = defineEmits<{
	'new-chat': []
	'configure': []
	'save': []
	'load': []
	'submit': [message: string]
}>()

const input = ref('')
const messagesContainer = ref<HTMLElement | null>(null)
const chatBottom = ref<HTMLElement | null>(null)
const isResizing = ref(false)
const startY = ref(0)
const startHeight = ref(0)

// Watch for height changes in chat bottom panel
watch(() => chatBottom.value?.offsetHeight, (newHeight) => {
	if (messagesContainer.value && newHeight) {
		messagesContainer.value.style.paddingBottom = `${newHeight + 16}px` // Add 16px for extra spacing
	}
}, { immediate: true })

const currentModel = computed(() => {
	return MODELS.value.find(m => m.value === props.config.model)?.name || props.config.model
})

const formatTokens = computed(() => {
	// Assuming this is passed from parent
	return props.formatTokens
})

const scrollToBottom = async (force = false) => {
	await nextTick()
	if (messagesContainer.value) {
		const container = messagesContainer.value
		const isScrolledToBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 100
		
		if (force || isScrolledToBottom) {
			// First snap to top
			// container.scrollTo({
			// 	top: 0,
			// 	behavior: 'auto'
			// })
			
			// Then scroll to bottom with animation
			container.scrollTo({
				top: container.scrollHeight,
				behavior: 'smooth'
			})
		}
	}
}

// Auto-scroll when new messages are added or loading state changes
watch([() => props.messages.length, () => props.loading], () => {
	scrollToBottom(true)
})

// Scroll to bottom on initial mount
onMounted(() => {
	scrollToBottom(true)
	if (chatBottom.value && messagesContainer.value) {
		messagesContainer.value.style.paddingBottom = `${chatBottom.value.offsetHeight + 16}px`
	}
})

const handleSubmit = () => {
	if (!input.value.trim() || props.loading) return
	emit('submit', input.value)
	input.value = ''
}

const handleResizeStart = (e: MouseEvent) => {
	// Only start resize if clicking near the top border
	if (e.offsetY > 8) return
	
	isResizing.value = true
	startY.value = e.clientY
	if (chatBottom.value) {
		startHeight.value = chatBottom.value.offsetHeight
	}
	document.addEventListener('mousemove', handleResizeMove)
	document.addEventListener('mouseup', handleResizeEnd)
}

const handleResizeMove = (e: MouseEvent) => {
	if (!isResizing.value || !chatBottom.value || !messagesContainer.value) return
	
	const deltaY = startY.value - e.clientY
	const newHeight = Math.min(Math.max(startHeight.value + deltaY, 8 * 16), window.innerHeight * 0.5)
	chatBottom.value.style.height = `${newHeight}px`
	messagesContainer.value.style.paddingBottom = `${newHeight + 16}px`
	
	// Prevent horizontal movement
	e.preventDefault()
}

const handleResizeEnd = () => {
	isResizing.value = false
	document.removeEventListener('mousemove', handleResizeMove)
	document.removeEventListener('mouseup', handleResizeEnd)
	// Scroll to bottom after resize to ensure last messages are visible
	scrollToBottom(true)
}

onUnmounted(() => {
	document.removeEventListener('mousemove', handleResizeMove)
	document.removeEventListener('mouseup', handleResizeEnd)
})
</script>

<style>
.typing-dots span {
	opacity: 0;
	animation: typingDot 1.4s infinite;
	display: inline-block;
}

.typing-dots span:nth-child(2) {
	animation-delay: 0.2s;
}

.typing-dots span:nth-child(3) {
	animation-delay: 0.4s;
}

@keyframes typingDot {
	0% { opacity: 0; }
	50% { opacity: 1; }
	100% { opacity: 0; }
}

.chat {
	height: 100%;
	display: flex;
	flex-direction: column;
	position: relative;
}

.messages {
	flex: 1;
	overflow-y: auto;
	padding: 1rem;
	display: flex;
	flex-direction: column;
	gap: 1rem;
}

.chat-bottom {
	position: absolute;
	bottom: 0;
	left: 0;
	right: 0;
	background: black;
	border-top: 1px solid rgba(239, 229, 192, 0.3);
	z-index: 10;
	min-height: 8rem;
	max-height: 50vh;
	height: 12rem;
	overflow: auto;
	cursor: ns-resize;
}

.chat-bottom:hover {
	border-top-color: rgba(239, 229, 192, 0.3);
}

/* Remove the separate resize handle */
.resize-handle {
	display: none;
}

/* Add a visual indicator when resizing */
.chat-bottom.resizing {
	user-select: none;
	border-top-color: rgba(239, 229, 192, 0.3);
}

.chat-bottom.resizing .resize-handle::after {
	background: rgba(239, 229, 192, 0.3);
}
</style> 