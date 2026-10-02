import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { VehicleProps } from '@/lib/vehicle';

/**
 * Canvas control functions interface
 */
export interface CanvasControls {
  takeScreenshot: () => void;
  resetCamera: () => void;
}

/**
 * Canvas state interface
 */
export interface CanvasState {
  vehicles: VehicleProps[];
  isVisible: boolean;
  controls: CanvasControls | null;
}

/**
 * Canvas context interface
 */
export interface CanvasContextType {
  state: CanvasState;
  setVehicles: (vehicles: VehicleProps[]) => void;
  setVisible: (visible: boolean) => void;
  setControls: (controls: CanvasControls) => void;
  takeScreenshot: () => void;
  resetCamera: () => void;
}

const CanvasContext = createContext<CanvasContextType | undefined>(undefined);

/**
 * Hook to use canvas context
 * @returns Canvas context with state and control functions
 */
export const useCanvas = (): CanvasContextType => {
  const context = useContext(CanvasContext);
  if (!context) {
    throw new Error('useCanvas must be used within a CanvasProvider');
  }
  return context;
};

/**
 * Canvas provider component props
 */
interface CanvasProviderProps {
  children: ReactNode;
}

/**
 * Canvas provider component that manages canvas state and controls
 */
export const CanvasProvider = ({ children }: CanvasProviderProps) => {
  const [state, setState] = useState<CanvasState>({
    vehicles: [],
    isVisible: true,
    controls: null,
  });

  const setVehicles = useCallback((vehicles: VehicleProps[]) => {
    setState(prev => ({ ...prev, vehicles }));
  }, []);

  const setVisible = useCallback((visible: boolean) => {
    setState(prev => ({ ...prev, isVisible: visible }));
  }, []);

  const setControls = useCallback((controls: CanvasControls) => {
    setState(prev => ({ ...prev, controls }));
  }, []);

  const takeScreenshot = useCallback(() => {
    if (state.controls) {
      state.controls.takeScreenshot();
    } else {
      console.warn('Canvas controls not available for screenshot');
    }
  }, [state.controls]);

  const resetCamera = useCallback(() => {
    if (state.controls) {
      state.controls.resetCamera();
    } else {
      console.warn('Canvas controls not available for camera reset');
    }
  }, [state.controls]);

  const contextValue: CanvasContextType = {
    state,
    setVehicles,
    setVisible,
    setControls,
    takeScreenshot,
    resetCamera,
  };

  return (
    <CanvasContext.Provider value={contextValue}>
      {children}
    </CanvasContext.Provider>
  );
};