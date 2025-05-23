<template>
	<div class="error-page">
		<div class="error-container">
			<div class="error-header">
				<span class="error-code">{{ error.statusCode }}</span>
				<span class="error-message">{{ error.message || 'Something went wrong' }}</span>
			</div>
			
			<div class="error-details">
				<div class="terminal-line">
					<span class="prompt">$</span>
					<span class="command">error.details</span>
				</div>
				<div class="terminal-output">
					<pre>{{ errorDetails }}</pre>
				</div>
			</div>

			<div class="error-actions">
				<button @click="handleError" class="btn-primary">
					<i class="ri-home-line"></i>
					Go Home
				</button>
				<button @click="handleRetry" class="btn-text" v-if="error.statusCode === 404">
					<i class="ri-refresh-line"></i>
					Retry
				</button>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
const props = defineProps<{
	error: {
		statusCode: number
		message?: string
		stack?: string
	}
}>()

const errorDetails = computed(() => {
	const details = {
		statusCode: props.error.statusCode,
		message: props.error.message || 'Unknown error',
		timestamp: new Date().toISOString(),
		path: window.location.pathname
	}
	return JSON.stringify(details, null, 2)
})

const handleError = () => {
	clearError({ redirect: '/' })
}

const handleRetry = () => {
	window.location.reload()
}
</script>

<style>
.error-page {
	min-height: 100vh;
	display: flex;
	align-items: center;
	justify-content: center;
	background: black;
	color: #efe5c0;
	padding: 2rem;
}

.error-container {
	max-width: 800px;
	width: 100%;
	background: rgba(239, 229, 192, 0.05);
	border: 1px solid rgba(239, 229, 192, 0.3);
	border-radius: 0.5rem;
	padding: 2rem;
}

.error-header {
	display: flex;
	align-items: center;
	gap: 1rem;
	margin-bottom: 2rem;
	padding-bottom: 1rem;
	border-bottom: 1px solid rgba(239, 229, 192, 0.3);
}

.error-code {
	font-size: 2rem;
	font-weight: 500;
	color: #efe5c0;
}

.error-message {
	font-size: 1.25rem;
	opacity: 0.75;
}

.error-details {
	background: rgba(0, 0, 0, 0.3);
	border: 1px solid rgba(239, 229, 192, 0.2);
	border-radius: 0.25rem;
	padding: 1rem;
	margin-bottom: 2rem;
}

.terminal-line {
	display: flex;
	gap: 0.5rem;
	margin-bottom: 0.5rem;
}

.prompt {
	color: #efe5c0;
	opacity: 0.75;
}

.command {
	color: #efe5c0;
}

.terminal-output {
	font-family: 'JetBrains Mono', monospace;
	font-size: 0.875rem;
	line-height: 1.5;
	white-space: pre-wrap;
	opacity: 0.75;
}

.error-actions {
	display: flex;
	gap: 1rem;
	justify-content: flex-end;
}

.btn-primary {
	display: inline-flex;
	align-items: center;
	gap: 0.5rem;
	background: transparent;
	border: 1px solid rgba(239, 229, 192, 0.5);
	color: #efe5c0;
	padding: 0.5rem 1rem;
	border-radius: 0.25rem;
	cursor: pointer;
	transition: all 0.2s ease;
}

.btn-primary:hover {
	background: rgba(239, 229, 192, 0.1);
	border-color: #efe5c0;
}

.btn-text {
	display: inline-flex;
	align-items: center;
	gap: 0.5rem;
	background: transparent;
	border: none;
	color: rgba(239, 229, 192, 0.5);
	padding: 0.5rem 1rem;
	cursor: pointer;
	transition: all 0.2s ease;
}

.btn-text:hover {
	color: #efe5c0;
}

/* Terminal-style animations */
@keyframes blink {
	0%, 100% { opacity: 1; }
	50% { opacity: 0; }
}

.prompt::after {
	content: '>';
	display: inline-block;
	margin-left: 0.25rem;
	opacity: 0.75;
}
</style> 