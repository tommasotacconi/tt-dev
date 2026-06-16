<script>
	import AppStack from '../components/AppStack.vue';
	import PersonalLogo from '../components/PersonalLogo.vue';
	import SkillText from '../components/SkillText.vue';
	import skillsMap from '../js/skillsMap.js';

	const plhol = '<service>'
	const mesService = `http://${plhol}.me`;
	const contacts = {
		'envelope-at': {
			hrefBase: 'mailto:',
			address: 'tommaso.tacconi@gmail.com'
		},
		whatsapp: {
			hrefBase: mesService.replace(plhol, 'wa'),
			address: '331 5378794'
		},
		telegram: {
			hrefBase: mesService.replace(plhol, 't'),
			address: 'Tom_T218'
		},
	}
	const connectorContexts = ['frontend', 'backend'];
	const cableRemeasureDelays = [180, 520];
	const point = (origin, x = 0, y = 0) => ({
		x: origin.x + x,
		y: origin.y + y
	});
	const reflect = (point, control) => ({
		x: point.x * 2 - control.x,
		y: point.y * 2 - control.y
	});
	const svgPoint = ({ x, y }) => `${x} ${y}`;
	const cubic = (controlA, controlB, target) =>
		`C ${svgPoint(controlA)}, ${svgPoint(controlB)}, ${svgPoint(target)}`;

	export default {
		data() {
			return {
				contacts,
				hoveredSkill: null,
				expandedContext: '',
				connectorRefs: {},
				connectorContexts,
				cableBox: {
					width: 520,
					height: 220
				},
				cablePoints: {
					frontend: { x: 142, y: 78 },
					backend: { x: 250, y: 126 }
				},
				resizeObserver: null,
				skillsMap
			};
		},
		methods: {
			getFaIcon(item) {
				const associations = {
					frontend: 'computer',
					backend: 'server',
					application: 'code',
					data: 'database'
				}

				return associations[item];
			},
			handleShowCtx(ctx) {
				this.expandedContext = this.expandedContext === ctx ? null : ctx;
				this.$nextTick(this.updateCableGeometry);
				cableRemeasureDelays.forEach(delay => window.setTimeout(this.updateCableGeometry, delay));
			},
			getPlaceholders(text) {
				return [...text.matchAll(/{(.*?)}/g)].map(match => match[1]);
			},
			getPhPerSection(sections) {
				const result = {};

				for (const [secName, contents] of Object.entries(sections)) {
					if (secName === 'title') continue;

					if (contents.text) result[secName] = this.getPlaceholders(contents.text);
					else result[secName] = this.getPhPerSection(contents);
				}

				return result;
			},
			getChildSections(section) {
				return Object.fromEntries(
					Object.entries(section).filter(([key]) => !['title', 'text'].includes(key))
				);
			},
			setConnectorRef(ctx, el) {
				if (el) this.connectorRefs[ctx] = el;
			},
			updateCableGeometry() {
				const area = this.$refs.stackArea;
				const frontend = this.connectorRefs.frontend;
				const backend = this.connectorRefs.backend;

				if (!area || !frontend || !backend) return;

				this.cableBox = {
					width: area.clientWidth,
					height: area.clientHeight
				};

				const getConnectorCenter = (el) => {
					let x = el.offsetLeft + el.offsetWidth / 2;
					let y = el.offsetTop + el.offsetHeight / 2;
					let offsetParent = el.offsetParent;

					while (offsetParent && offsetParent !== area) {
						x += offsetParent.offsetLeft;
						y += offsetParent.offsetTop;
						offsetParent = offsetParent.offsetParent;
					}

					return { x, y };
				};

				this.cablePoints = {
					frontend: getConnectorCenter(frontend),
					backend: getConnectorCenter(backend)
				};
			},
		},
		mounted() {
			this.$nextTick(() => {
				this.updateCableGeometry();

				if ('ResizeObserver' in window) {
					this.resizeObserver = new ResizeObserver(this.updateCableGeometry);
					this.resizeObserver.observe(this.$refs.stackArea);
				}

				window.addEventListener('resize', this.updateCableGeometry);
			});
		},
		beforeUnmount() {
			this.resizeObserver?.disconnect();
			window.removeEventListener('resize', this.updateCableGeometry);
		},
		components: {
			PersonalLogo,
			AppStack,
			SkillText
		},
		computed: {
			msgSkillsSections() {
				return this.$i18n.getLocaleMessage(this.$i18n.locale).about.skills.sections;
			},
			// Placeholders per sections
			phPerSec() {
				return this.getPhPerSection(this.msgSkillsSections);
			},
			cableGradient() {
				const { frontend, backend } = this.cablePoints;

				return {
					x1: frontend.x,
					y1: frontend.y,
					x2: backend.x,
					y2: backend.y
				};
			},
			cablePath() {
				const { frontend, backend } = this.cablePoints;
				const dx = backend.x - frontend.x;
				const dy = backend.y - frontend.y;
				const loopCenter = point(frontend, dx * 0.58, dy * 0.48);
				const coilStart = point(loopCenter, -54, 1);
				const coilEnd = point(loopCenter, 54);
				const startEscape = point(frontend, Math.max(dx * 0.06, 10), 46);
				const endEscape = point(backend, -Math.max(dx * 0.06, 10), -28);
				const firstControl = point(frontend, 1, 16);
				const startEscapeControl = point(frontend, 3, 34);
				const coilStartControl = point(coilStart, -26, 13);
				const loopPoints = [
					[point(loopCenter, 6, -2), point(loopCenter, 6, -34)],
					[point(loopCenter, -18, 3), point(loopCenter, -28, 33)],
					[point(loopCenter, 30, -3), point(loopCenter, 36, -36)],
					[point(loopCenter, 12, 2), point(loopCenter, 4, 34)]
				];
				const coilEndControl = point(loopCenter, 42, -18);
				const endEscapeControl = point(endEscape, -22, -12);
				const loopCurves = loopPoints.map(([target, control], index) => {
					const previous = index === 0 ? coilStart : loopPoints[index - 1][0];
					const previousControl = index === 0 ? coilStartControl : loopPoints[index - 1][1];

					return cubic(reflect(previous, previousControl), control, target);
				});

				return [
					`M ${svgPoint(frontend)}`,
					cubic(firstControl, startEscapeControl, startEscape),
					cubic(reflect(startEscape, startEscapeControl), coilStartControl, coilStart),
					...loopCurves,
					cubic(reflect(loopPoints.at(-1)[0], loopPoints.at(-1)[1]), coilEndControl, coilEnd),
					cubic(reflect(coilEnd, coilEndControl), endEscapeControl, endEscape),
					cubic(reflect(endEscape, endEscapeControl), point(backend, -1, -10), backend)
				].join(' ');
			}
		}
	}
