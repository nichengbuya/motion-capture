import { useObject3D } from '@/contexts/object3DContext';
import ThreeManager from '@/lib/world';
import { FC, useEffect, useState } from 'react';
import { SkinnedMesh, Object3D } from 'three';
import { CCDIKSolver, CCDIKHelper, IK} from 'three/addons/animation/CCDIKSolver.js';

const effectors = [
    'mixamorigRightHand_target',
    'mixamorigLeftHand_target',
    'mixamorigRightFoot_target',
    'mixamorigLeftFoot_target'
]
const IKFC: FC = () => {
    const { object3D } = useObject3D();

    const [id, setId] = useState(effectors[0]);

    const handleSelect = (id:string)=>{
        setId(id);
        const trans = ThreeManager.getInstance().transformControls;
        const bone = object3D!.getObjectByName(id);
        trans.setMode('translate');
        trans.attach(bone!);
    }
    useEffect(() => {
        const world = ThreeManager.getInstance();
        if (!object3D) {
            return;
        }
        const initIK = (object: Object3D): CCDIKSolver => {

            const skinnedMesh = object.children[1] as SkinnedMesh;
            const bones = skinnedMesh.skeleton.bones;
            const n = skinnedMesh.skeleton.bones.length;
            const suffixToRemove = '_target';
            const iks:IK[] = effectors.map((i,index)=>{
                const eindex = bones.indexOf(
                    skinnedMesh.skeleton.getBoneByName(
                        i.replace(new RegExp(`${suffixToRemove}$`), '')
                    )!
                );
                return {
                    target:n - 1 - index,
                    effector: eindex,
                    links:[
                        {
                            index: eindex-1
                        },
                        {
                            index: eindex-2
                        }
                    ]
    
                }
            })
            const ikSolver = new CCDIKSolver(skinnedMesh, iks)
            const ccdikhelper = new CCDIKHelper(skinnedMesh, iks, 1);
            const world = ThreeManager.getInstance();
            world.scene.add(ccdikhelper);
            const trans = ThreeManager.getInstance().transformControls;
            trans.setMode('translate');
            trans.attach(skinnedMesh.skeleton.bones[n-1]);
            return ikSolver;
        }
        const solver = initIK(object3D);
        const update = () => {
            if (solver) {
                solver.update();
            }
        }
        world.addAnimationFunction(update)
        return () => {
            world.removeAnimationFunction(update);
            const helper = world.scene.children.filter(i=> i instanceof CCDIKHelper)[0];
            if(helper) world.scene.remove(helper);
        }
    }, [object3D])


    return (
        <div className="p-4">
            <h2 className="text-lg font-semibold mb-4">Control Panel</h2>
            <ul className="space-y-2">
            {object3D && (object3D.children[1] as SkinnedMesh).skeleton.bones.slice(-4).map((child) => (
                    <li
                        key={child.uuid}
                        className={`p-2 border rounded cursor-pointer transition-all ${id === child.name
                            ? 'bg-blue-500 text-white'
                            : 'bg-white hover:bg-gray-100'
                            }`}
                        onClick={() => handleSelect(child.name)}
                    >
                        {child.name || child.uuid}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default IKFC;