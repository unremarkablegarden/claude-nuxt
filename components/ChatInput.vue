<template>
	<form @submit.prevent="handleSubmit" class="message-form">
		<input
			:value="modelValue"
			@input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
			type="text"
			placeholder="Type your message..."
			class="message-input"
			:disabled="loading"
		>
		<button type="submit" class="btn-primary" :disabled="loading || !modelValue.trim()">
			Send
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
</script> 