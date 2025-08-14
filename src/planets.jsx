import * as THREE from 'three';
import { useEffect, useRef } from "react";

function MyThree() {
	const refContainer = useRef(null);

	useEffect(() => {
		// Prevent creating multiple canvases on re-renders (e.g., in development)
		if (refContainer.current && refContainer.current.firstChild) {
			console.log("Canvas already exists, skipping creation.");
			return;
		}

		// === THREE.JS CODE START ===
		const scene = new THREE.Scene();
		const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
		const renderer = new THREE.WebGLRenderer();

		renderer.setSize(window.innerWidth, window.innerHeight);

		if (refContainer.current) {
			refContainer.current.appendChild(renderer.domElement);
		}

		const geometry = new THREE.BoxGeometry(1, 1, 1);
		const material = new THREE.MeshBasicMaterial({ color: 0x00ffff });
		const cube = new THREE.Mesh(geometry, material);
		scene.add(cube);
		camera.position.z = 5;

		renderer.setAnimationLoop(() => {
			cube.rotation.x += 0.01;
			cube.rotation.y += 0.01;
			renderer.render(scene, camera);
		});

		// === CLEANUP FUNCTION ===
		// This function will run when the component unmounts
		return () => {
			if (refContainer.current && renderer.domElement) {
				// Remove the canvas from the DOM
				refContainer.current.removeChild(renderer.domElement);
				// Clean up the animation loop
				renderer.setAnimationLoop(null);
			}
		};
	}, []);

	return (
		<div ref={refContainer}></div>
	);
}

export default MyThree;
