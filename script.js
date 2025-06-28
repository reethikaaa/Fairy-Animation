import * as THREE from 'https://cdn.skypack.dev/three@0.129.0/build/three.module.js';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js';
import { gsap } from 'https://cdn.skypack.dev/gsap';

// Camera Setup
const camera = new THREE.PerspectiveCamera(20, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 3, 20);

// Scene Setup
const scene = new THREE.Scene();
let fairy;
let mixer;
const loader = new GLTFLoader();

// Load Fairy Model
loader.load('assets/models/sihara_fictional_fairy.glb', function (gltf) {
    fairy = gltf.scene;
    fairy.scale.set(1.2, 1.2, 1.2);
    fairy.position.set(-5, 3, 0); // Start on the left

    scene.add(fairy);

    mixer = new THREE.AnimationMixer(fairy);
    if (gltf.animations.length > 0) {
        mixer.clipAction(gltf.animations[0]).play();
    }

    modelMove(); // Ensure Fairy Moves Correctly
}, undefined, function (error) {
    console.error("Error loading fairy model:", error);
});

// Renderer Setup
const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('container3D').appendChild(renderer.domElement);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 1.3);
scene.add(ambientLight);

const topLight = new THREE.DirectionalLight(0xffffff, 1);
topLight.position.set(500, 500, 500);
scene.add(topLight);

// Animation Loop
const reRender3D = () => {
    requestAnimationFrame(reRender3D);
    renderer.render(scene, camera);
    if (mixer) mixer.update(0.02);
};
reRender3D();

// Function to Move Fairy in a Zig-Zag Motion (Left ↔ Right 3 Times & End on the Left)
const modelMove = () => {
    let scrollProgress = window.scrollY / (document.body.scrollHeight - window.innerHeight); // 0 to 1

    // 🟢 Moves left → right → left → right
    let newX = Math.sin(scrollProgress * Math.PI * 3) * 5; // Moves between -5 and +5
    let newY = 3 - scrollProgress * 2; // Moves slightly downward
    let newRotationZ = Math.sin(scrollProgress * Math.PI * 3) * 0.3; // Small tilt effect

    // 🛑 If scroll reaches the bottom, move fairy completely left
    if (scrollProgress >= 0.95) {  // Adjust threshold for a smooth ending
        newX = -5; // Move fairy completely to the left
        newRotationZ = -0.2; // Slight tilt when stopping
    }

    gsap.to(fairy.position, {
        x: newX,
        y: newY,
        duration: 1.5,
        ease: "power1.out"
    });

    gsap.to(fairy.rotation, {
        z: newRotationZ,
        duration: 1.5,
        ease: "power1.out"
    });
};

// Scroll Event Listener
window.addEventListener('scroll', () => { if (fairy) modelMove(); });

// Resize Event Listener
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});
