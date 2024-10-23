"use client"
import { useState, useRef, useEffect } from 'react';
import styles from '../app/styles/home.module.css';
import Video from './video';

export default function Home() {
  const [leftWidth, setLeftWidth] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
      const container = containerRef.current;
      if(!container) return;
      let startX: number;
      let startWidth: number;

      const onMouseMove = (e: { clientX: number; }) => {
          const newWidth = Math.max(0, startWidth + e.clientX - startX);
          setLeftWidth((newWidth / container.clientWidth) * 100);
      };

      const onMouseUp = () => {
          document.removeEventListener('mousemove', onMouseMove);
          document.removeEventListener('mouseup', onMouseUp);
      };

      const onMouseDown = (e: { clientX: number; }) => {
          startX = e.clientX;
          startWidth = container.querySelector(`.${styles.leftPane}`)!.getBoundingClientRect().width;
          document.addEventListener('mousemove', onMouseMove);
          document.addEventListener('mouseup', onMouseUp);
      };

      container.querySelector(`.${styles.resizer}`)!.addEventListener('mousedown', onMouseDown);
      
      // Cleanup
      return () => {
          document.removeEventListener('mousemove', onMouseMove);
          document.removeEventListener('mouseup', onMouseUp);
      };
  }, []);
  return (
    <div className={styles.container} ref={containerRef}>

    <main className={styles.main}>
      <div className={styles.leftPane} style={{ width: `${leftWidth}%` }}>
          <Video></Video>
      </div>
      <div className={styles.resizer}></div>
      <div className={styles.rightPane} style={{ width: `${100 - leftWidth}%` }}>
        <h2>Right Pane</h2>
        <p>This is the right pane.</p>
      </div>
    </main>
  </div>
  );
}
