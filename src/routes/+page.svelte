<script lang="ts">
	import { resolve }
		from '$app/paths';

	import FloatingGallery
		from '$lib/components/three/FloatingGallery.svelte';

</script>

<svelte:head>

	<title>
		adityan
	</title>

	<meta
		name="viewport"
		content="width=device-width, initial-scale=1"
	/>

</svelte:head>

<FloatingGallery />

<div class="overlay">

	<div class="small-text">
		A Portfolio / 2026
	</div>

	<h1>
		adityan
	</h1>

	<div class="links">

		<a href={resolve('/')}>
			link1
		</a>

		<a href={resolve('/')}>
			link2
		</a>

		<a href={resolve('/')}>
			link3
		</a>

	</div>

</div>

<style>

	:global(body) {

		margin: 0;

		overflow: hidden;

		background: #f3f3f3;

		font-family:
			Arial,
			Helvetica,
			sans-serif;
	}

	:global(*) {

		box-sizing: border-box;
	}

	/*
		OVERLAY
	*/

	.overlay {

		position: fixed;

		left: 4vw;

		top: 50%;

		transform:
			translateY(-50%);

		z-index: 10;

		display: flex;

		flex-direction: column;

		align-items: flex-start;

		pointer-events: none;
	}

	/*
		SMALL TEXT
	*/

	.small-text {

		margin: 0 0 0.4rem 0;

		font-size: 0.95rem;

		font-weight: 400;

		letter-spacing: 0.01em;

		color: rgba(0,0,0,0.85);
	}

	/*
		TITLE
	*/

	h1 {

		margin: 0;

		padding: 0;

		font-weight: 900;

		line-height: 0.88;

		letter-spacing: -0.07em;

		color: black;

		font-size:
			clamp(
				4rem,
				10vw,
				8rem
			);
	}

	/*
		LINKS
	*/

	.links {

		margin-top: 0.8rem;

		display: flex;

		align-items: center;

		gap: 4rem;

		pointer-events: auto;
	}

	.links a {

		color: rgba(0,0,0,0.85);

		text-decoration: none;

		font-size: 0.9rem;

		font-weight: 400;

		transition:
			opacity 0.2s ease;
	}

	.links a:hover {

		opacity: 0.5;
	}

	/*
		MOBILE
	*/

	@media (max-width: 768px) {

		.overlay {

			left: 7vw;

			top: auto;

			bottom: 10vh;

			transform: none;
		}

		.small-text {

			font-size: 0.8rem;
		}

		h1 {

			font-size:
				clamp(
					3.5rem,
					18vw,
					6rem
				);
		}

		.links {

			margin-top: 0.8rem;

			gap: 2rem;

			flex-wrap: wrap;
		}
	}

</style>