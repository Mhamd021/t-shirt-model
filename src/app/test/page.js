'use client';
import TestScene from "../components/TestScene";
import styles from "./page.module.css";


export default function test()
{
    return (
        <main className={styles.container}>
            <div className={styles.scene}>
        <TestScene/>
            </div>
        </main>
    );
}