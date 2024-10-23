import { useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import * as posenet from '@tensorflow-models/posenet';
// import * as tf from '@tensorflow/tfjs';
import styles from '../styles/Home.module.css';

export default function Video() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [poseNetModel, setPoseNetModel] = useState<posenet.PoseNet | null>(null);

  useEffect(() => {
    // Initialize PoseNet
    async function initPoseNet() {
      const net = await posenet.load();
      setPoseNetModel(net);
    }

    // Set up camera
    async function setupCamera() {
      if (!videoRef.current) return;

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      videoRef.current.srcObject = stream;
      videoRef.current.play();
    }

    initPoseNet();
    setupCamera();
  }, []);

  useEffect(() => {
    if (!poseNetModel) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if(!canvas)return;
    const estimatePose = async () => {
      if (poseNetModel && video && ctx) {
        const pose = await poseNetModel.estimateSinglePose(video, {
          flipHorizontal: true,
        });

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        pose.keypoints.forEach(keypoint => {
          if (keypoint.score > 0.5) {
            const { y, x } = keypoint.position;
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, 2 * Math.PI);
            ctx.fillStyle = 'red';
            ctx.fill();
          }
        });
      }
      requestAnimationFrame(estimatePose);
    };

    estimatePose();
  }, [poseNetModel]);

  return (
    <div className={styles.container}>
      <Head>
        <title>PoseNet with Next.js</title>
        <meta name="description" content="Real-time Pose Estimation with PoseNet and Next.js" />
      </Head>
      <video ref={videoRef} className={styles.video} />
      <canvas ref={canvasRef} className={styles.canvas} />
    </div>
  );
}