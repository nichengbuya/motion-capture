import React, { useEffect, useRef } from 'react';
import ThreeManager from '../../../lib/word';
import loadFBXModel from '@/lib/loader';
import { useObject3D } from '@/contexts/object3DContext';
import { SkeletonHelper } from 'three';
import './index.css'
const ThreeScene: React.FC = () => {
    const { setObject3D } = useObject3D();
    const containerRef = useRef<HTMLDivElement>(null);
    const initModel = async () => {
        const object = await loadFBXModel('/models/fbx/mixamo.fbx');
        const world = ThreeManager.getInstance();
        world.scene.add(object);
        world.transformControls.attach(object);
        const skeletonHelper = new SkeletonHelper(object);
        world.scene.add(skeletonHelper);
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
                threeManager.unmountRenderer(container);
            }
        };
    }, []);

    return  <div className="three-scene-container">
                <div ref={containerRef} className="three-scene-canvas" />
        </div>;
};

export default ThreeScene;