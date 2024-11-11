import { Vector3, Object3D, SkinnedMesh, Bone, Quaternion } from 'three';
import { ControlablePart, ControlPartName, getMixamoNameIdxMap, getMixamoNameMediapipeNameMap, Mixamo, MixamoIndex, PartIndexMappingOfBlazePoseModel } from './constant';
import MixamoData from './mixamoData';
interface HipsBoneJson {
    x: number;
    y: number;
    z: number;
}
class Charactor {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    part: Record<ControlPartName, Object3D> = {} as any;
    body: Object3D;
    bones = new Map<Mixamo, Bone>();
    constructor(object: Object3D) {
        this.body = object;
        console.log(this.body);
        (this.body.children[1] as SkinnedMesh).skeleton.bones.forEach(child => {
            if(child instanceof Bone){
                const key = child.name.replace('mixamorig', '')
                this.bones.set( MixamoIndex[key], child);
            }
        });
        const map = getMixamoNameMediapipeNameMap();
        for (const [from, to] of map.entries()) {
            this.part[to as ControlPartName] = this.getObjectByName(`mixamorig${from}`)
        }

    }

    avgVec3(v1: Vector3, v2: Vector3): Vector3 {
        const x = (v1.x + v2.x) * 0.5;
        const y = (v1.y + v2.y) * 0.5;
        const z = (v1.z + v2.z) * 0.5;
        return new Vector3(x, y, z);
    }

    setHipsPosition(hipsBoneJson: HipsBoneJson, originHips: Vector3, currentHips: Vector3, factor: number): void {
        const x = (currentHips.x - originHips.x) * factor;
        const y = (currentHips.y - originHips.y) * factor;
        const z = (currentHips.z - originHips.z) * factor;
        hipsBoneJson.x = x;
        hipsBoneJson.y = -y;  // Note the negation here
        hipsBoneJson.z = z;
    }
    getObjectByName(name: string) {
        const part = this.body.getObjectByName(name)

        if (!part) throw new Error(`Not found part: ${name}`)

        return part
    }

    getMidpoint(from: Vector3, to: Vector3): Vector3 {
        return from.clone().add(to).multiplyScalar(0.5);
    }
    getMidVisibility(v1: number, v2: number) {
        return (v1 + v2) * 0.5;
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

        const map: [ControlPartName, [Vector3 | keyof typeof PartIndexMappingOfBlazePoseModel, Vector3 | keyof typeof PartIndexMappingOfBlazePoseModel]][] = [
            // ['five', [this.getMidpoint(this.getMidpoint(data['left_hip'], data['right_hip']), this.getMidpoint(data['left_shoulder'], data['right_shoulder'])), this.getMidpoint(data['left_shoulder'], data['right_shoulder'])]],
            ['left_shoulder', [this.getMidpoint(data['left_shoulder'], data['right_shoulder']), 'left_shoulder']],
            ['left_elbow', ['left_shoulder', 'left_elbow']],
            ['left_wrist', ['left_elbow', 'left_wrist']],
            // ['left_hip', [this.getMidpoint(data['left_shoulder'], data['right_shoulder']), 'left_hip']],
            ['left_knee', ['left_hip', 'left_knee']],
            ['left_ankle', ['left_knee', 'left_ankle']],
            ['right_shoulder', [this.getMidpoint(data['left_shoulder'], data['right_shoulder']), 'right_shoulder']],
            ['right_elbow', ['right_shoulder', 'right_elbow']],
            ['right_wrist', ['right_elbow', 'right_wrist']],
            // ['right_hip', [this.getMidpoint(data['left_shoulder'], data['right_shoulder']), 'right_hip']],
            ['right_knee', ['right_hip', 'right_knee']],
            ['right_ankle', ['right_knee', 'right_ankle']],
            // ['nose', [this.getMidpoint(data['left_shoulder'], data['right_shoulder']), 'nose']],
            // ['left_eye', ['nose', 'left_eye']],
            // ['right_eye', ['nose', 'right_eye']],
            // ['left_ear', ['left_eye', 'left_ear']],
            // ['right_ear', ['right_eye', 'right_ear']],
        ];
        console.log(getMixamoNameMediapipeNameMap())
        console.log(map)

        for (const [name, [from, to]] of map) {
            const fromVec = from instanceof Vector3 ? from : data[from];
            const toVec = to instanceof Vector3 ? to : data[to];
            console.log(name ,fromVec, toVec)
            // this.rotateTo3(name, fromVec, toVec);
            // this.setPositionByDistance(name, fromVec, toVec);
        }
    }
    setPose2(rawData: [number, number, number][], visibility: number[]) {

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
        const visData = Object.fromEntries(
            Object.entries(PartIndexMappingOfBlazePoseModel).map(
                ([name, index]) => {
                    return [
                        name,
                        visibility[index]
                    ];
                }
            )
        ) as Record<keyof typeof PartIndexMappingOfBlazePoseModel, number>;

        const glmList: Vector3[] = [];
        const visibilityList: number[] = [];
        glmList[Mixamo.Hips] = this.avgVec3(data['left_hip'], data['right_hip']);
        visibilityList[Mixamo.Hips] = (visData['left_hip'], visData['right_hip']) * 0.5;

        glmList[Mixamo.Hips] = this.avgVec3(data['left_hip'], data['right_hip']);
        visibilityList[Mixamo.Hips] = (visData['left_hip'] + visData['right_hip']) * 0.5;

        glmList[Mixamo.Neck] = this.avgVec3(data['left_shoulder'], data['right_shoulder']);
        visibilityList[Mixamo.Neck] = (visData['left_shoulder'] + visData['right_shoulder']) * 0.5;

        glmList[Mixamo.Spine1] = this.avgVec3(glmList[Mixamo.Hips], glmList[Mixamo.Neck]);
        visibilityList[Mixamo.Spine1] = (visibilityList[Mixamo.Hips] + visibilityList[Mixamo.Neck]) * 0.5;

        glmList[Mixamo.Spine] = this.avgVec3(glmList[Mixamo.Hips], glmList[Mixamo.Spine1]);
        visibilityList[Mixamo.Spine] = (visibilityList[Mixamo.Hips] + visibilityList[Mixamo.Spine1]) * 0.5;

        glmList[Mixamo.Spine2] = this.avgVec3(glmList[Mixamo.Spine1], glmList[Mixamo.Neck]);
        visibilityList[Mixamo.Spine2] = (visibilityList[Mixamo.Spine1] + visibilityList[Mixamo.Neck]) * 0.5;

        glmList[Mixamo.Head] = this.avgVec3(data['left_ear'], data['right_ear']);
        visibilityList[Mixamo.Head] = (visData['left_ear'] + visData['right_ear']) * 0.5;

        // Inverting the y and z coordinates
        glmList[Mixamo.Spine].y *= -1;
        glmList[Mixamo.Neck].y *= -1;
        glmList[Mixamo.Spine1].y *= -1;
        glmList[Mixamo.Spine2].y *= -1;
        glmList[Mixamo.Head].y *= -1;

        glmList[Mixamo.Neck].z *= -1;
        glmList[Mixamo.Spine].z *= -1;
        glmList[Mixamo.Spine1].z *= -1;
        glmList[Mixamo.Spine2].z *= -1;
        glmList[Mixamo.Head].z *= -1;
        // const indexMap = getMixamoNameIdxMap();
        // const map = getMixamoNameMediapipeNameMap();
        // console.log(map);
        // for (const [from, to] of indexMap.entries()) {
        //     const name = map.get(from);
        //     if (name) {
        //         glmList[to] = data[name];
        //         visibilityList[to] = visData[name];
        //     }
        // }
        // console.log(glmList, visibilityList);
    }

