import adapter from '@sveltejs/adapter-static';

const dev = process.argv.includes('dev');

const config = {

	kit: {

		adapter: adapter({

			pages: 'build',
			assets: 'build',

			fallback: '404.html'
		}),

		paths: {

			base: dev
				? ''
				: '/portfolio'
		},

		prerender: {

			handleHttpError: 'warn'
		}
	}
};

export default config;