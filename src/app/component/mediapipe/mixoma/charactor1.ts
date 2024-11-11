import { Vector3, Object3D, SkinnedMesh, Bone, Quaternion, Matrix4, Vector4, Euler } from 'three';
import { ControlablePart, ControlPartName, getMixamoNameIdxMap, getMixamoNameMediapipeNameMap, Mixamo, MixamoIndex, PartIndexMappingOfBlazePoseModel } from './constant';
import MixamoData from './mixamoData';

type PoseInfo = Map<Mixamo, MixamoData>;
class Charactor1 {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    body: Object3D;
    bones = new Map<Mixamo, Bone>();
    constructor(object: Object3D) {
        this.body = object;
        console.log(this.body);
        (this.body.children[1] as SkinnedMesh).skeleton.bones.forEach(child => {
            if (child instanceof Bone) {
                const key = child.name.replace('mixamorig', '')
                this.bones.set(MixamoIndex[key], child);
            }
        });
    }

    avgVec3(v1: Vector3, v2: Vector3): Vector3 {
        const x = (v1.x + v2.x) * 0.5;
        const y = (v1.y + v2.y) * 0.5;
        const z = (v1.z + v2.z) * 0.5;
        return new Vector3(x, y, z);
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

    rotateTo3(name: Mixamo, from: Vector3, to: Vector3) {
        this.rotateTo(name, this.getDirectionVectorByParentOf(name, from, to));
    }

    rotateTo(name: Mixamo, dir: Vector3) {
        const obj = this.bones.get(name)!;
        const unit = obj.position.clone().normalize();
        const axis = unit.clone().cross(dir);
        const angle = unit.clone().angleTo(dir);
        obj.parent?.rotateOnAxis(axis.normalize(), angle);
    }

    getLocalPosition(obj: Object3D, position: Vector3): Vector3 {
        return obj.worldToLocal(position.clone());
    }

    getDirectionVectorByParentOf(name: Mixamo, from: Vector3, to: Vector3): Vector3 {
        const parent = this.bones.get(name)!.parent!;
        const localFrom = this.getLocalPosition(parent, from);
        const localTo = this.getLocalPosition(parent, to);
        return localTo.clone().sub(localFrom).normalize();
    }

    getDistanceOf(from: Vector3, to: Vector3): number {
        return from.distanceTo(to);
    }

    setPositionByDistance(name: Mixamo, from: Vector3, to: Vector3) {
        const dis = this.getDistanceOf(from, to);
        this.bones.get(name)!.position.normalize().multiplyScalar(dis);
    }

    getPoseInfo(rawData: [number, number, number][], visibility: number[]) {
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

        return poseInfo;
    }

    calcHipTransform(leftLegLocal:Vector3,rightLegLocal:Vector3,spineLocal:Vector3) {
        const v1 = new Vector3().subVectors(rightLegLocal, leftLegLocal);
        const v2 = new Vector3().subVectors(spineLocal, rightLegLocal);
        const normalVec = new Vector3().crossVectors(v1, v2).normalize();
        const tangentVec = rightLegLocal.clone().normalize();
        const binormalVec = new Vector3().crossVectors(normalVec, tangentVec);
        const matrix = this.generateMatrix(tangentVec, normalVec, binormalVec);
        const v = new Vector3();
        const q = new Quaternion();
        const t = new Vector3();
        matrix.decompose(v, q, t)
        return q;
    }
    generateMatrix(tangent: Vector3, normal: Vector3, binormal: Vector3) {
        // 将向量转换为Vector4，并取反
        const tan = new Vector3(tangent.x, tangent.y, tangent.z).multiplyScalar(-1);
        const binorm = new Vector3(binormal.x, binormal.y, binormal.z);
        const norm = new Vector3(normal.x, normal.y, normal.z).multiplyScalar(-1);

        // 创建一个新的Matrix4实例
        const matrix = new Matrix4();
        // 设置矩阵的列
        matrix.makeBasis(tan, norm, binorm)

        return matrix;
    }
    setPose(rawData: [number, number, number][], visibility: number[]) {
        const poseInfo = this.getPoseInfo(rawData, visibility);
        const leftLegLocal = poseInfo.get(Mixamo.LeftUpLeg)!.position;
        const rightLegLocal = poseInfo.get(Mixamo.RightUpLeg)!.position;
        const spineLocal = poseInfo.get(Mixamo.Spine)!.position;
        const q = this.calcHipTransform(leftLegLocal,rightLegLocal,spineLocal);
        


        // this.bones.get(Mixamo.Hips)?.applyQuaternion(q);
        const limbs = [
            Mixamo.LeftForeArm, 
            Mixamo.LeftHand,  
            Mixamo.RightForeArm,
            Mixamo.RightHand, 
            Mixamo.LeftLeg, 
            Mixamo.LeftFoot, 
            Mixamo.RightLeg, 
            Mixamo.RightFoot
        ];
        for(let k of limbs){
            const node = poseInfo.get(k)!;
            const parent = poseInfo.get(node?.parent);
            if(!parent){
                continue;
            }
            const from = parent.position.clone();
            const to = node.position.clone();
            this.rotateTo3(node.name, from, to);
            this.setPositionByDistance(node.name, from, to);
        }
    }

}

export default Charactor1;

