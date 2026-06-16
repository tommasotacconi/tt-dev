<script>
	import typewriter from '../js/typewriter';

	export default {
		data() {
			return {
				name: '',
				gender: '',
				loading: false,
				showInput: true,
				thought: {
					lang: '',
					text: '',
					arrIndex: null,
					timeRange: '',
				},
			}
		},
		methods: {
			async handleConfirm(e) {
				if (!this.name) return;

				this.loading = true;
				this.resetGender();

				try {
					if (this.gender) return;
					const supportedLocales = Object.keys(this.$i18n.messages);
					const locale = navigator.language;
					const [lang, country = null] = locale.split('-');

					const res = await fetch(`https://gender-api.com/get?name=${this.name}&country=${country}&key=${import.meta.env.VITE_GENDER_API_KEY}`);
					({ gender: this.gender = '', meaning: this.meaning } = await res.json());
				} catch (err) {
					console.log(err);
				} finally {
					this.loading = false;
					this.showInput = false;
				}
			},
			resetGender() {
				this.gender = '';
			},
			getThought() {
				const getRandInt = (max) => Math.floor(Math.random() * (max + 1));
				const thoughts = this.$i18n.tm('home.intro.message.thoughts')
				const th = this.thought;
				if (th.timeRange && th.arrIndex) th.text = thoughts[th.timeRange].sentences[th.arrIndex];
				else {
					for (const [interval, { sentences }] of Object.entries(thoughts)) {
						const [start, end] = interval.split('-');
						const currHour = new Date().getHours();
						if (currHour >= start && currHour < end) {
							th.arrIndex = getRandInt(sentences.length - 1);
							th.text = sentences[th.arrIndex];
							th.lang = this.$i18n.locale;
							th.timeRange = interval;
							break;
						}
					}
				}

			}
		},
		computed: {
			welcomeWord() {
				if (this.$i18n.locale === 'en') return 'welcome';

				return 'benvenut' + (this.gender === 'female' ? 'a' : 'o');
			},
			intro() {
				if (!this.gender) return;
				const th = this.thought;
				if (!th.text) this.getThought();
				else if (th.lang !== this.$i18n.locale) {
					th.lang = this.$i18n.locale;
					this.getThought();
				}
				const isThoughtIncomplete = th.text.slice(-1) !== '.';

				return [
					'`' + this.$t('home.intro.message.greeting', {
						name: this.name,
						welcome: this.welcomeWord
					}),
					[
						this.$t(isThoughtIncomplete
							? 'home.intro.message.incompleteThought'
							: 'home.intro.message.completeThought', { thought: this.thought.text }
						),
						this.$t('home.intro.message.site')
					].join(' '),
					this.$t('home.intro.message.warning') + '`'
				].join('\n\n');
			}
		},
		watch: {
			async intro(newValue) {
				if (!newValue) return;

				await this.$nextTick();

				typewriter.createWithProcessing(this.$refs.codeBl);
			}
		}
	}
</script>

<template>
	<h1 v-scroll-reveal class="text-center py-5">{{ $t('home.intro.title') }}</h1>

	<div v-scroll-reveal="120" class="code-wrapper">
		<pre class="cod-ex-block">
<code ref="codeBl" class="language-javascript typewriter">{{ intro }}</code>
			</pre>

		<Transition name="bounce">
			<div v-if="showInput" class="input-field">
				<div class="form-floating">
					<input id="name" class="form-control" v-model.trim="name" placeholder="inserisci nome" type="text"
						@keypress.enter="handleConfirm">
					<label for="name">{{ $t('home.intro.input.floatingLabel') }}</label>
					<div class="form-text">{{ $t('home.intro.input.usageMessage') }}</div>
				</div>
			</div>
		</Transition>
	</div>
</template>

<style lang="scss">
	h1 {
		vertical-align: middle;
		color: #8b949e
	}

	pre {
		position: relative;
	}

	/* Utility */
	.code-wrapper {
		position: relative;

		.form-text {
			color: #8b949e;
		}
	}

	.bounce-enter-active {
		animation: bounce-in 0.5s;
	}

	.bounce-leave-active {
		animation: bounce-in 0.5s reverse;
	}

	.input-field {
		width: min(85%, 350px);

		position: absolute;
		left: 50%;
		top: 50%;
		translate: -50% -50%;
		z-index: 1;

		font-size: 1rem;

		.form-floating>.form-control {
			color: #a5d6ff;
			background-color: #24292f;

			&,
			&:focus,
			&:not(:placeholder-shown) {
				&~label {
					color: #8b949e;
					background-color: transparent;

					&::after {
						background: transparent !important;
					}
				}
			}
		}
	}
</style>
