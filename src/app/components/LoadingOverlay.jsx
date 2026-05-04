"use client";
import React from "react";
import dynamic from "next/dynamic";
import styles from "../shirtTool/designpage.module.css"; 

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

export default function LoadingOverlay({
  open,
  animationData = null,
  message = null,
  useCard = true
}) {
  if (!open) return null;

  const content = (
    <>
      {animationData && (
        <Lottie
          animationData={animationData}
          loop
          autoplay
          style={{ width: 160, height: 160 }}
        />
      )}
      {message && <div className={styles.loadingMessage}>{message}</div>}
    </>
  );

  return (
    <div className={styles.loadingOverlay}>
      {useCard ? (
        <div className={styles.loadingCard}>{content}</div>
      ) : (
        content
      )}
    </div>
  );
}

