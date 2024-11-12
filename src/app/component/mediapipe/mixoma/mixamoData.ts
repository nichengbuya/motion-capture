import { Vector3 } from "three";
import { Mixamo, mixamoBoneNames } from "./constant";

class MixamoData {
    name: string;
    self:Mixamo;
    parent: Mixamo;
    position: Vector3;
    visibility: number;

    constructor(thisMixamo: Mixamo, parentMixamo: Mixamo, mediapipeLandmark: Vector3, visibility: number) {
        this.self = thisMixamo;
        this.parent = parentMixamo;
        this.name = mixamoBoneNames[this.self];
        this.position = mediapipeLandmark;
        this.visibility = visibility;
    }
}

export default MixamoData;