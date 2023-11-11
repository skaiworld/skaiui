<script setup>
import { ref } from "vue";

import Card from "./Card.vue";
import { myName, checkedStatus, checkIn } from './utils'

const checkedIn = ref( -1 );
const checkedTime = ref( '' );
const me = myName();
const h = new Date().getHours();

function setCheckedStatus( status ) {
	if ( status.type === 'IN' ) {
		const t = new Date( status.time )
		const day = t.getDate() === ( new Date().getDate() ) ? 'Today' : `on ${ t.getDate() } ${ t.toLocaleString('default', { weekday: 'short' } ) }`
		checkedTime.value =  `${ day } at ${ t.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }) }`;
	}
	checkedIn.value = status.type === 'IN'
}

async function prepareChecked() {
	const status = await checkedStatus();
	setCheckedStatus( status )
}
prepareChecked();

async function checkInNow() {
	const status = await checkIn();
	if ( status ) {
		setCheckedStatus( status );
	}
}

async function checkOutNow() {
	const status = await checkIn( 'OUT' );
	if ( status ) {
		setCheckedStatus( status );
	}
}
</script>

<template>
	<div class="row">
		<div class="col-lg-6 col-sm-12">
			<Card>
				<p class="text-xl leading-5">Good {{ `${ h<12 ? 'Morning' : ( h<18 ? 'Afternoon' : 'Evening') }` }},</p>
				<p class="text-xl font-bold leading-5">{{ me }}!</p>
				<div v-if="checkedIn === -1">
					<a class="btn btn-lg btn-success disabled btn-block">Loading</a>
				</div>
				<div v-else-if="checkedIn">
					<p>You've Checked in {{ checkedTime }}</p>
					<a @click="checkOutNow" class="btn btn-lg btn-primary btn-block">Check Out</a>
				</div>
				<div v-else>
					<p>You've not Checked in yet Today</p>
					<a @click="checkInNow" class="btn btn-lg btn-success btn-block">Check In</a>
				</div>
			</Card>
		</div>
		<div class="col-lg-6 col-sm-12">
			<Card>
				Coming soon
			</Card>
		</div>
	</div>
</template>

<style>
/* Copied from tailwind */
.mb-10 {
	margin-bottom: 2.5rem;
}
.flex-auto {
	flex: 1 1 auto;
}
.text-xl {
	font-size: 1.25rem;
	line-height: 1.75rem;
}
.font-bold {
	font-weight: 700;
}
.leading-5 {
	line-height: 1.25rem;
}
</style>