</script>

<template>
	<h1 v-scroll-reveal>{{ $t('about.title') }}</h1>
	<div v-scroll-reveal="100">
		<PersonalLogo />
	</div>

	<section v-scroll-reveal="160">
		<h2 class="mt-2 py-1">{{ $t('about.skills.title') }}</h2>

		<div class="section-contents d-flex">
			<div class="section-text">
				<section v-for="(section, ctx) in msgSkillsSections" :key="ctx" :class="[ctx + '-section']">
					<h3>
						{{ section.title }}
						<button :class="['btn', 'btn-info', 'skill-toggle', { active: expandedContext === ctx }]"
							@click="handleShowCtx(ctx)"><i :class="['fa-solid', `fa-${getFaIcon(ctx)}`]"></i></button>
					</h3>
					<SkillText v-if="section.text" :keypath="`about.skills.sections.${ctx}.text`" :text="section.text"
						:skills-map="skillsMap" @skill-enter="hoveredSkill = $event" @skill-leave="hoveredSkill = null" />
					<section v-else v-for="(subSection, subCtx) in getChildSections(section)" :key="subCtx"
						:class="['skill-text-subsection']">
						<span :class="['skill-text-label', subCtx + '-subctx']">{{ subSection.title }}</span>
						<SkillText :keypath="`about.skills.sections.${ctx}.${subCtx}.text`" :text="subSection.text"
							:skills-map="skillsMap" @skill-enter="hoveredSkill = $event" @skill-leave="hoveredSkill = null" />
					</section>
				</section>
			</div>

			<div class="section-illustration">
				<div ref="stackArea" class="stack-plane d-md-flex flex-wrap">
					<svg ref="stackCable" class="stack-cable" :viewBox="`0 0 ${cableBox.width} ${cableBox.height}`"
						aria-hidden="true">
						<defs>
							<linearGradient id="stack-cable-gradient" :x1="cableGradient.x1" :y1="cableGradient.y1"
								:x2="cableGradient.x2" :y2="cableGradient.y2" gradientUnits="userSpaceOnUse">
								<stop offset="0%" stop-color="#2dd4bf" />
								<stop offset="100%" stop-color="#693ff0" />
							</linearGradient>
						</defs>
						<path class="stack-cable__track" pathLength="1" :d="cablePath" />
						<path class="stack-cable__pulse stack-cable__pulse--request" pathLength="1" :d="cablePath" />
						<path class="stack-cable__pulse stack-cable__pulse--response" pathLength="1" :d="cablePath" />
						<circle class="stack-cable__emitter stack-cable__emitter--request" :cx="cablePoints.frontend.x"
							:cy="cablePoints.frontend.y" r="4" />
						<circle class="stack-cable__emitter stack-cable__emitter--response" :cx="cablePoints.backend.x"
							:cy="cablePoints.backend.y" r="4" />
					</svg>
					<div :class="['skill-context', ctx]" v-for="(stackOrSubctx, ctx) in getPhPerSection(msgSkillsSections)">
						<h3 :class="{ hovered: expandedContext === ctx }">
							<i :class="['fa-solid', 'fa-' + getFaIcon(ctx)]"></i>
							<span v-if="connectorContexts.includes(ctx)" :ref="el => setConnectorRef(ctx, el)"
								class="skill-context__connector" aria-hidden="true">
								<span class="skill-context__connector-ring"></span>
								<span class="skill-context__connector-core"></span>
							</span>
						</h3>
						<template v-if="Array.isArray(stackOrSubctx)">
							<AppStack :stack="stackOrSubctx" :pickedCard="hoveredSkill" :expanded="expandedContext === ctx" />
						</template>
						<template v-else>
							<div :class="['skill-subcontext', subCtx]" v-for="(stack, subCtx) in stackOrSubctx">
								<h3><i :class="['fa-solid', 'fa-' + getFaIcon(subCtx)]"></i></h3>
								<AppStack :stack :pickedCard="hoveredSkill" :expanded="expandedContext === ctx"
									:gridOptions="{ cols: 2 }" />
							</div>
						</template>
					</div>
				</div>
			</div>
		</div>
	</section>
	<section v-scroll-reveal>
		<h2 class="mt-2 py-1">{{ $t('about.personalPath.title') }}</h2>

		<i18n-t keypath="about.personalPath.text" tag="p">
			<a href="../../public/cv/cv_Tommaso_Tacconi.pdf" target="_blank">{{
				$t('about.personalPath.linkWord')
			}}</a>.
		</i18n-t>
	</section>
	<section v-scroll-reveal>
		<h2 class="mt-2 py-1">{{ $t('about.contacts.title') }}</h2>

		<ul>
			<li v-for="[service, { hrefBase, address }] of Object.entries(contacts)">
				<a :href="hrefBase + address" target="_blank" rel="noopener noreferrer">
					<i :class="['bi', 'bi-' + service]"></i><span class="item-text">{{ address }}</span>
				</a>
			</li>
		</ul>
	</section>

