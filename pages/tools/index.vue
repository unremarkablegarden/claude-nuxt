<template>
	<div class="tools-page">
		<h1 class="tools-title">AI Tools Debug</h1>
		
		<div class="tools-grid">
			<NuxtLink 
				v-for="tool in tools" 
				:key="tool.id"
				:to="`/tools/${tool.id}/debug`"
				class="tool-card"
			>
				<h2 class="tool-name">{{ tool.name }}</h2>
				<p class="tool-description">{{ tool.description }}</p>
				<div class="tool-link">
					<span>View Debug</span>
					<i class="ri-arrow-right-line"></i>
				</div>
			</NuxtLink>
		</div>
	</div>
</template>

<script setup lang="ts">
import { tools } from '~/ai-tools/config/tools'
</script>

<style lang="scss">
.tools-page {
	padding: 1rem;
	color: #efe5c0;
}

.tools-title {
	font-size: 1.5rem;
	font-weight: 500;
	margin-bottom: 1.5rem;
}

.tools-grid {
	display: grid;
	gap: 1rem;
	grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
}

.tool-card {
	background: black;
	border: 1px solid rgba(239, 229, 192, 0.3);
	border-radius: 0.25rem;
	padding: 1rem;
	transition: all 0.2s ease;
	color: #efe5c0;
	text-decoration: none;

	&:hover {
		border-color: rgba(239, 229, 192, 0.5);
		background: rgba(239, 229, 192, 0.05);
	}
}

.tool-name {
	font-size: 1.125rem;
	font-weight: 500;
	margin-bottom: 0.5rem;
    margin-top: 0;;
}

.tool-description {
	font-size: 0.875rem;
	opacity: 0.75;
	margin-bottom: 1rem;
}

.tool-link {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	color: rgba(239, 229, 192, 0.75);
	font-size: 0.875rem;

	i {
		font-size: 1rem;
	}
}
</style> 