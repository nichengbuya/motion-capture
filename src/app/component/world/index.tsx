import React, { useEffect, useRef } from 'react';
import ThreeManager from '../../../lib/world';
import loadFBXModel from '@/lib/loader';
import { useObject3D } from '@/contexts/object3DContext';
import { ArrowHelper, Bone, Skeleton, SkeletonHelper, SkinnedMesh, Vector3 } from 'three';
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
        addCoordinateHelpers();
        setObject3D(object);
    }
    const addCoordinateHelpers = (size = 10)=> {
        const scene = ThreeManager.getInstance().scene;

        // 初始化箭头
        const headLength = 0.2 * size; // 箭头头部的长度
        const headWidth = 0.2 * size; // 箭头头部的宽度

        // 创建坐标原点
        const origin = new Vector3(0, 0, 0);

        // X 轴
        const xAxis = new ArrowHelper(new Vector3(1, 0, 0), origin, size, 0xff0000, headLength, headWidth);
        // Y 轴
        const yAxis = new ArrowHelper(new Vector3(0, 1, 0), origin, size, 0x00ff00, headLength, headWidth);
        // Z 轴
        const zAxis = new ArrowHelper(new Vector3(0, 0, 1), origin, size, 0x0000ff, headLength, headWidth);

        scene.add(xAxis);
        scene.add(yAxis);
        scene.add(zAxis);
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