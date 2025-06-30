"use client";
import React, { useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { EffectComposer } from "postprocessing";
import { RenderPass } from "postprocessing";
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader.js';
import { DecalGeometry } from 'three/examples/jsm/geometries/DecalGeometry.js';

const DesignScene = forwardRef((props, ref) => {
  const containerRef = useRef(null);
  const modelRef = useRef(null);
  const rendererRef = useRef(null);
  const decalGroupRef = useRef(new THREE.Group());

  useImperativeHandle(ref, () => ({
    changeModelColor: (colorHex) => {
      if (modelRef.current) {
        modelRef.current.traverse((child) => {
          if (child.isMesh) {
            child.material.color.set(new THREE.Color(colorHex));
            child.material.needsUpdate = true;
          }
        });
      }
    },

    applyDecalImage: (imageURL) => {
      const textureLoader = new THREE.TextureLoader();
      textureLoader.load(imageURL, (decalTexture) => {
        decalTexture.anisotropy = 16;
        decalTexture.colorSpace = THREE.SRGBColorSpace;

        if (modelRef.current) {
          let mesh = null;
          modelRef.current.traverse((child) => {
            if (child.isMesh && !mesh) {
              mesh = child;
            }
          });

          if (!mesh) {
            console.warn("No mesh found in model.");
            return;
          }

          const position = new THREE.Vector3(0, 1, 2); // Adjust this for your shirt model
          const orientation = new THREE.Euler(0, Math.PI, 0); // Face forward
          const size = new THREE.Vector3(-5,5,5);

          const decalMaterial = new THREE.MeshStandardMaterial({
            map: decalTexture,
            transparent: true,
            alphaTest: 0.5,
            depthTest: true,
            depthWrite: false,
            polygonOffset: true,
            polygonOffsetFactor: -4,
          });
          
          const decalGeometry = new DecalGeometry(mesh, position, orientation, size);
          const decalMesh = new THREE.Mesh(decalGeometry, decalMaterial);
          decalMesh.renderOrder = 1;

          decalGroupRef.current.add(decalMesh);
          console.log("Decal applied to mesh:", mesh.name);
        }
      },
      undefined,
      (err) => {
        console.error("Error loading decal image:", err);
      });
    }
  }));

  useEffect(() => {
    const container = containerRef.current;
    const width = window.innerWidth;
    const height = window.innerHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(70, width / height, 0.1, 1000);
    camera.position.set(0, 4, 17);

    rendererRef.current = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    rendererRef.current.setSize(width, height);
    rendererRef.current.setClearColor(0x000000, 0);
    rendererRef.current.toneMapping = THREE.ACESFilmicToneMapping;
    rendererRef.current.toneMappingExposure = 1.3;
    container.appendChild(rendererRef.current.domElement);

    

    const exrLoader = new EXRLoader();
    exrLoader.load('exr/buikslotermeerplein_2k.exr', (texture) => {
      texture.mapping = THREE.EquirectangularReflectionMapping;
      scene.environment = texture;
    });

    const controls = new OrbitControls(camera, rendererRef.current.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 3;
    controls.maxDistance = 25;

    const gloader = new GLTFLoader();
    gloader.load(
      "/models/Summershirt.glb",
      (gltf) => {
        modelRef.current = gltf.scene;
        modelRef.current.traverse((child) => {
          if (child.isMesh) {
            child.material.color = new THREE.Color(0x0f0f0f0);
            child.material.envMapIntensity = 1.5;
            child.castShadow = true;
            child.receiveShadow = true;
            child.material.metalness = 0.2;
            child.material.roughness = 0.8;
          }
        });

        const box = new THREE.Box3().setFromObject(modelRef.current);
        const center = box.getCenter(new THREE.Vector3());
        modelRef.current.position.sub(center);

        scene.add(modelRef.current);
        scene.add(decalGroupRef.current); // Add decal group
      },
      undefined,
      (error) => {
        console.error("Error loading model:", error);
      }
    );

    const composer = new EffectComposer(rendererRef.current);
    composer.addPass(new RenderPass(scene, camera));

    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      composer.render();
    };
    animate();

    const handleResize = () => {
      const width = container.getBoundingClientRect().width;
      const height = container.getBoundingClientRect().height;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      rendererRef.current.setSize(width, height);
      composer.setSize(width, height);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (rendererRef.current) rendererRef.current.dispose();
      if (container && rendererRef.current.domElement)
        container.removeChild(rendererRef.current.domElement);
    };
  }, []);

  return <div ref={containerRef}></div>;
});

export default DesignScene;
