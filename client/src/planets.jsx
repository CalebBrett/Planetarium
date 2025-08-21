import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { useEffect, useRef, useState } from "react";

function MyThree() {
	const refContainer = useRef(null);
	const [count, setCount] = useState(0)
	const [useCount, setUseCount] = useState(false)

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

		// Start HTTP request to server
		// receive_data will push each planet into the planets list
		const planets = [];
		get_data(useCount, count).then(data => received_data(data, planets, scene));

		// Initialize canvas
		renderer.setSize(window.innerWidth - 20, window.innerHeight - 20);
		if (refContainer.current) {
			refContainer.current.appendChild(renderer.domElement);
		}

		// Set camera start position and enable controls
		camera.position.z = 20;
		controls.update();

		// Lighting
		const ambientLight = new THREE.AmbientLight(0xa0a0a0);
		scene.add(ambientLight);
		const sunLight = new THREE.PointLight(0xffffff, 100, 1000);
		sunLight.position.set(0, 0, 0);
		scene.add(sunLight);

		// Cube sun
		const geometry = new THREE.BoxGeometry(1, 1, 1);
		const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
		const sun = new THREE.Mesh(geometry, material);
		scene.add(sun);

		// Animation loop
		var time = 0;
		renderer.setAnimationLoop(() => {
			time += 0.01;
			sun.rotation.x += 0.01;
			sun.rotation.y += 0.01;

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
		<div>
			<div className="card">
				<button onClick={() => setCount((count) => count + 1)}>
					Planet count is {count}
				</button>
				<button onClick={() => setUseCount((useCount) => !useCount)}>
					Use the count to generate planets? {String(useCount)}
				</button>
			</div>
			<div ref={refContainer}></div>
		</div>
	);
}

// Get data from the server
// Return promise
async function get_data(useCount, count) {
	const planets_endpoint = import.meta.env.VITE_PLANETS_URL + "/planets";

	if (useCount) {
		try {
			// Post number of planets and receive list of n planets
			const response = await fetch(planets_endpoint, {
				method: "POST",
				body: JSON.stringify({
					"n": count
				}),
				headers: {
					"Content-type": "application/json"
				}
			});

			if (!response.ok) {
				throw new Error(`Response status: ${response.status}`);
			}

			const result = await response.json();
			console.log(result);

			return result;

		} catch (error) {
			console.error(error.message);
		}
	} else {
		try {
			// Get list of preset number of planets
			const response = await fetch(planets_endpoint);

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
}

// Data received from the server callback
function received_data(data, list, scene) {
	if (data) {
		// Initialize received planets and add to planet list
		for (var i = 0; i < data.length; i++) {
			list.push(init_planet(scene, data[i].name, Number(data[i].colour), Number(data[i].radius), data[i].init_angle, data[i].orbital_radius, data[i].angular_velocity));
		}
	}
}

// Add a planet to the scene
// Return object with planet data
function init_planet(scene, name, colour, radius, init_angle, orbital_radius, angular_velocity) {
	const geometry = new THREE.SphereGeometry(radius, 20, 20);
	const material = new THREE.MeshPhongMaterial({ color: colour });
	const sphere = new THREE.Mesh(geometry, material);
	scene.add(sphere);

	// Add circular orbital lines if the orbit is not elliptical
	if (orbital_radius[0] == orbital_radius[1]) {
		const line_material = new THREE.LineBasicMaterial({ color: 0xffffff });
		const line_geometry = new THREE.RingGeometry(orbital_radius[0], orbital_radius[0], 50);
		const line = new THREE.Line(line_geometry, line_material);
		scene.add(line);
	}

	const planet = { name: name, mesh: sphere, init_angle: init_angle, orbital_radius: orbital_radius, angular_velocity: angular_velocity }
	return planet;
}

export default MyThree;
