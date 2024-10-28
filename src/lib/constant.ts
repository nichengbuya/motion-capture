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
