<template>
	<div class="markdown-content" v-html="renderedContent"></div>
	<!-- <pre style="color: white;">{{ content }}</pre> -->
</template>

<script setup lang="ts">
import { marked } from 'marked'
import { computed } from 'vue'

const props = defineProps<{
	content: string
}>()

const escapeHtmlTags = (text: string) => {
	// If the message contains typing-dots class, don't escape HTML
	if (text.includes("class='typing-dots'")) {
		return text
	}

	// First, temporarily replace code blocks with placeholders
	const codeBlocks: string[] = []
	const textWithPlaceholders = text.replace(/```[\s\S]*?```/g, (match) => {
		codeBlocks.push(match)
		return `__CODE_BLOCK_${codeBlocks.length - 1}__`
	})

	// Escape HTML tags in the non-code content
	const escapedContent = textWithPlaceholders.replace(/<([^>]+)>/g, '<code>&lt;$1&gt;</code>')

	// Restore code blocks
	return escapedContent.replace(/__CODE_BLOCK_(\d+)__/g, (_, index) => codeBlocks[parseInt(index)])
}

const renderedContent = computed(() => {
	const escapedContent = escapeHtmlTags(props.content)
	return marked(escapedContent, {
		gfm: true, // GitHub Flavored Markdown
		breaks: true // Convert line breaks to <br>
	})
})
</script>

<style>
.markdown-content {
	line-height: 1.5;
}

.markdown-content p {
	margin: 0.5em 0;
}

.markdown-content h1,
.markdown-content h2,
.markdown-content h3,
.markdown-content h4,
.markdown-content h5,
.markdown-content h6 {
	margin: 0.5em 0;
	font-weight: 600;
}

.markdown-content ul,
.markdown-content ol {
	margin: 0.5em 0;
	padding-left: 1.5em;
}

.markdown-content li {
	margin: 0.25em 0;
}

.markdown-content code {
	background: rgba(239, 229, 192, 0.1);
	/* background: #000;; */
	padding: 0.2em 0.4em;
	border-radius: 5px;
	font-family: 'JetBrains Mono', monospace;
	font-size: 0.9em;
	color: rgba(239, 189, 100, 0.9);
}

.markdown-content pre {
    background: #000;;
	/* background: rgba(239, 229, 192, 0.1); */
    border: 1px solid rgba(239, 189, 100, 0.33);
	padding: 1em;
	border-radius: 4px;
	/* overflow-x: auto; */
	margin: 1em 0;
    line-height: 1;
    font-size: 0.9em;
    text-wrap: wrap;
    color: rgba(239, 189, 100, 0.9);
}

.markdown-content pre code {
    background: none;
	padding: 0;
    /* font-family: monaco; */
    /* color: white; */
    /* background-color: black; */
}

.markdown-content blockquote {
	margin: 0.5em 0;
	padding-left: 1em;
	border-left: 3px solid rgba(239, 229, 192, 0.3);
	color: rgba(239, 229, 192, 0.8);
}

.markdown-content a {
	color: #efe5c0;
	text-decoration: underline;
}

.markdown-content a:hover {
	color: #e5dbb6;
}

.markdown-content table {
	border-collapse: collapse;
	width: 100%;
	margin: 0.5em 0;
}

.markdown-content th,
.markdown-content td {
	border: 1px solid rgba(239, 229, 192, 0.3);
	padding: 0.5em;
}

.markdown-content th {
	background: rgba(239, 229, 192, 0.1);
}
</style> 