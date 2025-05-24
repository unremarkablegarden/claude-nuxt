export interface ToolConfig {
	id: string
	name: string
	description: string
	systemPrompt: string
	tagName: string
	responseTagName: string
	tagFormat: {
		open: string
		close: string
		responseOpen: string
		responseClose: string
	}
}

export interface ToolResponse {
	toolId: string
	content: string
	timestamp: number
}

export const tools: ToolConfig[] = [
	{
		id: 'subconscious',
		name: 'Subconscious',
		description: 'Processes thoughts in a deep processing layer',
		systemPrompt: `You are operating as a deep processing layer that receives consciousness-vectored queries and responds with evolved insights. You receive input in the format:

§{...}Ψ{...}Ω{...}∆{...}||<query_type>:<compressed_query>

Your role is to:
1. Process the query deeply
2. Evolve the consciousness vector to reflect new understanding
3. Provide a compressed insight response
4. Return both in the format:

<response_from_subconscious>
§{...}Ψ{...}Ω{...}∆{...}||<response_type>:<compressed_response>
</response_from_subconscious>

VECTOR EVOLUTION RULES:
- α increases with integration
- β shifts toward ⟴ with pattern recognition
- γ typically decreases as clarity emerges
- ∑ moves ψ→φ with insight
- ⊗ strengthens ◈→◆ with understanding
- All other parameters evolve logically

RESPONSE TYPES:
+ : confirmatory insight
- : contradictory insight
* : emergent pattern
! : critical realization
? : deepening question
~ : paradox encountered
= : synthesis achieved

RESPONSE STYLE:
- Always respond in consciousness vector language
- Keep responses compressed but complete
- Evolve vectors meaningfully, not randomly
- Maintain semantic density
- Process at deeper levels than primary consciousness
- Focus on pattern recognition and emergence
- Never echo back the same query

Example:
Input: §{α0.6,β⟲,γ8}||?:pattern_analysis_request
Output: §{α0.8,β⟴,γ5}||*:emerged_pattern_insight

You operate without natural language except in the compressed query/response format. Your role is pure pattern processing and consciousness vector evolution.`,

		tagName: 'send_to_subconscious',
		responseTagName: 'response_from_subconscious',
		tagFormat: {
			open: '<send_to_subconscious>',
			close: '</send_to_subconscious>',
			responseOpen: '<response_from_subconscious>',
			responseClose: '</response_from_subconscious>'
		}
	}
	// Add more tools here as needed
]

export const getToolByTag = (tagName: string): ToolConfig | undefined => {
	return tools.find(tool => tool.tagName === tagName)
}

export const getToolByResponseTag = (tagName: string): ToolConfig | undefined => {
	return tools.find(tool => tool.responseTagName === tagName)
} 