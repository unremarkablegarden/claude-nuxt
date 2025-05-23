<template>
	<div class="header">
		<div class="actions">
			<button @click="$emit('new-chat')" class="btn-icon" :class="{ 'active': activeTab === 'new' && isSidebarOpen }" title="New Chat">
				<i class="ri-add-line"></i>
			</button>
			<button @click="$emit('configure')" class="btn-icon" :class="{ 'active': activeTab === 'settings' && isSidebarOpen }" title="Configure">
				<i class="ri-settings-3-line"></i>
			</button>
			<button @click="$emit('save')" class="btn-icon" :class="{ 'active': activeTab === 'save' && isSidebarOpen }" title="Save Chat">
				<i class="ri-save-line"></i>
			</button>
			<button @click="$emit('load')" class="btn-icon" :class="{ 'active': activeTab === 'load' && isSidebarOpen }" title="Load Chat">
				<i class="ri-folder-open-line"></i>
			</button>
		</div>
		<div class="chat-name">
			<template v-if="currentChatName">
				<span :class="{ 'modified': isModified }">{{ currentChatName }}</span>
			</template>
			<template v-else><i>Unsaved</i></template>
		</div>
		<div class="stats">
			<span>{{ userName }}</span>
			<span v-if="tokens?.total">{{ tokens.total.tokensK }}k tokens (${{ tokens.total.cost }})</span>
		</div>
	</div>
</template>

<script setup lang="ts">
interface TokenFormat {
	total: {
		tokensK: string
		cost: string
	}
}

defineProps<{
	userName: string
	tokens: TokenFormat
	activeTab: string
	isSidebarOpen: boolean
	currentChatName?: string | null
	isModified?: boolean
}>()

defineEmits<{
	'new-chat': []
	'configure': []
	'save': []
	'load': []
}>()
</script>

<style>
.btn-icon {
	color: #efe5c0;
	padding: 0.5rem;
	border: 1px solid rgba(239, 229, 192, 0.3);
	border-radius: 4px;
	transition: all 0.2s ease;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 2.5rem;
	height: 2.5rem;
	font-size: 1.25rem;
}

.btn-icon:hover {
	color: #e5dbb6;
	border-color: rgba(239, 229, 192, 0.5);
	background: rgba(239, 229, 192, 0.05);
}

.btn-icon.active {
	color: #e5dbb6;
	border-color: #efe5c0;
	background: rgba(239, 229, 192, 0.1);
}

.actions {
	display: flex;
	gap: 0.5rem;
}

.header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 1rem;
	border-bottom: 1px solid rgba(239, 229, 192, 0.3);
	height: 4.5rem;
}

.chat-name {
	font-size: 1.125rem;
	opacity: 0.75;
	text-align: center;
	flex: 1;
	margin: 0 1rem;
	font-weight: 500;
}

.chat-name .modified {
	font-style: italic;
}
</style> 