<template>
	<div class="debug-page">
		<div v-if="error" class="error-message">
			{{ error }}
		</div>
		
		<div v-else-if="loading" class="loading-message">
			Loading tool context...
		</div>
		
		<div v-else class="debug-content">
			<div class="tool-info">
				<h1 class="tool-name">{{ tool?.name }}</h1>
				<p class="tool-description">{{ tool?.description }}</p>
			</div>

			<div class="context-section">
				<h2 class="section-title">Context History</h2>
				<div class="message-list">
					<div v-for="(message, index) in context?.history" :key="index" 
						class="message"
					>
						<div class="message-header">
							<span class="message-role" :class="message.role">
								{{ message.role }}
							</span>
						</div>
						<pre class="message-content">{{ message.content }}</pre>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import type { ToolConfig } from '~/ai-tools/config/tools'

interface ToolContext {
	history: Array<{
		role: 'system' | 'user' | 'assistant'
		content: string
	}>
}

const route = useRoute()
const toolId = route.params.id as string

const loading = ref(true)
const error = ref<string | null>(null)
const tool = ref<ToolConfig | null>(null)
const context = ref<ToolContext | null>(null)

onMounted(async () => {
	try {
		const response = await $fetch(`/api/tools/${toolId}/context`)
		tool.value = response.tool
		context.value = response.context
	} catch (e) {
		error.value = e instanceof Error ? e.message : 'Failed to load tool context'
	} finally {
		loading.value = false
	}
})
</script>

<style lang="scss">
.debug-page {
	padding: 1rem;
}

.error-message {
	color: #ef5c5c;
	margin-bottom: 1rem;
}

.loading-message {
	color: rgba(239, 229, 192, 0.75);
}

.debug-content {
	display: flex;
	flex-direction: column;
	gap: 1.5rem;
}

.tool-info {
	background: black;
	border: 1px solid rgba(239, 229, 192, 0.3);
	border-radius: 0.25rem;
	padding: 1rem;
}

.tool-name {
	font-size: 1.5rem;
	font-weight: 500;
	margin-bottom: 0.5rem;
	color: rgba(239, 229, 192, 0.9);
}

.tool-description {
	color: rgba(239, 229, 192, 0.75);
}

.context-section {
	background: black;
	border: 1px solid rgba(239, 229, 192, 0.3);
	border-radius: 0.25rem;
	padding: 1rem;
}

.section-title {
	font-size: 1.125rem;
	font-weight: 500;
	margin-bottom: 1rem;
	color: rgba(239, 229, 192, 0.9);
	margin-top: 0;
}

.message-list {
	display: flex;
	flex-direction: column;
	gap: 1rem;
}

.message {
	background: rgba(239, 229, 192, 0.05);
	border: 1px solid rgba(239, 229, 192, 0.3);
	border-radius: 0.25rem;
	padding: 0.75rem;
}

.message-header {
	margin-bottom: 0.5rem;
}

.message-role {
	display: inline-block;
	padding: 0.25rem 0.5rem;
	border-radius: 0.25rem;
	font-size: 0.75rem;
	font-weight: 500;

	&.system {
		background: rgba(59, 130, 246, 0.2);
		color: rgba(59, 130, 246, 0.9);
	}

	&.user {
		background: rgba(239, 229, 192, 0.1);
		color: rgba(239, 229, 192, 0.9);
	}

	&.assistant {
		background: rgba(34, 197, 94, 0.2);
		color: rgba(34, 197, 94, 0.9);
	}
}

.message-content {
	margin: 0;
	white-space: pre-wrap;
	font-size: 0.875rem;
	color: rgba(239, 229, 192, 0.9);
	font-family: 'JetBrains Mono', monospace;
}
</style> 