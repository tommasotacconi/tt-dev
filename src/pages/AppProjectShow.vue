<script>
	import axios from 'axios';
	import { projectsUrl, storageUrl } from '../js/api';

	export default {
		name: 'AppProjectShow',
		data() {
			return {
				project: [],
				apiUrl: projectsUrl,
				isLoaded: false,
			}
		},
		methods: {
			getProjectsList() {
				axios.get(this.apiUrl + `/${this.$route.params.id}`)
					.then(response => {
						// handle success
						console.log(response.data);
						this.project = response.data.results;
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
		<h1 class="text-center py-5">{{ project[0].name }}</h1>
		<!-- Jumbotron image -->
		<img class="img-fluid" :src="getImagePath(`storage/${project[0].img_url}`)" alt="">
		<!-- Project characteristics -->
		<div class="container-md">
			<h2>{{ $t('projectShow.characteristics.authorsInfo.title') }}</h2>
			<p class="authors">{{ project[0].authors }}</p>

			<h2>{{ $t('projectShow.characteristics.typeInfo.title') }}</h2>
			<p class="type">{{ project[0].type.name }}</p>

			<h2>{{ $t('projectShow.characteristics.purposeInfo.title') }}</h2>
			<p class="authors">{{ project[0].arguments }}</p>

			<div class="row date-info">
				<div class="date-wrapper col-4">
					<h2>{{ $t('projectShow.characteristics.startInfo.title') }}</h2>
					<p>{{ project[0].start_date }}</p>
				</div>
				<div class="date-wrapper col-4">
					<h2>{{ $t('projectShow.characteristics.endInfo.title') }}</h2>
					<p>{{ project[0].end_date }}</p>
				</div>
			</div>

			<h2>{{ $t('projectShow.characteristics.techInfo.title') }}</h2>
			<p v-if="project[0].technologies">{{ $t('projectShow.characteristics.techInfo.emptyWarning') }}</p>
			<ul v-else>
				<li v-for="technology in project[0].technologies">{{ technology.name }}</li>
			</ul>
		</div>
	</main>
</template>

<style lang="scss" scoped>
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

	.container-md {
		h2 {
			font-size: 1.2rem;
			color: lightslategrey
		}

		p {
			margin-bottom: 50px;
		}
	}

</style>
