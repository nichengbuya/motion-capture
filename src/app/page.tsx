"use client"
import { useState, useRef, useEffect } from 'react';
import styles from '../app/styles/home.module.css';
import World from './component/world';
import Tabs from './component/tab';
import ControlPanel from './component/control-panel';
import ThreeManager from '@/lib/world';
import ImagePose from './component/image-panel';
import Video from './component/video';
import Mediapipe from './component/mediapipe';


export default function Home() {
  const [leftWidth, setLeftWidth] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState('pose');
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let startX: number;
    let startWidth: number;

    const onMouseMove = (e: { clientX: number; }) => {
      const newWidth = Math.max(0, startWidth + e.clientX - startX);
      setLeftWidth((newWidth / container.clientWidth) * 100);
      ThreeManager.getInstance().onWindowResize();
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

    (container.querySelector(`.${styles.resizer}`) as HTMLElement).addEventListener('mousedown', onMouseDown);

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
        <div className="flex flex-col h-full bg-gray-200" style={{ width: `${100}%` }}>
        <Tabs defaultActiveKey="control" activeKey={activeTab} onChange={setActiveTab}>
            <Tabs.TabPane tab="Control Panel" key="control">
              <ControlPanel/>
            </Tabs.TabPane>
            <Tabs.TabPane tab="Image" key="image">
              <ImagePose />
            </Tabs.TabPane>
            <Tabs.TabPane tab="Video" key="video">
              <Video></Video>
            </Tabs.TabPane>
            <Tabs.TabPane tab="Pose" key="pose">
              <Mediapipe></Mediapipe>
            </Tabs.TabPane>
          </Tabs>
        </div>
        </div>
        <div className={styles.resizer}></div>
        <div className={styles.rightPane} style={{ width: `${100 - leftWidth}%` }}>
          <World></World>
        </div>
      </main>
    </div>
  );
}
