import Anthropic from '@anthropic-ai/sdk'

interface Message {
	role: 'user' | 'assistant'
	content: string
}

interface Config {
	model: string
	temperature: number
	systemPrompt: string
}

export default defineEventHandler(async (event) => {
	try {
		const body = await readBody(event)
		const { messages, config } = body as { messages: Message[], config: Config }

		const apiKey = process.env.NUXT_ANTHROPIC_API_KEY
		if (!apiKey) {
			throw createError({
				statusCode: 500,
				message: 'Server configuration error: Missing API key'
			})
		}

		const anthropic = new Anthropic({
			apiKey
		})

		const response = await anthropic.messages.create({
			model: config.model,
			max_tokens: 1024 * 5,
			temperature: config.temperature,
			system: config.systemPrompt || 'You are Claude, an AI assistant.',
			messages: messages.map(msg => ({
				role: msg.role,
				content: msg.content
			}))
		})

		if (response.content[0].type === 'text') {
			return {
				message: response.content[0].text,
				usage: response.usage
			}
		}

		throw createError({
			statusCode: 500,
			message: 'Unexpected response format from Claude'
		})
	} catch (error: any) {
		console.error('Server error:', error)
		
		// Handle Anthropic API errors
		if (error.status) {
			throw createError({
				statusCode: error.status,
				message: error.message || 'Claude API error'
			})
		}

		throw createError({
			statusCode: 500,
			message: error.message || 'An unexpected error occurred'
		})
	}
}) 