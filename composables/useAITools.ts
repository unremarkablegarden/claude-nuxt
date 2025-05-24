import type { ToolResponse } from '../ai-tools/config/tools'
import { tools, getToolByTag, getToolByResponseTag } from '../ai-tools/config/tools'

export const useAITools = () => {
	const processToolMessage = async (toolId: string, content: string): Promise<ToolResponse> => {
		const response = await $fetch('/api/tools/process', {
			method: 'POST',
			body: {
				toolId,
				content
			}
		})
		return response as ToolResponse
	}

	const extractToolTags = (text: string): Array<{ toolId: string; content: string }> => {
		const results: Array<{ toolId: string; content: string }> = []
		
		tools.forEach(tool => {
			const regex = new RegExp(`<${tool.tagName}>(.*?)</${tool.tagName}>`, 'gs')
			let match
			
			while ((match = regex.exec(text)) !== null) {
				results.push({
					toolId: tool.id,
					content: match[1].trim()
				})
			}
		})
		
		return results
	}

	const extractResponseTags = (text: string): Array<{ toolId: string; content: string }> => {
		const results: Array<{ toolId: string; content: string }> = []
		
		tools.forEach(tool => {
			const regex = new RegExp(`<${tool.responseTagName}>(.*?)</${tool.responseTagName}>`, 'gs')
			let match
			
			while ((match = regex.exec(text)) !== null) {
				results.push({
					toolId: tool.id,
					content: match[1].trim()
				})
			}
		})
		
		return results
	}

	const processTextWithTools = async (text: string): Promise<{
		processedText: string
		toolResponses: ToolResponse[]
	}> => {
		const toolTags = extractToolTags(text)
		const toolResponses: ToolResponse[] = []
		let processedText = text

		for (const tag of toolTags) {
			const response = await processToolMessage(tag.toolId, tag.content)
			toolResponses.push(response)
			
			// Replace the tool tag with a visual indicator
			const tool = getToolByTag(tag.toolId)
			if (tool) {
				processedText = processedText.replace(
					`<${tool.tagName}>${tag.content}</${tool.tagName}>`,
					`[${tool.name} processing...]`
				)
			}
		}

		return {
			processedText,
			toolResponses
		}
	}

	return {
		processToolMessage,
		extractToolTags,
		extractResponseTags,
		processTextWithTools
	}
} 