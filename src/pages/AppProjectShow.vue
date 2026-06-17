<script>
	import axios from 'axios';
	import { projectsUrl, storageUrl } from '../js/api';

	export default {
		name: 'AppProjectShow',
		data() {
			return {
				project: null,
				apiUrl: projectsUrl,
				isLoaded: false,
				localeTxtKey: 'projectShow.characteristics'
			}
		},
		methods: {
			getProjectsList() {
				axios.get(this.apiUrl + `/${this.$route.params.id}`)
					.then(({ data: { results: [project] } }) => {
						// handle success
						const { start_date: start, end_date: end, technologies: stack, ...rest } = project;
						this.project = { ...rest, type: this.getObjNameKey(rest.type), tech: stack.map(t => this.getObjNameKey(t)).join(', '), start, end };
						this.isLoaded = true;
					})
					.catch(function (error) {
						// handle error
						console.log(error);
					});
			},
			getImagePath: function (imgPath) {
				return storageUrl(imgPath);
			},
			getObjNameKey(obj) {
				return obj.name.charAt(0).toUpperCase() + obj.name.slice(1);
			}
		},
		computed: {
			localeTxt() {
				const txt = this.$tm('projectShow.characteristics');
				console.log(txt);

				return txt;
			}
		},
		created() {
			this.getProjectsList();
		}
	}
</script>

<template>
	<!-- Loader -->
	<div class="loader-container" v-if="!isLoaded">
		<div class="loader mx-auto"></div>
	</div>
	<!-- Main -->
	<main class="project-show" v-else>
		<!-- Title -->
		<h1 v-scroll-reveal class="text-center py-5">{{ project.name }}</h1>
		<!-- Jumbotron image -->
		<img v-scroll-reveal="100" class="img-fluid" :src="getImagePath(`storage/${project.img_url}`)" alt="">
		<!-- Project characteristics -->
		<div class="container-md">
			<div class="row">
				<div v-for="(txt, descriptor, index) in localeTxt"
					:class="[descriptor === 'purpose' ? 'col-12' : ['start', 'end'].includes(descriptor) ? 'col-3' : 'col']"
					v-scroll-reveal="{ delay: 140 + index * 60 }">
					<h2>{{ txt.title }}</h2>
					<p :class="[descriptor]">{{ project[descriptor] }}</p>
				</div>
			</div>

			<div class="project-link-wrapper" v-scroll-reveal="{ delay: 140 + Object.keys(localeTxt).length * 60 }">
				<a :href="project.url" target="_blank" class="btn browse-to btn-outline-secondary"
					v-scroll-reveal="{ delay: 140 + Object.keys(localeTxt).length }">
					Vai a {{ project.name }}
					<div class="arrow-wrapper">
						<div class="arrow"></div>
					</div>
				</a>
			</div>
		</div>
	</main>
</template>

<style lang="scss" scoped>
	@use '../style/variables/palette' as pall;

	.loader-container {
		height: calc(100vh - 56px);
	}

	// css loader, credits to CSS Loaders
	.loader {
		--loader-w: 50px;
		width: var(--loader-w);
		aspect-ratio: 1;
		border-radius: 50%;
		border: 8px solid #000;
		position: relative;
		top: calc(50% - var(--loader-w) / 2);
		animation:
			l20-1 0.8s infinite linear alternate,
			l20-2 1.6s infinite linear;
	}

	@keyframes l20-1 {
		0% {
			clip-path: polygon(50% 50%, 0 0, 50% 0%, 50% 0%, 50% 0%, 50% 0%, 50% 0%)
		}

		12.5% {
			clip-path: polygon(50% 50%, 0 0, 50% 0%, 100% 0%, 100% 0%, 100% 0%, 100% 0%)
		}

		25% {
			clip-path: polygon(50% 50%, 0 0, 50% 0%, 100% 0%, 100% 100%, 100% 100%, 100% 100%)
		}

		50% {
			clip-path: polygon(50% 50%, 0 0, 50% 0%, 100% 0%, 100% 100%, 50% 100%, 0% 100%)
		}

		62.5% {
			clip-path: polygon(50% 50%, 100% 0, 100% 0%, 100% 0%, 100% 100%, 50% 100%, 0% 100%)
		}

		75% {
			clip-path: polygon(50% 50%, 100% 100%, 100% 100%, 100% 100%, 100% 100%, 50% 100%, 0% 100%)
		}

		100% {
			clip-path: polygon(50% 50%, 50% 100%, 50% 100%, 50% 100%, 50% 100%, 50% 100%, 0% 100%)
		}
	}

	@keyframes l20-2 {
		0% {
			transform: scaleY(1) rotate(0deg)
		}

		49.99% {
			transform: scaleY(1) rotate(135deg)
		}

		50% {
			transform: scaleY(-1) rotate(0deg)
		}

		100% {
			transform: scaleY(-1) rotate(-135deg)
		}
	}

	img {
		width: 100%;
		height: 40vh;
		object-fit: cover;
		object-position: center;
		margin-bottom: 100px;
	}

	.btn-outline-secondary {
		--bs-btn-color: #{pall.$text-main};
		--bs-btn-border-color: #{pall.$accent-blue};
		--bs-btn-hover-border-color: #{pall.$accent-blue};
		--bs-btn-hover-bg: transparent;
	}

	/* Credits to uiverse.io/satyamchaudharydev/modern-sheep-10 */
	a.browse-to {
		--primary-color: var(--bs-btn-bg);
		--secondary-color: var(--bs-btn-color);
		--hover-color: var(--bs-btn-hover-bg);
		--arrow-width: 10px;
		--arrow-stroke: 2px;
		padding: 10px 14px;
		box-sizing: border-box;
		display: inline-flex;
		column-gap: 5px;
		transition: 0.2s background;
		align-items: center;

		.arrow-wrapper {
			display: flex;
			justify-content: center;
			align-items: center;
		}

		.arrow {
			margin-top: 1px;
			width: var(--arrow-width);
			background: var(--primary-color);
			height: var(--arrow-stroke);
			position: relative;
			transition: 0.2s;

			&::before {
				content: "";
				box-sizing: border-box;
				position: absolute;
				border: solid var(--secondary-color);
				border-width: 0 var(--arrow-stroke) var(--arrow-stroke) 0;
				display: inline-block;
				top: -3px;
				right: 3px;
				transition: 0.2s;
				padding: 3px;
				transform: rotate(-45deg);
			}
		}

		&:hover {
			--bs-btn-color: #{pall.$accent-blue};
			color: var(--bs-btn-color);
			background-color: var(--hover-color);

			.arrow {
				background: var(--secondary-color);

				&::before {
					right: 0;
				}
			}
		}
	}

	.container-md {
		h2 {
			font-size: 1.2rem;
		}

		p {
			margin-bottom: 50px;
		}
	}

</style>
