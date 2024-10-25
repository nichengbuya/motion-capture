import React, { useRef, useEffect } from "react";
import * as tf from "@tensorflow/tfjs";
import * as posenet from "@tensorflow-models/posenet";
import Webcam from "react-webcam";
import { drawKeypoints, drawSkeleton } from "@/lib/util";

function App() {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    // Load Posenet and set up detection
    const runPosenet = async () => {
      await tf.ready(); // Ensure the backend is ready
      const net = await posenet.load();

      intervalId = setInterval(() => {
        detect(net);
      }, 100);
    };

    // Detection logic
    const detect = async (net: posenet.PoseNet) => {
      if (
        webcamRef.current &&
        webcamRef.current.video &&
        webcamRef.current.video.readyState === 4
      ) {
        const video = webcamRef.current.video;
        const videoWidth = video.videoWidth;
        const videoHeight = video.videoHeight;

        video.width = videoWidth;
        video.height = videoHeight;

        const pose = await net.estimateSinglePose(video);
        console.log(pose);

        drawCanvas(pose, videoWidth, videoHeight, canvasRef);
      }
    };

    // Draw keypoints and skeleton
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

    // Start Posenet
    runPosenet();

    // Cleanup function to clear interval on unmount
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div style={{ position: 'relative' }}>
      <header className="App-header">
        <Webcam
          ref={webcamRef}
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: 0,
            right: 0,
            textAlign: "center",
            zIndex: 9,
            width: 640,
            height: 480,
          }}
        />

        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: 0,
            right: 0,
            textAlign: "center",
            zIndex: 9,
            width: 640,
            height: 480,
          }}
        />
      </header>
    </div>
  );
}

export default App;