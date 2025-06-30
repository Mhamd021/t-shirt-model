"use client";
import styles from "./page.module.css";
import BasicScene from "./components/BasicScene";
import Link from "next/link";

export default function Home() {
  return (
    <main>
      {/* <div className={styles.navigationBar}>
      
        <Link href='/login'>
        Login  
        </Link>
       
        <Link href='/register'>
        Create Account
        </Link>
      </div> */}
      <div className={styles.main}>
      <div className={styles.content}>
        <h1 >Welcome to the T-Shirt Designer!</h1>
        <p>Design your custom T-shirts with ease using our interactive 3D tool.</p>
      </div>
      <div className={styles.sceneContainer}>
        <BasicScene/>
      </div>
      <Link  href="/shirtTool">
      <button className={styles.button}>
        Start Designing now!
      </button>
      </Link>
      </div>
     
      
    </main>
  );
}
