import React, { useEffect, useRef } from 'react';
import ThreeManager from '../../../lib/world';
import loadFBXModel from '@/lib/loader';
import { useObject3D } from '@/contexts/object3DContext';
import { Bone, Skeleton, SkeletonHelper, SkinnedMesh, Vector3 } from 'three';
import './index.css'
const ThreeScene: React.FC = () => {
    const { setObject3D } = useObject3D();
    const containerRef = useRef<HTMLDivElement>(null);
    const initModel = async () => {
        const object = await loadFBXModel('/models/fbx/mixamo.fbx');
        const world = ThreeManager.getInstance();
        world.scene.add(object);
        const skeletonHelper = new SkeletonHelper(object);
        world.scene.add(skeletonHelper);
        const effectors = [
            'mixamorigRightHand',
            'mixamorigLeftHand',
            'mixamorigRightFoot',
            'mixamorigLeftFoot'
        ]
    
        const rootBone = object.children[0];
        const skinnedMesh = object.children[1] as SkinnedMesh;
        const bones: Bone[] = [...skinnedMesh.skeleton.bones.slice()];
        for(const e of effectors.reverse()){
            const bone = new Bone();
            bone.name = `${e}_target`;
            const origin = skinnedMesh.skeleton.getBoneByName(e);
            const position = new Vector3();
            origin?.getWorldPosition(position);
            bone.position.copy(position);
            world.scene.add(bone);
            rootBone.attach(bone);
            bones.push(bone);
        }
        
        const skeleton = new Skeleton(bones);
        skinnedMesh.bind(skeleton);
        setObject3D(object);
    }

    useEffect(() => {
        const threeManager = ThreeManager.getInstance();
        const container = containerRef.current;

        // Mount the renderer to the container
        if (container) {
            threeManager.mountRenderer(container);
            threeManager.animate();
        }
        initModel();
        // Clean up on unmount
        return () => {
            if (container) {
                threeManager.dispose();
            }
        };
    }, []);

    return  <div className="three-scene-container">
                <div ref={containerRef} className="three-scene-canvas" />
        </div>;
};

export default ThreeScene;