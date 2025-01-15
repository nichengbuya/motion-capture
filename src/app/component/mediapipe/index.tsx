"use client"
import { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import { DetectPosefromImage } from '@/lib/detect';
import { useObject3D } from '@/contexts/object3DContext';
import Charactor1 from './mixoma/charactor1';

const ImagePose: React.FC = () => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const { object3D } = useObject3D();

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (imageRef.current && object3D) {
      const detect = async () => {
        const result = await DetectPosefromImage(imageRef.current!);
        const charactor = new Charactor1(object3D!);
        const positions: [number, number, number ][] = result.poseWorldLandmarks.map(({ x, y, z }) => [
          x * 100,
          -y * 100,
          -z * 100
        ]);
        const visibility: number[] = result.poseWorldLandmarks.map(({ visibility }) => visibility!);
        
        setTimeout(() => {
          charactor.calcAnimation(positions, visibility);
        }, 500);
      };
      detect();
    }
  }, [imageSrc, object3D]);

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleImageUpload} />
      {imageSrc && (
        <div style={{ position: 'relative' }}>
          <Image ref={imageRef} src={imageSrc} width={300} height={200} layout="intrinsic" objectFit="contain" alt="Uploaded" />
        </div>
      )}
    </div>
  );
};

export default ImagePose;