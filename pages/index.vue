<template>
	<ClientOnly>
		<div class="app">
			<div v-if="isConfigured">
				<ChatInterface
					:messages="messages"
					:config="config"
					:loading="loading"
					:last-usage="lastUsage"
					:format-tokens="formatTokens"
					@new-chat="handleNewChat"
					@configure="showConfigDialog = true"
					@save="handleSaveClick"
					@load="showLoadDialog = true"
					@submit="handleSubmit"
				/>

				<!-- Config Dialog -->
				<ConfigModal
					v-if="!isConfigured || showConfigDialog"
					:config="config"
					:is-configured="isConfigured"
					@update="handleConfigSubmit"
					@cancel="handleCancelConfig"
				/>

				<!-- Save Dialog -->
				<SaveChatModal
					v-if="showSaveDialog"
					:mode="saveDialogMode"
					:current-chat-name="currentChatName || null"
					@save="handleSaveChat"
					@cancel="handleCancelSave"
					@skip="handleSkipSave"
				/>

				<!-- Load Dialog -->
				<LoadChatModal
					v-if="showLoadDialog"
					:saved-chats="savedChats"
					@load="handleLoadChat"
					@delete="handleDeleteChat"
					@close="showLoadDialog = false"
				/>
			</div>
		</div>
	</ClientOnly>
</template>

<script setup lang="ts">
import { useChatUI } from '~/composables/useChatUI'

const {
	messages,
	config,
	isConfigured,
	savedChats,
	currentChatName,
	loading,
	lastUsage,
	showSaveDialog,
	showLoadDialog,
	showConfigDialog,
	saveDialogMode,
	formatTokens,
	handleNewChat,
	handleConfigSubmit,
	handleCancelConfig,
	handleSaveClick,
	handleSaveChat,
	handleCancelSave,
	handleSkipSave,
	handleLoadChat,
	handleDeleteChat,
	handleSubmit
} = useChatUI()
</script> 