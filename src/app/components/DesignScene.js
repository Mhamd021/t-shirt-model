"use client";
import React, {
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { EffectComposer } from "postprocessing";
import { RenderPass } from "postprocessing";
import { DecalGeometry } from "three/examples/jsm/geometries/DecalGeometry.js";

let fabricMapsCache = null;

const DesignScene = forwardRef(function DesignScene(props, ref) {
  const { onMoodChange, onSceneReady } = props;
  const containerRef = useRef(null);
  const modelRef = useRef(null);
  const rendererRef = useRef(null);
  const decalGroupRef = useRef(new THREE.Group());
  const decalMapRef = useRef(new Map());
 const sceneRef = useRef(null);
const sunLightRef = useRef(null);
const ambientRef = useRef(null);
const cameraRef = useRef();
const controlsRef = useRef();
const rimLightLeftRef = useRef(null);
const rimLightRightRef = useRef(null);
const hemiLightRef = useRef(null);
const fillLightRef = useRef(null);
const shadowPlaneRef = useRef(null);
const pedestalRef = useRef(null);
const autoRotateRef = useRef(true);
const activeViewRef = useRef("front");
const interactionRef = useRef({ pointerDown: false, pauseUntil: 0 });
const readyNotifiedRef = useRef(false);

function createFabricMaps() {
  if (fabricMapsCache) {
    return fabricMapsCache;
  }

  const size = 512;
  const diffuseCanvas = document.createElement("canvas");
  const roughnessCanvas = document.createElement("canvas");
  const bumpCanvas = document.createElement("canvas");
  diffuseCanvas.width = size;
  diffuseCanvas.height = size;
  roughnessCanvas.width = size;
  roughnessCanvas.height = size;
  bumpCanvas.width = size;
  bumpCanvas.height = size;

  const diffuseCtx = diffuseCanvas.getContext("2d");
  const roughnessCtx = roughnessCanvas.getContext("2d");
  const bumpCtx = bumpCanvas.getContext("2d");
  const imageData = bumpCtx.createImageData(size, size);

  diffuseCtx.fillStyle = "#f1f0ec";
  diffuseCtx.fillRect(0, 0, size, size);
  roughnessCtx.fillStyle = "#d9d9d4";
  roughnessCtx.fillRect(0, 0, size, size);

  for (let y = 0; y < size; y += 2) {
    for (let x = 0; x < size; x += 2) {
      const index = (y * size + x) * 4;
      const warp = ((x % 14) / 14) * 255;
      const weft = ((y % 14) / 14) * 255;
      const microNoise = 108 + Math.floor(Math.random() * 28);
      const wrinkleX = Math.sin(x / 42) * 10 + Math.sin(x / 87) * 7;
      const wrinkleY = Math.cos(y / 46) * 10 + Math.sin(y / 96) * 7;
      const fold = Math.sin((x + y) / 72) * 4 + Math.cos((x - y) / 81) * 4;
      const bumpValue = Math.max(
        88,
        Math.min(
          168,
          Math.floor((warp + weft) * 0.22 + microNoise * 0.34 + wrinkleX + wrinkleY + fold)
        )
      );
      for (let oy = 0; oy < 2; oy += 1) {
        for (let ox = 0; ox < 2; ox += 1) {
          const px = Math.min(x + ox, size - 1);
          const py = Math.min(y + oy, size - 1);
          const pixelIndex = (py * size + px) * 4;
          imageData.data[pixelIndex] = bumpValue;
          imageData.data[pixelIndex + 1] = bumpValue;
          imageData.data[pixelIndex + 2] = bumpValue;
          imageData.data[pixelIndex + 3] = 255;
        }
      }

      const diffuseGrain = 232 + Math.floor(Math.random() * 12);
      const roughnessGrain = 206 + Math.floor(Math.random() * 16);
      diffuseCtx.fillStyle = `rgba(${diffuseGrain}, ${diffuseGrain}, ${diffuseGrain - 4}, 0.08)`;
      diffuseCtx.fillRect(x, y, 2, 2);
      roughnessCtx.fillStyle = `rgba(${roughnessGrain}, ${roughnessGrain}, ${roughnessGrain}, 0.09)`;
      roughnessCtx.fillRect(x, y, 2, 2);

      if (x % 14 === 0 || y % 14 === 0) {
        diffuseCtx.fillStyle = "rgba(0, 0, 0, 0.026)";
        diffuseCtx.fillRect(x, y, 2, 2);
        roughnessCtx.fillStyle = "rgba(255, 255, 255, 0.08)";
        roughnessCtx.fillRect(x, y, 2, 2);
      }
    }
  }

  const paintSoftFold = (ctx, x, y, radiusX, radiusY, color) => {
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, Math.max(radiusX, radiusY));
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.ellipse(x, y, radiusX, radiusY, 0, 0, Math.PI * 2);
    ctx.fill();
  };

  // Broad wrinkle and shadow breakup so the shirt catches light less uniformly.
  paintSoftFold(diffuseCtx, size * 0.34, size * 0.28, 180, 110, "rgba(0,0,0,0.035)");
  paintSoftFold(diffuseCtx, size * 0.7, size * 0.4, 220, 130, "rgba(255,255,255,0.028)");
  paintSoftFold(roughnessCtx, size * 0.26, size * 0.32, 210, 120, "rgba(255,255,255,0.095)");
  paintSoftFold(roughnessCtx, size * 0.68, size * 0.62, 250, 150, "rgba(0,0,0,0.06)");
  paintSoftFold(bumpCtx, size * 0.44, size * 0.52, 260, 140, "rgba(255,255,255,0.075)");
  paintSoftFold(bumpCtx, size * 0.73, size * 0.26, 190, 90, "rgba(0,0,0,0.055)");

  bumpCtx.putImageData(imageData, 0, 0);

  const configureTexture = (texture, repeat) => {
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(repeat, repeat);
    texture.anisotropy = 4;
    return texture;
  };

  const diffuseMap = configureTexture(new THREE.CanvasTexture(diffuseCanvas), 4.5);
  diffuseMap.colorSpace = THREE.SRGBColorSpace;
  const roughnessMap = configureTexture(new THREE.CanvasTexture(roughnessCanvas), 4.5);
  const bumpMap = configureTexture(new THREE.CanvasTexture(bumpCanvas), 5.2);

  fabricMapsCache = { diffuseMap, roughnessMap, bumpMap };
  return fabricMapsCache;
}

function createDecalMaterial(texture) {
  return new THREE.MeshPhysicalMaterial({
    map: texture,
    transparent: true,
    alphaTest: 0.08,
    depthTest: true,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -4,
    roughness: 0.96,
    metalness: 0,
    clearcoat: 0,
    sheen: 0.08,
    sheenRoughness: 1,
  });
}
  
  
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
   
    removeDecalById: (id) => {
      const group = decalGroupRef.current;
      const target = group.children.find((mesh) => mesh.userData.id === id);
      if (target) {
        group.remove(target);
        decalMapRef.current.delete(id);
        target.geometry.dispose();
        if (target.material.map) target.material.map.dispose();
        target.material.dispose();
      }
     
    },
    clearDecals: () => {
      const group = decalGroupRef.current;
      group.children.forEach((mesh) => {
        mesh.geometry.dispose();
        if (mesh.material.map) mesh.material.map.dispose();
        mesh.material.dispose();
      });
      group.clear();
      decalMapRef.current.clear();
    },
    selectDecalById: (id) => {
  const mesh = decalMapRef.current.get(id);
  if (mesh) {
    decalGroupRef.current.children.forEach((child) => {
      if (child.material && child.material.emissive) {
        child.material.emissive.setHex(0x000000);
      }
    });

    mesh.material.emissive = new THREE.Color(0x333333);
    mesh.material.emissiveIntensity = 1.5;
  }
},

   updateDecalGeometry: (id, params) => {
  const { position, orientation, size, texture } = params;
  
  const group = decalGroupRef.current;
  const oldMesh = decalMapRef.current.get(id);
  
  if (oldMesh) {
    group.remove(oldMesh);
    decalMapRef.current.delete(id);
    oldMesh.geometry.dispose();
    if (oldMesh.material.map) oldMesh.material.map.dispose();
    oldMesh.material.dispose();
  }

  let mesh = null;
  modelRef.current?.traverse((child) => {
    if (child.isMesh && !mesh) mesh = child;
  });

  if (!mesh) {
    console.warn("No shirt mesh found for decal geometry.");
    return;
  }

  const decalMaterial = createDecalMaterial(texture);

 const decalGeometry = new DecalGeometry(
  mesh,
  new THREE.Vector3(position.x, position.y, position.z),
  new THREE.Euler(orientation.x, orientation.y, orientation.z),
  new THREE.Vector3(size.x, size.y, size.z)
);
  
  const newMesh = new THREE.Mesh(decalGeometry, decalMaterial);
          

  newMesh.renderOrder = 1;
  newMesh.userData.id = id;

  group.add(newMesh);
  decalMapRef.current.set(id, newMesh);
}
,
    applyDecalText: (text, id, options = {}) => {
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 256;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = options.bgColor || "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = `${options.fontSize || 40}px ${options.font || "Arial"}`;
      ctx.fillStyle = options.textColor || "black";
      ctx.textAlign = "center";
      ctx.fillText(text, canvas.width / 2, canvas.height / 2);
      const decalTexture = new THREE.CanvasTexture(canvas);
      decalTexture.anisotropy = 16;
      decalTexture.colorSpace = THREE.SRGBColorSpace;
      if (modelRef.current) {
        let mesh = null;
        modelRef.current.traverse((child) => {
          if (child.isMesh && !mesh) mesh = child;
        });

         const position = new THREE.Vector3(0, 0.2, -0.2); 

          const orientation = new THREE.Euler(0, Math.PI, 0);
          const size = new THREE.Vector3(0.5, 0.5, 0.5); 

        const decalMaterial = createDecalMaterial(decalTexture);

        const decalGeometry = new DecalGeometry(
          mesh,
          position,
          orientation,
          size
        );

        const decalMesh = new THREE.Mesh(decalGeometry, decalMaterial);

        decalMesh.renderOrder = 1;
        decalMesh.userData.id = id;
        decalGroupRef.current.add(decalMesh);
        decalMapRef.current.set(id, decalMesh);
      }
    },

    applyDecalImage: (imageURL, id) => {
      const textureLoader = new THREE.TextureLoader();
      textureLoader.load(
        imageURL,
        (decalTexture) => {
        

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
          const position = new THREE.Vector3(0, 0.2, -0.2); 

          const orientation = new THREE.Euler(0, Math.PI, 0);
          const size = new THREE.Vector3(0.5, 0.5, 0.5); 



            const decalMaterial = createDecalMaterial(decalTexture);

            const decalGeometry = new DecalGeometry(
              mesh,
              position,
              orientation,
              size
            );
            const decalMesh = new THREE.Mesh(decalGeometry, decalMaterial);
            decalMesh.renderOrder = 1;
            decalMesh.userData.id = id;

            decalGroupRef.current.add(decalMesh);
            decalMapRef.current.set(id, decalMesh);
          
          }
        },
        undefined,
        (err) => {
          console.error("Error loading decal image:", err);
        }
      );
    },
     toggleLamp() {
    const light = sunLightRef.current;
    if (!light) return;

    const isOn = light.intensity > 0;
    const newIntensity = isOn ? 0 : 1.3;

    fadeLight(light, newIntensity, 500);
    return !isOn; // return new state (true = on, false = off)
  },
  isLampOn() {
    return sunLightRef.current?.intensity > 0;
  },
 setCameraView: (view) => {
   const presets = {
     front: {
       pos: [0.0, 1.1, -2.45],
       look: [0, 0.38, 0],
     },
     angled: {
       pos: [-1.55, 1.2, -2.05],
       look: [0, 0.32, 0],
     },
     back: {
       pos: [0.0, 1.0, 2.45],
       look: [0, 0.3, 0],
     },
     detail: {
       pos: [-0.45, 1.45, -1.18],
       look: [0, 0.55, -0.05],
     },
   };

   const preset = presets[view];
   const cam = cameraRef.current;
   const ctrl = controlsRef.current;
   if (!preset || !cam || !ctrl) return;

   activeViewRef.current = view;
   const startPos = cam.position.clone();
   const startLook = ctrl.target.clone();
   const endPos = new THREE.Vector3(...preset.pos);
   const endLook = new THREE.Vector3(...preset.look);
   const startTime = performance.now();
   const duration = 700;

   function animateCam(time) {
     let t = Math.min((time - startTime) / duration, 1);
     t = 1 - Math.pow(1 - t, 3);
     cam.position.lerpVectors(startPos, endPos, t);
     ctrl.target.lerpVectors(startLook, endLook, t);
     ctrl.update();
     if (t < 1) requestAnimationFrame(animateCam);
   }

   requestAnimationFrame(animateCam);
 },
 toggleAutoRotate: () => {
   autoRotateRef.current = !autoRotateRef.current;
   if (controlsRef.current) {
     controlsRef.current.autoRotate = autoRotateRef.current;
   }
   return autoRotateRef.current;
 },
 isAutoRotateEnabled: () => autoRotateRef.current,
 setMood: (mood) => {
   const moods = {
  original: {
  sun: { color: 0xfff3de, intensity: 1.55 },
    ambient: { color: 0xf3f1eb, intensity: 0.62 },
    hemi: { sky: 0xf7f4ef, ground: 0xc4ccd5, intensity: 0.95 },
    fill: { color: 0xffffff, intensity: 0.85 },
    rimLeft: { color: 0xf9d3a8, intensity: 1.0 },
    rimRight: { color: 0xc7dfee, intensity: 0.75 },
    pedestalTop: 0xc8d5de,
    pedestalSide: 0x6f7b88,
    fog: 0x10131c,
    stageBackground: 0xe8edf0,
    cone: 'rgba(255, 230, 150, 0.4)',
    containerBg: 'linear-gradient(135deg, #1e1e2f, #2d2d3c)',
    sceneBg: 'linear-gradient(145deg, rgb(164,199,208) 0%, rgba(99,110,114,0.8) 50%, rgb(127,65,129) 100%)',
    sidebarBg: 'linear-gradient(145deg, rgb(164,199,208) 0%, rgba(99,110,114,0.8) 50%, rgb(127,65,129) 100%)',
    shirtColor: 0xD6D6D6, 
    shirtEmissive: 0x000000,
    emissiveIntensity: 0,
    exposure: 1.18,
    shadowOpacity: 0.28
  },
  silverblack: {
    sun: { color: 0xf1f1f1, intensity: 1.8 },
    ambient: { color: 0xaeb5c0, intensity: 0.34 },
    hemi: { sky: 0xd9e0e7, ground: 0x5a6470, intensity: 0.78 },
    fill: { color: 0xe9eef5, intensity: 0.92 },
    rimLeft: { color: 0xdfe4eb, intensity: 1.35 },
    rimRight: { color: 0x8e9fb2, intensity: 1.05 },
    pedestalTop: 0x9099a5,
    pedestalSide: 0x30353d,
    fog: 0x111418,
    stageBackground: 0x2f353d,
    cone: 'rgba(200, 200, 200, 0.25)',
    containerBg: 'linear-gradient(135deg, #1a1a1a, #2f2f2f)',
    sceneBg: 'linear-gradient(145deg, #3c3c3c 0%, #555 50%, #1a1a1a 100%)',
    sidebarBg: 'linear-gradient(145deg, #3c3c3c 0%, #555 50%, #1a1a1a 100%)',
    shirtColor: 0xaaaaaa, 
    shirtEmissive: 0x111111,
    emissiveIntensity: 0.1,
    exposure: 1.08,
    shadowOpacity: 0.36
  },
  velvetnight: {
   sun: { color: 0xc694ff, intensity: 1.22 },
    ambient: { color: 0x43355e, intensity: 0.38 },
    hemi: { sky: 0x8168a6, ground: 0x231d2f, intensity: 0.72 },
    fill: { color: 0xb8cfff, intensity: 0.68 },
    rimLeft: { color: 0xc694ff, intensity: 0.95 },
    rimRight: { color: 0x83b6ff, intensity: 0.75 },
    pedestalTop: 0x5f5279,
    pedestalSide: 0x241d31,
    fog: 0x0d0b15,
    stageBackground: 0x232033,
    cone: 'rgba(164, 120, 208, 0.3)',
    containerBg: 'linear-gradient(135deg, #0d0d15, #1c1c28)',
    sceneBg: 'linear-gradient(145deg, #2a1f33 0%, #1e2838 50%, #0d0d15 100%)',
    sidebarBg: 'linear-gradient(145deg, #2a1f33 0%, #1e2838 50%, #0d0d15 100%)',
    shirtColor: 0x2b1b38, 
    shirtEmissive: 0x1b0e28,
    emissiveIntensity: 0.08,
    exposure: 0.98,
    shadowOpacity: 0.42
  }
};

    const target = moods[mood];
    if (!target) return;
    fadeLight(sunLightRef.current, target.sun.intensity, 500);
    sunLightRef.current.color.set(target.sun.color);
    ambientRef.current.color.set(target.ambient.color);
    ambientRef.current.intensity = target.ambient.intensity;
    if (hemiLightRef.current) {
      hemiLightRef.current.color.set(target.hemi.sky);
      hemiLightRef.current.groundColor.set(target.hemi.ground);
      hemiLightRef.current.intensity = target.hemi.intensity;
    }
    if (fillLightRef.current) {
      fillLightRef.current.color.set(target.fill.color);
      fillLightRef.current.intensity = target.fill.intensity;
    }
    if (rimLightLeftRef.current) {
      rimLightLeftRef.current.color.set(target.rimLeft.color);
      rimLightLeftRef.current.intensity = target.rimLeft.intensity;
    }
    if (rimLightRightRef.current) {
      rimLightRightRef.current.color.set(target.rimRight.color);
      rimLightRightRef.current.intensity = target.rimRight.intensity;
    }
    if (shadowPlaneRef.current?.material) {
      shadowPlaneRef.current.material.opacity = target.shadowOpacity;
    }
    if (pedestalRef.current?.material) {
      pedestalRef.current.material[0].color.set(target.pedestalTop);
      pedestalRef.current.material[1].color.set(target.pedestalSide);
    }
    if (sceneRef.current?.fog) {
      sceneRef.current.fog.color.set(target.fog);
    }
    if (sceneRef.current) {
      sceneRef.current.background = new THREE.Color(target.stageBackground);
    }
    if (rendererRef.current) {
      rendererRef.current.setClearColor(target.stageBackground, 1);
    }

    document.documentElement.style.setProperty('--container-bg', target.containerBg);
    document.documentElement.style.setProperty('--scene-bg', target.sceneBg);
    document.documentElement.style.setProperty('--sidebar-bg', target.sidebarBg);
    document.documentElement.style.setProperty('--cone-color', target.cone);

modelRef.current?.traverse((child) => {
 if (child.isMesh) {
    child.material.color.set(target.shirtColor);

    child.material.emissive.set(target.shirtEmissive);
    child.material.emissiveIntensity = target.emissiveIntensity;
    child.material.sheen = mood === "silverblack" ? 0.18 : 0.36;
    child.material.sheenRoughness = mood === "velvetnight" ? 0.9 : 0.68;
    child.material.roughness = mood === "silverblack" ? 0.72 : 0.88;
    child.material.needsUpdate = true;
  }
});


rendererRef.current.toneMappingExposure = target.exposure;
    onMoodChange?.(mood);

const camTarget = {
  original: {
    pos: [ 0.00, 1, -2.4 ],   
    look: [0 , 0.4,0 ]         
  },
  silverblack: {

    pos: [ 0.25, 1.38, -2.4 ],
    look: [ 0 , 0.3,0 ]
  },
  velvetnight: {
    pos: [ -0.25, 1.32, -2.4 ],
    look: [0 , 0.2,0]
  }
};




const { pos, look } = camTarget[mood];
const cam = cameraRef.current;
const ctrl = controlsRef.current;

const startPos = cam.position.clone();
const startLook = ctrl.target.clone();

const endPos = new THREE.Vector3(...pos);
const endLook = new THREE.Vector3(...look);

let startTime = performance.now();
const duration = 900;

function animateCam(time) {
  let t = Math.min((time - startTime) / duration, 1);
  t = t * (2 - t);
  cam.position.lerpVectors(startPos, endPos, t);
  ctrl.target.lerpVectors(startLook, endLook, t);
  ctrl.update();
  if (t < 1) requestAnimationFrame(animateCam);
}
requestAnimationFrame(animateCam);



  }
  }));
  
