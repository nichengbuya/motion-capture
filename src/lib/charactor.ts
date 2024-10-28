import { Vector3, Object3D, SkinnedMesh } from 'three';
import { ControlablePart, ControlPartName, PartIndexMappingOfBlazePoseModel } from './constant';

class Charactor {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    part: Record<ControlPartName, Object3D> = {} as any;
    body: Object3D;
    constructor(object: Object3D) {
        this.body = object;
        this.body.traverse((o) => {
            if (ControlablePart.includes(o.name as ControlPartName)) {
                this.part[o.name as ControlPartName] = o
            }
        })
        // this.part['left_shoulder_inner'] = this.getObjectByName(
        //     'mixamorigLeftShoulder'
        // )
        // this.part['right_shoulder_inner'] = this.getObjectByName(
        //     'mixamorigRightShoulder'
        // )
        // this.part['left_hip_inner'] = this.getObjectByName('left_hip_inner')
        // this.part['right_hip_inner'] = this.getObjectByName('right_hip_inner')
        // this.part['five'] = this.getObjectByName('five')
        // this.part['right_hand'] = this.getObjectByName('mixamorigRightHand')
        // this.part['left_hand'] = this.getObjectByName('mixamorigLeftHand')
        // this.part['right_foot'] = this.getObjectByName('mixamorigRightFoot')
        // this.part['left_foot'] = this.getObjectByName('mixamorigLeftFoot')
    }

    getObjectByName(name: string) {
        const part = this.body.getObjectByName(name)

        if (!part) throw new Error(`Not found part: ${name}`)

        return part
    }

    getMidpoint(from: Vector3, to: Vector3): Vector3 {
        return from.clone().add(to).multiplyScalar(0.5);
    }

    rotateTo3(name: ControlPartName, from: Vector3, to: Vector3) {
        this.rotateTo(name, this.getDirectionVectorByParentOf(name, from, to));
    }

    rotateTo(name: ControlPartName, dir: Vector3) {
        const obj = this.part[name];
        const unit = obj.position.clone().normalize();
        const axis = unit.clone().cross(dir);
        const angle = unit.clone().angleTo(dir);
        obj.parent?.rotateOnAxis(axis.normalize(), angle);
    }

    getLocalPosition(obj: Object3D, position: Vector3): Vector3 {
        return obj.worldToLocal(position.clone());
    }

    getDirectionVectorByParentOf(name: ControlPartName, from: Vector3, to: Vector3): Vector3 {
        const parent = this.part[name].parent!;
        const localFrom = this.getLocalPosition(parent, from);
        const localTo = this.getLocalPosition(parent, to);
        return localTo.clone().sub(localFrom).normalize();
    }

    getDistanceOf(from: Vector3, to: Vector3): number {
        return from.distanceTo(to);
    }

    setPositionByDistance(name: ControlPartName, from: Vector3, to: Vector3) {
        const dis = this.getDistanceOf(from, to);
        this.part[name].position.normalize().multiplyScalar(dis);
    }

    setPose(rawData: [number, number, number][]) {
        const data = Object.fromEntries(
            Object.entries(PartIndexMappingOfBlazePoseModel).map(
                ([name, index]) => {
                    return [
                        name,
                        new Vector3().fromArray(
                            rawData[index] ?? [0, 0, 0]
                        ),
                    ];
                }
            )
        ) as Record<keyof typeof PartIndexMappingOfBlazePoseModel, Vector3>;
        console.log(data , Object.keys(data) , (this.body.children[1] as SkinnedMesh).skeleton.bones.map(i=>i.name))
        // const map: [ControlPartName, [Vector3 | keyof typeof PartIndexMappingOfBlazePoseModel, Vector3 | keyof typeof PartIndexMappingOfBlazePoseModel]][] = [
        //     ['five', [this.getMidpoint(this.getMidpoint(data['left_hip'], data['right_hip']), this.getMidpoint(data['left_shoulder'], data['right_shoulder'])), this.getMidpoint(data['left_shoulder'], data['right_shoulder'])]],
        //     ['left_shoulder', [this.getMidpoint(data['left_shoulder'], data['right_shoulder']), 'left_shoulder']],
        //     ['left_elbow', ['left_shoulder', 'left_elbow']],
        //     ['left_wrist', ['left_elbow', 'left_wrist']],
        //     ['left_hip', [this.getMidpoint(data['left_shoulder'], data['right_shoulder']), 'left_hip']],
        //     ['left_knee', ['left_hip', 'left_knee']],
        //     ['left_ankle', ['left_knee', 'left_ankle']],
        //     ['right_shoulder', [this.getMidpoint(data['left_shoulder'], data['right_shoulder']), 'right_shoulder']],
        //     ['right_elbow', ['right_shoulder', 'right_elbow']],
        //     ['right_wrist', ['right_elbow', 'right_wrist']],
        //     ['right_hip', [this.getMidpoint(data['left_shoulder'], data['right_shoulder']), 'right_hip']],
        //     ['right_knee', ['right_hip', 'right_knee']],
        //     ['right_ankle', ['right_knee', 'right_ankle']],
        //     ['nose', [this.getMidpoint(data['left_shoulder'], data['right_shoulder']), 'nose']],
        //     ['left_eye', ['nose', 'left_eye']],
        //     ['right_eye', ['nose', 'right_eye']],
        //     ['left_ear', ['left_eye', 'left_ear']],
        //     ['right_ear', ['right_eye', 'right_ear']],
        // ];

        // for (const [name, [from, to]] of map) {
        //     const fromVec = from instanceof Vector3 ? from : data[from];
        //     const toVec = to instanceof Vector3 ? to : data[to];

        //     this.rotateTo3(name, fromVec, toVec);
        //     this.setPositionByDistance(name, fromVec, toVec);
        // }
    }
}

export default Charactor;

