import { useObject3D } from '@/contexts/object3DContext';
import ThreeManager from '@/lib/word';
import { FC, useState } from 'react';
import { SkinnedMesh } from 'three';


const FK: FC = () => {
    const { object3D } = useObject3D();

    const [id, setId] = useState('');

    const handleSelect = (id: string) => {
        setId(id);
        const trans = ThreeManager.getInstance().transformControls;
        const bone = object3D!.getObjectByProperty('uuid', id);
        trans.setMode('rotate');
        trans.attach(bone!);
    }

    return (
        <div className="p-4">
            <h2 className="text-lg font-semibold mb-4">Control Panel</h2>
            <ul className="space-y-2">
                {object3D && (object3D.children[1] as SkinnedMesh).skeleton.bones.map((child) => (
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

export default FK;