import { ref, computed } from 'vue'
import { useChat, MODELS, type Model } from '~/composables/useChat'

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
		isChatModified,
		saveConfig,
		addMessage,
		clearHistory,
		getFormattedTokens,
		saveCurrentChat,
		loadChat,
		deleteSavedChat,
		getPrunedMessages
	} = useChat()

	const loading = ref(false)
	const lastUsage = ref<{ tokensK: string, cost: string } | null>(null)
	const saveDialogMode = ref<'new' | 'save' | 'overwrite'>('new')
	const chatToLoad = ref<string | null>(null)

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
				// Emit event to show save dialog in sidebar
				return 'save'
			} else if (messages.value.length > 0) {
				saveDialogMode.value = 'new'
				// Emit event to show save dialog in sidebar
				return 'save'
			} else {
				clearHistory()
			}
		} else {
			clearHistory()
		}
	}

	const handleConfigSubmit = (newConfig: any) => {
		saveConfig(newConfig)
	}

	const handleSaveClick = () => {
		if (currentChatSaved?.value) {
			saveDialogMode.value = 'overwrite'
			// Emit event to show save dialog in sidebar
			return 'save'
		} else {
			saveDialogMode.value = 'save'
			// Emit event to show save dialog in sidebar
			return 'save'
		}
	}

	const handleSaveAs = () => {
		saveDialogMode.value = 'new'
		return 'save'
	}

	const handleSaveChat = (name: string) => {
		saveCurrentChat(name)
		if (saveDialogMode.value === 'new' && chatToLoad.value) {
			loadChat(chatToLoad.value)
			chatToLoad.value = null
		} else if (saveDialogMode.value === 'new' && !chatToLoad.value) {
			// If this is a Save As operation, load the newly saved chat
			if (currentChatName?.value) {
				loadChat(name)
			} else {
				clearHistory()
			}
		}
		return 'close' // Signal to close the sidebar
	}

	const handleCancelSave = () => {
		// No need to handle modal state anymore
	}

	const handleSkipSave = () => {
		if (chatToLoad.value) {
			clearHistory()
			loadChat(chatToLoad.value)
			chatToLoad.value = null
		} else {
			clearHistory()
		}
	}

	const handleLoadChat = (name: string) => {
		const hasUnsavedChanges = messages.value.length > 0 && 
			(isChatModified?.value || !currentChatSaved?.value)
		
		if (hasUnsavedChanges) {
			chatToLoad.value = name
			// Emit event to show save dialog in sidebar
			return 'save'
		} else {
			loadChat(name)
		}
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
					messages: getPrunedMessages(),
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
			
			const model = MODELS.value.find((m: Model) => m.value === config.value.model)
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
		isChatModified,
		loading,
		lastUsage,
		saveDialogMode,
		formatTokens,
		chatToLoad,

		// Methods
		handleNewChat,
		handleConfigSubmit,
		handleSaveClick,
		handleSaveAs,
		handleSaveChat,
		handleCancelSave,
		handleSkipSave,
		handleLoadChat,
		handleDeleteChat,
		handleSubmit,
		getPrunedMessages
	}
} 