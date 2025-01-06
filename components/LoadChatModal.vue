<template>
	<div class="modal">
		<div class="modal-content">
			<h3 class="modal-title">Load Chat</h3>
			<div class="saved-chats">
				<div v-for="chat in sortedChats" :key="chat.name" class="saved-chat">
					<div>
						<div class="saved-chat-name">{{ chat.name }}</div>
						<div class="saved-chat-info">
							<span class="saved-chat-date">{{ chat.date }}</span>
						</div>
					</div>
					<div class="saved-chat-actions">
						<button @click="$emit('load', chat.name)" class="btn-primary btn-sm">Load</button>
						<button @click="handleDelete(chat.name)" class="btn-danger btn-sm">Delete</button>
					</div>
				</div>
				<div v-if="sortedChats.length === 0" class="no-chats">
					No saved chats
				</div>
			</div>
			<div class="modal-actions">
				<button @click="$emit('close')" class="btn-text">Close</button>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
	savedChats: Array<{
		name: string
		date: string
	}>
}>()

const emit = defineEmits<{
	'load': [name: string]
	'delete': [name: string]
	'close': []
}>()

const sortedChats = computed(() => {
	return [...props.savedChats].sort((a, b) => b.date.localeCompare(a.date))
})

const handleDelete = (name: string) => {
	if (confirm('Are you sure you want to delete this chat?')) {
		emit('delete', name)
	}
}
</script> 