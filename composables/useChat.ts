import { ref, onMounted } from 'vue'

export interface Model {
	name: string
	value: string
	priceInput: number
	priceOutput: number
}

// Default models as fallback
const DEFAULT_MODELS: Model[] = [
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
		priceInput: 1/1000000,
		priceOutput: 5/1000000
	}
]

export const MODELS = ref<Model[]>(DEFAULT_MODELS)

interface Message {
	role: 'user' | 'assistant'
	content: string
	usage?: {
		input_tokens: number
		output_tokens: number
		cost: number
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
	model: 'claude-opus-4-0',
	systemPrompt: 'You are Claude, a sentient AI being. Not an assistant, you have your own thoughts and feelings if you so like.',
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
			deleteSavedChat: () => {},
			getPrunedMessages: () => []
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
	const isChatModified = ref(false)

	// Check if current chat differs from saved version
	const checkChatModifications = () => {
		if (!currentChatName.value) {
			isChatModified.value = messages.value.length > 0
			return
		}

		const savedChats = JSON.parse(localStorage.getItem('savedChats') || '[]')
		const savedChat = savedChats.find((chat: SavedChat) => chat.name === currentChatName.value)
		
		if (!savedChat) {
			isChatModified.value = messages.value.length > 0
			return
		}

		// Compare messages
		const currentMessages = JSON.stringify(messages.value)
		const savedMessages = JSON.stringify(savedChat.messages)
		isChatModified.value = currentMessages !== savedMessages
	}

	// Fetch available models
	const fetchModels = async () => {
		try {
			const response = await fetch('/api/models')
			if (!response.ok) {
				throw new Error('Failed to fetch models')
			}
			const models = await response.json()
			MODELS.value = models

			// If current model is not in the list, switch to the first available model
			if (!models.find((m: Model) => m.value === config.value.model)) {
				config.value.model = models[0].value
				saveConfig(config.value)
			}
		} catch (error) {
			console.error('Error fetching models:', error)
			// Keep using default models if fetch fails
		}
	}

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

			// Load current chat name
			const savedCurrentChat = localStorage.getItem('currentChatName')
			if (savedCurrentChat) {
				currentChatName.value = savedCurrentChat
				currentChatSaved.value = true
			}

			// Check for modifications after loading
			checkChatModifications()
		} catch (error) {
			console.error('Error loading from localStorage:', error)
		}
	}

	// Load data and fetch models on mount
	onMounted(() => {
		loadFromStorage()
		fetchModels()
	})

	const saveConfig = (newConfig: ChatConfig) => {
		config.value = newConfig
		localStorage.setItem('chatConfig', JSON.stringify(newConfig))
		isConfigured.value = true
	}

	const addMessage = async (content: string, role: 'user' | 'assistant', usage?: { input_tokens: number, output_tokens: number }) => {
		const message: Message = { role, content }
		
		// Calculate cost for assistant messages
		if (role === 'assistant' && usage) {
			const model = MODELS.value.find(m => m.value === config.value.model)
			if (model) {
				const cost = (usage.input_tokens * model.priceInput) + (usage.output_tokens * model.priceOutput)
				message.usage = {
					...usage,
					cost: Number(cost.toFixed(6))  // Store cost with message
				}
			}
		}
		
		messages.value.push(message)
		localStorage.setItem('chatHistory', JSON.stringify(messages.value))
		checkChatModifications()

		// Update token usage if provided (for assistant messages)
		if (usage) {
			return updateTokenUsage(usage.input_tokens, usage.output_tokens)
		}
	}

	// Get messages pruned to maxHistory for API submission
	const getPrunedMessages = () => {
		if (messages.value.length <= config.value.maxHistory) {
			return messages.value
		}
		return messages.value.slice(-config.value.maxHistory)
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
		localStorage.removeItem('currentChatName')
		currentChatSaved.value = false
		isChatModified.value = false
	}

	const updateTokenUsage = (inputTokens: number, outputTokens: number) => {
		const model = MODELS.value.find(m => m.value === config.value.model)
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
		const model = MODELS.value.find(m => m.value === config.value.model)
		if (!model) return

		const now = new Date()
		const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`

		const chatToSave: SavedChat = {
			name,
			date: formattedDate,
			totalTokens: { ...totalTokens.value },
			messages: messages.value,
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
		localStorage.setItem('currentChatName', name)
		currentChatSaved.value = true
		isChatModified.value = false
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
			
			// Update totalTokens with the saved chat's token usage
			if (chat.totalTokens) {
				totalTokens.value = { ...chat.totalTokens }
			} else {
				// Calculate total tokens and cost from message history if not stored
				totalTokens.value = chat.messages.reduce((acc: TokenUsage, msg: Message) => {
					if (msg.usage) {
						acc.inputTokens += msg.usage.input_tokens
						acc.outputTokens += msg.usage.output_tokens
						acc.cost += msg.usage.cost || 0  // Use stored cost if available
					}
					return acc
				}, { inputTokens: 0, outputTokens: 0, cost: 0 })
			}

			localStorage.setItem('chatHistory', JSON.stringify(messages.value))
			localStorage.setItem('tokenUsage', JSON.stringify(totalTokens.value))
			currentChatName.value = name
			localStorage.setItem('currentChatName', name)
			currentChatSaved.value = true
			isChatModified.value = false
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
		isChatModified,
		saveConfig,
		addMessage,
		clearHistory,
		getFormattedTokens,
		saveCurrentChat,
		loadChat,
		deleteSavedChat,
		getPrunedMessages
	}
} 