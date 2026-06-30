<script>
	import AppStack from './AppStack.vue';
	import SkillText from './SkillText.vue';
	import skillsMap from '../js/skillsMap.js';
	import { getRotationMatrix, backendLocalToFrontendLocal } from '../js/transfMatrix.js';

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
		name: 'AboutSkills',
		data() {
			return {
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
				skillsMap,
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
				const area = this.$refs.stacksArea;
				const rotatedParent = area; // the element with rotate3d + preserve-3d + perspective
				const frontend = this.connectorRefs.frontend;
				const backend = this.connectorRefs.backend;
				if (!area || !rotatedParent || !frontend || !backend) return;

				const width = area.clientWidth, height = area.clientHeight;
				this.cableBox = { width, height };

				const R = getRotationMatrix(rotatedParent);
				const perspectiveDepth = parseFloat(getComputedStyle(rotatedParent).perspective) || Infinity;

				const localOffset = (el) => {
					let x = el.offsetLeft + el.offsetWidth / 2, y = el.offsetTop + el.offsetHeight / 2, p = el.offsetParent;
					while (p && p !== area) { x += p.offsetLeft; y += p.offsetTop; p = p.offsetParent; }
					return { x, y };
				};

				const fe = localOffset(frontend); // already lies on the reference plane — usable directly
				const be = localOffset(backend);  // flat layout position within backend's own (z = -150) plane

				this.cablePoints = {
					frontend: fe,
					backend: backendLocalToFrontendLocal({ xb: be.x, yb: be.y, zOffset: -150, width, height, perspectiveDepth, R })
				};
			},
		},
		mounted() {
			this.$nextTick(() => {
				this.updateCableGeometry();

				if ('ResizeObserver' in window) {
					this.resizeObserver = new ResizeObserver(this.updateCableGeometry);
					this.resizeObserver.observe(this.$refs.stacksArea);
				}

				window.addEventListener('resize', this.updateCableGeometry);
			});
		},
		beforeUnmount() {
			this.resizeObserver?.disconnect();
			window.removeEventListener('resize', this.updateCableGeometry);
		},
		components: {
			AppStack,
			SkillText,
		},
		computed: {
			msgSkillsSections() {
				return this.$i18n.getLocaleMessage(this.$i18n.locale).about.skills.sections;
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

				return [
					`M ${svgPoint(frontend)}`,
					`L ${svgPoint(point(frontend, 0, 15))}`,
					`${cubic(point(frontend, 0, 10), point(frontend, 0, 35), point(frontend, -10, 60))}`,
					`${cubic(point(frontend, -80, 235), point(backend, 0, 100), point(backend))}`,
				].join(' ');
			},
		}
	}
</script>

<template>
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
				<div ref="stacksArea" class="stacks-area">
					<svg ref="stackCable" class="stack-cable" :viewBox="`0 0 ${cableBox.width} ${cableBox.height}`"
						aria-hidden="true">
						<defs>
							<linearGradient id="stack-cable-gradient" :x1="cableGradient.x1" :y1="cableGradient.y1"
								:x2="cableGradient.x2" :y2="cableGradient.y2" gradientUnits="userSpaceOnUse">
								<stop offset="0%" stop-color="#2dd4bf" />
								<stop offset="100%" stop-color="#693ff0" />
							</linearGradient>
						</defs>
						<circle class="stack-cable__emitter stack-cable__emitter--request" :cx="cablePoints.frontend.x"
							:cy="cablePoints.frontend.y" r="4" />
						<circle class="stack-cable__emitter stack-cable__emitter--response" :cx="cablePoints.backend.x"
							:cy="cablePoints.backend.y" r="4" />
						<path class="stack-cable__track" pathLength="1" :d="cablePath" />
						<path class="stack-cable__pulse stack-cable__pulse--request" pathLength="1" :d="cablePath" />
						<path class="stack-cable__pulse stack-cable__pulse--response" pathLength="1" :d="cablePath" />
					</svg>

					<div :class="['skill-context', ctx, { expanded: expandedContext === ctx }]"
						v-for="(stackOrSubctx, ctx) in getPhPerSection(msgSkillsSections)" :key="ctx">
						<h3>
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
							<div :class="['skill-subcontext', subCtx]" v-for="(stack, subCtx) in stackOrSubctx" :key="subCtx">
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
</template>

<style lang="scss">
	@use '../style/variables/dimensions' as *;
	@use '../style/variables/palette' as pall;
	@use '../style/variables/transformation' as tran;
	$planes-dist: 150px;

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

	%threed-setup {
		transform-style: preserve-3d;
	}

	.section-contents {
		min-height: inherit;
	}


	.section-text {
		width: auto;
		flex: 0 60%;

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
		padding: 0 30px;
		position: relative;
		flex: 1;
		@extend %threed-setup;
	}

	.stacks-area {
		$height: 220px;
		position: relative;
		width: 100%;
		min-height: $height;
		rotate: tran.$rot-3d;
		@extend %threed-setup;
		perspective: 3000px;
	}

	.stack-cable {
		position: absolute;

		overflow: visible;
		pointer-events: none;
		z-index: 1;

		will-change: transform;
		transform-origin: center;
		@extend %threed-setup;
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

.skill-context,
.skill-subcontext {
	@extend %threed-setup;
}

$skill-contexts: (
	(frontend, $card-lg, pall.$frontend, pall.$frontend),
	(backend, $card-xxl, pall.$backend, pall.$backend)
);
$skill-subcontexts: application app left, data data right;

@mixin highlight-stack($ctx) {
	.skill-card i {
		@extend %#{$ctx}-ctx;
	}

	@each $subctx, $alias, $from in $skill-subcontexts {
		.skill-subcontext.#{$subctx} i {
			@extend %#{$alias}-subctx;
		}
	}
}

.skill-context {
	width: fit-content;
	padding: 0 $px;
	display: flex;
	align-items: center;

	position: absolute;
	column-gap: 10px;

	&.frontend {
		top: -80px;
		left: 75px;
	}

	&.backend {
		transform: translateZ(-$planes-dist);
		transform-style: preserve-3d;
	}

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

	@each $ctx, $width, $color, $shadow-color in $skill-contexts {
		&.#{$ctx} {
			&>h3 {
				width: $width;
				--connector-color: #{$color};
				@extend %#{$ctx}-ctx;
			}

			&>h3:hover,
			&.expanded>h3 {
				--shadow-width: 6px;
				--shadow-color: #{$shadow-color};
			}

			&>h3:hover {
				&~ {
					@include highlight-stack($ctx)
				}
			}

			&.expanded {
				@include highlight-stack($ctx)
			}
		}
	}

	.skill-subcontext {
		$x-of: 3%;
		width: calc(50% - ($x-of * 2 + $px));

		position: absolute;

		@each $subctx, $alias, $from in $skill-subcontexts {
			&.#{$subctx} {
				#{$from}: calc($px + $x-of);

				h3 {
					@extend %#{$alias}-subctx;
				}
			}
		}

		& h3 {
			width: 100%;
			height: 100%;
			border: 2px solid pall.$border-soft;
			border-radius: $br;
		}
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
}
</style>
