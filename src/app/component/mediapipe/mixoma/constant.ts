export const PartIndexMappingOfBlazePoseModel = {
    nose: 0,
    left_eye_inner: 1,
    left_eye: 2,
    left_eye_outer: 3,
    right_eye_inner: 4,
    right_eye: 5,
    right_eye_outer: 6,
    left_ear: 7,
    right_ear: 8,
    mouth_left: 9,
    mouth_right: 10,
    left_shoulder: 11,
    right_shoulder: 12,
    left_elbow: 13,
    right_elbow: 14,
    left_wrist: 15,
    right_wrist: 16,
    left_pinky: 17,
    right_pinky: 18,
    left_index: 19,
    right_index: 20,
    left_thumb: 21,
    right_thumb: 22,
    left_hip: 23,
    right_hip: 24,
    left_knee: 25,
    right_knee: 26,
    left_ankle: 27,
    right_ankle: 28,
    left_heel: 29,
    right_heel: 30,
    left_foot_index: 31,
    right_foot_index: 32,
}

export const OpenposeKeypointsConst = [
    'nose',
    'neck',
    'right_shoulder',
    'right_elbow',
    'right_wrist',
    'left_shoulder',
    'left_elbow',
    'left_wrist',
    'right_hip',
    'right_knee',
    'right_ankle',
    'left_hip',
    'left_knee',
    'left_ankle',
    'right_eye',
    'left_eye',
    'right_ear',
    'left_ear',
] as const;

export const ControlablePart = [
    ...OpenposeKeypointsConst,
    'left_shoulder_inner',
    'right_shoulder_inner',
    'left_hip_inner',
    'right_hip_inner',
    'five',
    'right_hand',
    'left_hand',
    'left_foot',
    'right_foot',
    'torso',
    'left_wrist_target',
    'right_wrist_target',
    'left_ankle_target',
    'right_ankle_target',
] as const;

// type OpenposeKeypoints = typeof OpenposeKeypointsConst[number];
export type ControlPartName = typeof ControlablePart[number];


function getMixamoNames(){
    return [
        ['Hips', 0, -1],  
        ['Spine', 1, 0],
        ['Spine1', 2, 1],
        ['Spine2', 3, 2],

        ['Neck', 4, 3],  
        ['Head', 5, 4],  

        ['LeftArm', 6, 3, "left_shoulder"],
        ['LeftForeArm', 7, 6, "left_elbow"],
        ['LeftHand', 8, 7, "left_wrist"],
        ['LeftHandThumb1', 9, 8, "left_thumb"],
        ['LeftHandIndex1', 10, 8, "left_index"],
        ['LeftHandPinky1', 11, 8, "left_pinky"],

        ['RightArm', 12, 3, "right_shoulder"],
        ['RightForeArm', 13, 12, "right_elbow"],
        ['RightHand', 14, 13, "right_wrist"],
        ['RightHandThumb1', 15, 14, "right_thumb"],
        ['RightHandIndex1', 16, 14, "right_index"],
        ['RightHandPinky1', 17, 14, "right_pinky"],

        ['LeftUpLeg', 18, 0, "left_hip"],
        ['LeftLeg', 19, 18, "left_knee"],
        ['LeftFoot', 20, 19, "left_ankle"],
        ['LeftToeBase', 21, 20, "left_foot_index"],

        ['RightUpLeg', 22, 0, "right_hip"],
        ['RightLeg', 23, 22, "right_knee"],
        ['RightFoot', 24, 23, "right_ankle"],
        ['RightToeBase', 25, 24, "right_foot_index"]
    ]
}
export function getNameIdxMap(){
    return {
        nose: 0,
        left_eye_inner: 1,
        left_eye: 2,
        left_eye_outer: 3,
        right_eye_inner: 4,
        right_eye: 5,
        right_eye_outer: 6,
        left_ear: 7,
        right_ear: 8,
        mouth_left: 9,
        mouth_right: 10,
        left_shoulder: 11,
        right_shoulder: 12,
        left_elbow: 13,
        right_elbow: 14,
        left_wrist: 15,
        right_wrist: 16,
        left_pinky: 17,
        right_pinky: 18,
        left_index: 19,
        right_index: 20,
        left_thumb: 21,
        right_thumb: 22,
        left_hip: 23,
        right_hip: 24,
        left_knee: 25,
        right_knee: 26,
        left_ankle: 27,
        right_ankle: 28,
        left_heel: 29,
        right_heel: 30,
        left_foot_index: 31,
        right_foot_index: 32,
    }
}

