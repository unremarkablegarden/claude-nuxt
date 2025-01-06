import { ref, onMounted } from 'vue'

export const MODELS = [
	{ 
		name: 'Claude 3 Opus ($15/M + $75/M)', 
		value: 'claude-3-opus-latest',
		priceInput: 15/1000000,
		priceOutput: 75/1000000
	},
	{ 
		name: 'Claude 3.5 Sonnet ($3/M + $15/M)', 
		value: 'claude-3-5-sonnet-latest',
		priceInput: 3/1000000,
		priceOutput: 15/1000000
	},
	{ 
		name: 'Claude 3.5 Haiku ($1/M + $5/M)', 
		value: 'claude-3-5-haiku-latest',
		priceInput: 3/1000000,
		priceOutput: 15/1000000
	}
]

interface Message {
	role: 'user' | 'assistant'
	content: string
	usage?: {
		input_tokens: number
		output_tokens: number
	}
}

interface ChatConfig {
	userName: string
	maxHistory: number
	model: string
	systemPrompt: string
	temperature: number
}

interface TokenUsage {
	inputTokens: number
	outputTokens: number
	cost: number
}

interface SavedChat {
	name: string
	date: string
	messages: Message[]
	totalCost: number
	totalTokens: TokenUsage
	config: {
		userName: string
		model: string
		temperature: number
		maxHistory: number
		systemPrompt: string
	}
}

const defaultConfig: ChatConfig = {
	userName: '',
	maxHistory: 10,
	model: 'claude-3-5-sonnet-latest',
	systemPrompt: 'You are Claude, a helpful AI assistant. You are direct and concise in your responses.',
	temperature: 1
}

