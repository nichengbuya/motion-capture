import { Vector3, Object3D, SkinnedMesh, Bone, Quaternion, Box3, Matrix4 } from 'three';
import { Mixamo, MixamoIndex, MixamoIndexKeys, PartIndexMappingOfBlazePoseModel } from './constant';
import MixamoData from './mixamoData';
import ThreeManager from '@/lib/world';

class Charactor1 {
    body: Object3D;
    bones = new Map<Mixamo, Bone>();
    poseInfo!: Map<Mixamo, MixamoData>;
    landmarks?: Record<keyof typeof PartIndexMappingOfBlazePoseModel, Vector3>;

    constructor(object: Object3D) {
        this.body = object;
        (this.body.children[1] as SkinnedMesh).skeleton.bones.forEach(child => {
            if (child instanceof Bone) {
                const key = child.name.replace('mixamorig', '')
                this.bones.set(MixamoIndex[key as MixamoIndexKeys], child);
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

    calcHipTransform() {
        const { poseInfo } = this;
        const leftLegLocal = poseInfo.get(Mixamo.LeftUpLeg)!.position;
        const rightLegLocal = poseInfo.get(Mixamo.RightUpLeg)!.position;
        const spineLocal = poseInfo.get(Mixamo.Spine)!.position;
        const v1 = new Vector3().subVectors(rightLegLocal, leftLegLocal);
        const v2 = new Vector3().subVectors(spineLocal, rightLegLocal);
        const normalVec = new Vector3().crossVectors(v1, v2).normalize();
        const quaternion = new Quaternion();
        quaternion.setFromUnitVectors(new Vector3(0, 0, -1), normalVec);
        return quaternion;
    }

    calculateHeadOrientation(
        nose: Vector3,
        leftEyeInner: Vector3,
        rightEyeInner: Vector3,
        leftEar: Vector3,
        rightEar: Vector3,

    ): Quaternion {
        const world = ThreeManager.getInstance();
        // 计算头部的左右向量 (x轴)
        // 转换Mediapipe关键点为js向量
        // const nose = new Vector3(landmarks[0].x, landmarks[0].y, landmarks[0].z);
        // const leftEyeInner = new Vector3(landmarks[1].x, landmarks[1].y, landmarks[1].z);
        // const rightEyeInner = new Vector3(landmarks[4].x, landmarks[4].y, landmarks[4].z);
        // const leftEar = new Vector3(landmarks[7].x, landmarks[7].y, landmarks[7].z);
        // const rightEar = new Vector3(landmarks[8].x, landmarks[8].y, landmarks[8].z);

        // 计算眼睛中心点
        const eyeCenter = leftEyeInner.clone().add(rightEyeInner).multiplyScalar(0.5);
        const earCenter = leftEar.clone().add(rightEar).multiplyScalar(0.5);
        // 计算头部朝前的方向向量
        const forwardVector = eyeCenter.clone().sub(earCenter).normalize();

        // 计算头部的水平向量（从左耳到右耳）
        const horizontalVector = rightEar.clone().sub(leftEar).normalize();

        // 根据头部向前的方向向量和水平向量计算头部的上向量
        const upVector = horizontalVector.clone().cross(forwardVector).normalize();

        // 创建一个齐次变换矩阵（包括旋转和位移）
        const headMatrix = new Matrix4();
        headMatrix.makeBasis(horizontalVector.multiplyScalar(-1) , upVector, forwardVector);
        const quaternion = new Quaternion().setFromRotationMatrix(headMatrix)
        // const group = world.addCoordinateHelpers(nose , horizontalVector, upVector, forwardVector);
        // world.scene.add(group)
        return quaternion;
    }

    generateNormal() {
        const { poseInfo } = this;
        const leftLegLocal = poseInfo.get(Mixamo.LeftUpLeg)!.position;
        const rightLegLocal = poseInfo.get(Mixamo.RightUpLeg)!.position;
        const spineLocal = poseInfo.get(Mixamo.Spine)!.position;
        const v1 = new Vector3().subVectors(rightLegLocal, leftLegLocal);
        const v2 = new Vector3().subVectors(spineLocal, rightLegLocal);
        const normalVec = new Vector3().crossVectors(v1, v2).normalize();
        const quaternion = new Quaternion();
        quaternion.setFromUnitVectors(new Vector3(0, 0, -1), normalVec);
        return quaternion;
    }

    setPose(bone: Bone) {
        const { poseInfo } = this;
        const node = this.getMixamoDataByName(bone.name);
        const parent = poseInfo.get(node?.parent);  
        if(!node) return;
        if (node.self === Mixamo.Hips) {
            const q = this.calcHipTransform();
            bone.applyQuaternion(q);
            return;
        }
        if (node.self === Mixamo.Spine2) {
            const neckNode = poseInfo.get(Mixamo.Neck)!;
            const spine2Node = poseInfo.get(Mixamo.Spine2)!;
            const unit = this.getDirectionVectorByParentOf(neckNode.self, spine2Node.position, neckNode.position);
            const v = bone.position.clone().applyQuaternion(bone.quaternion).normalize();
            const q = new Quaternion().setFromUnitVectors(v, unit)
            bone.applyQuaternion(q);
            return;
        }

        if (node.self === Mixamo.Head) {
            if (this.landmarks) {
                const q2 = this.calculateHeadOrientation(
                    this.landmarks['nose'],
                    this.landmarks['left_eye_inner'],
                    this.landmarks['right_eye_inner'],
                    this.landmarks['left_ear'],
                    this.landmarks['right_ear'],
                );
                const q1 = new Quaternion();
                bone.getWorldQuaternion(q1);
                const q = q1.clone().conjugate().multiply(q2);
                bone.quaternion.copy(q);
            }
            return;
        }
        // if(node.self === Mixamo.LeftArm || node.self === Mixamo.RightArm){
        //     const from = parent!.position.clone();
        //     const to = node.position.clone();
        //     const unit = this.getDirectionVectorByParentOf(parent!.self, from, to);
        //     const v = bone.position.clone().applyQuaternion(bone.parent!.quaternion).normalize();
        //     const q = new Quaternion().setFromUnitVectors(v, unit)
        //     // bone.parent!.applyQuaternion(q);
        //     return;
        // }   
        const arr = [Mixamo.Spine1, Mixamo.Hips, Mixamo.LeftHand, Mixamo.RightHand, Mixamo.LeftFoot, Mixamo.RightFoot];

        
       
        console.log('child:' + node?.name , 'parent:' + parent?.name)
        if (!parent || arr.indexOf(parent!.self) >= 0) {
            return;
        }
        if (node && parent) {
            const from = parent.position.clone();
            const to = node.position.clone();
            const unit = this.getDirectionVectorByParentOf(parent.self, from, to);
            const v = bone.position.clone().applyQuaternion(bone.parent!.quaternion).normalize();
            const q = new Quaternion().setFromUnitVectors(v, unit)
            bone.parent!.applyQuaternion(q);
        }
    }

    getMixamoDataByName(name: string) {
        const { poseInfo } = this;
        name = name.replace('mixamorig', '');
        const key = MixamoIndex[name as MixamoIndexKeys];
        return poseInfo.get(key)!;
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
        this.landmarks = data;
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
            Mixamo.LeftArm, Mixamo.Neck,
            data['left_shoulder'],
            visData['left_shoulder']
        ));

        poseInfo.set(Mixamo.LeftForeArm, new MixamoData(
            Mixamo.LeftForeArm, Mixamo.LeftArm,
            data['left_elbow'],
            visData['left_elbow']
        ));

        poseInfo.set(Mixamo.RightArm, new MixamoData(
            Mixamo.RightArm, Mixamo.Neck,
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
        return poseInfo;
    }

    normalize(bone: Bone, len = 0) {
        const node = this.getMixamoDataByName(bone.name)
        if (node.self === Mixamo.Hips) {
            // bone.position.copy(node.position);
        } else {
            if (node && node.visibility > 0) {
                const unit = bone.position.clone().normalize();
                bone.position.copy(unit.multiplyScalar(len))
            }
        }
        for (const b of bone.children) {
            const child = this.getMixamoDataByName(b.name);
            if (!child) {
                continue;
            }
            const newLen = node.position.distanceTo(child.position);
            this.normalize(b as Bone, newLen)
        }
    }

    normalizeSpine(bone:Bone){
        const node = this.getMixamoDataByName(bone.name)
        if(!node){
            return;
        }
        if(node.self === Mixamo.LeftArm || node.self === Mixamo.RightArm || node.self === Mixamo.Neck){
            bone.position.z = 0;
        }
        if(node.self === Mixamo.LeftUpLeg || node.self === Mixamo.RightUpLeg){
            bone.position.y = 0;
            bone.position.z = 0;
        }
        for(let c of bone.children){
            this.normalizeSpine(c as Bone);
        }
    }
    standFloor() {
        const boundingBox = new Box3().setFromObject(this.body);
        const offset = boundingBox.min.y;
        this.body.position.y -= offset;
    }

    calcAnimation(landmarks: [number, number, number][], visibility: number[],) {
        this.poseInfo = this.getPoseInfo(landmarks, visibility);
        const rootBone = this.body.children[0] as Bone;
        // this.normalizeSpine(rootBone);
        // this.normalize(rootBone);
        rootBone.traverse(child => {
            if (child instanceof Bone) {             
                this.setPose(child)
            }
        })
        this.standFloor();
    }

}

export default Charactor1;

