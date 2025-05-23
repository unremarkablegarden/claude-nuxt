<template>
	<ClientOnly>
		<div class="app">
			<div v-if="isConfigured" class="app-content" :style="{ marginLeft: showSidebar ? `${sidebarWidth}px` : '0', width: showSidebar ? `calc(100% - ${sidebarWidth}px)` : '100%' }">
				<ChatInterface
					:messages="messages"
					:config="config"
					:loading="loading"
					:last-usage="lastUsage"
					:format-tokens="formatTokens"
					:active-tab="sidebarTab"
					:is-sidebar-open="showSidebar"
					:current-chat-name="currentChatName"
					:is-modified="isChatModified"
					:chat-to-load="chatToLoad"
					@new-chat="handleNewChat"
					@configure="handleConfigure"
					@save="handleSaveClick"
					@load="handleLoad"
					@submit="handleSubmit"
				/>

				<ChatSidebar
					:is-open="showSidebar"
					:active-tab="sidebarTab"
					:config="config"
					:is-configured="isConfigured"
					:saved-chats="savedChats"
					:current-chat-name="currentChatName"
					:chat-to-load="chatToLoad"
					@update="handleConfigSubmit"
					@load="handleLoadChat"
					@delete="showDeleteConfirm"
					@save="handleSaveChat"
					@save-as="handleSaveAs"
					@cancel="handleCancelSave"
					@skip="handleSkipSave"
					@resize="handleSidebarResize"
					@close="showSidebar = false"
				/>
			</div>

			<ConfirmDialog
				v-model="showDeleteDialog"
				title="Delete Chat"
				:message="'Are you sure you want to delete \'' + chatToDelete + '\'? This action cannot be undone.'"
				:actions="[
					{ label: 'Cancel', class: 'btn-text', action: 'cancel' },
					{ label: 'Delete', class: 'btn-danger', action: 'confirm' }
				]"
				@action="handleDeleteAction"
			/>

			<ConfirmDialog
				v-model="showSaveDialog"
				v-model:inputValue="inputValue"
				title="Save Chat"
				:message="saveDialogMessage"
				:show-input="true"
				:actions="saveDialogActions"
				@action="handleSaveAction"
			/>
		</div>
	</ClientOnly>
</template>

<script setup lang="ts">
import { useChatUI } from '~/composables/useChatUI'
import ConfirmDialog from '~/components/ConfirmDialog.vue'

const {
	messages,
	config,
	isConfigured,
	savedChats,
	currentChatName,
	isChatModified,
	loading,
	lastUsage,
	formatTokens,
	chatToLoad,
	handleNewChat: baseHandleNewChat,
	handleConfigSubmit,
	handleSaveClick: baseHandleSaveClick,
	handleSaveChat: baseHandleSaveChat,
	handleSaveAs: baseHandleSaveAs,
	handleCancelSave,
	handleSkipSave,
	handleLoadChat: baseHandleLoadChat,
	handleDeleteChat,
	handleSubmit
} = useChatUI()

// Sidebar state
const showSidebar = ref(false)
const sidebarTab = ref<'settings' | 'load' | 'save' | 'new'>('settings')
const sidebarWidth = ref(400)

// Delete dialog state
const showDeleteDialog = ref(false)
const chatToDelete = ref('')

const showDeleteConfirm = (name: string) => {
	chatToDelete.value = name
	showDeleteDialog.value = true
}

const handleDeleteAction = (action: string) => {
	if (action === 'confirm') {
		handleDeleteChat(chatToDelete.value)
	}
	chatToDelete.value = ''
}

// Save dialog state
const showSaveDialog = ref(false)
const saveDialogType = ref<'new' | 'save' | 'overwrite'>('new')
const saveDialogMessage = computed(() => {
	switch (saveDialogType.value) {
		case 'overwrite':
			return `Save changes to "${currentChatName?.value || ''}"? Leave empty to overwrite, or enter a new name to save as.`
		case 'new':
			return 'Save current chat? Leave empty to save as new, or enter a name to save as.'
		default:
			return 'Save Chat? Leave empty to save as new, or enter a name to save as.'
	}
})

const inputValue = ref('')

const saveDialogActions = computed(() => {
	const actions = []
	
	if (saveDialogType.value === 'new') {
		actions.push({ label: 'Don\'t Save', class: 'btn-text', action: 'skip' })
	}
	
	actions.push(
		{ label: 'Cancel', class: 'btn-text', action: 'cancel' },
		{ 
			label: saveDialogType.value === 'overwrite' && !inputValue.value 
				? 'Overwrite' 
				: 'Save As', 
			class: 'btn-primary', 
			action: 'confirm' 
		}
	)
	
	return actions
})

const handleSaveAction = (action: string, value?: string) => {
	switch (action) {
		case 'confirm':
			if (value) {
				handleSaveChat(value)
			} else if (currentChatName?.value) {
				handleSaveChat(currentChatName.value)
			}
			break
		case 'skip':
			handleSkipSave()
			break
		case 'cancel':
			handleCancelSave()
			break
	}
	showSaveDialog.value = false
	inputValue.value = ''
}

const handleConfigure = () => {
	if (showSidebar.value && sidebarTab.value === 'settings') {
		showSidebar.value = false
	} else {
		sidebarTab.value = 'settings'
		showSidebar.value = true
	}
}

const handleLoad = () => {
	if (showSidebar.value && sidebarTab.value === 'load') {
		showSidebar.value = false
	} else {
		sidebarTab.value = 'load'
		showSidebar.value = true
	}
}

const handleNewChat = () => {
	const result = baseHandleNewChat()
	if (result === 'save') {
		saveDialogType.value = 'new'
		showSaveDialog.value = true
	}
}

const handleSaveClick = () => {
	if (showSidebar.value && sidebarTab.value === 'save') {
		showSidebar.value = false
	} else {
		const result = baseHandleSaveClick()
		if (result === 'save') {
			saveDialogType.value = currentChatName?.value ? 'overwrite' : 'save'
			showSaveDialog.value = true
		}
	}
}

const handleSidebarResize = (width: number) => {
	sidebarWidth.value = width
}

const handleSaveChat = (name: string) => {
	const result = baseHandleSaveChat(name)
	if (result === 'close') {
		showSidebar.value = false
	}
}

const handleLoadChat = (name: string) => {
	const result = baseHandleLoadChat(name)
	if (result === 'save') {
		saveDialogType.value = 'new'
		showSaveDialog.value = true
	}
}

const handleSaveAs = () => {
	const result = baseHandleSaveAs()
	if (result === 'save') {
		saveDialogType.value = 'save'
		showSaveDialog.value = true
	}
}
</script>

<style>
.app {
	height: 100vh;
	display: flex;
	flex-direction: column;
	background: black;
	color: #efe5c0;
	overflow: hidden;
}

.app-content {
	position: relative;
	width: 100%;
	height: 100vh;
	overflow: hidden;
}
</style> 