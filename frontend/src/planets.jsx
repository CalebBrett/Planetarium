import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { useEffect, useRef } from "react";

function MyThree() {
	const refContainer = useRef(null);

	useEffect(() => {
		// Prevent creating multiple canvases on re-renders (used in development)
		if (refContainer.current && refContainer.current.firstChild) {
			console.log("Canvas already exists, skipping creation.");
			return;
		}

		// Initialize Three.js components
		const scene = new THREE.Scene();
		const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
		const renderer = new THREE.WebGLRenderer();
		const controls = new OrbitControls(camera, renderer.domElement);

		// HTTP request to server
		// receive_data will push each planet into the planets list
		const planets = [];
		get_data().then(data => received_data(data, planets, scene));

		// Initialize canvas
		renderer.setSize(window.innerWidth - 20, window.innerHeight - 20);
		if (refContainer.current) {
			refContainer.current.appendChild(renderer.domElement);
		}

		// Set camera start position and enable controls
		camera.position.z = 20;
		controls.update();

		// Lighting
		const ambient_light = new THREE.AmbientLight(0xa0a0a0);
		scene.add(ambient_light);
		const sun_light = new THREE.PointLight(0xffffff, 100, 1000);
		sun_light.position.set(0, 0, 0);
		scene.add(sun_light);

		// SUN
		const geometry = new THREE.BoxGeometry(1, 1, 1);
		const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
		const cube = new THREE.Mesh(geometry, material);
		scene.add(cube);

		// add_planet(scene, name, colour, radius, init_angle, orbital_radius, angular_velocity)
		// planets.push(init_planet(scene, "Mars", 0xff0000, 1, [2, 1, 0], [2, 2, 2], 1));
		// planets.push(init_planet(scene, "Pluto", 0x00ffff, 0.5, [-2, -2, 4], [2, 5, 5], 4));
		// planets.push(init_planet(scene, "Earth", 0x00ff00, 0.75, [-5, -3, 0], [1, 5, 0], 2));

		// Animation loop
		var time = 0;
		renderer.setAnimationLoop(() => {
			time += 0.01;
			cube.rotation.x += 0.01;
			cube.rotation.y += 0.01;

			// Move each planet
			for (var i = 0; i < planets.length; i++) {
				// TODO: MATH AND PHYSICS
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

		// Cleanup when component unmounts
		return () => {
			if (refContainer.current && renderer.domElement) {
				refContainer.current.removeChild(renderer.domElement);
				renderer.setAnimationLoop(null);
			}
		};
	}, []);

	return (
		<div ref={refContainer}></div>
	);
}

// Get data from the server
// Returns promise or null
async function get_data() {
	const endpoint_get = process.env.ENDPOINT_PLANETS_GET;
	const endpoint_post = process.env.ENDPOINT_PLANETS_POST;

	// TODO: cleanup
	try {
		// Post number of planets to request
		const n_res = await fetch(endpoint_post, {
			method: "POST",
			body: JSON.stringify({
				"n": 5
			}),
			headers: {
				"Content-type": "application/json"
			}
		});
		if (!n_res.ok) {
			throw new Error(`Response status: ${n_res.status}`);
		}
		const res = await n_res.json();
		console.log(res);
		return res;

		const response = await fetch(endpoint_get);
		if (!response.ok) {
			throw new Error(`Response status: ${response.status}`);
		}

		const result = await response.json();
		console.log(result);

		return result;
	} catch (error) {
		console.error(error.message);
	}
}

// Data received from the server callback
function received_data(data, list, scene) {
	if (data) {
		console.log(data);
		console.log(list);

		for (var i = 0; i < data.length; i++) {
			console.log(data[i].name);
			console.log(data[i]);
			console.log(Number(data[i].radius));
			list.push(init_planet(scene, data[i].name, Number(data[i].colour), Number(data[i].radius), data[i].init_angle, data[i].orbital_radius, data[i].angular_velocity));
		}

	}
}

// Adds a planet to the scene
// Returns object with planet data
function init_planet(scene, name, colour, radius, init_angle, orbital_radius, angular_velocity) {
	const geometry = new THREE.SphereGeometry(radius, 20, 20);
	console.log(radius);
	const material = new THREE.MeshPhongMaterial({ color: colour });
	const sphere = new THREE.Mesh(geometry, material);

	// TODO: elliptical orbit lines
	const line_material = new THREE.LineBasicMaterial({ color: 0xffffff });
	const line_geometry = new THREE.RingGeometry(orbital_radius[0], orbital_radius[0], 50);
	const line = new THREE.Line(line_geometry, line_material);

	scene.add(line);
	scene.add(sphere);

	const planet = { name: name, mesh: sphere, init_angle: init_angle, orbital_radius: orbital_radius, angular_velocity: angular_velocity }
	return planet;
}

export default MyThree;