function fadeLight(light, target, duration) {
  const start = light.intensity;
  const delta = target - start;
  let startTime = performance.now();

  function update(time) {
    let t = Math.min((time - startTime) / duration, 1);
    light.intensity = start + delta * t;
    if (t < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}




  useEffect(() => {
    const container = containerRef.current;
    const getSize = () => {
      const bounds = container?.getBoundingClientRect();
      return {
        width: bounds?.width || window.innerWidth,
        height: bounds?.height || window.innerHeight,
      };
    };
    const { width, height } = getSize();

    sceneRef.current = new THREE.Scene();
const scene = sceneRef.current;
scene.fog = new THREE.Fog(0x10131c, 7, 12.5);
scene.background = new THREE.Color(0xe8edf0);

const sunLight = new THREE.DirectionalLight(0xfff3de, 1.55);
sunLight.position.set(5, 10, -5); // position above and to the side
sunLight.castShadow = true;


sunLight.shadow.mapSize.width = 2048;
sunLight.shadow.mapSize.height = 2048;
sunLight.shadow.camera.near = 1;
sunLight.shadow.camera.far = 50;
sunLight.shadow.camera.left = -5;
sunLight.shadow.camera.right = 5;
sunLight.shadow.camera.top = 5;
sunLight.shadow.camera.bottom = -5;

scene.add(sunLight);
sunLightRef.current = sunLight;


const ambientLight = new THREE.AmbientLight(0xf3f1eb, 0.62); 
scene.add(ambientLight);
ambientRef.current = ambientLight;

const hemiLight = new THREE.HemisphereLight(0xf7f4ef, 0xc4ccd5, 0.95);
scene.add(hemiLight);
hemiLightRef.current = hemiLight;

const fillLight = new THREE.DirectionalLight(0xffffff, 0.85);
fillLight.position.set(0, 2.6, -4.5);
scene.add(fillLight);
fillLightRef.current = fillLight;

const rimLightLeft = new THREE.DirectionalLight(0xf9d3a8, 1);
rimLightLeft.position.set(-4, 2.5, -3);
scene.add(rimLightLeft);
rimLightLeftRef.current = rimLightLeft;

const rimLightRight = new THREE.DirectionalLight(0xc7dfee, 0.75);
rimLightRight.position.set(4, 1.8, 3);
scene.add(rimLightRight);
rimLightRightRef.current = rimLightRight;

    const camera = new THREE.PerspectiveCamera(70, width / height, 0.1, 1000);
    camera.position.set(0,1,-2.5);
    cameraRef.current = camera;
    rendererRef.current = new THREE.WebGLRenderer({
      antialias: true,
    });
    rendererRef.current.setSize(width, height);
    rendererRef.current.setClearColor(0xe8edf0, 1);
    rendererRef.current.toneMapping = THREE.ACESFilmicToneMapping;
    rendererRef.current.toneMappingExposure = 1.18;
    rendererRef.current.shadowMap.enabled = true;
    rendererRef.current.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current.outputColorSpace = THREE.SRGBColorSpace;
    rendererRef.current.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    container.appendChild(rendererRef.current.domElement);

    const controls = new OrbitControls(camera, rendererRef.current.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 1;
    controls.maxDistance = 5;
    controls.enablePan = false;
    controls.autoRotate = autoRotateRef.current;
    controls.autoRotateSpeed = 1.15;
    controls.minPolarAngle = Math.PI / 2 - 0.6;
    controls.maxPolarAngle = Math.PI / 2 + 0.25;
    controls.addEventListener("start", () => {
      interactionRef.current.pointerDown = true;
      interactionRef.current.pauseUntil = performance.now() + 2600;
    });
    controls.addEventListener("end", () => {
      interactionRef.current.pointerDown = false;
      interactionRef.current.pauseUntil = performance.now() + 2200;
    });

 
      controlsRef.current = controls;

    

    const gloader = new GLTFLoader();
    const fabricMaps = createFabricMaps();
    gloader.load(
      "/models/ShirtwithoutTexture.glb",
      (gltf) => {
        modelRef.current = gltf.scene;
        modelRef.current.traverse((child) => {
          if (child.isMesh) {
            const sourceMaterial = child.material;
            child.material = new THREE.MeshPhysicalMaterial({
              color: new THREE.Color(0xd6d6d6),
              map: fabricMaps.diffuseMap,
              roughnessMap: fabricMaps.roughnessMap,
              bumpMap: fabricMaps.bumpMap,
              metalnessMap: sourceMaterial.metalnessMap || null,
              transparent: sourceMaterial.transparent,
              side: sourceMaterial.side,
              roughness: 0.97,
              metalness: 0.02,
              envMapIntensity: 0,
              sheen: 0.78,
              sheenRoughness: 0.97,
              clearcoat: 0.01,
              clearcoatRoughness: 1,
              specularIntensity: 0.26,
              specularColor: new THREE.Color(0xe7e2d7),
              bumpScale: 0.055,
            });
            sourceMaterial.dispose();
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        const box = new THREE.Box3().setFromObject(modelRef.current);

        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        modelRef.current.position.sub(center);

        const pedestalRadius = Math.max(size.x, size.z) * 0.72;
        const pedestal = new THREE.Mesh(
          new THREE.CylinderGeometry(pedestalRadius, pedestalRadius * 1.12, 0.22, 64),
          [
            new THREE.MeshStandardMaterial({
              color: 0xc8d5de,
              roughness: 0.35,
              metalness: 0.12,
            }),
            new THREE.MeshStandardMaterial({
              color: 0x6f7b88,
              roughness: 0.78,
              metalness: 0.08,
            }),
          ]
        );
        pedestal.position.set(0, -size.y / 2 - 0.16, 0);
        pedestal.receiveShadow = true;
        pedestal.castShadow = false;
        scene.add(pedestal);
        pedestalRef.current = pedestal;

        const pedestalAccent = new THREE.Mesh(
          new THREE.TorusGeometry(pedestalRadius * 0.92, 0.025, 16, 80),
          new THREE.MeshStandardMaterial({
            color: 0xffffff,
            emissive: 0xffffff,
            emissiveIntensity: 0.08,
            transparent: true,
            opacity: 0.55,
            roughness: 0.35,
            metalness: 0.2,
          })
        );
        pedestalAccent.rotation.x = Math.PI / 2;
        pedestalAccent.position.set(0, -size.y / 2 - 0.045, 0);
        scene.add(pedestalAccent);

        const shadowPlane = new THREE.Mesh(
          new THREE.CircleGeometry(Math.max(size.x, size.z) * 1.15, 64),
          new THREE.ShadowMaterial({
            color: 0x000000,
            opacity: 0.28,
          })
        );
        shadowPlane.rotation.x = -Math.PI / 2;
        shadowPlane.position.set(0, -size.y / 2 - 0.04, 0);
        shadowPlane.receiveShadow = true;
        scene.add(shadowPlane);
        shadowPlaneRef.current = shadowPlane;

        scene.add(modelRef.current);
        scene.add(decalGroupRef.current);
        if (!readyNotifiedRef.current) {
          readyNotifiedRef.current = true;
          onSceneReady?.();
        }
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
      const shouldAutoRotate =
        autoRotateRef.current &&
        !interactionRef.current.pointerDown &&
        performance.now() > interactionRef.current.pauseUntil;
      controls.autoRotate = shouldAutoRotate;
      controls.update();
      composer.render();
    };
    animate();

    const handleResize = () => {
      const { width, height } = getSize();
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      rendererRef.current.setSize(width, height);
      rendererRef.current.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      composer.setSize(width, height);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      controls.dispose();
      if (rendererRef.current) rendererRef.current.dispose();
      if (container && rendererRef.current.domElement)
        container.removeChild(rendererRef.current.domElement);
    };
  }, []);

  return <div ref={containerRef}></div>;
});

DesignScene.displayName = "DesignScene";

export default DesignScene;