</template>

<style lang="scss">
	@use '../style/general.scss' as gen;
	@use '../style/variables/dimensions' as *;
	@use '../style/variables/palette' as pall;
	@use '../style/variables/transformation' as tran;

	section {
		margin: 1rem 0;
	}

	h1 {
		text-align: center;
		color: lightsteelblue
	}


	li {
		list-style-type: none;

		a {
			text-decoration: none;
			color: #000;

			@each $icon-name, $color in (envelope-at gen.$link-color,
				whatsapp gen.$wa-color,
				telegram gen.$teleg-color) {
				&:hover:has(.bi-#{$icon-name}) .bi {
					color: $color;
				}
			}
		}

		i {
			margin-right: 10px;
		}
	}

	// Utility
	.section-contents {
		min-height: inherit;
	}

	%frontend-ctx {
		color: pall.$frontend;
	}

	%backend-ctx {
		color: pall.$backend;
	}

	%app-subctx {
		color: pall.$application;
	}

	%data-subctx {
		color: pall.$data;
	}

	.section-text {
		width: auto;
		flex: 1 1 50%;

		.frontend-section h3 {
			@extend %frontend-ctx;
		}

		.backend-section h3 {
			@extend %backend-ctx;
		}

		.skill-toggle {
			border: 0;
			color: pall.$text-main;
			background: pall.$card-gradient;

			&.active {
				box-shadow:
					inset 0 0 0 2px pall.$secondary,
					0 4px 12px rgba(pall.$secondary, .22);

			}
		}

		.frontend-section .skill-toggle i {
			@extend %frontend-ctx;
		}

		.backend-section .skill-toggle i {
			@extend %backend-ctx;
		}

		.skill-text-label {
			display: inline-flex;
			margin-bottom: 0.35rem;
			font-size: 0.75rem;
			font-weight: 700;
			letter-spacing: 0.06em;
			text-transform: uppercase;
			color: pall.$data;

			&.application-subctx {
				@extend %app-subctx;
			}

			&.data-subctx {
				@extend %data-subctx;
			}
		}
	}

	.section-illustration {
		position: relative;
		flex: 0 0 50%;
		perspective: 3500px;
		transform-style: preserve-3d;
	}

	.stack-plane {
		position: relative;
		width: 100%;
		min-height: 220px;
		rotate: tran.$rot-3d;
		transform-origin: center;
		transform-style: preserve-3d;
	}

	.stack-cable {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		min-height: 220px;

		overflow: visible;
		pointer-events: none;
		z-index: 0;

		transform-origin: center;
		transform-style: preserve-3d;
	}

	.stack-cable__track,
	.stack-cable__pulse {
		fill: none;
		stroke-linecap: round;
		stroke-linejoin: round;
		stroke-width: 3;
	}

	.stack-cable__track {
		stroke: rgba(pall.$primary, .11);
	}

	.stack-cable__pulse {
		stroke-dasharray: .16 2;
		stroke-dashoffset: 0;

		animation-duration: 8s;
		animation-iteration-count: infinite;
		animation-timing-function: linear;
	}

	.stack-cable__pulse--request {
		stroke: pall.$frontend;
		filter: drop-shadow(0 0 6px rgba(pall.$frontend, .28));

		animation-name: stack-cable-request;
	}

	.stack-cable__pulse--response {
		stroke: pall.$backend;
		filter: drop-shadow(0 0 6px rgba(pall.$backend, .28));

		animation-name: stack-cable-response;
	}

	.stack-cable__emitter {
		opacity: 0;
		transform-box: fill-box;
		transform-origin: center;

		animation-duration: 8s;
		animation-iteration-count: infinite;
		animation-timing-function: ease-out;
	}

	.stack-cable__emitter--request {
		fill: pall.$frontend;
		filter: drop-shadow(0 0 10px rgba(pall.$frontend, .72));

		animation-name: stack-cable-request-emitter;
	}

	.stack-cable__emitter--response {
		fill: pall.$backend;
		filter: drop-shadow(0 0 10px rgba(pall.$backend, .72));

		animation-name: stack-cable-response-emitter;
	}

	$cable-signal-frames: (
		request: ('0%': (.024 2, 0, 0),
			'8%': (.024 2, 0, 0),
			'11%': (.024 2, 0, 1),
			'15%': (.16 2, 0, 1),
			'34%': (.16 2, -.78, 1),
			'39%': (.024 2, -.976, 1),
			'44%': (.024 2, -.976, 1),
			'48%, 99%': (.024 2, -.976, 0),
			'100%': (.024 2, 0, 0)),
		response: ('0%, 50%': (.024 2, -.976, 0),
			'58%': (.024 2, -.976, 0),
			'61%': (.024 2, -.976, 1),
			'64%': (.16 2, -.84, 1),
			'82%': (.16 2, -.16, 1),
			'87%': (.024 2, 0, 1),
			'92%': (.024 2, 0, 1),
			'96%, 99%': (.024 2, 0, 0),
			'100%': (.024 2, -.976, 0))
	);

