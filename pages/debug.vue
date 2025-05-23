<template>
	<div class="debug-page">
		<h2>LocalStorage Debug</h2>
		<div class="debug-section">
			<div class="section-header">
				<h3>Saved Chats</h3>
				<button v-if="parsedChats.length > 0" @click="exportAll" class="btn-export">Export All</button>
			</div>
			<div v-for="(chat, index) in parsedChats" :key="index" class="chat-entry">
				<div class="chat-header" @click="toggleChat(index)">
					<span class="chat-name">{{ chat.name }}</span>
					<div class="chat-actions">
						<button @click.stop="exportChat(chat)" class="btn-export btn-sm">Export</button>
						<span class="toggle-icon">{{ expandedChats[index] ? '▼' : '▶' }}</span>
					</div>
				</div>
				<pre v-if="expandedChats[index]" class="chat-content">{{ JSON.stringify(chat, null, 2) }}</pre>
			</div>
		</div>
		<div class="debug-section">
			<h3>Current Config</h3>
			<pre>{{ currentConfig }}</pre>
		</div>
		<div class="debug-section">
			<h3>Current History</h3>
			<pre>{{ currentHistory }}</pre>
		</div>
		<div class="debug-section">
			<h3>Token Usage</h3>
			<pre>{{ tokenUsage }}</pre>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const savedChats = ref('')
const currentConfig = ref('')
const currentHistory = ref('')
const tokenUsage = ref('')
const expandedChats = ref<{ [key: number]: boolean }>({})
const parsedChats = ref<any[]>([])

const toggleChat = (index: number) => {
	expandedChats.value[index] = !expandedChats.value[index]
}

const exportChat = (chat: any) => {
	const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 16)
	const blob = new Blob([JSON.stringify(chat, null, 2)], { type: 'application/json' })
	const url = URL.createObjectURL(blob)
	const a = document.createElement('a')
	a.href = url
	a.download = `chat-${chat.name.toLowerCase().replace(/\s+/g, '-')}-${timestamp}.json`
	document.body.appendChild(a)
	a.click()
	document.body.removeChild(a)
	URL.revokeObjectURL(url)
}

const exportAll = () => {
	const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 16)
	const blob = new Blob([JSON.stringify(parsedChats.value, null, 2)], { type: 'application/json' })
	const url = URL.createObjectURL(blob)
	const a = document.createElement('a')
	a.href = url
	a.download = `all-chats-${timestamp}.json`
	document.body.appendChild(a)
	a.click()
	document.body.removeChild(a)
	URL.revokeObjectURL(url)
}

onMounted(() => {
	// Only run on client side
	if (process.client) {
		const chats = JSON.parse(localStorage.getItem('savedChats') || '[]')
		parsedChats.value = chats
		savedChats.value = JSON.stringify(chats, null, 2)
		currentConfig.value = JSON.stringify(JSON.parse(localStorage.getItem('chatConfig') || '{}'), null, 2)
		currentHistory.value = JSON.stringify(JSON.parse(localStorage.getItem('chatHistory') || '[]'), null, 2)
		tokenUsage.value = JSON.stringify(JSON.parse(localStorage.getItem('tokenUsage') || '{}'), null, 2)
	}
})
</script>

<style>
.debug-page {
	padding: 2rem;
	color: #efe5c0;
	background: black;
	min-height: 100vh;
}

.debug-section {
	margin-bottom: 2rem;
}

.debug-section h3 {
	margin-bottom: 0.5rem;
	font-size: 1.25rem;
}

.section-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 1rem;
}

pre {
	background: rgba(239, 229, 192, 0.05);
	padding: 1rem;
	border: 1px solid rgba(239, 229, 192, 0.3);
	border-radius: 4px;
	overflow-x: auto;
	white-space: pre-wrap;
	font-family: 'JetBrains Mono', monospace;
	font-size: 0.875rem;
	line-height: 1.5;
}

.chat-entry {
	margin-bottom: 0.5rem;
}

.chat-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 0.5rem 1rem;
	background: rgba(239, 229, 192, 0.05);
	border: 1px solid rgba(239, 229, 192, 0.3);
	border-radius: 4px;
	cursor: pointer;
	transition: background-color 0.2s ease;
}

.chat-header:hover {
	background: rgba(239, 229, 192, 0.1);
}

.chat-name {
	font-weight: 500;
}

.chat-actions {
	display: flex;
	align-items: center;
	gap: 1rem;
}

.toggle-icon {
	opacity: 0.7;
	font-size: 0.75rem;
}

.chat-content {
	margin-top: 0.5rem;
	margin-left: 1rem;
}

.btn-export {
	background: rgba(239, 229, 192, 0.1);
	border: 1px solid rgba(239, 229, 192, 0.3);
	border-radius: 4px;
	padding: 0.25rem 0.75rem;
	color: #efe5c0;
	cursor: pointer;
	transition: all 0.2s ease;
}

.btn-export:hover {
	background: rgba(239, 229, 192, 0.2);
	border-color: rgba(239, 229, 192, 0.5);
}

.btn-sm {
	padding: 0.125rem 0.5rem;
	font-size: 0.75rem;
}
</style> 