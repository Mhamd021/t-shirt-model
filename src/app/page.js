"use client";

import Link from "next/link";
import LottiePlayer from "./components/LottiePlayer";
import styles from "./page.module.css";

const workflowSteps = [
  {
    number: "01",
    title: "Create",
    text: "Choose a shirt color, upload artwork, add text, and shape the first version fast.",
  },
  {
    number: "02",
    title: "Save",
    text: "Keep your best designs in your account so you can return, compare, and refine.",
  },
  {
    number: "03",
    title: "Order",
    text: "Move from design to checkout with the saved mockup attached to your request.",
  },
];

const featureItems = [
  {
    title: "Modern design workspace",
    text: "A focused tool for building custom T-shirt ideas without heavy setup or visual clutter.",
  },
  {
    title: "Cloud-backed projects",
    text: "Saved designs, uploaded images, and order details connect to your backend account flow.",
  },
  {
    title: "Ready for growth",
    text: "The app can expand into AI tools, payment, admin review, and production tracking later.",
  },
];

const palette = ["#0f766e", "#ef5b45", "#f4c542", "#5b4bdb"];

export default function Home() {
  return (
    <main className={styles.pageShell}>
      <section className={styles.heroSection}>
        <nav className={styles.navBar} aria-label="Main navigation">
          <Link href="/" className={styles.brand}>
            <span className={styles.brandMark}>TS</span>
            <span>T-Shirt Studio</span>
          </Link>
          <div className={styles.navActions}>
            <Link href="/login" className={styles.navLink}>
              Sign in
            </Link>
            <Link href="/register" className={styles.navButton}>
              Create account
            </Link>
          </div>
        </nav>

        <div className={styles.heroContent}>
          <div className={styles.heroCopy}>
            <span className={styles.eyebrow}>Custom apparel studio</span>
            <h1>Design shirts that look ready to launch.</h1>
            <p>
              Build clean T-shirt concepts, save your favorite versions, and turn a finished design
              into an order from one polished workspace.
            </p>
            <div className={styles.ctaRow}>
              <Link href="/shirtTool" className={styles.primaryCta}>
                Start designing
              </Link>
              <a href="#workflow" className={styles.secondaryCta}>
                See workflow
              </a>
            </div>
          </div>

          <div className={styles.heroVisual} aria-label="Animated custom shirt preview">
            <div className={styles.visualTopBar}>
              <span>Studio preview</span>
              <div className={styles.windowDots} aria-hidden="true">
                <i />
                <i />
                <i />
              </div>
            </div>
            <div className={styles.animationStage}>
              <LottiePlayer className={styles.lottieAsset} />
            </div>
            <div className={styles.paletteStrip} aria-label="Featured color palette">
              {palette.map((color) => (
                <span key={color} style={{ backgroundColor: color }} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="workflow" className={styles.workflowSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionLabel}>Workflow</span>
          <h2>From idea to saved order without leaving the experience.</h2>
        </div>

        <div className={styles.workflowGrid}>
          {workflowSteps.map((step) => (
            <article key={step.number} className={styles.stepCard}>
              <span>{step.number}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.featureBand}>
        <div className={styles.featureIntro}>
          <span className={styles.sectionLabel}>Built for your project</span>
          <h2>A cleaner front door for the T-shirt model app.</h2>
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
    </main>
  );
}
