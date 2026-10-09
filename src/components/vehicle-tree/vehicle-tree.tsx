import {
  List,
} from "@mui/material"
import {
  SelectedVehicleProps
} from "@/lib/selected-vehicle";
import { useSettings } from "@/lib/settings-provider";
import { VehicleNode } from "@/components/vehicle-tree/vehicle-node";
import { VehicleTreeActions } from "@/components/vehicle-tree/vehicle-actions";

/**
 * Properties for the VehicleTree component.
 */
export interface VehicleTreeProps {
  /** List of selected vehicles to display in the tree */
  vehicles: SelectedVehicleProps[];
  /** Callback actions */
  actions: VehicleTreeActions;
}

/**
 * Renders a tree view of selected vehicles with container management controls.
 * Displays a list of selected vehicles, each with expandable controls for
 * container assignment, layout selection, and vehicle removal.
 * @param props Tree configuration including optional delete callback
 */
export const VehicleTree = (props: VehicleTreeProps) => {
  const { settings } = useSettings();

  return (
    <List
      sx={{
        width: "100%",
        bgcolor: "background.paper",
        overflow: "auto",
        display: "flex",
        flexDirection: "column",
        gap: 1,
        pt: 1,
      }}
      component="nav"
    >
      {props.vehicles.map((vehicle) => (
        <VehicleNode
          key={`${vehicle.schema.name}-treenode`}
          nodeIsOpen={settings.autoExpandVehicle}
          selected={vehicle}
          actions={props.actions}
        />
      ))}
    </List>
  );
}
