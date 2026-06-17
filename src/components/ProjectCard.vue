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
			browseTo(url) {
				this.$router.push({ path: url });
			}
		},
		props: {
			proj: {
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
			<a :href="proj.url">
				<img :src="getImagePath(proj.img_url) ?? plHolPath" class="card-img-top" :alt="proj.name" v-if="state.show">
			</a>
		</Transition>
		<div class="card-body m-0 p-2">
			<h3 class="card-title playing-card">{{ proj.name }}</h3>
			<Transition>
				<p v-if="state.show" class="authors">
				<h4 id="authors-word">{{ $t('components.card.shrinked.authors') }}</h4>
				{{ proj.authors }}</p>
			</Transition>
		</div>
		<Transition>
			<div class="button-wrapper" v-if="state.hovered">
				<a class="btn" @click="$router.push(`/projects/${proj.id}`)">{{
					$t('elements.buttons.show.text')
				}}</a>
			</div>
		</Transition>
	</div>
</template>

<style lang="scss" scoped>
	@use '../style/variables/palette' as pall;

	.card {
		height: 220px;
		border-width: 2px;

		position: relative;
		overflow-y: hidden;

		transition: height 1s;

		h3.card-title {
			color: pall.$text-main;
		}

		h4#authors-word {
			display: inline;
			margin-right: 10px;
			color: #5081b3;
			font-size: 0.8em;
		}
	}

	.col-2.expanded>.card {
		height: 330px;
		border-color: pall.$secondary;

		h3 {
			margin-right: 40px;
		}

		.card-body {
			display: flex;
			justify-content: space-between;
		}
	}

	.button-wrapper {
		a {
			border-color: pall.$primary;
			color: pall.$primary;
			background: transparent;
			position: absolute;
			left: 10px;
			bottom: 10px;

			&:hover {
				border-color: pall.$secondary;
				background-color: pall.$secondary;
			}
		}
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
