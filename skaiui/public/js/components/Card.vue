<template>
	<div class="flex flex-column rounded-lg border bg-white px-4 py-6 mb-6 shadow">
		<div class="flex items-center justify-between mb-2" v-if="title || $slots['actions-left'] || $slots['actions']">
			<div class="flex items-baseline space-x-2">
				<div class="flex items-center space-x-2" v-if="$slots['actions-left']">
					<slot name="actions-left"></slot>
				</div>
				<h2 class="text-xl font-semibold m-0 text-slate-500">{{ title }}</h2>
			</div>
			<div class="flex items-center space-x-2" v-if="$slots['actions']">
				<slot name="actions"></slot>
			</div>
		</div>
		<p class="mb-2 text-base text-gray-600" v-if="subtitle">
			{{ subtitle }}
		</p>
		<div v-if="loading" class="mt-4 flex flex-auto flex-col items-center justify-center rounded-md">
			Loading ...
		</div>
		<div class="flex-auto" v-else-if="$slots['default']">
			<slot></slot>
		</div>
	</div>
</template>

<script setup>
const { title, subtitle, loading } = defineProps(['title', 'subtitle', 'loading'])
</script>
