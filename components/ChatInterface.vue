<template>
	<div class="chat">
		<ChatHeader 
			:user-name="config.userName"
			:tokens="formatTokens"
			@new-chat="$emit('new-chat')"
			@configure="$emit('configure')"
			@save="$emit('save')"
			@load="$emit('load')"
		/>

		<div ref="messagesContainer" class="messages">
			<div v-for="(message, index) in messages" :key="index" class="message" :class="message.role === 'assistant' ? 'message-claude' : 'message-user'">
				<div class="message-author">{{ message.role === 'assistant' ? 'Claude' : config.userName }}</div>
				<div class="message-content">{{ message.content }}</div>
			</div>
			<div v-if="loading" class="message message-claude">
				<div class="message-author">Claude</div>
				<div class="message-content loading-dots">...</div>
			</div>
		</div>

		<ChatInput 
			v-model="input"
			:loading="loading"
			@submit="handleSubmit"
		/>

		<div v-if="lastUsage" class="usage-info">
			<div class="usage-stats">
				<span>Last message: {{ lastUsage.tokensK }}k tokens (${{ lastUsage.cost }})</span>
				<span class="usage-model">{{ currentModel }} · t={{ config.temperature }}</span>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useChat, MODELS } from '~/composables/useChat'
import ChatHeader from './ChatHeader.vue'
import ChatInput from './ChatInput.vue'

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

const currentModel = computed(() => {
	return MODELS.find(m => m.value === props.config.model)?.name || props.config.model
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
})

const handleSubmit = () => {
	if (!input.value.trim() || props.loading) return
	emit('submit', input.value)
	input.value = ''
}
</script>

<style>
.loading-dots {
	display: inline-block;
	animation: loadingDots 1.5s infinite;
}

@keyframes loadingDots {
	0% { opacity: .2; }
	20% { opacity: 1; }
	100% { opacity: .2; }
}
</style> 