// https://github.com/google/mediapipe/blob/master/docs/solutions/pose.md#resources
import { Results, Pose } from '@mediapipe/pose'

// @mediapipe/pose is not an es module ??
// Extract Pose from the window to solve the problem
// To prevent optimization, just print it

const AliyuncsBase =
    'https://openpose-editor.oss-cn-beijing.aliyuncs.com/%40mediapipe/pose'
// const JsdelivrBase = 'https://cdn.jsdelivr.net/npm/@mediapipe/pose'

// let UseJsdelivrBase = true
function GetCDNBase() {
    // if (UseJsdelivrBase) return JsdelivrBase
    // else return AliyuncsBase
    return AliyuncsBase
}

// export function SetCDNBase(isJsdelivrBase: boolean) {
//     UseJsdelivrBase = isJsdelivrBase
// }

const pose = new Pose({
    locateFile: (file:string) => {
        const url = `${GetCDNBase()}/${file}`
        return url
    },
})

// https://github.com/google/mediapipe/blob/master/docs/solutions/pose.md#solution-apis
pose.setOptions({
    modelComplexity: 1,
    smoothLandmarks: true,
    enableSegmentation: true,
    smoothSegmentation: true,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5,
})

export function DetectPosefromImage(image: HTMLImageElement): Promise<Results> {
    return new Promise((resolve, reject) => {
        let isException = false
        const id = setTimeout(() => {
            isException = true
            reject('Timeout')
        }, 60 * 1000)
        pose.reset()
        pose.send({ image: image })
        pose.onResults((result) => {
            if (!isException) {
                clearTimeout(id)
                resolve(result)
            }
        })
    })
}