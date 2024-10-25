import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import * as posenet from '@tensorflow-models/posenet';
import * as tf from '@tensorflow/tfjs';
import styles from '../../styles/Home.module.css';
import videoStyles from './index.module.css';
import { drawKeypoints, drawSkeleton } from '@/lib/util';

const ImagePose: React.FC = () => {
  const [poseNetModel, setPoseNetModel] = useState<posenet.PoseNet | null>(null);
  const [uploadedImage,] = useState<string | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Initialize PoseNet
    async function initPoseNet() {
      await tf.ready(); // Ensure backend is initialized
      const net = await posenet.load();
      setPoseNetModel(net);
    }
    initPoseNet();
  }, []);

  useEffect(() => {
    if (poseNetModel && uploadedImage) {
      detect(poseNetModel);
    }
  }, [poseNetModel, uploadedImage]);
  const detect = async (net: posenet.PoseNet) => {
    if (
      imageRef.current 
    ) {
      const image = imageRef.current;
      const pose = await net.estimateSinglePose(image);
      console.log(pose);

      drawCanvas(pose, image.width, image.height, canvasRef);
    }
  };
  const drawCanvas = (
    pose: posenet.Pose,
    videoWidth: number,
    videoHeight: number,
    canvas: React.RefObject<HTMLCanvasElement>
  ) => {
    if (!canvas.current) return;
    const ctx = canvas.current.getContext("2d")!;
    canvas.current.width = videoWidth;
    canvas.current.height = videoHeight;

    drawKeypoints(pose["keypoints"], 0.6, ctx);
    drawSkeleton(pose["keypoints"], 0.7, ctx);
  };
  return (
    <div className={styles.container}>
      <Head>
        <title>PoseNet Image Recognition with Next.js</title>
        <meta name="description" content="Pose estimation on an image using PoseNet and Next.js" />
      </Head>
      <button onClick={()=>{detect(poseNetModel!)}}>检测</button>
      <div style={{ position: 'relative' }}>
        <img ref={imageRef} src={'/images/pose.jpeg'} className={videoStyles.image} alt="Uploaded" />
        <canvas ref={canvasRef} className={videoStyles.canvas} />
      </div>
    </div>
  );
};

export default ImagePose;