@mixin cable-signal-state($dash-array, $dash-offset, $opacity) {
	stroke-dasharray: $dash-array;
	stroke-dashoffset: $dash-offset;
	opacity: $opacity;
}

@each $name, $frames in $cable-signal-frames {
	@keyframes stack-cable-#{$name} {
		@each $step, $state in $frames {
			#{$step} {
				@include cable-signal-state($state...);
			}
		}
	}
}

@keyframes stack-cable-request-emitter {

	0%,
	4%,
	13%,
	100% {
		opacity: 0;
		transform: scale(.6);
	}

	7% {
		opacity: 1;
		transform: scale(1);
	}

	11% {
		opacity: 0;
		transform: scale(4.2);
	}
}

@keyframes stack-cable-response-emitter {

	0%,
	54%,
	63%,
	100% {
		opacity: 0;
		transform: scale(.6);
	}

	57% {
		opacity: 1;
		transform: scale(1);
	}

	61% {
		opacity: 0;
		transform: scale(4.2);
	}
}


// .skill {
// 	color: pall.$text-soft;
// }

.skill-context,
.skill-subcontext {
	perspective: 3500px;
	transform-style: preserve-3d;
}


.skill-context {
	z-index: 1;
	padding: 0 $px;
	margin: 0 auto;
	display: flex;
	align-items: center;

	position: relative;
	column-gap: 10px;

	h3 {
		--shadow-width: 2px;
		--shadow-color: #{pall.$border-soft};
		--connector-color: #{pall.$border-hover};

		padding: {
			left: 10px;
			bottom: 5px;
		}

		aspect-ratio: 5 / 4;
		border-radius: $br;
		display: flex;
		align-items: end;

		position: relative;
		font-size: 1.2rem;
		vertical-align: bottom;

		transition: box-shadow 0.5s;
		box-shadow: 0 0 0 var(--shadow-width) var(--shadow-color);
	}

	.skill-context__connector {
		position: relative;
		display: inline-flex;
		flex: 0 0 auto;
		margin-left: 8px;
		width: 16px;
		height: 16px;
		border-radius: 50%;
		background: color-mix(in srgb, var(--connector-color) 20%, transparent);
		filter: drop-shadow(0 0 5px color-mix(in srgb, var(--connector-color) 34%, transparent));
	}

	.skill-context__connector-ring,
	.skill-context__connector-core {
		position: absolute;
		inset: 50% auto auto 50%;
		border-radius: 50%;
		transform: translate(-50%, -50%);
	}

	.skill-context__connector-ring {
		width: 11px;
		height: 11px;
		background: pall.$bg-main;
		border: 1.6px solid var(--connector-color);
	}

	.skill-context__connector-core {
		width: 4.4px;
		height: 4.4px;
		background: var(--connector-color);
	}

	// Each item: context, width, color, shadow-color
	$skill-contexts: (
		(frontend, $card-lg, pall.$frontend, pall.$frontend),
		(backend, $card-xxl, pall.$backend, pall.$backend)
	);

@each $ctx, $width, $color, $shadow-color in $skill-contexts {
	&.#{$ctx}>h3 {
		width: $width;
		--connector-color: #{$color};
		@extend %#{$ctx}-ctx;

		&:hover,
		&.hovered {
			--shadow-width: 6px;
			--shadow-color: #{$shadow-color};
		}
	}

}

.skill-subcontext {
	$x-of: 3%;
	width: calc(50% - ($x-of * 2 + $px));

	position: absolute;

	&.application {
		@extend %app-subctx;
		left: calc($px + $x-of);
	}

	&.data {
		@extend %data-subctx;
		right: calc($px + $x-of);
	}

	& h3 {
		width: 100%;
		height: 100%;
		border: 2px solid pall.$border-soft;
		border-radius: $br;
	}
}
}
</style>
