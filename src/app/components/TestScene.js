"use client";
import {useRef,useEffect} from 'react';
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader.js';



export default function TestScene() 
{
    const ContainerRef = useRef(null);
     const modelRef = useRef(null);
    let renderer;

    useEffect( () => 
        {

            const container = ContainerRef.current;

            const width = window.innerWidth;
            const height = window.innerHeight;

            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(75,width/height,0.1,1000);
            camera.position.set(0, 4, 17);
            camera.lookAt(0,0,0);

           

            renderer = new THREE.WebGLRenderer({alpha : true});
            renderer.setSize(width,height);
            const loader = new EXRLoader();
            loader.load('exr/buikslotermeerplein_2k.exr', (texture) => {
                texture.mapping = THREE.EquirectangularReflectionMapping;
                scene.environment = texture;
               
              });
            container.appendChild(renderer.domElement);

           const gloader = new GLTFLoader();
               gloader.load(
                 "/models/Summershirt.glb",
                 (gltf) => {
                  modelRef.current = gltf.scene;
                  modelRef.current.traverse((child) => {
                     if (child.isMesh) {
                       child.material.color = new THREE.Color(0x0f0f0f0); // initial color
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
                 },
                 undefined,
                 (error) => {
                   console.error(error);
                 }
               );
            
            const animate = () =>
                {
                    requestAnimationFrame(animate);
                    renderer.render(scene, camera);
                }
            animate();
                return ()=>
                    {
                        if(renderer)
                            {
                                renderer.dispose();
                            }
                            if(container && renderer.domElement)
                                {
                                    container.removeChild(renderer.domElement);
                                }
                    };
        },[]);
        return <div ref={ContainerRef}></div>;

}