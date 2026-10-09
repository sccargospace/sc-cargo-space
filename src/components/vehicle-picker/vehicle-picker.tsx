import { useState } from "react";
import {
  TextField, Autocomplete,
  Box
} from "@mui/material";

import {
  VehicleSchemaProps,
  VehicleSchemas
} from "@/lib/vehicle-schema";
import { ManufacturerIcon } from "@/components/icons/manufacturer-icon";
import { SelectedVehicleProps } from "@/lib/selected-vehicle";

/**
 * Properties for the VehiclePicker component.
 */
export interface VehiclePickerProps {
  vehicles: SelectedVehicleProps[];
  /** Callback function called when a vehicle is selected */
  onVehiclePicked: (newVehicle: VehicleSchemaProps) => void;
}

/**
 * Component that provides vehicle selection with autocomplete.
 * Automatically adds the vehicle on selection and clears the input.
 * Already-selected vehicles are disabled in the dropdown.
 */
export const VehiclePicker = (props: VehiclePickerProps) => {
  const [inputValue, setInputValue] = useState('');

  const isVehicleSelected = (vehicle: VehicleSchemaProps): boolean => {
    return props.vehicles.some((v) => v.schema.name === vehicle.name);
  };

  return (
    <Box sx={{ px: 2 }}>
      <Autocomplete
        value={null}
        inputValue={inputValue}
        onInputChange={(_event, newInputValue) => {
          setInputValue(newInputValue);
        }}
        options={VehicleSchemas}
        groupBy={(option) => option.manufacturer}
        getOptionLabel={(option) => option.name}
        getOptionDisabled={(option) => isVehicleSelected(option)}
        sx={{ width: '100%' }}
        blurOnSelect
        renderInput={(params) => (
          <TextField {...params} label="Add Vehicle" placeholder="Search vehicles..." />
        )}
        renderGroup={(params) => (
          <li key={params.key}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                padding: "8px 16px",
                backgroundColor: "rgba(25, 118, 210, 0.10)",
                borderBottom: "1px solid rgba(25, 118, 210, 0.20)",
                fontWeight: "600",
                fontSize: "0.875rem",
                color: "#1976d2",
                letterSpacing: "0.5px"
              }}
            >
              <ManufacturerIcon
                manufacturer={params.group}
                size={35}
              />
              {params.group}
            </div>
            <ul style={{ padding: 0 }}>{params.children}</ul>
          </li>
        )}
        onChange={(_event, value) => {
          if (value && !isVehicleSelected(value)) {
            props.onVehiclePicked(value);
          }
          setInputValue('');
        }}
      />
    </Box>
  );
}
