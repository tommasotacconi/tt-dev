<script>	import AboutSkills from '../components/AboutSkills.vue';
	import PersonalLogo from '../components/PersonalLogo.vue';

	const createContact = (hrefBase, address) => ({
		hrefBase,
		address,
		get href() {
			return [this.hrefBase, this.address].join('/');
		}
	});
	const contacts = {
		github: createContact('https://github.com', 'tommasotacconi'),
		linkedin: createContact('https://www.linkedin.com/in', 'tommaso-tacconi'),
		'envelope-at': createContact('mailto:', 'tommaso.tacconi@gmail.com'),
		telegram: createContact('https://t.me', 'Tom_T218')
	};

	export default {
		data() {
			return {
				contacts
			};
		},
		computed: {
			cvPath() {
				const eventualLangSuf = this.$i18n.locale === 'it' ? '' : '_EN';

				return `/cv/cv_Tommaso_Tacconi${eventualLangSuf}.pdf`
			}
		},
		components: {
			AboutSkills,
			PersonalLogo
		},
	}
</script>

<template>
	<h1 v-scroll-reveal>{{ $t('about.title') }}</h1>
	<div v-scroll-reveal="100">
		<PersonalLogo />
	</div>

	<AboutSkills />

	<section v-scroll-reveal class="personal-path">
		<h2 class="mt-2 py-1">{{ $t('about.personalPath.title') }}</h2>

		<i18n-t keypath="about.personalPath.text" tag="p">
			<a :href="cvPath" target="_blank">{{
				$t('about.personalPath.linkWord')
			}}</a>.
		</i18n-t>
	</section>
	<section v-scroll-reveal class="contacts">
		<h2 class="mt-2 py-1">{{ $t('about.contacts.title') }}</h2>

		<ul>
			<li v-for="[service, { href, address }] of Object.entries(contacts)" :key="service">
				<a :href="href" target="_blank" rel="noopener noreferrer">
					<i :class="['bi', 'bi-' + service]"></i><span class="item-text">{{ address }}</span>
				</a>
			</li>
		</ul>
	</section>

</template>

<style lang="scss">
	@use '../style/variables/palette' as pall;

	section {
		margin: 1rem 0;
	}

	a[href] {
		--bs-link-color: #{pall.$text-main};
		color: var(--bs-link-color);
		text-decoration: none;

		&:hover {
			--bs-link-color: var(--bs-link-hover-color);
			--bs-link-hover-color: #{pall.$accent-blue};
		}
	}

	li {
		list-style-type: none;

		a {
			text-decoration: none;
			color: pall.$text-main;

			@each $icon-name, $color in (envelope-at pall.$link-color,
				github pall.$gh-color,
				linkedin pall.$lkdin-color,
				whatsapp pall.$wa-color,
				telegram pall.$teleg-color,
			) {
				&:hover:has(.bi-#{$icon-name}) .bi {
					color: $color;
				}
			}
		}

		i {
			margin-right: 10px;
		}
	}
</style>
