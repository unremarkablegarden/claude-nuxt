<template>
	<div v-if="modelValue" class="confirm-dialog-overlay" @click="handleOverlayClick">
		<div class="confirm-dialog" @click.stop>
			<div class="confirm-dialog-header">
				<h3>{{ title }}</h3>
			</div>
			<div class="confirm-dialog-content">
				<p>{{ message }}</p>
				<input 
					v-if="showInput"
					v-model="inputValue"
					type="text"
					placeholder="Enter new name (optional)..."
					class="input"
				>
			</div>
			<div class="confirm-dialog-actions">
				<button 
					v-for="action in actions" 
					:key="action.label"
					@click="handleAction(action)"
					:class="action.class"
				>
					{{ action.label }}
				</button>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
const props = defineProps<{
	modelValue: boolean
	title: string
	message: string
	showInput?: boolean
	actions: Array<{
		label: string
		class: string
		action: string
	}>
}>()

const emit = defineEmits<{
	'update:modelValue': [value: boolean]
	'action': [action: string, value?: string]
	'update:inputValue': [value: string]
}>()

const inputValue = ref('')

watch(inputValue, (newValue) => {
	emit('update:inputValue', newValue)
})

const handleAction = (action: { action: string }) => {
	if (props.showInput && action.action === 'confirm') {
		emit('action', action.action, inputValue.value)
	} else {
		emit('action', action.action)
	}
	emit('update:modelValue', false)
	inputValue.value = ''
}

const handleOverlayClick = () => {
	emit('update:modelValue', false)
	inputValue.value = ''
}
</script>

<style>
.confirm-dialog-overlay {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.75);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 9999;
	backdrop-filter: blur(2px);
}

.confirm-dialog {
	background: black;
	border: 1px solid rgba(239, 229, 192, 0.3);
	border-radius: 0.5rem;
	width: 90%;
	max-width: 400px;
	animation: dialogFadeIn 0.2s ease;
	box-shadow: 0 4px 24px rgba(0, 0, 0, 0.5);
}

.confirm-dialog-header {
	padding: 1rem;
	border-bottom: 1px solid rgba(239, 229, 192, 0.3);
}

.confirm-dialog-header h3 {
	margin: 0;
	font-size: 1.125rem;
}

.confirm-dialog-content {
	padding: 1rem;
	display: flex;
	flex-direction: column;
	gap: 1rem;
}

.confirm-dialog-actions {
	padding: 1rem;
	display: flex;
	justify-content: flex-end;
	gap: 0.5rem;
	border-top: 1px solid rgba(239, 229, 192, 0.3);
}

.input {
	background: black;
	border: 1px solid rgba(239, 229, 192, 0.5);
	border-radius: 0.25rem;
	padding: 0.5rem;
	color: #efe5c0;
	width: 100%;
}

.input:focus {
	border-color: #efe5c0;
	outline: none;
}

.btn-danger {
	color: #ef5c5c;
	background: transparent;
	padding: 0.25rem 0.75rem;
	border: 1px solid #ef5c5c;
	border-radius: 4px;
	transition: all 0.2s ease;
}

.btn-danger:hover {
	background: rgba(239, 92, 92, 0.1);
}

@keyframes dialogFadeIn {
	from {
		opacity: 0;
		transform: scale(0.95);
	}
	to {
		opacity: 1;
		transform: scale(1);
	}
}
</style> 