"use client";
import React, { useRef, useState } from "react";
import DesignScene from "../components/DesignScene";
import styles from "./designpage.module.css";
import dynamic from "next/dynamic";

// Dynamically import SketchPicker with SSR disabled.
const SketchPickerNoSSR = dynamic(
  () => import("react-color").then((mod) => mod.SketchPicker),
  { ssr: false }
);

export default function ShirtTool() {
  const sceneRef = useRef(null);
  const [showNavBar, setShowNavBar] = useState(true);
  const [color, setColor] = useState("#f44336");



  const toggleNavBar = () => {
    setShowNavBar((prev) => !prev);
  };

  // Update the model color when the color picker changes.
  const handleColorChange = (newColor) => {
    setColor(newColor.hex);
    if (sceneRef.current) {
      sceneRef.current.changeModelColor(newColor.hex);
    }
  };

  // Upload image and apply it as a texture.
  const handleImageInput = (event) => {
    const file = event.target.files[0];
    const imageURL = URL.createObjectURL(file);
    if (sceneRef.current) {
      sceneRef.current.applyDecalImage(imageURL);
    }
  };

  

  return (
    <main className={styles.container}>
      <div className={styles.scene}>
        <DesignScene ref={sceneRef} />
      </div>
      <button className={styles.toggleButton} onClick={toggleNavBar}>
        Toggle Navigation
      </button>
      <nav
        className={`${styles.sidebar} ${
          !showNavBar ? styles.sidebarClosed : ""
        }`}
      >
        <h3>Model Controllers</h3>
        <hr className={styles.divider} />
        <p>Choose the color of the shirt</p>
        <SketchPickerNoSSR
          color={color}
          onChangeComplete={handleColorChange}
          styles={{
            default: {
              picker: {
                boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
                borderRadius: "12px",
                marginBottom: "10px",
              },
            },
          }}
        />
        <hr className={styles.divider} />
        <label>add an image to the model</label>
        <label className={styles.imageInput}>
          <input type="file" onChange={handleImageInput} />
          <span className="uploadIcon">📤</span> Upload Image
        </label>
        <hr className={styles.divider} />
        <label>adjust the image on the model</label>
   
      </nav>
    </main>
  );
}
