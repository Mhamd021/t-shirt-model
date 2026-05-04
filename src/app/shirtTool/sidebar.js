'use client';
import styles from './designpage.module.css';
import { useState } from 'react';
import dynamic from "next/dynamic";

import { FaTshirt, FaImage, FaTrash, FaArrowsAlt, FaEye ,FaArrowLeft, FaArrowRight, FaArrowUp, FaArrowDown, FaRedo,FaMinus,FaPlus, FaFont } from "react-icons/fa";



const SketchPickerNoSSR = dynamic(
  () => import("react-color").then((mod) => mod.SketchPicker),
  { ssr: false }
);
const getShortLabel = (label) => {
  if (!label) return "Unnamed";
  const clean = label.trim();
  return clean.length > 30 ? `${clean.slice(0, 27)}...` : clean;
};


export default function Sidebar({
  showNavBar,
  color,
  handleColorChange,
  textInput,
  setTextInput,
  handleTextApply,
  selectedFont,
  setSelectedFont,
  fontColor,
  setFontColor,
  decals,
  sceneRef,
  setDecals,
  moveStep,
  setMoveStep,
  handleFlipSide,
  handleMove,
  handleScale,
  handleFontUpdate,
  handleFontScale,
  handleImageInput,
}) {
 
  const [openSection, setOpenSection] = useState("model");

  const toggleSection = (section) => {
    setOpenSection(prev => (prev === section ? null : section));
  };
  const [openDecalId, setOpenDecalId] = useState(null);
const toggleDecal = (id) => {
  setOpenDecalId((prev) => (prev === id ? null : id));
};

  return (
    <nav className={`${styles.sidebar} ${!showNavBar ? styles.sidebarClosed : ""}`}>

      <div className={styles.collapsible} onClick={() => toggleSection("model")}>
        <h3><FaTshirt /> Color</h3>

      </div>
      <div className={openSection === "model" ? styles.contentExpanded : styles.contentCollapsed}>
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
      </div>
      <div className={styles.collapsible} onClick={() => toggleSection("Image_Add")}>
          <h3><FaImage /> Upload Image</h3>
        </div>
        <div className={openSection === "Image_Add" ? styles.contentExpanded : styles.contentCollapsed}>
        <label className={styles.imageInput}>
          <input type="file" onChange={handleImageInput} />
          Upload Image
        </label>
        </div>

        <div className={styles.collapsible} onClick={() => toggleSection("Text_Add")}>
  <h3><FaFont />Add Text</h3>
</div>
<div className={`${openSection === "Text_Add" ? styles.contentExpanded : styles.contentCollapsed} ${styles.textAddSection}`}>
  <input
    type="text"
    value={textInput}
    onChange={(e) => setTextInput(e.target.value)}
    placeholder="Enter your text"
    className={styles.textInput}
  />

  <label>Choose Font Style</label>
  <select value={selectedFont} onChange={(e) => setSelectedFont(e.target.value)} className={styles.selectInput}>
    <option value="Arial">Arial</option>
    <option value="Roboto">Roboto</option>
    <option value="Comic Sans MS">Comic Sans</option>
    <option value="Courier New">Courier</option>
    <option value="Georgia">Georgia</option>
  </select>

  <label>Choose Text Color</label>
  <input
    type="color"
    value={fontColor}
    onChange={(e) => setFontColor(e.target.value)}
    className={styles.colorInput}
  />

 <center>
   <button onClick={handleTextApply} className={styles.imageInput}>
    Apply Text
  </button>
 </center>
</div>


<div className={styles.collapsible} onClick={() => toggleSection("decals")}>
  <h3><FaEye /> Applied Decals</h3>
</div>
<div className={openSection === "decals" ? styles.contentExpanded : styles.contentCollapsed}>
<ul className={styles.decalList}>
  {decals.map((decal) => (
    <li key={decal.id} className={styles.decalItem}>
  <div className={styles.collapsibleDecal} onClick={() => toggleDecal(decal.id)}>
   <h4>
  {decal.type === "text" ? <FaFont  /> : <FaImage />}{" "}
  {decal.type === "text" ? "Text" : "Image"}{" "}
</h4>
  </div>

  <div className={openDecalId === decal.id ? styles.decalExpanded : styles.decalCollapsed}>
    {/* decalHeader */}
    <div className={styles.decalHeader}>
      
      <div className={styles.decalActions}>
        

      <span className={styles.sideleft} onClick={() => {
          sceneRef.current.removeDecalById(decal.id);
          setDecals((prev) => prev.filter((d) => d.id !== decal.id));
          
        }} title='remove the applied item!'>
        remove <FaTrash />
        </span>


          <span className={styles.sideBadge} onClick={() => handleFlipSide(decal.id)} title='to flip the applied item front and back'>
  {decal.side === "front" ? "Front" : "Back"}
</span>
      </div>
    </div>

    {/* decalControls */}
    <div className={styles.decalControls}>
      <label>Precision: {moveStep.toFixed(2)} units</label>
      <input type="range" min={0.01} max={1.0} step={0.01} value={moveStep}
        onChange={(e) => setMoveStep(parseFloat(e.target.value))} />
        <h5>Modify Position</h5>
      <div className={styles.moveButtons}>
        <button onClick={() => handleMove(decal.id, "left")}><FaArrowLeft /></button>
        <button onClick={() => handleMove(decal.id, "right")}><FaArrowRight /></button>
        <button onClick={() => handleMove(decal.id, "up")}><FaArrowUp /></button>
        <button onClick={() => handleMove(decal.id, "down")}><FaArrowDown /></button>
      </div>
    </div>

    {/* Optional Scale or Text Config */}
    
    {decal.type === "image" && (
      
      <div className={styles.scaleButtons}>
        <h5>Modify Scale</h5>
        <button onClick={() => handleScale(decal.id, "increase")}><FaPlus /></button>
        <button onClick={() => handleScale(decal.id, "decrease")}><FaMinus /></button>
      </div>
    )}

    {decal.type === "text" && (
      <div className={styles.textOptions}>
        <label>Choose Font Style</label>
        <select
          value={decal.font}
          onChange={(e) => handleFontUpdate(decal.id, e.target.value, decal.textColor)}>
          <option value="Arial">Arial</option>
          <option value="Roboto">Roboto</option>
          <option value="Comic Sans MS">Comic Sans</option>
          <option value="Courier New">Courier</option>
          <option value="Georgia">Georgia</option>
        </select>
        <label> Choose Font Color</label>
        <input type="color" value={decal.textColor}
          onChange={(e) => handleFontUpdate(decal.id, decal.font, e.target.value)} />
        <div className={styles.scaleButtons}>
                  <label>Modify Font Size</label>
          <span>Size: {decal.fontSize}px</span>
          <button onClick={() => handleFontScale(decal.id, "increase")}><FaPlus /></button>
          <button onClick={() => handleFontScale(decal.id, "decrease")}><FaMinus /></button>
        </div>
        <div className={styles.textPreview}>
    <p style={{
      fontFamily: decal.font,
      fontSize: '18px',
      color: decal.textColor,
      textAlign: 'center'
    }}>
      {decal.label}
    </p>
  </div>
      </div>
    )}
  </div>
</li>

  ))}
</ul>
</div>
 
    </nav>
   
   

  );
}