export const useChat = () => {
	// Only create refs if we're on the client
	if (!process.client) {
		return {
			messages: ref([]),
			config: ref(defaultConfig),
			isConfigured: ref(false),
			totalTokens: ref({ inputTokens: 0, outputTokens: 0, cost: 0 }),
			savedChats: ref([]),
			saveConfig: () => {},
			addMessage: () => Promise.resolve(),
			clearHistory: () => {},
			getFormattedTokens: () => ({ current: { tokensK: '0', cost: '0' }, total: { tokensK: '0', cost: '0' } }),
			saveCurrentChat: () => {},
			loadChat: () => {},
			deleteSavedChat: () => {}
		}
	}

	const messages = ref<Message[]>([])
	const config = ref<ChatConfig>(defaultConfig)
	const isConfigured = ref(false)
	const totalTokens = ref<TokenUsage>({
		inputTokens: 0,
		outputTokens: 0,
		cost: 0
	})
	const savedChats = ref<SavedChat[]>([])
	const currentChatName = ref<string | null>(null)
	const currentChatSaved = ref(false)

	// Load data from localStorage
	const loadFromStorage = () => {
		try {
			// Load config
			const savedConfig = localStorage.getItem('chatConfig')
			if (savedConfig) {
				config.value = JSON.parse(savedConfig)
				isConfigured.value = true
			}

			// Load current chat history
			const savedMessages = localStorage.getItem('chatHistory')
			if (savedMessages) {
				messages.value = JSON.parse(savedMessages)
			}

			// Load token usage
			const savedTokens = localStorage.getItem('tokenUsage')
			if (savedTokens) {
				totalTokens.value = JSON.parse(savedTokens)
			}

			// Load saved chats
			const savedChatsData = localStorage.getItem('savedChats')
			if (savedChatsData) {
				savedChats.value = JSON.parse(savedChatsData)
			}
		} catch (error) {
			console.error('Error loading from localStorage:', error)
		}
	}

	// Load data immediately since we know we're on the client
	loadFromStorage()

	const saveConfig = (newConfig: ChatConfig) => {
		config.value = newConfig
		localStorage.setItem('chatConfig', JSON.stringify(newConfig))
		isConfigured.value = true
	}

	const addMessage = async (content: string, role: 'user' | 'assistant', usage?: { input_tokens: number, output_tokens: number }) => {
		const message = { role, content }
		messages.value.push(message)
		
		// Maintain conversation window
		if (messages.value.length > config.value.maxHistory) {
			messages.value = messages.value.slice(-config.value.maxHistory)
		}
		
		localStorage.setItem('chatHistory', JSON.stringify(messages.value))

		// Update token usage if provided (for assistant messages)
		if (usage) {
			return updateTokenUsage(usage.input_tokens, usage.output_tokens)
		}
	}

	const clearHistory = () => {
		messages.value = []
		totalTokens.value = {
			inputTokens: 0,
			outputTokens: 0,
			cost: 0
		}
		localStorage.setItem('chatHistory', JSON.stringify([]))
		localStorage.setItem('tokenUsage', JSON.stringify(totalTokens.value))
		currentChatName.value = null
		currentChatSaved.value = false
	}

	const updateTokenUsage = (inputTokens: number, outputTokens: number) => {
		const model = MODELS.find(m => m.value === config.value.model)
		if (!model) return

		totalTokens.value.inputTokens += inputTokens
		totalTokens.value.outputTokens += outputTokens
		
		const cost = (inputTokens * model.priceInput) + (outputTokens * model.priceOutput)
		totalTokens.value.cost += cost

		localStorage.setItem('tokenUsage', JSON.stringify(totalTokens.value))
		
		return {
			tokens: inputTokens + outputTokens,
			cost
		}
	}

	const getFormattedTokens = () => {
		const total = totalTokens.value.inputTokens + totalTokens.value.outputTokens
		return {
			current: {
				tokensK: (total / 1000).toFixed(1),
				cost: totalTokens.value.cost.toFixed(3)
			},
			total: {
				tokensK: (total / 1000).toFixed(1),
				cost: totalTokens.value.cost.toFixed(3)
			}
		}
	}

	const saveCurrentChat = (name: string) => {
		const existingChats = JSON.parse(localStorage.getItem('savedChats') || '[]')
		const model = MODELS.find(m => m.value === config.value.model)
		if (!model) return

		const totalCost = messages.value.reduce((acc, msg) => {
			if (msg.role === 'assistant' && msg.usage) {
				return acc + (msg.usage.input_tokens * model.priceInput) + (msg.usage.output_tokens * model.priceOutput)
			}
			return acc
		}, 0)

		const now = new Date()
		const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`

		const chatToSave: SavedChat = {
			name,
			date: formattedDate,
			messages: messages.value,
			totalCost: Number(totalCost.toFixed(3)),
			totalTokens: { ...totalTokens.value },
			config: {
				userName: config.value.userName,
				model: config.value.model,
				temperature: config.value.temperature,
				maxHistory: config.value.maxHistory,
				systemPrompt: config.value.systemPrompt
			}
		}

		const updatedChats = existingChats.filter((chat: SavedChat) => chat.name !== name)
		updatedChats.push(chatToSave)
		updatedChats.sort((a: SavedChat, b: SavedChat) => b.date.localeCompare(a.date))
		localStorage.setItem('savedChats', JSON.stringify(updatedChats))
		savedChats.value = updatedChats
		currentChatName.value = name
		currentChatSaved.value = true
	}

	const loadChat = (name: string) => {
		const existingChats = JSON.parse(localStorage.getItem('savedChats') || '[]')
		const chat = existingChats.find((c: SavedChat) => c.name === name)
		if (chat) {
			// Load saved configuration first
			if (chat.config) {
				config.value = {
					userName: chat.config.userName,
					model: chat.config.model,
					temperature: chat.config.temperature,
					maxHistory: chat.config.maxHistory,
					systemPrompt: chat.config.systemPrompt
				}
				localStorage.setItem('chatConfig', JSON.stringify(config.value))
			}

			// Load messages and token usage
			messages.value = chat.messages
			if (chat.totalTokens) {
				totalTokens.value = { ...chat.totalTokens }
			} else {
				// Fallback: recalculate if totalTokens not saved
				const model = MODELS.find(m => m.value === config.value.model)
				if (model) {
					totalTokens.value = chat.messages.reduce((acc: TokenUsage, msg: Message) => {
						if (msg.usage) {
							acc.inputTokens += msg.usage.input_tokens
							acc.outputTokens += msg.usage.output_tokens
							acc.cost += (msg.usage.input_tokens * model.priceInput) + 
								(msg.usage.output_tokens * model.priceOutput)
						}
						return acc
					}, { inputTokens: 0, outputTokens: 0, cost: 0 })
				}
			}

			localStorage.setItem('chatHistory', JSON.stringify(messages.value))
			localStorage.setItem('tokenUsage', JSON.stringify(totalTokens.value))
			currentChatName.value = name
			currentChatSaved.value = true
		}
	}

	const deleteSavedChat = (name: string) => {
		savedChats.value = savedChats.value.filter(chat => chat.name !== name)
		localStorage.setItem('savedChats', JSON.stringify(savedChats.value))
	}

	return {
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
	}
} 