    setPose3(rawData: [number, number, number][], visibility: number[]) {
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

        const visData = Object.fromEntries(
            Object.entries(PartIndexMappingOfBlazePoseModel).map(
                ([name, index]) => {
                    return [
                        name,
                        visibility[index]
                    ];
                }
            )
        ) as Record<keyof typeof PartIndexMappingOfBlazePoseModel, number>;
        // 初始化poseInfo Map
        const poseInfo = new Map<Mixamo, MixamoData>();

        // 创建MixamoData对象并存储进map
        poseInfo.set(Mixamo.Hips, new MixamoData(
            Mixamo.Hips, Mixamo.Root,
            this.getMidpoint(data['left_hip'], data['right_hip']),
            this.getMidVisibility(visData['left_hip'], visData['right_hip'])
        ));

        // 创建MixamoData对象并存储进map
        poseInfo.set(Mixamo.Neck, new MixamoData(
            Mixamo.Neck, Mixamo.Spine2,
            this.getMidpoint(data['left_shoulder'], data['right_shoulder']),
            this.getMidVisibility(visData['left_shoulder'], visData['right_shoulder'])
        ));

        // 获取前面创建的hips和neck中间结果，用于spine1、spine和spine2的计算
        const hipsMidpoint = poseInfo.get(Mixamo.Hips)!.position;
        const hipsVisibility = poseInfo.get(Mixamo.Hips)!.visibility;
        const neckMidpoint = poseInfo.get(Mixamo.Neck)!.position;
        const neckVisibility = poseInfo.get(Mixamo.Neck)!.visibility;

        // 创建MixamoData对象并存储进map
        poseInfo.set(Mixamo.Spine1, new MixamoData(
            Mixamo.Spine1, Mixamo.Spine,
            this.getMidpoint(hipsMidpoint, neckMidpoint),
            this.getMidVisibility(hipsVisibility, neckVisibility)
        ));

        // 获取spine1中间结果用于spine的计算
        const spine1Data = poseInfo.get(Mixamo.Spine1);

        poseInfo.set(Mixamo.Spine, new MixamoData(
            Mixamo.Spine, Mixamo.Hips,
            this.getMidpoint(hipsMidpoint, spine1Data!.position),
            this.getMidVisibility(hipsVisibility, spine1Data!.visibility)
        ));

        poseInfo.set(Mixamo.Spine2, new MixamoData(
            Mixamo.Spine2, Mixamo.Spine1,
            this.getMidpoint(spine1Data!.position, neckMidpoint),
            this.getMidVisibility(spine1Data!.visibility, neckVisibility)
        ));

        poseInfo.set(Mixamo.Head, new MixamoData(
            Mixamo.Head, Mixamo.Neck,
            this.getMidpoint(data['left_ear'], data['right_ear']),
            this.getMidVisibility(visData['left_ear'], visData['right_ear'])
        ));

        poseInfo.set(Mixamo.LeftArm, new MixamoData(
            Mixamo.LeftArm, Mixamo.Spine2,
            data['left_shoulder'],
            visData['left_shoulder']
        ));

        poseInfo.set(Mixamo.LeftForeArm, new MixamoData(
            Mixamo.LeftForeArm, Mixamo.LeftArm,
            data['left_elbow'],
            visData['left_elbow']
        ));

        poseInfo.set(Mixamo.RightArm, new MixamoData(
            Mixamo.RightArm, Mixamo.Spine2,
            data['right_shoulder'],
            visData['right_shoulder']
        ));

        poseInfo.set(Mixamo.RightForeArm, new MixamoData(
            Mixamo.RightForeArm, Mixamo.RightArm,
            data['right_elbow'],
            visData['right_elbow']
        ));

        poseInfo.set(Mixamo.LeftUpLeg, new MixamoData(
            Mixamo.LeftUpLeg, Mixamo.Hips,
            data['left_hip'],
            visData['left_hip']
        ));

        poseInfo.set(Mixamo.LeftLeg, new MixamoData(
            Mixamo.LeftLeg, Mixamo.LeftUpLeg,
            data['left_knee'],
            visData['left_knee']
        ));

        poseInfo.set(Mixamo.LeftFoot, new MixamoData(
            Mixamo.LeftFoot, Mixamo.LeftLeg,
            data['left_ankle'],
            visData['left_ankle']
        ));

        poseInfo.set(Mixamo.LeftToeBase, new MixamoData(
            Mixamo.LeftToeBase, Mixamo.LeftFoot,
            data['left_foot_index'],
            visData['left_foot_index']
        ));

        poseInfo.set(Mixamo.RightUpLeg, new MixamoData(
            Mixamo.RightUpLeg, Mixamo.Hips,
            data['right_hip'],
            visData['right_hip']
        ));

        poseInfo.set(Mixamo.RightLeg, new MixamoData(
            Mixamo.RightLeg, Mixamo.RightUpLeg,
            data['right_knee'],
            visData['right_knee']
        ));

        poseInfo.set(Mixamo.RightFoot, new MixamoData(
            Mixamo.RightFoot, Mixamo.RightLeg,
            data['right_ankle'],
            visData['right_ankle']
        ));

        poseInfo.set(Mixamo.RightToeBase, new MixamoData(
            Mixamo.RightToeBase, Mixamo.RightFoot,
            data['right_foot_index'],
            visData['right_foot_index']
        ));

        poseInfo.set(Mixamo.LeftHand, new MixamoData(
            Mixamo.LeftHand, Mixamo.LeftForeArm,
            data['left_wrist'],
            visData['left_wrist']
        ));

        poseInfo.set(Mixamo.RightHand, new MixamoData(
            Mixamo.RightHand, Mixamo.RightForeArm,
            data['right_wrist'],
            visData['right_wrist']
        ));

        poseInfo.set(Mixamo.LeftHandThumb1, new MixamoData(
            Mixamo.LeftHandThumb1, Mixamo.LeftHand,
            data['left_thumb'],
            visData['left_thumb']
        ));

        poseInfo.set(Mixamo.LeftHandIndex1, new MixamoData(
            Mixamo.LeftHandIndex1, Mixamo.LeftHand,
            data['left_index'],
            visData['left_index']
        ));

        poseInfo.set(Mixamo.LeftHandPinky1, new MixamoData(
            Mixamo.LeftHandPinky1, Mixamo.LeftHand,
            data['left_pinky'],
            visData['left_pinky']
        ));

        poseInfo.set(Mixamo.RightHandThumb1, new MixamoData(
            Mixamo.RightHandThumb1, Mixamo.RightHand,
            data['right_thumb'],
            visData['right_thumb']
        ));

        poseInfo.set(Mixamo.RightHandIndex1, new MixamoData(
            Mixamo.RightHandIndex1, Mixamo.RightHand,
            data['right_index'],
            visData['right_index']
        ));

        poseInfo.set(Mixamo.RightHandPinky1, new MixamoData(
            Mixamo.RightHandPinky1, Mixamo.RightHand,
            data['right_pinky'],
            visData['right_pinky']
        ));
        console.log(poseInfo)
        for(let [key , value] of poseInfo.entries()){
            const parent = poseInfo.get(value.parent);
            console.log(parent)
            if(!parent){
                // this.bones.get(key)?.position.copy(value.position);
                continue;
            }
            const from = parent.position;
            const to = value.position;
            
        }
    }

}

export default Charactor;

