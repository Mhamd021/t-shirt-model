import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { EffectComposer } from "postprocessing";
import { RenderPass } from "postprocessing";
import { BloomEffect, EffectPass } from "postprocessing";



export default function BasicScene() 
{
  const mountRef = useRef(null);
  let renderer;

  useEffect(() => {
    const container = mountRef.current;
    const width = container?.getBoundingClientRect().width;
    const height = 500;

    // Set up the scene, camera, and renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 4, 17);
    camera.lookAt(0, 0, 0);

    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);

    // Enable tone mapping and gamma correction
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.5;

    if (!container.contains(renderer.domElement)) {
      container.appendChild(renderer.domElement);
    }

    // Lighting setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 2);
    scene.add(ambientLight);
  

    const directionalLight = new THREE.DirectionalLight(0xffeedd, 0.8);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.bias = -0.001;
    scene.add(directionalLight);

    const backLight = new THREE.DirectionalLight(0xffeedd, 0.8);
backLight.position.set(-5, 8, -5);
scene.add(backLight);

    const hemisphereLight = new THREE.HemisphereLight(0x87ceeb, 0xaaaaaa, 0.6);
    scene.add(hemisphereLight);
    const fillLight = new THREE.DirectionalLight(0xffeedd, 0.8);
    fillLight.position.set(0, 2, 3);
    scene.add(fillLight);
    // Load HDR environment map
    scene.background = null;
   
    
    // Add OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 3;
    controls.maxDistance = 25;
  

    // Load 3D model
    let loadedModel = null;
    const loader = new GLTFLoader();
    loader.load(
      "/models/Summershirt.glb",
      (gltf) => {
        loadedModel = gltf.scene;
        loadedModel.traverse((child) => {
          if (child.isMesh) {
            child.material.color = new THREE.Color(0xffffff);
            child.material.envMapIntensity = 1.5;
            child.castShadow = true;
            child.receiveShadow = true;
            child.material.metalness = 0.2;
            child.material.roughness = 0.8;
          }
        });
        
        
        // Center the model
        const box = new THREE.Box3().setFromObject(loadedModel);
        const center = box.getCenter(new THREE.Vector3());
        loadedModel.position.sub(center);
        scene.add(loadedModel);
      },
      undefined,
      (error) => {
        console.error(error);
      }
    );
    
    // Postprocessing setup
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera)); // Base render pass

    // Add Bloom Effect
    const bloomEffect = new BloomEffect({
      intensity: 0.3, // Adjust intensity of the glow
    });
    composer.addPass(new EffectPass(camera, bloomEffect)); // Add the bloom effect

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      
      composer.render(); // Use composer for postprocessing
    };
    animate();

    // Handle window resizing
    window.addEventListener("resize", () => {
      const width = container?.getBoundingClientRect().width;
      const height = container?.getBoundingClientRect().height;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      composer.setSize(width, height); 
    });

    // Clean up
    return () => {
      if (renderer) {
        renderer.dispose();
      }
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

    return <div ref={mountRef}></div>;
}
