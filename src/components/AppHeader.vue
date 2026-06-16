<script>
	import SiteLogo from './SiteLogo.vue';

	export default {
		components: {
			SiteLogo
		}
	}
</script>

<template>
	<nav class="navbar navbar-expand-lg bg-body-tertiary">
		<div class="container-fluid">
			<router-link :to="{ name: 'home' }" class="navbar-brand" aria-label="Tommaso Tacconi portfolio home">
				<SiteLogo />
			</router-link>
			<div class="d-flex order-lg-1">
				<label class="d-inline navbar-text me-1" for="lang-select">
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
						<path fill="currentColor"
							d=" M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z ">
						</path>
					</svg>
				</label>
				<select id="lang-select" class="form-select locale-changer me-4" v-model="$i18n.locale"
					placeholder="choose language">
					<option disabled>Choose language</option>
					<option v-for="locale in $i18n.availableLocales" :key="`locale-${locale}`" :value="locale">{{ locale }}
					</option>
				</select>
				<button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav"
					aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
					<span class="navbar-toggler-icon"></span>
				</button>
			</div>
			<div class="collapse navbar-collapse" id="navbarNav">
				<ul class="navbar-nav">
					<li class="nav-item">
						<router-link :to="{ name: 'home' }" class="nav-link">{{ $t('components.header.nav.links.homepage')
						}}</router-link>
					</li>
					<li class="nav-item">
						<router-link :to="{ name: 'projects' }" class="nav-link">{{ $t('components.header.nav.links.projects')
						}}</router-link>
					</li>
					<li class="nav-item">
						<router-link :to="{ name: 'about' }" class="nav-link">{{ $t('components.header.nav.links.about')
						}}</router-link>
					</li>
				</ul>
			</div>
		</div>
	</nav>
</template>

<style lang="scss" scoped>
	@use '../style/variables/palette' as pall;

	.locale-changer {
		width: 70px;
	}

	.navbar-brand {
		display: inline-flex;
		align-items: center;
		width: 46px;
		height: 46px;
		padding: 0;
		color: pall.$primary;
	}

	.nav-link {
		position: relative;
		width: fit-content;
		color: pall.$text-soft;
		transition: color .2s ease;

		&::after {
			content: '';

			position: absolute;
			left: var(--bs-nav-link-padding-x);
			right: var(--bs-nav-link-padding-x);
			bottom: .25rem;

			height: 2px;

			background-color: pall.$secondary;

			transform: scaleX(0);
			transform-origin: left;
		}

		&:hover,
		&:focus {
			color: pall.$primary;
		}

		&.router-link-exact-active {
			color: pall.$primary;

			&::after {
				transform: scaleX(1);
				transition: transform .2s ease;
			}
		}
	}
</style>
