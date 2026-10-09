import {
  SelectedVehicleProps
} from "@/lib/selected-vehicle";

export interface VehicleTreeActions {
  /** Callback when container loadout changes */
  onVehicleLoadoutChange: (vehicle: SelectedVehicleProps) => void;
  /** Callback when vehicle is deleted */
  onVehicleReset: (vehicleReset: SelectedVehicleProps) => void;
  /** Callback when vehicle is deleted */
  onVehicleDelete: (deletedVehicle: SelectedVehicleProps) => void;
  /** Callback when grid layout changes */
  onGridLayoutChange: (vehicle: SelectedVehicleProps, layout: VehicleGridLayoutType) => void;
  /** Callback when alert is cleared */
  onAlertClear: (vehicleName: string) => void;
}

/** Vehicle grid layout types */
export enum VehicleGridLayoutType {
  Official,
  Unofficial,
}