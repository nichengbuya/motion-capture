import { Vector3 } from "three";
import { Mixamo } from "./constant";

class MixamoData {
    name: Mixamo;
    parent: Mixamo;
    position: Vector3;
    visibility: number;

    constructor(thisMixamo: Mixamo, parentMixamo: Mixamo, mediapipeLandmark: Vector3, visibility: number) {
        this.name = thisMixamo;
        this.parent = parentMixamo;
        this.position = mediapipeLandmark;
        this.visibility = visibility;
    }
}

export default MixamoData;