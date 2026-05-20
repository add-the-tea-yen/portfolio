<script lang="ts">
	import { onMount } from 'svelte';
	import * as THREE from 'three';

	let container: HTMLDivElement;

	onMount(async () => {

		/*
			SCENE
		*/

		const scene =
			new THREE.Scene();

		scene.background =
			new THREE.Color(0xf3f3f3);

		scene.fog =
			new THREE.Fog(
				0xf3f3f3,
				10,
				65
			);

		/*
			RESPONSIVE
		*/

		const isMobile =
			window.innerWidth < 768;

		/*
			CAMERA
		*/

		const camera =
			new THREE.PerspectiveCamera(
				75,
				window.innerWidth /
					window.innerHeight,
				0.1,
				1000
			);

		camera.position.set(0, 0, 0);

		/*
			RENDERER
		*/

		const renderer =
			new THREE.WebGLRenderer({
				antialias: true,
				alpha: true
			});

		renderer.setPixelRatio(
			Math.min(
				window.devicePixelRatio,
				2
			)
		);

		renderer.setSize(
			window.innerWidth,
			window.innerHeight
		);

		renderer.outputColorSpace =
			THREE.SRGBColorSpace;

		container.appendChild(
			renderer.domElement
		);

		/*
			LIGHT
		*/

		scene.add(
			new THREE.AmbientLight(
				0xffffff,
				1
			)
		);

		/*
			AUTO IMPORT IMAGES
			FROM static/images
		*/

		const imageModules =
			import.meta.glob(
				'/src/lib/images/**/*.{jpg,jpeg,png,webp,avif}',
				{
					eager: true,
					query: '?url',
					import: 'default'
				}
			);

		/*
			SHUFFLE ORDER
		*/

		const imageUrls =
			Object.values(
				imageModules
			)
				.sort(
					() =>
						Math.random() -
						0.5
				) as string[];

		/*
			LOAD TEXTURES
		*/

		const loader =
			new THREE.TextureLoader();

		const textures =
			await Promise.all(

				imageUrls.map(
					(url) =>
						new Promise<
							THREE.Texture
						>(
							(resolve) => {

								loader.load(
									url,
									(texture) => {

										texture.colorSpace =
											THREE.SRGBColorSpace;

										resolve(
											texture
										);
									}
								);
							}
						)
				)
			);

		/*
			IMAGE COUNT
		*/

		const totalCards =
			textures.length;

		/*
			DYNAMIC DENSITY
		*/

		const densityFactor =
			Math.max(
				0.7,
				Math.min(
					2,
					totalCards / 30
				)
			);

		/*
			SPREAD
		*/

		const radialSpread =
			(isMobile ? 2.2 : 4.2) *
			densityFactor;

		/*
			CORRIDOR LENGTH
		*/

		const corridorLength =
			(isMobile ? 22 : 42) *
			densityFactor;

		/*
			CARD TYPE
		*/

		type Card = {

			mesh: THREE.Mesh;

			material:
				THREE.MeshBasicMaterial;

			baseScale: number;

			floatOffset: number;
		};

		const cards: Card[] = [];

		/*
			RANDOMIZE CARD
		*/

		function randomizeCard(
			card: Card,
			resetZ = false
		) {

			const {
				mesh
			} = card;

			/*
				ANGLE
			*/

			const angle =
				Math.random() *
				Math.PI *
				2;

			/*
				RADIUS
			*/

			const radius =
				radialSpread *
				(
					0.2 +
					Math.random() *
						0.8
				);

			mesh.position.x =
				Math.cos(angle) *
				radius;

			mesh.position.y =
				(Math.random() -
					0.5) *
				(isMobile ? 2.4 : 3.8);

			/*
				INFINITE DEPTH
			*/

			if (resetZ) {

				mesh.position.z -=
					corridorLength;
			}

			/*
				SUBTLE OFFSET
			*/

			mesh.position.x +=
				(Math.random() -
					0.5) *
				0.25;

			mesh.position.y +=
				(Math.random() -
					0.5) *
				0.25;

			/*
				ROTATION
			*/

			mesh.rotation.z =
				(Math.random() -
					0.5) *
				0.08;

			/*
				SCALE
			*/

			card.baseScale =
				Math.random() *
					0.15 +
				0.72;
		}

		/*
			CREATE FIELD
		*/

		for (
			let i = 0;
			i < totalCards;
			i++
		) {

			const tex =
				textures[i];

			const image =
				tex.image;

			/*
				IMAGE SCALE
			*/

			const scale =
				isMobile
					? 0.00092
					: 0.00115;

			let width =
				image.width *
				scale;

			let height =
				image.height *
				scale;

			/*
				MAX HEIGHT
			*/

			const maxHeight =
				isMobile
					? 1
					: 1.7;

			if (
				height > maxHeight
			) {

				const ratio =
					maxHeight /
					height;

				height *= ratio;
				width *= ratio;
			}

			/*
				GEOMETRY
			*/

			const geometry =
				new THREE.PlaneGeometry(
					width,
					height
				);

			const material =
				new THREE.MeshBasicMaterial(
					{
						map: tex,
						transparent: true,
						opacity: 1
					}
				);

			const mesh =
				new THREE.Mesh(
					geometry,
					material
				);

			/*
				INITIAL DEPTH
			*/

			mesh.position.z =
				-(
					Math.random() *
					corridorLength
				);

			scene.add(mesh);

			const card: Card = {

				mesh,
				material,

				baseScale:
					Math.random() *
						0.15 +
					0.83,

				floatOffset:
					Math.random() *
					1000
			};

			randomizeCard(card);

			cards.push(card);
		}

		/*
			MOUSE LOOK
		*/

		let targetYaw = 0;
		let targetPitch = 0;

		let currentYaw = 0;
		let currentPitch = 0;

		window.addEventListener(
			'mousemove',
			(e) => {

				targetYaw =
					(
						e.clientX /
						window.innerWidth -
						0.5
					) *
					Math.PI *
					0.25;

				targetPitch =
					(
						e.clientY /
						window.innerHeight -
						0.5
					) *
					0.2;
			}
		);

		/*
			SCROLL
		*/

		let targetScroll = 0;
		let currentScroll = 0;

		window.addEventListener(
			'wheel',
			(e) => {

				targetScroll +=
					e.deltaY *
					0.016;

			},
			{ passive: true }
		);

		/*
			RESIZE
		*/

		window.addEventListener(
			'resize',
			() => {

				camera.aspect =
					window.innerWidth /
					window.innerHeight;

				camera.updateProjectionMatrix();

				renderer.setSize(
					window.innerWidth,
					window.innerHeight
				);
			}
		);

		/*
			ANIMATION
		*/

		const animate = () => {

			requestAnimationFrame(
				animate
			);

			/*
				SCROLL
			*/

			currentScroll +=
				(
					targetScroll -
					currentScroll
				) *
				0.05;

			camera.position.z =
				-currentScroll;

			/*
				MOUSE LOOK
			*/

			currentYaw +=
				(
					targetYaw -
					currentYaw
				) *
				0.05;

			currentPitch +=
				(
					targetPitch -
					currentPitch
				) *
				0.05;

			camera.lookAt(
				Math.sin(
					currentYaw
				),
				-currentPitch,
				camera.position.z - 5
			);

			/*
				CARDS
			*/

			cards.forEach(
				(card) => {

					const {
						mesh,
						material,
						floatOffset
					} = card;

					/*
						FLOAT
					*/

					mesh.position.y +=
						Math.sin(
							Date.now() *
								0.0007 +
								floatOffset
						) *
							0.0006;

					/*
						FACE CAMERA
					*/

					mesh.lookAt(
						camera.position
					);

					/*
						INFINITE LOOP
					*/

					const relativeZ =
						mesh.position.z -
						camera.position.z;

					if (
						relativeZ > 2
					) {

						randomizeCard(
							card,
							true
						);
					}

					/*
						DISTANCE
					*/

					const distance =
						camera.position.distanceTo(
							mesh.position
						);

					/*
						DEPTH OPACITY
					*/

					const opacity =
						THREE.MathUtils.clamp(
							1 -
								(
									distance -
									3
								) /
									16,
							0,
							1
						);

					material.opacity =
						opacity;

					/*
						CENTER SMALLER
					*/

					const centerFactor =
						THREE.MathUtils.clamp(
							Math.abs(
								mesh.position.x
							) /
								radialSpread,
							0,
							1
						);

					const centerScale =
						0.75 +
						centerFactor *
							0.25;

					/*
						DEPTH SCALE
					*/

					const depthScale =
						THREE.MathUtils.clamp(
							card.baseScale *
								centerScale *
								(
									1 -
									distance *
										0.008
								),
							0.4,
							1
						);

					mesh.scale.set(
						depthScale,
						depthScale,
						depthScale
					);
				}
			);

			renderer.render(
				scene,
				camera
			);
		};

		animate();

		return () => {

			renderer.dispose();

		};
	});
</script>

<div
	class="three-container"
	bind:this={container}
></div>

<style>
	.three-container {

		position: fixed;

		inset: 0;

		width: 100%;
		height: 100%;

		overflow: hidden;

		z-index: 0;
	}
</style>