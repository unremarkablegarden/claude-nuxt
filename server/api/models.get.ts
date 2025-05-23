import Anthropic from '@anthropic-ai/sdk'

interface AnthropicModel {
	id: string
	name: string
}

interface FormattedModel {
	name: string
	value: string
	priceInput: number
	priceOutput: number
}

export default defineEventHandler(async (event) => {
	try {
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

		// Get available models from the API
		const response = await anthropic.messages.create({
			model: 'claude-3-7-sonnet-latest',
			max_tokens: 1,
			messages: [{ role: 'user', content: 'test' }]
		})

		// Current models with their latest pricing (as of March 2024)
		const knownModels: AnthropicModel[] = [
			{ id: 'claude-opus-4-0', name: 'Claude Opus 4' },
			{ id: 'claude-sonnet-4-0', name: 'Claude Sonnet 4' },
			{ id: 'claude-3-7-sonnet-latest', name: 'Claude Sonnet 3.7' },
			{ id: 'claude-3-5-sonnet-latest', name: 'Claude Sonnet 3.5' },
			{ id: 'claude-3-5-haiku-latest', name: 'Claude Haiku 3.5' },
			{ id: 'claude-3-opus-latest', name: 'Claude Opus 3' }
		]

		// Map models to our format with pricing
		const formattedModels: FormattedModel[] = knownModels.map((model: AnthropicModel) => {
			// Determine pricing based on model type and version
			let inputPrice = 0
			let outputPrice = 0

			if (model.id.includes('opus')) {
				inputPrice = 7.50/1000000  // $7.50 per million tokens
				outputPrice = 37.50/1000000 // $37.50 per million tokens
			} else if (model.id.includes('sonnet')) {
				inputPrice = 1.50/1000000  // $1.50 per million tokens
				outputPrice = 7.50/1000000  // $7.50 per million tokens
			} else if (model.id.includes('haiku')) {
				inputPrice = 0.40/1000000   // $0.40 per million tokens
				outputPrice = 2/1000000     // $2.00 per million tokens
			}

			// Format prices for display
			const inputPricePerM = (inputPrice * 1000000).toFixed(2)
			const outputPricePerM = (outputPrice * 1000000).toFixed(2)

			return {
				name: `${model.name} ($${inputPricePerM}/M + $${outputPricePerM}/M)`,
				value: model.id,
				priceInput: inputPrice,
				priceOutput: outputPrice
			}
		})

		return formattedModels
	} catch (error: any) {
		console.error('Server error:', error)
		
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