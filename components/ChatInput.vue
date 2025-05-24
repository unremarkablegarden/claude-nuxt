<template>
	<form @submit.prevent="handleSubmit" class="message-form">
		<textarea
			:value="modelValue"
			@input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
			@keydown.enter="handleKeyDown"
			placeholder="Type your message... [⌘↵]"
			class="message-input"
			:disabled="loading"
			rows="3"
			spellcheck="false"
		></textarea>
		<button type="submit" class="btn-primary btn-icon btn-send" :disabled="loading || !modelValue.trim()">
			<i class="ri-arrow-right-line"></i>
		</button>
	</form>
</template>

<script setup lang="ts">
const props = defineProps<{
	modelValue: string
	loading: boolean
}>()

const emit = defineEmits<{
	'update:modelValue': [value: string]
	'submit': []
}>()

const handleSubmit = () => {
	if (!props.modelValue.trim() || props.loading) return
	emit('submit')
}

const handleKeyDown = (event: KeyboardEvent) => {
	if (event.metaKey) {
		event.preventDefault()
		handleSubmit()
	}
}
</script>

<style>
.message-form {
	display: flex;
	gap: 0.5rem;
	padding: 1rem;
	background: black;
	/* height: 100%; */
	height: calc(100% - 2.5rem)
}

.message-input {
	flex: 1;
	background: black;
	border: 1px solid rgba(239, 229, 192, 0.5);
	border-radius: 0.25rem;
	padding: 0.5rem;
	color: #efe5c0;
	resize: none;
	height: 100%;
	min-height: 80px;
}

.message-input:focus {
	border-color: #efe5c0;
	outline: none;
}

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

.btn-send {
	height: 100%;
	align-self: stretch;
	width: 5rem;
}

.btn-icon:hover {
	color: #e5dbb6;
	border-color: rgba(239, 229, 192, 0.5);
	background: rgba(239, 229, 192, 0.05);
}

.btn-icon:disabled {
	opacity: 0.7;
	cursor: not-allowed;
	border-color: rgba(239, 229, 192, 0.5);
	color: rgba(239, 229, 192, 0.7);
}
</style> 