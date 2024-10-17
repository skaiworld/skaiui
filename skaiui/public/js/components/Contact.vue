<template>
	<Card title="Create Contact">
		<div class="flex flex-col gap-3 md:flex-row">
			<input type="text" class="form-control" placeholder="First Name *" v-model="first">
			<input type="text" class="form-control" placeholder="Last Name" v-model="last">
		</div>
		<div class="flex flex-col gap-3 md:flex-row mt-3">
			<input type="text" class="form-control" placeholder="Phone Number *" v-model="phone">
			<select class="form-control" v-model="userType">
				<option value="Lead">Lead</option>
				<option value="Customer">Customer</option>
				<option value="Supplier">Supplier</option>
			</select>
		</div>
		<div class="flex mt-3 items-center">
			<textarea class="form-control" placeholder="Note" v-model="note" style="height: 32px;"></textarea>
		</div>
		<div class="flex mt-3 items-center">
			<button class="btn btn-success flex" @click="create">
				<span>Create</span>
				<Loading v-if="creating" />
			</button>
			<div class="notice ml-2" v-html="notice"></div>
		</div>
	</Card>
</template>

<script setup>
import { ref } from 'vue'

import Card from "./Card.vue";
import Loading from "./Loading.vue";
import { createContact } from '../services/api'

const first = ref('')
const last = ref('')
const phone = ref('')
const userType = ref('Lead')
const note = ref('')

const creating = ref(false)
const notice = ref('')

function resetForm() {
	first.value = ''
	last.value = ''
	phone.value = ''
	note.value = ''
}

async function create() {
	notice.value = ''
	if ( ! first.value ) {
		notice.value = 'First name is required'
		return
	}
	if ( ! phone.value ) {
		notice.value = 'Phone number is required'
		return
	}
	creating.value = true
	const r = await createContact( {
		first: first.value,
		last: last.value,
		phone: phone.value,
		type: userType.value,
		note: note.value,
	} )
	creating.value = false

	if ( 'message' in r ) {
		notice.value = r.message
		if ( r.message.includes( 'created' ) ) resetForm()
	} else {
		notice.value = `Could not create. Create <a href="/app/${ userType.value.toLowerCase() }">Manually</a>`
	}
}

</script>
