const observerOptions = {
	threshold: 0.16,
	rootMargin: '0px 0px -8% 0px'
};

const getRevealDelay = (binding) => {
	if (typeof binding.value === 'number') return binding.value;
	if (binding.value && typeof binding.value.delay === 'number') return binding.value.delay;

	return 0;
};

const reveal = (el) => {
	el.classList.add('is-visible');
};

export default {
	mounted(el, binding) {
		el.classList.add('scroll-reveal');
		el.style.setProperty('--reveal-delay', `${getRevealDelay(binding)}ms`);

		if (!('IntersectionObserver' in window)) {
			reveal(el);
			return;
		}

		const observer = new IntersectionObserver(([entry]) => {
			if (!entry.isIntersecting) return;

			reveal(el);
			observer.unobserve(el);
		}, observerOptions);

		observer.observe(el);
		el._scrollRevealObserver = observer;
	},
	updated(el, binding) {
		el.style.setProperty('--reveal-delay', `${getRevealDelay(binding)}ms`);
	},
	unmounted(el) {
		el._scrollRevealObserver?.disconnect();
		delete el._scrollRevealObserver;
	}
};
