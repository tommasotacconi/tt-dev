<script>
	export default {}
</script>

<template>
	<div class="personal-logo text-center">
		<div class="logo-frame my-3" aria-label="Tommaso Tacconi personal image">
			<img src="../assets/images/TT-2.jpg" class="rounded-circle" alt="">
		</div>
		<h2 id="personal-name">Tommaso Tacconi</h2>
		<h3 id="personal-job">Sviluppatore full stack</h3>
	</div>
</template>

<style lang="scss" scoped>
	@use '../style/variables/palette' as pall;

	h3 {
		font-weight: 400;
	}

	/* Utility */
	.personal-logo {
		padding: 30px;
	}

	$logo-glow-vars: --logo-glow-alpha number,
		--logo-glow-blur length,
		--logo-glow-front-x length,
		--logo-glow-front-y length,
		--logo-glow-back-x length,
		--logo-glow-back-y length;

	@each $name, $data-type in $logo-glow-vars {
		@property #{$name} {
			syntax: "<#{$data-type}>";
			inherits: false;
			initial-value: if(sass($data-type ==length): 0px; else: 0);
		}
	}

	$logo-glow-initial: .24 42px -8px -2px 8px 3px;
	$logo-glow-frames: '0%, 100%' .2 38px -5px -6px 12px 4px,
		'18%' .3 54px -17px -16px 6px 12px,
		'34%' .38 68px -22px 8px 12px -10px,
		'51%' .24 48px -4px 15px 18px 4px,
		'68%' .34 62px -2px -10px 22px 16px,
		'84%' .27 52px -14px 4px 2px -14px;

	@mixin set-logo-glow($alpha, $blur, $front-x, $front-y, $back-x, $back-y) {
		--logo-glow-alpha: #{$alpha};
		--logo-glow-blur: #{$blur};
		--logo-glow-front-x: #{$front-x};
		--logo-glow-front-y: #{$front-y};
		--logo-glow-back-x: #{$back-x};
		--logo-glow-back-y: #{$back-y};
	}

	.logo-frame {
		@include set-logo-glow($logo-glow-initial...);

		position: relative;
		width: 160px;
		aspect-ratio: 1;
		margin: 0 auto;

		filter:
			drop-shadow(var(--logo-glow-front-x) var(--logo-glow-front-y) 20px rgba(pall.$frontend, var(--logo-glow-alpha))) drop-shadow(var(--logo-glow-back-x) var(--logo-glow-back-y) 22px rgba(pall.$backend, var(--logo-glow-alpha)));

		animation: logo-glow-breathe 4.8s ease-in-out infinite;

		&::before {
			content: '';

			position: absolute;
			inset: 8px;

			border-radius: 50%;
			box-shadow:
				0 0 0 1px rgba(pall.$frontend, .18),
				0 0 0 2px rgba(pall.$backend, .14),
				var(--logo-glow-front-x) var(--logo-glow-front-y) var(--logo-glow-blur) rgba(pall.$frontend, var(--logo-glow-alpha)),
				var(--logo-glow-back-x) var(--logo-glow-back-y) calc(var(--logo-glow-blur) + 30px) rgba(pall.$backend, var(--logo-glow-alpha)),
				0 0 calc(var(--logo-glow-blur) + 44px) rgba(pall.$frontend, .14),
				0 0 calc(var(--logo-glow-blur) + 48px) rgba(pall.$backend, .13);
		}

		img {
			position: absolute;
			inset: 10px;

			display: block;
			width: calc(100% - 20px);
			height: calc(100% - 20px);
			object-fit: cover;
		}
	}

	@keyframes logo-glow-breathe {
		@each $step, $alpha, $blur, $front-x, $front-y, $back-x, $back-y in $logo-glow-frames {
			#{$step} {
				@include set-logo-glow($alpha, $blur, $front-x, $front-y, $back-x, $back-y);
			}
		}
	}

	#personal-name {
		color: pall.$secondary;
	}

	#personal-job {
		color: pall.$text-main;
	}

	.fa-brands {
		font-size: 2rem;
	}
</style>
