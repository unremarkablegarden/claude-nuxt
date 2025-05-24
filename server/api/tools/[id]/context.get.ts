import { toolProcessor } from '../../../../ai-tools/tools/processor'
import { tools } from '../../../../ai-tools/config/tools'

export default defineEventHandler(async (event) => {
	const toolId = getRouterParam(event, 'id')
	
	if (!toolId) {
		throw createError({
			statusCode: 400,
			message: 'Missing tool ID'
		})
	}

	const tool = tools.find(t => t.id === toolId)
	if (!tool) {
		throw createError({
			statusCode: 404,
			message: `Tool with ID ${toolId} not found`
		})
	}

	try {
		const context = toolProcessor.getToolContext(toolId)
		return {
			tool,
			context
		}
	} catch (error) {
		throw createError({
			statusCode: 500,
			message: error instanceof Error ? error.message : 'Failed to fetch tool context'
		})
	}
}) 