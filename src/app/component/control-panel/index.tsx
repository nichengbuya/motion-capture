import { useObject3D } from '@/contexts/object3DContext';
import ThreeManager from '@/lib/word';
import { FC, useEffect, useState } from 'react';
import { SkinnedMesh, BufferGeometry, NormalBufferAttributes, Material, Object3DEventMap } from 'three';
import { CCDIKSolver, CCDIKHelper, IK } from 'three/addons/animation/CCDIKSolver.js';


const ControlPanel: FC = () => {
    const { object3D } = useObject3D();

    const [id, setId] = useState('');
    useEffect(()=>{
        const world = ThreeManager.getInstance();
        if(!object3D){
            return;
        }
        const solver = initIK(object3D.children[1]);
        const update = ()=>{
            if(solver){
                solver.update();
            }
        }
        world.addAnimationFunction(update)
        return ()=>{
            world.removeAnimationFunction(update)
        }
    },[object3D])
    const initIK = (object:SkinnedMesh):CCDIKSolver =>{
        const iks: SkinnedMesh<BufferGeometry<NormalBufferAttributes>, Material | Material[], Object3DEventMap> | IK[] | undefined = [
            {
                target:10,
                effector:10,
                links:[
                    {
                        index:9
                    },
                    {
                        index:8
                    },
                    {
                        index:7
                    },
                ]
            }
        ]
        // object.add(object.skeleton.bones[ 0 ] )
        const ikSolver = new CCDIKSolver(object, iks)
        const ccdikhelper = new CCDIKHelper( object, iks, 1);
        const world = ThreeManager.getInstance();
        world.scene.add( ccdikhelper );
        const trans = ThreeManager.getInstance().transformControls;
        const bone = object3D!.getObjectByName('mixamorigRightHand');
        trans.setMode('translate');
        trans.attach(bone!);
        return ikSolver;
    }
    const handleSelect = (id: string) => {
        setId(id);
        const trans = ThreeManager.getInstance().transformControls;
        const bone = object3D!.getObjectByProperty('uuid', id);
        // trans.setMode('rotate');
        trans.attach(bone!);
    }

    return (
        <div className="p-4">
            <h2 className="text-lg font-semibold mb-4">Control Panel</h2>
            <ul className="space-y-2">
                {object3D && object3D.children[1].skeleton.bones.map((child) => (
                    <li
                        key={child.uuid}
                        className={`p-2 border rounded cursor-pointer transition-all ${id === child.uuid
                                ? 'bg-blue-500 text-white'
                                : 'bg-white hover:bg-gray-100'
                            }`}
                        onClick={() => handleSelect(child.uuid)}
                    >
                        {child.name || child.uuid}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ControlPanel;