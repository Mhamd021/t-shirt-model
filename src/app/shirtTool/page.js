"use client";
import React, { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DesignScene from "../components/DesignScene";
import styles from "./designpage.module.css";
import * as THREE from "three";
import SidebarDock from './Sidebar2';
import LoadingOverlay from "../components/LoadingOverlay";
import { ACCESS_TOKEN_KEY, getApiErrorMessage } from "../services/apiClient";
import {
  createDesign,
  deleteDesign,
  getDesigns,
  updateDesign,
} from "../services/designService";
import { uploadImage } from "../services/uploadService";
import { createOrder, getMyOrders } from "../services/orderService";

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

function createImageTextureFromUrl(imageUrl) {
  return new Promise((resolve, reject) => {
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin("anonymous");
    loader.load(
      imageUrl,
      (texture) => {
        texture.anisotropy = 16;
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.needsUpdate = true;
        resolve(texture);
      },
      undefined,
      reject
    );
  });
}

async function toFrontendDecal(savedDecal) {
  const isText = savedDecal.type === "TEXT";
  const id = savedDecal.id;
  const side = savedDecal.side || "front";
  const position = {
    x: savedDecal.positionX ?? 0,
    y: savedDecal.positionY ?? 0.2,
    z: savedDecal.positionZ ?? -0.2,
  };
  const orientation = {
    x: savedDecal.orientationX ?? 0,
    y: savedDecal.orientationY ?? Math.PI,
    z: savedDecal.orientationZ ?? 0,
  };
  const size = {
    x: savedDecal.scaleX ?? 0.5,
    y: savedDecal.scaleY ?? 0.5,
    z: savedDecal.scaleZ ?? 0.5,
  };

  if (isText) {
    const font = savedDecal.font || "Arial";
    const fontSize = savedDecal.fontSize || 40;
    const textColor = savedDecal.textColor || "#000000";
    const label = savedDecal.text || "";

    return {
      id,
      type: "text",
      label,
      texture: createStyledTextTexture({
        text: label,
        font,
        fontSize: fontSize * 4,
        textColor,
        mirrored: side === "back",
      }),
      position,
      orientation,
      size,
      font,
      textColor,
      fontSize,
      side,
    };
  }

  if (!savedDecal.imageUrl) return null;

  return {
    id,
    type: "image",
    label: "Image Layer",
    texture: await createImageTextureFromUrl(savedDecal.imageUrl),
    position,
    orientation,
    size,
    side,
    imageUrl: savedDecal.imageUrl,
    publicId: savedDecal.publicId,
  };
}



export default function ShirtTool() {

  const router = useRouter();
  const initialDesignLoadedRef = useRef(false);

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
  const [saveStatus, setSaveStatus] = useState("");
  const [currentDesignId, setCurrentDesignId] = useState(null);
  const [currentDesignName, setCurrentDesignName] = useState("");
  const [savedDesigns, setSavedDesigns] = useState([]);
  const [operationsOpen, setOperationsOpen] = useState(true);
  const [orders, setOrders] = useState([]);
  const [checkoutForm, setCheckoutForm] = useState({
    size: "M",
    street: "",
    city: "",
    country: "",
    zip: "",
    notes: "",
  });


  useEffect(() => {
    if (!localStorage.getItem(ACCESS_TOKEN_KEY)) {
      router.push("/login");
      return;
    }


    if (sceneRef.current) {
      sceneRef.current.setMood("original");
      sceneRef.current.setCameraView("front");
      setLampOn(sceneRef.current.isLampOn());
      setAutoRotate(sceneRef.current.isAutoRotateEnabled());
      setCurrentMood("original");
      setActiveView("front");
    }
  },

    [router]);

  const refreshSavedDesigns = async () => {
    const designs = await getDesigns();
    setSavedDesigns(designs);
    return designs;
  };

  const refreshOrders = async () => {
    const nextOrders = await getMyOrders();
    setOrders(nextOrders);
    return nextOrders;
  };

  const loadDesignIntoScene = async (design) => {
    if (!design || !sceneRef.current) return;

    sceneRef.current.clearDecals();
    sceneRef.current.changeModelColor(design.shirtColor);
    setColor(design.shirtColor);
    setCurrentDesignId(design.id);
    setCurrentDesignName(design.name);

    const restoredDecals = (
      await Promise.all(design.decals.map(toFrontendDecal))
    ).filter(Boolean);

    restoredDecals.forEach((decal) => {
      sceneRef.current.updateDecalGeometry(decal.id, {
        position: decal.position,
        orientation: decal.orientation,
        size: decal.size,
        texture: decal.texture,
      });
    });

    setDecals(restoredDecals);
  };

  useEffect(() => {
    if (!sceneReady || initialDesignLoadedRef.current) return;
    if (!localStorage.getItem(ACCESS_TOKEN_KEY)) return;

    const loadLatestDesign = async () => {
      try {
        initialDesignLoadedRef.current = true;
        setLoading(true);

        const designs = await refreshSavedDesigns();
        await refreshOrders();
        const latestDesign = designs[0];
        if (!latestDesign) return;

        await loadDesignIntoScene(latestDesign);
        setSaveStatus(`Loaded design #${latestDesign.id}`);
      } catch (error) {
        console.error("Design load error", error);
        setSaveStatus(getApiErrorMessage(error));
      } finally {
        setLoading(false);
      }
    };

    loadLatestDesign();
  }, [sceneReady]);

  const handleLoadDesign = async (design) => {
    try {
      setLoading(true);
      await loadDesignIntoScene(design);
      setSaveStatus(`Loaded design #${design.id}`);
    } catch (error) {
      console.error("Design load error", error);
      setSaveStatus(getApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDesign = async (id) => {
    try {
      setLoading(true);
      await deleteDesign(id);
      const designs = await refreshSavedDesigns();

      if (currentDesignId === id) {
        if (designs[0]) {
          await loadDesignIntoScene(designs[0]);
          setSaveStatus(`Deleted design #${id}. Loaded design #${designs[0].id}`);
        } else {
          handleNewDesign();
          setSaveStatus(`Deleted design #${id}`);
        }
      } else {
        setSaveStatus(`Deleted design #${id}`);
      }
    } catch (error) {
      console.error("Design delete error", error);
      setSaveStatus(getApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleNewDesign = () => {
    sceneRef.current?.clearDecals();
    setColor("#f44336");
    sceneRef.current?.changeModelColor("#f44336");
    setDecals([]);
    setCurrentDesignId(null);
    setCurrentDesignName("");
    setSaveStatus("Started a new design");
  };

  const persistCurrentDesign = async () => {
    const designPayload = {
      name: currentDesignName || `T-Shirt Design ${new Date().toLocaleDateString()}`,
      shirtColor: color,
      decals,
    };
    const design = currentDesignId
      ? await updateDesign(currentDesignId, designPayload)
      : await createDesign(designPayload);

    setCurrentDesignId(design.id);
    setCurrentDesignName(design.name);
    await refreshSavedDesigns();
    return design;
  };

  const handleCheckoutChange = (field, value) => {
    setCheckoutForm((form) => ({ ...form, [field]: value }));
  };

  const handleSubmitOrder = async (event) => {
    event.preventDefault();
    setSaveStatus("");

    try {
      setLoading(true);
      const design = await persistCurrentDesign();
      const order = await createOrder({
        designId: design.id,
        size: checkoutForm.size,
        address: {
          street: checkoutForm.street,
          city: checkoutForm.city,
          country: checkoutForm.country,
          zip: checkoutForm.zip,
        },
        notes: checkoutForm.notes || undefined,
      });

      await refreshOrders();
      setCheckoutForm((form) => ({ ...form, notes: "" }));
      setSaveStatus(`Order #${order.id} created`);
    } catch (error) {
      console.error("Order submit error", error);
      setSaveStatus(getApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };



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
            newPosition.y += step;
            break;
          case "down":
            newPosition.y += -step;
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

  const addTextDecal = (text, options = {}) => {
    if (sceneRef.current && text.trim() !== "") {
      const id = Date.now();
      const font = options.font || selectedFont;
      const textColor = options.textColor || fontColor;
      const fontSize = options.fontSize || 40;
      const decalTexture = createStyledTextTexture({
        text,
        font,
        fontSize: 160,
        textColor,
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
          label: text,
          texture: decalTexture,
          position,
          orientation,
          size,
          font,
          textColor,
          fontSize,
          side: "front",
        },
      ]);

      sceneRef.current.updateDecalGeometry(id, {
        position,
        orientation,
        size,
        texture: decalTexture,
      });
    }
  };

  const handleTextApply = () => {
    addTextDecal(textInput);
    setTextInput("");
  };


  const addImageDecal = ({ fileName, texture, uploadedImage }) => {
    const id = Date.now();
    const position = { x: 0, y: 0.2, z: -0.2 };
    const orientation = { x: 0, y: Math.PI, z: 0 };
    const size = { x: 0.5, y: 0.5, z: 0.5 };

    setDecals(prev => [
      ...prev,
      {
        id,
        type: "image",
        label: fileName,
        texture,
        position,
        orientation,
        size,
        side: "front",
        imageUrl: uploadedImage.url,
        publicId: uploadedImage.publicId,
      }
    ]);

    sceneRef.current.updateDecalGeometry(id, {
      position,
      orientation,
      size,
      texture,
    });
  };

  const handleImageInput = async (event) => {
    const file = event.target.files[0];
    if (!file || !sceneRef.current) return;

    setLoading(true);
    setSaveStatus("");

    try {
      const [uploadedImage, { texture }] = await Promise.all([
        uploadImage(file),
        createEnhancedImageTexture(file),
      ]);
      addImageDecal({ fileName: file.name, texture, uploadedImage });
    } catch (error) {
      console.error("Image upload error", error);
      setSaveStatus(getApiErrorMessage(error));
    } finally {
      event.target.value = "";
      setLoading(false);
    }
  };

  const handleSaveDesign = async () => {
    setSaveStatus("");

    try {
      setLoading(true);
      const design = await persistCurrentDesign();
      setSaveStatus(`${currentDesignId ? "Updated" : "Saved"} design #${design.id}`);
    } catch (error) {
      console.error("Design save error", error);
      setSaveStatus(getApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
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

      <button
        className={styles.operationsToggle}
        onClick={() => setOperationsOpen((open) => !open)}
      >
        {operationsOpen ? "Hide Tools" : "Show Tools"}
      </button>

      <div className={`${styles.viewSelector} ${operationsOpen ? '' : styles.operationsHidden}`}>
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
        <button className={styles.viewBtn} onClick={handleSaveDesign}>
          Save
        </button>
      </div>
      {saveStatus && <span className={styles.saveStatus}>{saveStatus}</span>}


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
        savedDesigns={savedDesigns}
        currentDesignId={currentDesignId}
        handleLoadDesign={handleLoadDesign}
        handleDeleteDesign={handleDeleteDesign}
        handleNewDesign={handleNewDesign}
        checkoutForm={checkoutForm}
        orders={orders}
        handleCheckoutChange={handleCheckoutChange}
        handleSubmitOrder={handleSubmitOrder}
        showNavBar={true}
      />

      <LoadingOverlay
        open={!sceneReady || loading}
        message={!sceneReady ? "Preparing studio..." : "loading..."}
      />


    </main>
  );
}
