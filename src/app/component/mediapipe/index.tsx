"use client"
import { useRef, useEffect } from 'react';
import Image from 'next/image';
import { DetectPosefromImage } from '@/lib/detect';
import { useObject3D } from '@/contexts/object3DContext';
import Charactor from '@/lib/charactor';

const ImagePose: React.FC = () => {
  const imageRef = useRef<HTMLImageElement>(null);
  const {object3D} = useObject3D();
  useEffect(() => {
    if (imageRef.current && object3D) {
      const detect =  async ()=> {
        const result = await DetectPosefromImage(imageRef.current!);
        const charactor = new Charactor(object3D!);
        console.log(result)
        const positions: [number, number, number ][] =
        result.poseWorldLandmarks.map(({ x, y, z }) => [
            x * 100,
            -y * 100,
            -z * 100
        ])
        const visibility:number[] = 
        result.poseWorldLandmarks.map(({ visibility }) => visibility!)
        setTimeout(() => {
          charactor.setPose2(positions,visibility);
        }, 500);
        
      };
      detect();
    }
  }, [object3D]);

  return (
    <div>
      <div style={{ position: 'relative' }}>
          <Image ref={imageRef} src={'/images/pose1.jpeg'} width={300} height={200} layout="intrinsic" objectFit="contain" alt="Uploaded" />
      </div>
    </div>
  );
};

export default ImagePose;