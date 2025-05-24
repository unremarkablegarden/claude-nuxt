import { toolProcessor } from '../../../ai-tools/tools/processor'

export default defineEventHandler(async (event) => {
	const body = await readBody(event)
	console.log('body', body)
	
	const { toolId, content, config } = body

	if (!toolId || !content) {
		throw createError({
			statusCode: 400,
			message: 'Missing required fields: toolId and content'
		})
	}

	try {
		const response = await toolProcessor.processToolMessage(toolId, content, config)
		return response
	} catch (error) {
		throw createError({
			statusCode: 500,
			message: error instanceof Error ? error.message : 'Failed to process tool message'
		})
	}
}) 