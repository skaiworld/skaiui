<template>
	<Card title="My Tasks" :loading="tasks.length === 0">
		<div class="max-h-40 overflow-auto">
			<a :href="`/app/task/${ task.name }`" class="relative no-underline group flex items-center py-2 hover:bg-slate-100 transition rounded-sm" v-for="task in tasks">
				<div class="w-2 h-2 rounded border-solid border-2 mr-2" :style="{ borderColor: task.color }"></div>
				<div>{{ task.subject }}</div>
				<div class="px-2 ml-2 bg-slate-400 text-slate-200 text-xs rounded-sm absolute right-0">{{ task.priority }}</div>
				<div class="text-slate-500 ml-2 opacity-0 group-hover:opacity-100 transition">❯</div>
			</a>
		</div>
		<div class="flex mt-3">
			<input class="form-control mr-2" type="text" :placeholder="placeholder" v-model="subject">
			<div class="relative group">
				<input type="checkbox" v-model="assign" class="assign border block rounded bg-slate-100 focus:ring-3 focus:ring-blue-300" />
				<div class="absolute -left-10 w-max z-10 bottom-full px-2 py-1 mb-1 text-sm text-white duration-300 bg-slate-800 rounded-md opacity-0 group-hover:opacity-100 transition pointer-events-none">
					Assign to me
					<div class="tooltip-arrow"></div>
				</div>
			</div>
			<button class="btn btn-success flex" @click="createNewTask">
				<span>Create</span>
				<Loading v-if="creating" />
			</button>

		</div>
	</Card>
</template>

<script setup>
import { ref, onMounted } from 'vue'

import Card from "./Card.vue";
import Loading from "./Loading.vue";
import { sleep } from '../services/utils'
import { fetchTasks, createTask } from '../services/api'

const tasks = ref([])
const subject = ref('')
const assign = ref(true)
const creating = ref(false)
const placeholder = ref('New Task')

onMounted( async () => tasks.value = await fetchTasks() )

async function createNewTask() {
	if ( creating.value ) return

	creating.value = true
	const newTask = await createTask( subject.value, assign.value )
	creating.value = false
	if (newTask) {
		appendTask( newTask )
		placeholder.value = 'Created Successfully'
		subject.value = ''
		await sleep(2)
		placeholder.value = 'New task'
	}
}

function appendTask(task) {
	if ( ! assign.value ) return
	task.color = '#0070cc'
	tasks.value.push(task)
}
</script>

<style>
input.assign {
	width: 28px !important;
	height: 28px;
	border: 1px solid rgb(203 213 225 / 1) !important;
}
</style>
