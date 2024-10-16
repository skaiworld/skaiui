<script setup>
import TasksList from "./TasksList.vue";
import Contact from "./Contact.vue";
import CheckIn from "./CheckIn.vue";
</script>

<template>
	<div class="row">
		<div class="col-lg-6 col-sm-12">
			<CheckIn />
			<Contact />
		</div>
		<div class="col-lg-6 col-sm-12">
			<TasksList />
		</div>
	</div>
</template>
