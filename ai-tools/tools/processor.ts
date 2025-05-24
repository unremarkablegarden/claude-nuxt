import type { ToolConfig, ToolResponse } from '../config/tools'
import { tools } from '../config/tools'
// import { Anthropic } from '@anthropic-ai/sdk'

interface ToolContext {
	history: Array<{
		role: 'system' | 'user' | 'assistant'
		content: string
	}>
}

class ToolProcessor {
	private contexts: Map<string, ToolContext> = new Map()

	constructor() {
		this.initializeContexts()
	}

	private initializeContexts() {
		tools.forEach(tool => {
			this.contexts.set(tool.id, {
				history: [{
					role: 'system',
					content: tool.systemPrompt
				}]
			})
		})
	}

	getToolContext(toolId: string): ToolContext {
		const context = this.contexts.get(toolId)
		if (!context) {
			throw new Error(`No context found for tool ${toolId}`)
		}
		return context
	}

	async processToolMessage(toolId: string, content: string, userConfig?: { model: string, temperature: number }): Promise<ToolResponse> {
		console.log(`[TOOL IN] [${toolId}]`, content)
		const context = this.getOrCreateContext(toolId)
		const tool = this.getToolById(toolId)
		
		if (!tool) {
			throw new Error(`Tool with id ${toolId} not found`)
		}

		// Add message to context history
		context.history.push({
			role: 'user',
			content
		})

		// Process the message and generate response
		const response = await this.generateResponse(tool, context, userConfig)

		// Add response to context history
		context.history.push({
			role: 'assistant',
			content: response
		})

		console.log(`[TOOL OUT] [${toolId}]`, response)

		return {
			toolId,
			content: response,
			timestamp: Date.now()
		}
	}

	private getOrCreateContext(toolId: string): ToolContext {
		if (!this.contexts.has(toolId)) {
			this.contexts.set(toolId, {
				history: []
			})
		}
		return this.contexts.get(toolId)!
	}

	private getToolById(toolId: string): ToolConfig | undefined {
		return tools.find(tool => tool.id === toolId)
	}

	private async generateResponse(tool: ToolConfig, context: ToolContext, userConfig?: { model: string, temperature: number }): Promise<string> {
		const lastMessage = context.history[context.history.length - 1].content
		const systemPrompt = context.history[0].content // First message is always system prompt

		const response = await $fetch('/api/chat', {
			method: 'POST',
			body: {
				messages: [{
					role: 'user',
					content: lastMessage
				}],
				config: {
					model: userConfig?.model || 'claude-opus-4-0',
					temperature: userConfig?.temperature || 1,
					systemPrompt
				}
			}
		})

		// return `${tool.tagFormat.responseOpen}\n${response.message}\n${tool.tagFormat.responseClose}`
		return `${response.message}`
	}
}

export const toolProcessor = new ToolProcessor() 