export function getMixamoNameIdxMap(): Map<string, number> {
    const mixamoNames = getMixamoNames();
    const mixamoNameIdxMap = new Map<string, number>();
    mixamoNames.forEach(name => {
        mixamoNameIdxMap.set(name[0] as string, name[1] as number);
    });
    return mixamoNameIdxMap;
}

export function getMixamoNameMediapipeNameMap(): Map<string, string> {
    const mixamoNames = getMixamoNames();
    const mixamoNameMediapipeNameMap = new Map<string, string>();
    for (let idx = 6; idx < mixamoNames.length; idx++) {
        mixamoNameMediapipeNameMap.set(mixamoNames[idx][0] as string, mixamoNames[idx][3] as string);
    }
    return mixamoNameMediapipeNameMap;
}
export const mixamoBoneNames = [
    'mixamorigHips',           // 0
    'mixamorigSpine',          // 1
    'mixamorigSpine1',         // 2
    'mixamorigSpine2',         // 3
    'mixamorigNeck',           // 4
    'mixamorigHead',           // 5
    'mixamorigLeftArm',        // 6
    'mixamorigLeftForeArm',    // 7
    'mixamorigLeftHand',       // 8
    'mixamorigLeftHandThumb1', // 9
    'mixamorigLeftHandIndex1', // 10
    'mixamorigLeftHandPinky1', // 11
    'mixamorigRightArm',       // 12
    'mixamorigRightForeArm',   // 13
    'mixamorigRightHand',      // 14
    'mixamorigRightHandThumb1',// 15
    'mixamorigRightHandIndex1',// 16
    'mixamorigRightHandPinky1',// 17
    'mixamorigLeftUpLeg',      // 18
    'mixamorigLeftLeg',        // 19
    'mixamorigLeftFoot',       // 20
    'mixamorigLeftToeBase',    // 21
    'mixamorigRightUpLeg',     // 22
    'mixamorigRightLeg',       // 23
    'mixamorigRightFoot',      // 24
    'mixamorigRightToeBase',   // 25

    'mixamorigLeftHandThumb2', // 26
    'mixamorigLeftHandThumb3', // 27
    'mixamorigLeftHandThumb4', // 28
    'mixamorigLeftHandIndex2', // 29
    'mixamorigLeftHandIndex3', // 30
    'mixamorigLeftHandIndex4', // 31
    'mixamorigLeftHandMiddle1',// 32
    'mixamorigLeftHandMiddle2',// 33
    'mixamorigLeftHandMiddle3',// 34
    'mixamorigLeftHandMiddle4',// 35
    'mixamorigLeftHandRing1',  // 36
    'mixamorigLeftHandRing2',  // 37
    'mixamorigLeftHandRing3',  // 38
    'mixamorigLeftHandRing4',  // 39
    'mixamorigLeftHandPinky2', // 40
    'mixamorigLeftHandPinky3', // 41
    'mixamorigLeftHandPinky4', // 42

    'mixamorigRightHandThumb2',// 43
    'mixamorigRightHandThumb3',// 44
    'mixamorigRightHandThumb4',// 45
    'mixamorigRightHandIndex2',// 46
    'mixamorigRightHandIndex3',// 47
    'mixamorigRightHandIndex4',// 48
    'mixamorigRightHandMiddle1',// 49
    'mixamorigRightHandMiddle2',// 50
    'mixamorigRightHandMiddle3',// 51
    'mixamorigRightHandMiddle4',// 52
    'mixamorigRightHandRing1', // 53
    'mixamorigRightHandRing2', // 54
    'mixamorigRightHandRing3', // 55
    'mixamorigRightHandRing4', // 56
    'mixamorigRightHandPinky2',// 57
    'mixamorigRightHandPinky3',// 58
    'mixamorigRightHandPinky4' // 59
];


