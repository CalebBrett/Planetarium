import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
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
		const controls = new OrbitControls(camera, renderer.domElement);

		renderer.setSize(window.innerWidth - 20, window.innerHeight - 20);

		if (refContainer.current) {
			refContainer.current.appendChild(renderer.domElement);
		}

		const geometry = new THREE.BoxGeometry(1, 1, 1);
		const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
		const cube = new THREE.Mesh(geometry, material);

		const line_material = new THREE.LineDashedMaterial({ color: 0x0000ff });
		const points = [];
		points.push(new THREE.Vector3(- 10, 0, -5));
		points.push(new THREE.Vector3(0, 10, 0));
		points.push(new THREE.Vector3(10, 0, 5));

		const line_geometry = new THREE.BufferGeometry().setFromPoints(points);
		const line = new THREE.Line(line_geometry, line_material);

		const planets = [];
		// add_planet(scene, name, colour, radius, init_angle, orbital_radius, angular_velocity) {
		planets.push(add_planet(scene, "Mars", 0xff0000, 1, [2, 1, 0], [2, 2, 2], 1));
		planets.push(add_planet(scene, "Pluto", 0x00ffff, 0.5, [-2, -2, 4], [2, 5, 5], 4));
		planets.push(add_planet(scene, "Earth", 0x00ff00, 0.75, [-5, -3, 0], [1, 5, 0], 2));

		scene.add(line);
		scene.add(cube);
		camera.position.z = 20;
		controls.update();

		var time = 0;

		renderer.setAnimationLoop(() => {
			cube.rotation.x += 0.01;
			cube.rotation.y += 0.01;
			time += 0.01;

			for (var i = 0; i < planets.length; i++) {
				var angle_x = (time * planets[i].angular_velocity + planets[i].init_angle[0]);
				var angle_y = (time * planets[i].angular_velocity + planets[i].init_angle[1]);
				var angle_z = (time * planets[i].angular_velocity + planets[i].init_angle[2]);

				planets[i].mesh.position.x = Math.sin(angle_x) * planets[i].orbital_radius[0];
				planets[i].mesh.position.y = Math.cos(angle_y) * planets[i].orbital_radius[1];
				planets[i].mesh.position.z = Math.sin(angle_z) * planets[i].orbital_radius[2];
			}

			controls.update();
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

function add_planet(scene, name, colour, radius, init_angle, orbital_radius, angular_velocity) {
	const geometry = new THREE.SphereGeometry(radius, 20, 20);
	const material = new THREE.MeshBasicMaterial({ color: colour });
	const sphere = new THREE.Mesh(geometry, material);
	scene.add(sphere);

	const planet = { name: name, mesh: sphere, init_angle: init_angle, orbital_radius: orbital_radius, angular_velocity: angular_velocity }
	return planet;
}

export default MyThree;
