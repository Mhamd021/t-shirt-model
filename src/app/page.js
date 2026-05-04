"use client";
import styles from "./page.module.css";
import BasicScene from "./components/BasicScene";
import Link from "next/link";
import LottiePlayer from "./components/LottiePlayer";

const featureItems = [
  {
    title: "Design in 3D",
    text: "Preview colors and graphics on a rotating shirt model before you commit.",
  },
  {
    title: "Fast Creative Flow",
    text: "Move from idea to polished mockup in a workspace built for experimentation.",
  },
  {
    title: "Ready for Your Brand",
    text: "Shape merch concepts, team apparel, or one-off drops with a cleaner presentation.",
  },
];

export default function Home() {
  return (
    <main className={styles.pageShell}>
      <div className={styles.backgroundGrid} />

      <section className={styles.heroSection}>
        <div className={styles.copyColumn}>
          <span className={styles.eyebrow}>Custom Apparel Studio</span>
          <h1 className={styles.heroTitle}>Turn simple shirt ideas into polished 3D concepts.</h1>
          <p className={styles.heroText}>
            Build custom T-shirt looks with a more immersive preview experience, clearer visual
            hierarchy, and a workspace that feels crafted for modern merch design.
          </p>

          <div className={styles.ctaRow}>
            <Link href="/shirtTool" className={styles.primaryCta}>
              Start Designing
            </Link>
            <a href="#features" className={styles.secondaryCta}>
              Explore Features
            </a>
          </div>

          <div className={styles.metricRow}>
            <div className={styles.metricCard}>
              <strong>Interactive</strong>
              <span>Rotate and inspect your design live.</span>
            </div>
            <div className={styles.metricCard}>
              <strong>Brand Ready</strong>
              <span>Create concepts that feel presentation-worthy.</span>
            </div>
          </div>
        </div>

        <div className={styles.visualColumn}>
          <div className={styles.sceneCard}>
            <div className={styles.sceneBadge}>Live 3D Preview</div>
            <div className={styles.sceneContainer}>
              <BasicScene />
            </div>
          </div>
        </div>
      </section>

      <section id="features" className={styles.featureSection}>
        <div className={styles.featureIntro}>
          <span className={styles.sectionLabel}>Why It Feels Better</span>
          <h2>Designed to feel more like a creative product and less like a demo page.</h2>
        </div>

        <div className={styles.featureGrid}>
          {featureItems.map((item) => (
            <article key={item.title} className={styles.featureCard}>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.showcaseSection}>
        <div className={styles.showcaseCopy}>
          <span className={styles.sectionLabel}>Extra Motion</span>
          <h2>Small animation support adds energy without overpowering the main experience.</h2>
          <p>
            The landing page now balances the 3D shirt viewer with a softer motion accent so the
            layout feels alive while still staying focused on the product.
          </p>
        </div>
        <div className={styles.animationCard}>
          <LottiePlayer />
        </div>
      </section>
    </main>
  );
}
