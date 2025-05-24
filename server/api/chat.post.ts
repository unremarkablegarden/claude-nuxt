import Anthropic from '@anthropic-ai/sdk'
import { toolProcessor } from '../../ai-tools/tools/processor'
import { tools } from '../../ai-tools/config/tools'

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
			...(config.systemPrompt ? { system: config.systemPrompt } : {}),
			messages: messages.map(msg => ({
				role: msg.role,
				content: msg.content
			}))
		})

		if (response.content[0].type === 'text') {
			let processedMessage = response.content[0].text

			// Process tool tags in the API response
			const toolTags = tools.map(tool => {
				const regex = new RegExp(`<${tool.tagName}>(.*?)</${tool.tagName}>`, 'gs')
				const matches = [...processedMessage.matchAll(regex)]
				return matches.map(match => ({
					toolId: tool.id,
					content: match[1].trim()
				}))
			}).flat()

			// Process each tool tag
			for (const tag of toolTags) {
				const response = await toolProcessor.processToolMessage(tag.toolId, tag.content, config)
				// Replace the tool tag with the response in the message
				const tool = tools.find(t => t.id === tag.toolId)
				if (tool) {
					processedMessage = processedMessage.replace(
						`<${tool.tagName}>${tag.content}</${tool.tagName}>`,
						`<${tool.responseTagName}>${response.content}</${tool.responseTagName}>`
					)
				}
			}

			return {
				message: processedMessage,
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