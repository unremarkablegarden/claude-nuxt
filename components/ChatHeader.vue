<template>
	<div class="header">
		<div class="actions">
			<button @click="$emit('new-chat')" class="btn-icon" title="New Chat">
				<i class="ri-add-line"></i>
			</button>
			<button @click="$emit('configure')" class="btn-icon" title="Configure">
				<i class="ri-settings-3-line"></i>
			</button>
			<button @click="$emit('save')" class="btn-icon" title="Save Chat">
				<i class="ri-save-line"></i>
			</button>
			<button @click="$emit('load')" class="btn-icon" title="Load Chat">
				<i class="ri-folder-open-line"></i>
			</button>
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

.actions {
	display: flex;
	gap: 0.5rem;
}
</style> 