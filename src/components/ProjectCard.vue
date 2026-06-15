<script>
	import { storageUrl } from '../js/api';

	const plHolPath = new URL('../assets/images/placeholder.jpg', import.meta.url);

	export default {
		data() {
			return {}
		},
		methods: {
			getImagePath(imgPath) {
				if (imgPath !== null) return storageUrl('storage/' + imgPath);
			},
		},
		props: {
			cardProject: {
				type: Object,
				required: true
			},
			state: {
				type: Object,
				required: false,
			},
		},
		setup() {
			return { plHolPath };
		}
	}
</script>

<template>
	<!-- Card Bootstrap -->
	<div class="card">
		<Transition>
			<img :src="getImagePath(cardProject.img_url) ?? plHolPath" class="card-img-top" :alt="cardProject.name"
				v-if="state.show">
		</Transition>
		<div class="card-body m-0 p-2">
			<h5 class="card-title playing-card">{{ cardProject.name }}</h5>
			<Transition>
				<p v-if="state.show" class="authors"><span class="card-data">{{ $t('components.card.shrinked.authorsDetail')
				}}</span class="authors-block">{{
							cardProject.authors }}</p>
			</Transition>
		</div>
		<Transition>
			<div class="button-wrapper" v-if="state.hovered">
				<a class="btn btn-primary" @click="$router.push(`/projects/${cardProject.id}`)">{{
					$t('elements.buttons.showBtn.text')
				}}</a>
			</div>
		</Transition>
	</div>
</template>

<style lang="scss" scoped>
	.card {
		height: 220px;

		position: relative;
		overflow-y: hidden;

		transition: height 1s;

		.card-data {
			margin-right: 10px;
			color: #5081b3;
		}
	}

	.col-2.expanded>.card {
		height: 330px;

		.card-body {
			display: flex;
			justify-content: space-between;
		}
	}


	a {
		background-color: #5082b3dd;
		border-color: transparent;
		color: #000;
		position: absolute;
		left: 10px;
		bottom: 10px;
	}

	.v-enter-active,
	.v-leave-active {
		transition: opacity 0.5s ease;
	}

	.v-enter-from,
	.v-leave-to {
		opacity: 0;
	}

</style>