export const MixamoIndex = {
    Hips: 0,
    Spine: 1,
    Spine1: 2,
    Spine2: 3,
    Neck: 4,
    Head: 5,
    LeftArm: 6,
    LeftForeArm: 7,
    LeftHand: 8,
    LeftHandThumb1: 9,
    LeftHandIndex1: 10,
    LeftHandPinky1: 11,
    RightArm: 12,
    RightForeArm: 13,
    RightHand: 14,
    RightHandThumb1: 15,
    RightHandIndex1: 16,
    RightHandPinky1: 17,
    LeftUpLeg: 18,
    LeftLeg: 19,
    LeftFoot: 20,
    LeftToeBase: 21,
    RightUpLeg: 22,
    RightLeg: 23,
    RightFoot: 24,
    RightToeBase: 25,

    LeftHandThumb2: 26,
    LeftHandThumb3: 27,
    LeftHandThumb4: 28,
    LeftHandIndex2: 29,
    LeftHandIndex3: 30,
    LeftHandIndex4: 31,
    LeftHandMiddle1: 32,
    LeftHandMiddle2: 33,
    LeftHandMiddle3: 34,
    LeftHandMiddle4: 35,
    LeftHandRing1: 36,
    LeftHandRing2: 37,
    LeftHandRing3: 38,
    LeftHandRing4: 39,
    LeftHandPinky2: 40,
    LeftHandPinky3: 41,
    LeftHandPinky4: 42,

    RightHandThumb2: 43,
    RightHandThumb3: 44,
    RightHandThumb4: 45,
    RightHandIndex2: 46,
    RightHandIndex3: 47,
    RightHandIndex4: 48,
    RightHandMiddle1: 49,
    RightHandMiddle2: 50,
    RightHandMiddle3: 51,
    RightHandMiddle4: 52,
    RightHandRing1: 53,
    RightHandRing2: 54,
    RightHandRing3: 55,
    RightHandRing4: 56,
    RightHandPinky2: 57,
    RightHandPinky3: 58,
    RightHandPinky4: 59
} as const;


export type MixamoIndexKeys = keyof typeof MixamoIndex;
export enum Mixamo {
    Root = -1,
    Hips,
    // Spine
    Spine,
    Spine1,
    Spine2,
    Neck,
    // HeadTop_End does not exist in Mediapipe
    Head,

    // Left Arm (LeftShoulder does not exist in Mediapipe)
    LeftArm,
    LeftForeArm,
    LeftHand,
    LeftHandThumb1,
    LeftHandIndex1,
    LeftHandPinky1,
    // Right Arm (RightShoulder does not exist in Mediapipe)
    RightArm,
    RightForeArm,
    RightHand,
    RightHandThumb1,
    RightHandIndex1,
    RightHandPinky1,
    
    // Left Leg (LeftToe_End does not exist in Mediapipe)
    LeftUpLeg,
    LeftLeg,
    LeftFoot,
    LeftToeBase,
    // Right Leg (RightToe_End does not exist in Mediapipe)
    RightUpLeg,
    RightLeg,
    RightFoot,
    RightToeBase,

    // Left Hand 22 + 18 + 18 = 58
    LeftHandThumb2,
    LeftHandThumb3,
    LeftHandThumb4,
    LeftHandIndex2,
    LeftHandIndex3,
    LeftHandIndex4,
    LeftHandMiddle1,
    LeftHandMiddle2,
    LeftHandMiddle3,
    LeftHandMiddle4,
    LeftHandRing1,
    LeftHandRing2,
    LeftHandRing3,
    LeftHandRing4,
    LeftHandPinky2,
    LeftHandPinky3,
    LeftHandPinky4,

    // Right Hand
    RightHandThumb2,
    RightHandThumb3,
    RightHandThumb4,
    RightHandIndex2,
    RightHandIndex3,
    RightHandIndex4,
    RightHandMiddle1,
    RightHandMiddle2,
    RightHandMiddle3,
    RightHandMiddle4,
    RightHandRing1,
    RightHandRing2,
    RightHandRing3,
    RightHandRing4,
    RightHandPinky2,
    RightHandPinky3,
    RightHandPinky4
}

// export type MixamoType = keyof typeof Mixamo;