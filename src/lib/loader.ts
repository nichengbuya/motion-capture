import { Group, LoadingManager } from "three";
import { FBXLoader } from "three/examples/jsm/Addons.js";

const loadFBXModel = (url: string): Promise<Group> => {
    const manager = new LoadingManager(); 
    return new Promise((resolve, reject) => {
      const loader = new FBXLoader(manager);
      loader.load(
        url,
        (object) => {
          resolve(object);
        },
        () => {
        
        },
        (error) => {
          reject(new Error('Error loading FBX model: ' + error));
        }
      );
    });
  };
  
  export default loadFBXModel;