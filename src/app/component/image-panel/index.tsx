import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import * as posenet from '@tensorflow-models/posenet';
import * as tf from '@tensorflow/tfjs';
import styles from '../../styles/Home.module.css';
import videoStyles from './index.module.css';

type Keypoint = {
  score: number;
  part: string;
  position: {
    x: number;
    y: number;
  };
};

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
      estimatePose();
    }
  }, [poseNetModel, uploadedImage]);

  const estimatePose = async () => {
    const image = imageRef.current;
    const canvas = canvasRef.current;

    if (!canvas || !image || !poseNetModel) return;

    const ctx = canvas.getContext('2d');
    canvas.width = image.width;
    canvas.height = image.height;

    const pose = await poseNetModel.estimateSinglePose(image, {
      flipHorizontal: false,
    });

    // 清理画布并绘制原图
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
    ctx?.drawImage(image, 0, 0, canvas.width, canvas.height);

    // 关键点连接对
    const adjacentKeyPoints: [string, string][] = [
      ['leftShoulder', 'rightShoulder'], ['leftShoulder', 'leftElbow'], ['rightShoulder', 'rightElbow'],
      ['leftElbow', 'leftWrist'], ['rightElbow', 'rightWrist'], ['leftHip', 'rightHip'],
      ['leftShoulder', 'leftHip'], ['rightShoulder', 'rightHip'], ['leftHip', 'leftKnee'],
      ['rightHip', 'rightKnee'], ['leftKnee', 'leftAnkle'], ['rightKnee', 'rightAnkle']
    ];

    const getKeypointByName = (keypoints: Keypoint[], name: string) => 
      keypoints.find(keypoint => keypoint.part === name);

    const drawLine = (ctx: CanvasRenderingContext2D, point1: { x: number; y: number }, point2: { x: number; y: number }) => {
      ctx.beginPath();
      ctx.moveTo(point1.x, point1.y);
      ctx.lineTo(point2.x, point2.y);
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'blue';
      ctx.stroke();
    };

    pose.keypoints.forEach(keypoint => {
      if (keypoint.score > 0.5 && ctx) {
        const { y, x } = keypoint.position;
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = 'red';
        ctx.fill();
      }
    });

    adjacentKeyPoints.forEach(pair => {
      const keypoint1 = getKeypointByName(pose.keypoints, pair[0]);
      const keypoint2 = getKeypointByName(pose.keypoints, pair[1]);

      if (keypoint1 && keypoint2 && keypoint1.score > 0.5 && keypoint2.score > 0.5 && ctx) {
        drawLine(ctx, keypoint1.position, keypoint2.position);
      }
    });
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>PoseNet Image Recognition with Next.js</title>
        <meta name="description" content="Pose estimation on an image using PoseNet and Next.js" />
      </Head>
      <button onClick={estimatePose}>检测</button>
      <div style={{ position: 'relative' }}>
        <img ref={imageRef} src={'/images/pose.jpeg'} className={videoStyles.image} alt="Uploaded" />
        <canvas ref={canvasRef} className={videoStyles.canvas} />
      </div>
    </div>
  );
};

export default ImagePose;