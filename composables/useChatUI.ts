import { ref, computed } from 'vue'
import { useChat } from './useChat'

interface TokenFormat {
	total: {
		tokensK: string
		cost: string
	}
}

export const useChatUI = () => {
	const {
		messages,
		config,
		isConfigured,
		totalTokens,
		savedChats,
		currentChatName,
		currentChatSaved,
		saveConfig,
		addMessage,
		clearHistory,
		getFormattedTokens,
		saveCurrentChat,
		loadChat,
		deleteSavedChat
	} = useChat()

	const loading = ref(false)
	const lastUsage = ref<{ tokensK: string, cost: string } | null>(null)
	const showSaveDialog = ref(false)
	const showLoadDialog = ref(false)
	const showConfigDialog = ref(false)
	const saveDialogMode = ref<'new' | 'save' | 'overwrite'>('new')

	const formatTokens = computed<TokenFormat>(() => {
		const formatted = getFormattedTokens()
		return {
			total: {
				tokensK: formatted.total.tokensK,
				cost: formatted.total.cost
			}
		}
	})

	const handleNewChat = () => {
		if (messages.value.length > 0) {
			if (currentChatSaved?.value) {
				saveDialogMode.value = 'new'
				showSaveDialog.value = true
			} else if (messages.value.length > 0) {
				saveDialogMode.value = 'new'
				showSaveDialog.value = true
			} else {
				clearHistory()
			}
		} else {
			clearHistory()
		}
	}

	const handleConfigSubmit = (newConfig: any) => {
		saveConfig(newConfig)
		showConfigDialog.value = false
	}

	const handleCancelConfig = () => {
		showConfigDialog.value = false
	}

	const handleSaveClick = () => {
		if (currentChatSaved?.value) {
			saveDialogMode.value = 'overwrite'
			showSaveDialog.value = true
		} else {
			saveDialogMode.value = 'save'
			showSaveDialog.value = true
		}
	}

	const handleSaveChat = (name: string) => {
		saveCurrentChat(name)
		showSaveDialog.value = false
		if (saveDialogMode.value === 'new') {
			clearHistory()
		}
	}

	const handleCancelSave = () => {
		showSaveDialog.value = false
	}

	const handleSkipSave = () => {
		showSaveDialog.value = false
		clearHistory()
	}

	const handleLoadChat = (name: string) => {
		loadChat(name)
		showLoadDialog.value = false
	}

	const handleDeleteChat = (name: string) => {
		deleteSavedChat(name)
	}

	const handleSubmit = async (message: string) => {
		loading.value = true
		lastUsage.value = null

		try {
			await addMessage(message, 'user')

			const response = await fetch('/api/chat', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					messages: messages.value,
					config: config.value
				})
			})

			if (!response.ok) {
				throw new Error('Failed to get response')
			}

			const data = await response.json()
			
			if (!data.message || !data.usage) {
				throw new Error('Invalid response format')
			}
			
			await addMessage(data.message, 'assistant', data.usage)
			
			const model = MODELS.find(m => m.value === config.value.model)
			if (!model) throw new Error('Invalid model configuration')

			const inputTokens = data.usage.input_tokens
			const outputTokens = data.usage.output_tokens
			const totalTokens = inputTokens + outputTokens
			const cost = (inputTokens * model.priceInput) + (outputTokens * model.priceOutput)

			lastUsage.value = {
				tokensK: (totalTokens / 1000).toFixed(1),
				cost: cost.toFixed(3)
			}
		} catch (error) {
			console.error('Error:', error)
			messages.value.pop() // Remove user message if request failed
		} finally {
			loading.value = false
		}
	}

	return {
		// State
		messages,
		config,
		isConfigured,
		totalTokens,
		savedChats,
		currentChatName,
		currentChatSaved,
		loading,
		lastUsage,
		showSaveDialog,
		showLoadDialog,
		showConfigDialog,
		saveDialogMode,
		formatTokens,

		// Methods
		handleNewChat,
		handleConfigSubmit,
		handleCancelConfig,
		handleSaveClick,
		handleSaveChat,
		handleCancelSave,
		handleSkipSave,
		handleLoadChat,
		handleDeleteChat,
		handleSubmit
	}
} 