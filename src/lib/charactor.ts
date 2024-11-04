import { Vector3, Object3D, SkinnedMesh } from 'three';
import { ControlablePart, ControlPartName, getMixamoNameIdxMap, getMixamoNameMediapipeNameMap, Mixamo, PartIndexMappingOfBlazePoseModel } from './constant';
interface HipsBoneJson {
    x: number;
    y: number;
    z: number;
}
class Charactor {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    part: Record<ControlPartName, Object3D> = {} as any;
    body: Object3D;
    constructor(object: Object3D) {
        this.body = object;
        const map = getMixamoNameMediapipeNameMap();
        for(const [from , to] of map.entries()){
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
            ['left_hip', [this.getMidpoint(data['left_shoulder'], data['right_shoulder']), 'left_hip']],
            ['left_knee', ['left_hip', 'left_knee']],
            ['left_ankle', ['left_knee', 'left_ankle']],
            ['right_shoulder', [this.getMidpoint(data['left_shoulder'], data['right_shoulder']), 'right_shoulder']],
            ['right_elbow', ['right_shoulder', 'right_elbow']],
            ['right_wrist', ['right_elbow', 'right_wrist']],
            ['right_hip', [this.getMidpoint(data['left_shoulder'], data['right_shoulder']), 'right_hip']],
            ['right_knee', ['right_hip', 'right_knee']],
            ['right_ankle', ['right_knee', 'right_ankle']],
            // ['nose', [this.getMidpoint(data['left_shoulder'], data['right_shoulder']), 'nose']],
            // ['left_eye', ['nose', 'left_eye']],
            // ['right_eye', ['nose', 'right_eye']],
            // ['left_ear', ['left_eye', 'left_ear']],
            // ['right_ear', ['right_eye', 'right_ear']],
        ];

        for (const [name, [from, to]] of map) {
            const fromVec = from instanceof Vector3 ? from : data[from];
            const toVec = to instanceof Vector3 ? to : data[to];

            this.rotateTo3(name, fromVec, toVec);
            this.setPositionByDistance(name, fromVec, toVec);
        }
    }
    setPose2(rawData: [number, number, number][], visibility:number[]) {
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
    
        const glmList:Vector3[] = [];
        const visibilityList:number[] = [];
        glmList[Mixamo.Hips] = this.avgVec3(data['left_hip'],data['right_hip']);
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
        const indexMap = getMixamoNameIdxMap();
        // for mp_idx in mp_idx_mm_idx_map.keys():
        // mm_idx = mp_idx_mm_idx_map[mp_idx]
        // glm_list[mm_idx] = glm.vec3(
        //     landmark[mp_idx].x, -landmark[mp_idx].y, -landmark[mp_idx].z)
        // visibility_list[mm_idx] = landmark[mp_idx].visibility
        for(const [from, to] of indexMap.entries()){
            glmList[to] = data[from];
            visibilityList[to] = visData[from];
        }
        

    }

}

export default Charactor;

