'use client'
import React, { createContext, useContext, useState, ReactNode, FC } from 'react';
import * as THREE from 'three';

interface Object3DContextType {
  object3D: THREE.Object3D | null;
  setObject3D: (object3D: THREE.Object3D) => void;
}

const Object3DContext = createContext<Object3DContextType | undefined>(undefined);

export const useObject3D = () => {
  const context = useContext(Object3DContext);
  if (!context) {
    throw new Error('useObject3D must be used within an Object3DProvider');
  }
  return context;
};

export const Object3DProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [object3D, setObject3D] = useState<THREE.Object3D | null>(null);

  return (
    <Object3DContext.Provider value={{ object3D, setObject3D }}>
      {children}
    </Object3DContext.Provider>
  );
};