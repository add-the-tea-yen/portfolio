<script lang="ts">
	import { onMount } from 'svelte';
	import * as THREE from 'three';

	let container: HTMLDivElement;

	onMount(() => {

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
				8,
				60
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

		camera.position.set(
			0,
			0,
			0
		);

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
			LOAD EVERYTHING
		*/

		const init = async () => {

			/*
				IMAGES
			*/

			const imageModules =
				import.meta.glob(
					'$lib/images/**/*.{jpg,jpeg,png,webp,avif}',
					{
						eager: true,
						query: '?url',
						import: 'default'
					}
				);

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
				TEXTURES
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
				COUNT
			*/

			const totalCards =
				textures.length;

			/*
				DENSITY
			*/

			const densityFactor =
				Math.max(
					0.8,
					Math.min(
						1.8,
						totalCards / 24
					)
				);

			/*
				SCENE SIZE
			*/

			const radialSpread =
				(isMobile ? 3 : 5.5) *
				densityFactor;

			const corridorLength =
				(isMobile ? 22 : 40) *
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
				COMPOSITION
			*/

			function randomizeCard(
				card: Card,
				index: number
			) {

				const {
					mesh
				} = card;

				/*
					DEPTH
				*/

				const t =
					index / totalCards;

				const z =
					-Math.pow(
						t,
						0.82
					) *
					corridorLength;

				mesh.position.z = z;

				/*
					SPREAD
				*/

				const spread =
					(1 - t) *
					radialSpread;

				mesh.position.x =
					(Math.random() - 0.5) *
					spread;

				mesh.position.y =
					(Math.random() - 0.5) *
					(isMobile ? 3 : 5);

				/*
					PARALLAX
				*/

				mesh.position.x *=
					1 +
					Math.abs(z) *
						0.03;

				/*
					ROTATION
				*/

				mesh.rotation.z =
					(Math.random() - 0.5) *
					0.05;

				mesh.rotation.x =
					(Math.random() - 0.5) *
					0.04;

				mesh.rotation.y =
					(Math.random() - 0.5) *
					0.04;

				/*
					SCALE
				*/

				card.baseScale =
					1.2 -
					t * 0.45 +
					Math.random() *
						0.08;
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
					SCALE
				*/

				const scale =
					isMobile
						? 0.00125
						: 0.00155;

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
						? 1.8
						: 2.8;

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

				scene.add(mesh);

				const card: Card = {

					mesh,
					material,

					baseScale: 1,

					floatOffset:
						Math.random() *
						1000
				};

				randomizeCard(
					card,
					i
				);

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
						0.18;

					targetPitch =
						(
							e.clientY /
							window.innerHeight -
							0.5
						) *
						0.12;
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
						0.012;

				},
				{ passive: true }
			);

			/*
				TOUCH
			*/

			let touchStartY = 0;

			window.addEventListener(
				'touchstart',
				(e) => {

					touchStartY =
						e.touches[0].clientY;

				},
				{ passive: true }
			);

			window.addEventListener(
				'touchmove',
				(e) => {

					const currentY =
						e.touches[0].clientY;

					const delta =
						touchStartY -
						currentY;

					targetScroll +=
						delta *
						0.03;

					touchStartY =
						currentY;

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

			let animationId: number;

			const animate = () => {

				animationId =
					requestAnimationFrame(
						animate
					);

				/*
					SMOOTH SCROLL
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
					0.04;

				currentPitch +=
					(
						targetPitch -
						currentPitch
					) *
					0.04;

				camera.lookAt(
					Math.sin(
						currentYaw
					),
					-currentPitch,
					camera.position.z - 6
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
							SUBTLE FLOAT
						*/

						mesh.position.y +=
							Math.sin(
								Date.now() *
									0.0005 +
									floatOffset
							) *
								0.0005;

						/*
							FACE CAMERA
						*/

						mesh.lookAt(
							camera.position
						);

						/*
							INFINITE DEPTH
						*/

						if (
							mesh.position.z -
							camera.position.z >
							2
						) {

							mesh.position.z -=
								corridorLength;
						}

						if (
							mesh.position.z -
							camera.position.z <
							-corridorLength
						) {

							mesh.position.z +=
								corridorLength;
						}

						/*
							DISTANCE
						*/

						const distance =
							camera.position.distanceTo(
								mesh.position
							);

						/*
							OPACITY
						*/

						const opacity =
							THREE.MathUtils.clamp(
								1 -
									(
										distance -
										4
									) /
										20,
								0.15,
								1
							);

						material.opacity =
							opacity;

						/*
							SCALE
						*/

						const depthScale =
							THREE.MathUtils.clamp(
								card.baseScale *
									(
										1 -
										distance *
											0.0025
									),
								0.75,
								1.8
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

			/*
				CLEANUP
			*/

			return () => {

				cancelAnimationFrame(
					animationId
				);

				renderer.dispose();
			};
		};

		init();
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

		touch-action: none;

		z-index: 0;
	}

	canvas {

		display: block;
	}
</style>