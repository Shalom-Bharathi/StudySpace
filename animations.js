// Particles configuration with enhanced particles
const particlesConfig = {
    particles: {
        number: {
            value: 120,
            density: {
                enable: true,
                value_area: 800
            }
        },
        color: {
            value: ["#6b7280", "#3B82F6", "#8B5CF6", "#EC4899"]
        },
        shape: {
            type: "circle"
        },
        opacity: {
            value: 0.6,
            random: true,
            anim: {
                enable: true,
                speed: 1,
                opacity_min: 0.1,
                sync: false
            }
        },
        size: {
            value: 4,
            random: true,
            anim: {
                enable: true,
                speed: 2,
                size_min: 0.1,
                sync: false
            }
        },
        line_linked: {
            enable: true,
            distance: 150,
            color: "#6b7280",
            opacity: 0.4,
            width: 1
        },
        move: {
            enable: true,
            speed: 2,
            direction: "none",
            random: true,
            straight: false,
            out_mode: "out",
            bounce: false,
            attract: {
                enable: true,
                rotateX: 600,
                rotateY: 1200
            }
        }
    },
    interactivity: {
        detect_on: "canvas",
        events: {
            onhover: {
                enable: true,
                mode: "grab"
            },
            onclick: {
                enable: true,
                mode: "push"
            },
            resize: true
        },
        modes: {
            grab: {
                distance: 180,
                line_linked: {
                    opacity: 0.8
                }
            },
            push: {
                particles_nb: 4
            }
        }
    },
    retina_detect: true
};

// Initialize particles
particlesJS('particles-js', particlesConfig);

// Three.js Scene Setup
let scene, camera, renderer, model;
let clock = new THREE.Clock();

function initThreeJS() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    
    renderer = new THREE.WebGLRenderer({ 
        alpha: true, 
        antialias: true,
        powerPreference: "high-performance"
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    
    document.getElementById('model-container').appendChild(renderer.domElement);

    // Enhanced lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0x3B82F6, 1, 100);
    pointLight.position.set(0, 10, 0);
    scene.add(pointLight);

    camera.position.z = 5;

    // Create a placeholder geometric shape while model loads
    const geometry = new THREE.IcosahedronGeometry(1, 0);
    const material = new THREE.MeshPhongMaterial({
        color: 0x3B82F6,
        wireframe: true,
        transparent: true,
        opacity: 0.8
    });
    model = new THREE.Mesh(geometry, material);
    scene.add(model);

    // Optional: Load your custom 3D model
    // const loader = new THREE.GLTFLoader();
    // loader.load('path/to/your/3d-model.glb',...);

    animate();
}

function animate() {
    requestAnimationFrame(animate);
    
    const elapsedTime = clock.getElapsedTime();
    
    if (model) {
        // Smooth rotation
        model.rotation.y = elapsedTime * 0.5;
        
        // Complex floating motion
        model.position.y = Math.sin(elapsedTime) * 0.2;
        model.position.x = Math.cos(elapsedTime * 0.8) * 0.1;
        
        // Breathing scale effect
        const scale = 1 + Math.sin(elapsedTime * 2) * 0.05;
        model.scale.set(scale, scale, scale);
    }
    
    renderer.render(scene, camera);
}

// Improved window resize handling
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
}

window.addEventListener('resize', onWindowResize, false);

// Initialize everything when the page loads
document.addEventListener('DOMContentLoaded', initThreeJS); 