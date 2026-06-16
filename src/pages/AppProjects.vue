<script>
	import axios from 'axios';
	import ProjectCard from '../components/ProjectCard.vue';
	import { projectsUrl } from '../js/api';

	export default {
		name: 'AppMain',
		data() {
			return {
				projectsList: [],
				apiUrl: projectsUrl,
				isLoaded: false,
				colsPerLine: 6,
				currentHoveredDivIndex: null,
			}
		},
		methods: {
			getProjectsList() {
				axios.get(this.apiUrl)
					.then(response => {
						// handle success
						console.log(response.data);
						this.projectsList = response.data.results;
						this.isLoaded = true;
					})
					.catch(function (error) {
						// handle error
						console.log(error);
					});
			},
		},
		components: {
			ProjectCard,
		},
		created() {
			this.getProjectsList();
		},
		computed: {
			numberOfColsGroups() {
				return Math.ceil(this.projectsList.length / this.colsPerLine);
			},
			collapsedColsIndexes() {
				let result = [];
				for (let i = 0; i < this.numberOfColsGroups; i++) {
					let isCurrentExpandedColGroup = false;
					let indexesArray = [];
					for (let j = 0; j < this.colsPerLine; j++) {
						let colIndex = j + this.colsPerLine * i;
						indexesArray.push(colIndex);
						if (colIndex === this.currentHoveredDivIndex) isCurrentExpandedColGroup = true;
					}
					if (isCurrentExpandedColGroup) {
						result = indexesArray;
						break;
					};
				}
				console.log(result);
				return result;
			},
			// Compute an object with keys names given by cards indexes and values of boolean type, used in card to decide whether or not all card details. Expanded card show all details in a starting card plus a button 'show'.  
			detailsShowsList() {
				let result = {};
				for (let i = 0; i < this.projectsList.length; i++) {
					let colIndex = i;
					if (this.collapsedColsIndexes.includes(colIndex) && colIndex !== this.currentHoveredDivIndex) result[colIndex] = false;
					else result[colIndex] = true;
				}
				console.log(result);
				return result;
			},
		},
	}
</script>

<template>
	<!-- Loader -->
	<div class="loader-container" v-if="!isLoaded">
		<div class="loader mx-auto"></div>
	</div>
	<!-- Main -->
	<main class="pb-4" v-else>
		<h1 v-scroll-reveal class="text-center py-5">{{ $t('projectsOverview.title') }}</h1>
		<div class="card-container container-md">
			<!-- Contatori di card -->
			<div v-scroll-reveal="100" class="filter-counter-box row d-block p-4">
				<div>{{ $t('projectsOverview.projects.completed') }}: <span class="badge rounded-pill"><span
							class="pillow-text">{{
								projectsList.length }}</span></span></div> <!-- counter for projects -->
			</div>
			<!-- Row di cols -->
			<div class="row g-3 mt-5">
				<!-- Cols -->
				<div class="col-2 card-col"
					:class="{ 'collapsed': collapsedColsIndexes.includes(index) && index !== currentHoveredDivIndex, 'expanded': currentHoveredDivIndex === index }"
					v-for="(project, index) in projectsList" :key="index"
					v-scroll-reveal="{ delay: 140 + (index % colsPerLine) * 70 }">
					<ProjectCard :cardProject="project"
						:state="{ show: detailsShowsList[index], hovered: index === currentHoveredDivIndex }"
						@mouseenter="currentHoveredDivIndex = index" @mouseleave="currentHoveredDivIndex = null" />
				</div>
			</div>
		</div>
	</main>
</template>

<style lang="scss">
	@use '../style/variables/palette' as pall;

	.loader-container {
		height: calc(100vh - 56px);
	}

	// css loader, credits to CSS Loaders
	/* HTML: <div class="loader"></div> */
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

	.rounded-pill {
		background-color: pall.$accent-blue;
	}

	.col-2 {
		transition: width 0.8s;
	}

	.col-2.expanded {
		width: calc(100% * 6 / 12);
	}

	.col-2.collapsed {
		width: calc(100% * (6 / 12) / 5);
	}
</style>
