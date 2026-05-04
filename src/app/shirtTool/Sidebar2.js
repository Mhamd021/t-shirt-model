'use client';
import styles from './designpage.module.css';
import { useState } from 'react';
import dynamic from "next/dynamic";
import { 
  FaTshirt, FaImage, FaTrash, FaArrowLeft, FaArrowRight, FaArrowUp, FaArrowDown, FaRedo, FaMinus, FaPlus, FaFont, FaEye
} from "react-icons/fa";

const SketchPickerNoSSR = dynamic(
  () => import("react-color").then((mod) => mod.SketchPicker),
  { ssr: false }
);
const getShortLabel = (label) => {
  if (!label) return "Unnamed";
  const clean = label.trim();
  return clean.length > 30 ? `${clean.slice(0, 20)}...` : clean;
};

export default function SidebarDock({
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
  const [activePanel, setActivePanel] = useState(null);
   const [openDecalId, setOpenDecalId] = useState(null);
  const removeDecal = (id) => {
    sceneRef.current.removeDecalById(id);
    setDecals(prev => prev.filter(d => d.id !== id));
  };

  const getDecalPreviewStyle = (decal) => {
    if (decal.type === "text") {
      return {
        fontFamily: decal.font,
        color: decal.textColor,
        fontWeight: 700,
      };
    }

    return {
      color: "var(--text-soft)",
      fontWeight: 600,
    };
  };

  return (
    <>
      {/* Floating Dock */}
      <div className={styles.toolDock}>
        <button onClick={() => setActivePanel(activePanel === 'color' ? null : 'color')} title="Shirt Color"><FaTshirt/></button>
        <button onClick={() => setActivePanel(activePanel === 'image' ? null : 'image')} title="Add Image"><FaImage/></button>
        <button onClick={() => setActivePanel(activePanel === 'text' ? null : 'text')} title="Add Text"><FaFont/></button>
        <button onClick={() => setActivePanel(activePanel === 'decals' ? null : 'decals')} title="Applied Decals"><FaEye/></button>
      </div>

      {/* Slide-Out Panel */}
      <div className={`${styles.sidePanel} ${activePanel ? styles.open : ''}`}>
        {activePanel === 'color' && (
          <div className={styles.panelSection}>
            <h3><FaTshirt/> Shirt Color</h3>
            <p className={styles.panelIntro}>Choose a base tone that works well with your print and lighting mood.</p>
            <div className={styles.panelCard}>
              <SketchPickerNoSSR color={color} onChangeComplete={handleColorChange}/>
            </div>
          </div>
        )}

        {activePanel === 'image' && (
          <div className={styles.panelSection}>
            <h3><FaImage/> Upload Image</h3>
            <p className={styles.panelIntro}>Add artwork, logos, or graphics as a decal on the shirt.</p>
            <div className={styles.panelCard}>
              <label className={styles.imageInput}>
                <input type="file" onChange={handleImageInput} />
                <span className={styles.uploadLabel}>Upload Image</span>
              </label>
            </div>
          </div>
        )}

        {activePanel === 'text' && (
  <div className={`${styles.textPanel} ${styles.panelSection}`}>
    <h3><FaFont/> Add Text</h3>
    <p className={styles.panelIntro}>Create a cleaner print-style text decal with font and color controls.</p>
    
    <div className={styles.panelCard}>
      <label className={styles.fieldLabel}>Enter Your Text</label>
      <input
        type="text"
        value={textInput}
        onChange={(e) => setTextInput(e.target.value)}
        placeholder="Type something creative..."
        className={styles.textInput}
      />

      <label className={styles.fieldLabel}>Font Style</label>
      <select
        value={selectedFont}
        onChange={(e) => setSelectedFont(e.target.value)}
        className={styles.selectInput}
      >
        <option value="Arial">Arial</option>
        <option value="Roboto">Roboto</option>
        <option value="Comic Sans MS">Comic Sans</option>
        <option value="Courier New">Courier</option>
        <option value="Georgia">Georgia</option>
      </select>

      <label className={styles.fieldLabel}>Text Color</label>
      <input
        type="color"
        value={fontColor}
        onChange={(e) => setFontColor(e.target.value)}
        className={styles.colorInput}
      />

      <button onClick={handleTextApply} className={styles.applyTextBtn}>
        Add Text To Shirt
      </button>
    </div>
  </div>
)}


        {activePanel === 'decals' && (
          <div className={styles.panelSection}>
            <h3><FaEye/> Applied Decals</h3>
            <p className={styles.panelIntro}>Review your layers, adjust their size and placement, or remove them.</p>
            <ul className={styles.decalGrid}>
  {decals.map((decal) => {
    const isOpen = openDecalId === decal.id;
    return (
      <li key={decal.id} className={styles.decalCard}>
        {/* Header */}
        <div className={styles.decalHeader} onClick={() => setOpenDecalId(isOpen ? null : decal.id)}>
          <div className={styles.decalPreview}>
            {decal.type === "text" ? (
              <span style={getDecalPreviewStyle(decal)}>{getShortLabel(decal.label)}</span>
            ) : (
              <span style={getDecalPreviewStyle(decal)}>Image Layer</span>
            )}
          </div>
          <div className={styles.decalMeta}>
            <strong>{getShortLabel(decal.label)}</strong>
            <button className={styles.sideToggleBtn} onClick={(e) => {
              e.stopPropagation();
              handleFlipSide(decal.id);
            }}>
              {decal.side === "front" ? "Front" : "Back"}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className={isOpen ? styles.decalExpanded : styles.decalCollapsed}>
          <div className={styles.decalControlCard}>
            <label>Precision: {moveStep.toFixed(2)} units</label>
            <input type="range" min={0.01} max={1.0} step={0.01} value={moveStep}
              onChange={(e) => setMoveStep(parseFloat(e.target.value))} />

            <div className={styles.decalToolbar}>
              <button onClick={() => handleMove(decal.id, "left")}><FaArrowLeft/></button>
              <button onClick={() => handleMove(decal.id, "right")}><FaArrowRight/></button>
              <button onClick={() => handleMove(decal.id, "up")}><FaArrowUp/></button>
              <button onClick={() => handleMove(decal.id, "down")}><FaArrowDown/></button>
            </div>
          </div>

          {decal.type === "image" && (
            <div className={styles.decalControlCard}>
              <label>Scale</label>
              <div className={styles.decalToolbar}>
                <button onClick={() => handleScale(decal.id, "increase")}><FaPlus/></button>
                <button onClick={() => handleScale(decal.id, "decrease")}><FaMinus/></button>
              </div>
            </div>
          )}

          {decal.type === "text" && (
            <div className={`${styles.textOptions} ${styles.decalControlCard}`}>
              <label>Font Style</label>
              <select className={styles.selectInput} value={decal.font} onChange={(e) => handleFontUpdate(decal.id, e.target.value, decal.textColor)}>
                <option value="Arial">Arial</option>
                <option value="Roboto">Roboto</option>
                <option value="Comic Sans MS">Comic Sans</option>
                <option value="Courier New">Courier</option>
                <option value="Georgia">Georgia</option>
              </select>
              <label>Font Color</label>
              <input type="color" className={styles.colorInput} value={decal.textColor} onChange={(e) => handleFontUpdate(decal.id, decal.font, e.target.value)} />
              <label>Font Size</label>
              <span className={styles.valueLabel}>{decal.fontSize}px</span>
              <div className={styles.decalToolbar}>
                <button onClick={() => handleFontScale(decal.id, "increase")}><FaPlus/></button>
                <button onClick={() => handleFontScale(decal.id, "decrease")}><FaMinus/></button>
              </div>
            </div>
          )}

          <div className={`${styles.decalToolbar} ${styles.decalFooter}`}>
            <button onClick={() => removeDecal(decal.id)}><FaTrash/></button>
          </div>
        </div>
      </li>
    );
  })}
</ul>

          </div>
        )}
      </div>
    </>
  );
}
