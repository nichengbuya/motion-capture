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
      imageRef.current.onload = async function () {
        const result = await DetectPosefromImage(imageRef.current!);
        const positions: [number, number, number][] =
        result.poseWorldLandmarks.map(({ x, y, z }) => [
            x * 100,
            -y * 100,
            -z * 100,
        ])
        const charactor = new Charactor(object3D!);
        charactor.setPose(positions);
      };
    }
  }, [object3D]);

  return (
    <div>
      <div style={{ position: 'relative' }}>
          <Image ref={imageRef} src={'/images/pose.jpeg'} width={300} height={200} layout="intrinsic" objectFit="contain" alt="Uploaded" />
      </div>
    </div>
  );
};

export default ImagePose;