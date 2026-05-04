"use client";
import React, { useRef, useState,useEffect  } from "react";
import DesignScene from "../components/DesignScene";
import styles from "./designpage.module.css";
import * as THREE from "three";
import SidebarDock from './Sidebar2';
import LoadingOverlay from "../components/LoadingOverlay";

function createStyledTextTexture({
  text,
  font,
  fontSize,
  textColor,
  mirrored = false,
}) {
  const canvas = document.createElement("canvas");
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d");

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();

  if (mirrored) {
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
  }

  const x = canvas.width / 2;
  const y = canvas.height / 2 + fontSize * 0.18;
  const gradient = ctx.createLinearGradient(0, y - fontSize, 0, y + fontSize * 0.25);
  gradient.addColorStop(0, "#ffffff");
  gradient.addColorStop(0.16, textColor);
  gradient.addColorStop(1, textColor);

  ctx.font = `700 ${fontSize}px ${font}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.lineJoin = "round";
  ctx.lineCap = "round";

  ctx.shadowColor = "rgba(0, 0, 0, 0.26)";
  ctx.shadowBlur = 30;
  ctx.shadowOffsetY = 16;
  ctx.strokeStyle = "rgba(255, 255, 255, 0.28)";
  ctx.lineWidth = Math.max(6, fontSize * 0.06);
  ctx.strokeText(text, x, y);

  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
  ctx.fillStyle = gradient;
  ctx.fillText(text, x, y);

  ctx.strokeStyle = "rgba(20, 20, 20, 0.16)";
  ctx.lineWidth = Math.max(2, fontSize * 0.02);
  ctx.strokeText(text, x, y);
  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 16;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

function createEnhancedImageTexture(file) {
  return new Promise((resolve, reject) => {
    const imageURL = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      const maxSize = 1600;
      const scale = Math.min(maxSize / image.width, maxSize / image.height, 1);
      const width = Math.max(1, Math.round(image.width * scale));
      const height = Math.max(1, Math.round(image.height * scale));
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");

      ctx.clearRect(0, 0, width, height);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(image, 0, 0, width, height);

      // Subtle contrast bump so uploaded artwork reads a bit cleaner on fabric.
      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;
      const contrast = 1.04;
      for (let i = 0; i < data.length; i += 4) {
        data[i] = Math.max(0, Math.min(255, ((data[i] / 255 - 0.5) * contrast + 0.5) * 255));
        data[i + 1] = Math.max(0, Math.min(255, ((data[i + 1] / 255 - 0.5) * contrast + 0.5) * 255));
        data[i + 2] = Math.max(0, Math.min(255, ((data[i + 2] / 255 - 0.5) * contrast + 0.5) * 255));
      }
      ctx.putImageData(imageData, 0, 0);

      const texture = new THREE.CanvasTexture(canvas);
      texture.anisotropy = 16;
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.needsUpdate = true;
      URL.revokeObjectURL(imageURL);
      resolve({ texture, imageURL });
    };
    image.onerror = () => {
      URL.revokeObjectURL(imageURL);
      reject(new Error("Failed to load image"));
    };
    image.src = imageURL;
  });
}



export default function ShirtTool() {


  const [loading, setLoading] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);
  const sceneRef = useRef(null);
  const [color, setColor] = useState("#f44336");
  const [textInput, setTextInput] = useState("");
  const [decals, setDecals] = useState([]);
  const [moveStep, setMoveStep] = useState(0.2);
  const [selectedFont, setSelectedFont] = useState("Arial");
  const [fontColor, setFontColor] = useState("#000000");
const [lampOn, setLampOn] = useState(false);
const [currentMood, setCurrentMood] = useState('original');
const [activeView, setActiveView] = useState("front");
const [autoRotate, setAutoRotate] = useState(true);


useEffect(() => {
 

    if (sceneRef.current) {
    sceneRef.current.setMood("original");
    sceneRef.current.setCameraView("front");
    setLampOn(sceneRef.current.isLampOn());
    setAutoRotate(sceneRef.current.isAutoRotateEnabled());
    setCurrentMood("original");
    setActiveView("front");
  }
},

[]);



const handleMove = (id, direction) => {
  setDecals(prev =>
    prev.map(decal => {
      if (decal.id !== id) return decal;

      const step = moveStep;
      const newPosition = { ...decal.position };

      const isBack = decal.side === "back";

      switch (direction) {
        case "right":
          newPosition.x += isBack ? step : -step;
          break;
        case "left":
          newPosition.x += isBack ? -step : step;
          break;
        case "up":
          newPosition.y +=  step;
          break;
        case "down":
          newPosition.y +=  -step;
          break;
        default:
          break;
      }

      newPosition.x = Math.max(-8, Math.min(8, newPosition.x));
      newPosition.y = Math.max(-3, Math.min(3, newPosition.y));

      sceneRef.current.updateDecalGeometry(decal.id, {
        position: newPosition,
        orientation: decal.orientation,
        size: decal.size,
        texture: decal.texture,
      });

      return { ...decal, position: newPosition };
    })
  );
};

const handleFlipSide = (id) => {
  
  setDecals(prev =>
    prev.map(decal => {
      if (decal.id !== id) return decal;

      const newSide = decal.side === "front" ? "back" : "front";
      const newPosition = { ...decal.position, z: newSide === "front" ? -0.2 : 0.2 };
      const newOrientation = { ...decal.orientation, y: newSide === "front" ? 0 : Math.PI };

      let updatedTexture = decal.texture;

      if (decal.type === "text") {
        updatedTexture = createStyledTextTexture({
          text: decal.label,
          font: decal.font,
          fontSize: decal.fontSize * 4,
          textColor: decal.textColor,
          mirrored: newSide === "back",
        });
      }

      sceneRef.current.updateDecalGeometry(decal.id, {
        position: newPosition,
        orientation: newOrientation,
        size: decal.size,
        texture: updatedTexture,
      });
      return {
        ...decal,
        position: newPosition,
        orientation: newOrientation,
        side: newSide,
        texture: updatedTexture,
      };
      
    },
  )
  );
};


const handleScale = (id, action) => {
  const scaleStep = moveStep;

  setDecals(prev =>
    prev.map(decal => {
      if (decal.id !== id) return decal;

      const newSize = { ...decal.size };
      if (action === "increase") {
        newSize.x += scaleStep;
        newSize.y += scaleStep;
        
      } else if (action === "decrease") {
        newSize.x = Math.max(0.1, newSize.x - scaleStep);
        newSize.y = Math.max(0.1, newSize.y - scaleStep);
        
      }

      sceneRef.current.updateDecalGeometry(decal.id, {
        position: decal.position,
        orientation: decal.orientation,
        size: newSize,
        texture: decal.texture,
      });

      return { ...decal, size: newSize };
    })
  );
};

const handleFontUpdate = (id, newFont, newColor) => {
  setDecals(prev =>
    prev.map(decal => {
      if (decal.id !== id || decal.type !== "text") return decal;
      const newTexture = createStyledTextTexture({
        text: decal.label,
        font: newFont,
        fontSize: decal.fontSize * 4,
        textColor: newColor,
        mirrored: decal.side === "back",
      });

      sceneRef.current.updateDecalGeometry(decal.id, {
        position: decal.position,
        orientation: decal.orientation,
        size: decal.size,
        texture: newTexture,
      });
    setLoading(false);

      return {
        ...decal,
        texture: newTexture,
        font: newFont,
        textColor: newColor,
      };
      
    })
    
  );
};
const handleFontScale = (id, direction) => {
  const step = 4;
      setLoading(true);

  setDecals(prev =>
    prev.map(decal => {
      if (decal.id !== id || decal.type !== "text") return decal;

      let newFontSize = direction === "increase"
        ? decal.fontSize + step
        : Math.max(8, decal.fontSize - step);
      const newTexture = createStyledTextTexture({
        text: decal.label,
        font: decal.font,
        fontSize: newFontSize * 4,
        textColor: decal.textColor,
        mirrored: decal.side === "back",
      });

      sceneRef.current.updateDecalGeometry(decal.id, {
        position: decal.position,
        orientation: decal.orientation,
        size: decal.size,
        texture: newTexture,
      });
                setLoading(false);
      return {
        ...decal,
        texture: newTexture,
        fontSize: newFontSize
      };
    })
  );
};





  const handleColorChange = (newColor) => {
    setColor(newColor.hex);
    if (sceneRef.current) {
      sceneRef.current.changeModelColor(newColor.hex);
    }


  };

 const handleTextApply = () => {
 
  if (sceneRef.current && textInput.trim() !== "") {
   
    const id = Date.now();
    const decalTexture = createStyledTextTexture({
      text: textInput,
      font: selectedFont,
      fontSize: 160,
      textColor: fontColor,
      mirrored: false,
    });

    const position = { x: 0, y: 0.2, z: -0.2 };
    const orientation = { x: 0, y: Math.PI, z: 0 };
    const size = { x: 0.5, y: 0.5, z: 0.5 };

    setDecals((prev) => [
      ...prev,
      {
        id,
        type: "text",
        label: textInput,
        texture: decalTexture,
        position,
        orientation,
        size,
        font: selectedFont,
        textColor: fontColor,
        fontSize: 40,
        side: "front",
      },
    ]);

    sceneRef.current.updateDecalGeometry(id, {
      position,
      orientation,
      size,
      texture: decalTexture,
    });

    setTextInput("");
      
  }
};


  const handleImageInput = (event) => {
    const file = event.target.files[0];
    if (!file || !sceneRef.current) return;

    setLoading(true);

    createEnhancedImageTexture(file)
      .then(({ texture }) => {
        const id = Date.now();
        setDecals(prev => [
          ...prev,
          {
            id,
            type: "image",
            label: file.name,
            texture,
            position: { x: 0, y: 0.2, z: -0.2 },
            orientation: { x: 0, y: Math.PI, z: 0 },
            size: { x: 0.5, y: 0.5, z: 0.5 },
            side: "front",
          }
        ]);

        sceneRef.current.updateDecalGeometry(id, {
          position: { x: 0, y: 0.2, z: -0.2 },
          orientation: { x: 0, y: Math.PI, z: 0 },
          size: { x: 0.5, y: 0.5, z: 0.5 },
          texture,
        });
      })
      .catch((error) => {
        console.error("Image load error", error);
      })
      .finally(() => {
        setLoading(false);
      });
  };




  

  return (
    <main className={styles.container}>
      <div className={`${styles.lampWrapper} ${lampOn ? styles.on : styles.off}`}>
  <div className={styles.lampTop}></div>
  <div className={styles.lampShade}></div>
  <div className={styles.bulb}></div>
  <div className={styles.spotlight}></div>
  <div className={styles.cord}></div>
  <div
    className={styles.knob}
    onClick={() => {
      const newState = sceneRef.current.toggleLamp();
      setLampOn(newState);
    }}
  ></div>
</div>
<div className={styles.moodSelector}>
  <div
    className={`${styles.moodBtn} ${currentMood === 'original' ? styles.active : ''}`}
    onClick={() => sceneRef.current.setMood('original')}
    title="original "
  ></div>
  <div
    className={`${styles.moodBtn} ${currentMood === 'silverblack' ? styles.active : ''}`}
    onClick={() => sceneRef.current.setMood('silverblack')}
    title="silverblack"
  ></div>
  <div
    className={`${styles.moodBtn} ${currentMood === 'velvetnight' ? styles.active : ''}`}
    onClick={() => sceneRef.current.setMood('velvetnight')}
    title="velvetnight "
  ></div>
</div>

<div className={styles.viewSelector}>
  <button
    className={`${styles.viewBtn} ${activeView === "front" ? styles.activeView : ""}`}
    onClick={() => {
      sceneRef.current.setCameraView("front");
      setActiveView("front");
    }}
  >
    Front
  </button>
  <button
    className={`${styles.viewBtn} ${activeView === "angled" ? styles.activeView : ""}`}
    onClick={() => {
      sceneRef.current.setCameraView("angled");
      setActiveView("angled");
    }}
  >
    Angle
  </button>
  <button
    className={`${styles.viewBtn} ${activeView === "back" ? styles.activeView : ""}`}
    onClick={() => {
      sceneRef.current.setCameraView("back");
      setActiveView("back");
    }}
  >
    Back
  </button>
  <button
    className={`${styles.viewBtn} ${activeView === "detail" ? styles.activeView : ""}`}
    onClick={() => {
      sceneRef.current.setCameraView("detail");
      setActiveView("detail");
    }}
  >
    Detail
  </button>
  <button
    className={`${styles.viewBtn} ${autoRotate ? styles.activeView : ""}`}
    onClick={() => {
      const next = sceneRef.current.toggleAutoRotate();
      setAutoRotate(next);
    }}
  >
    Rotate
  </button>
</div>


      <div className={styles.scene}>
      <DesignScene
        ref={sceneRef}
        onMoodChange={setCurrentMood}
        onSceneReady={() => setSceneReady(true)}
      />


      </div>








      
        <SidebarDock
  color={color}
  handleColorChange={handleColorChange}
  textInput={textInput}
  setTextInput={setTextInput}
  handleTextApply={handleTextApply}
  selectedFont={selectedFont}
  setSelectedFont={setSelectedFont}
  fontColor={fontColor}
  setFontColor={setFontColor}
  decals={decals}
  sceneRef={sceneRef}
  setDecals={setDecals}
  moveStep={moveStep}
  setMoveStep={setMoveStep}
  handleFlipSide={handleFlipSide}
  handleMove={handleMove}
  handleScale={handleScale}
  handleFontUpdate={handleFontUpdate}
  handleFontScale={handleFontScale}
  handleImageInput={handleImageInput}
  showNavBar={true} 
/>

<LoadingOverlay
  open={!sceneReady || loading}
  message={!sceneReady ? "Preparing studio..." : "loading..."}
/>

       
    </main>
  );
}
