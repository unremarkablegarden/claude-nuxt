<template>
	<div class="modal">
		<div class="modal-content">
			<h3 class="modal-title">Configuration</h3>
			<form @submit.prevent="handleSubmit" class="form">
				<div class="form-group">
					<label class="label">Name:</label>
					<input v-model="tempConfig.userName" type="text" required class="input">
				</div>
				<div class="form-group">
					<label class="label">Model:</label>
					<select v-model="tempConfig.model" required class="input">
						<option v-for="model in MODELS" :key="model.value" :value="model.value">
							{{ model.name }}
						</option>
					</select>
				</div>
				<div class="form-group">
					<label class="label">Max History:</label>
					<input v-model.number="tempConfig.maxHistory" type="number" min="1" max="1000" required class="input">
				</div>
				<div class="form-group">
					<label class="label">Temperature:</label>
					<input v-model.number="tempConfig.temperature" type="number" min="0" max="1" step="0.1" required class="input">
				</div>
				<div class="form-group">
					<label class="label">System Prompt:</label>
					<textarea v-model="tempConfig.systemPrompt" required class="input" rows="3"></textarea>
				</div>
				<div class="modal-actions">
					<button v-if="isConfigured" @click="$emit('cancel')" type="button" class="btn-text">Cancel</button>
					<button type="submit" class="btn-primary">Save Configuration</button>
				</div>
			</form>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { MODELS } from '~/composables/useChat'

const props = defineProps<{
	config: any
	isConfigured: boolean
}>()

const emit = defineEmits<{
	'update': [config: any]
	'cancel': []
}>()

const tempConfig = ref({ ...props.config })

const handleSubmit = () => {
	emit('update', tempConfig.value)
}
</script> 