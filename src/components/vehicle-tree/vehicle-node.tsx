import { useReducer, useEffect } from "react";
import {
  ListItem, ListItemButton,
  ListItemText, Collapse, IconButton, TextField,
  Box, Button, Alert, Tooltip, Paper,
  Typography, ToggleButtonGroup, ToggleButton
} from "@mui/material";
import {
  ExpandLess, ExpandMore, Delete,
  Add as AddIcon, RestartAlt as RestartIcon,
  Error as ErrorIcon
} from "@mui/icons-material";

import { ContainerSizes } from "@/lib/util";
import {
  SelectedVehicleProps,
  SelectedVehicleGetSchemaLayout
} from "@/lib/selected-vehicle";
import { ManufacturerIcon } from "@/components/icons/manufacturer-icon";
import { VehicleTreeActions, VehicleGridLayoutType } from "@/components/vehicle-tree/vehicle-actions";

/**
 * Properties for a vehicle node in the tree.
 */
export interface VehicleNodeProps {
  /** Whether the node is initially expanded */
  nodeIsOpen: boolean;
  /** The selected vehicle data */
  selected: SelectedVehicleProps;
  /** Callback actions */
  actions: VehicleTreeActions;
}

/**
 * Renders an individual vehicle node in the tree with container assignment controls.
 * Provides functionality to assign containers, reset to maximum capacity, and toggle
 * between official and unofficial layouts.
 * @param props Vehicle node configuration and callbacks
 */
export const VehicleNode = (props: VehicleNodeProps) => {
  const [nodeValues, setNodeValues] = useReducer(
    (prev: any, next: any) => {
      return { ...prev, ...next };
    }, {
    1: props.selected.containerCounts[1],
    2: props.selected.containerCounts[2],
    4: props.selected.containerCounts[4],
    8: props.selected.containerCounts[8],
    16: props.selected.containerCounts[16],
    24: props.selected.containerCounts[24],
    32: props.selected.containerCounts[32],
    isOpen: props.nodeIsOpen,
    alert: undefined,
  });

  // Update local state when props change (e.g., after reset)
  useEffect(() => {
    setNodeValues({
      1: props.selected.containerCounts[1],
      2: props.selected.containerCounts[2],
      4: props.selected.containerCounts[4],
      8: props.selected.containerCounts[8],
      16: props.selected.containerCounts[16],
      24: props.selected.containerCounts[24],
      32: props.selected.containerCounts[32],
    });
  }, [props.selected.containerCounts]);

  const assignTooltip = "Assign containers to vehicle";

  /**
   * Handles toggling between official and unofficial vehicle layouts.
   * @param _event The toggle event (unused)
   * @param value The selected layout type ("official" or "unofficial")
   */
  const handleOfficialToggle = (_event: any, value: string) => {
    props.actions.onGridLayoutChange(
      props.selected,
      value === "unofficial" ? VehicleGridLayoutType.Unofficial : VehicleGridLayoutType.Official);
  }

  /**
   * Calculates the total size of the vehicle based on its container counts.
   * @returns The total container size of the vehicle
   */
  const vehicleSize = () => {
    let currentSize = 0;
    ContainerSizes.forEach((size) => {
      const count = Number(nodeValues[size]) || 0;
      currentSize += (size * count);
    });
    return currentSize;
  };

  const currentSize = vehicleSize();
  const maxCapacity = SelectedVehicleGetSchemaLayout(props.selected).capacity;

  return (
    <>
      <ListItem
        sx={{
          py: 0, // Remove vertical padding
          px: 1  // Reduce horizontal padding
        }}
        secondaryAction={
          <Tooltip
            title="Remove vehicle"
            enterDelay={250}
            enterNextDelay={250}
          >
            <span>
              <IconButton
                edge="end"
                aria-label="delete"
                size="small" // Make button smaller
                color="default"
                sx={{
                  p: 0.5, // Reduce button padding
                  mr: -0.5, // Pull closer to edge
                }}
                onClick={() => props.actions.onVehicleDelete(props.selected)}
              >
                <Delete fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        }
      >
        <ListItemButton
          sx={{
            py: 1, // Controlled vertical padding
            px: 1  // Controlled horizontal padding
          }}
          onClick={() => setNodeValues({ isOpen: !nodeValues.isOpen, alert: undefined })}
        >
          {nodeValues.isOpen ?
            <ExpandLess sx={{ color: "text.primary" }} /> :
            <ExpandMore sx={{ color: "text.primary" }} />
          }
          <Box sx={{ display: "flex", alignItems: "center", ml: 1, flex: 1, minWidth: 0 }}>
            {props.selected.alert === undefined && <ManufacturerIcon
              manufacturer={props.selected.schema.manufacturer}
              size={24}
            />}
            {props.selected.alert && (
              <Tooltip
                title={`Error: ${props.selected.alert}`}
                placement="top"
                enterDelay={300}
              >
                <ErrorIcon
                  fontSize="small"
                  color="error"
                  sx={{ ml: 0.5, mr: 0.5 }}
                />
              </Tooltip>
            )}
            <ListItemText
              primary={props.selected.schema.name}
              primaryTypographyProps={{
                variant: props.selected.schema.name.length > 20 ? "body2" : "body1",
                color: "text.primary", // Explicit color to ensure theme updates
                sx: {
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap"
                }
              }}
              sx={{
                margin: 0,
                minWidth: 0
              }}
            />
          </Box>
        </ListItemButton>
      </ListItem>
      <Collapse
        in={nodeValues.isOpen}
        timeout="auto"
        unmountOnExit
      >
        <Box sx={{ px: 2, pt: 0, pb: 2.25 }}>
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              borderRadius: 2,
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            {props.selected.alert && (
              <Alert
                severity="error"
                variant="outlined"
                onClose={() => props.actions.onAlertClear(props.selected.schema.name)}
              >
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  Loading Error
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                  {props.selected.alert}
                </Typography>
              </Alert>
            )}
            {props.selected.schema.unofficial && (
              <ToggleButtonGroup
                color={props.selected.useUnofficial ? "secondary" : "primary"}
                size="small"
                sx={{ width: "100%" }}
                value={props.selected.useUnofficial ? "unofficial" : "official"}
                exclusive
                onChange={handleOfficialToggle}
                aria-label="Official vs Unofficial"
              >
                <ToggleButton value="official" sx={{ flex: 1 }}>Official</ToggleButton>
                <ToggleButton value="unofficial" sx={{ flex: 1 }}>Unofficial</ToggleButton>
              </ToggleButtonGroup>
            )}
            <Box sx={{ width: "100%" }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.75 }}>
                <Typography variant="caption" color="text.secondary">
                  Capacity
                </Typography>
                <Typography variant="caption" fontWeight="bold" color="text.primary">
                  {currentSize} / {maxCapacity} SCU
                </Typography>
              </Box>
              <Box sx={{
                width: "100%",
                height: 10,
                backgroundColor: (theme) =>
                  theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'grey.200',
                borderRadius: 5,
                overflow: "hidden"
              }}>
                <Box sx={{
                  width: `${Math.min((currentSize / maxCapacity) * 100, 100)}%`,
                  height: "100%",
                  borderRadius: 5,
                  backgroundColor: (() => {
                    const percentage = (currentSize / maxCapacity) * 100;
                    if (currentSize > maxCapacity) {
                      return "error.main";
                    } else if (percentage === 100) {
                      return "#2196F3";
                    } else if (percentage >= 66) {
                      return "#4CAF50";
                    } else if (percentage >= 33) {
                      return "#FF9800";
                    } else {
                      return "#F44336";
                    }
                  })(),
                  transition: "width 0.3s ease, background-color 0.3s ease"
                }} />
              </Box>
            </Box>
            <Box sx={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: 1,
              width: "100%"
            }}>
              {ContainerSizes.map((size) => (
                <TextField
                  key={`${props.selected.schema.name}-scutextfield-${size}`}
                  size="small"
                  label={`${size} scu`}
                  variant="outlined"
                  value={nodeValues[size]}
                  onChange={(e) => {
                    setNodeValues({
                      [size]: e.target.value,
                      alert: undefined
                    })
                  }}
                  fullWidth />
              ))}
            </Box>
            {/* Action Buttons */}
            <Box sx={{ display: "flex", gap: 1, width: "100%" }}>
              {/* Assign button */}
              <Tooltip
                title={`${assignTooltip}`}
                enterDelay={1000}
                enterNextDelay={1000}
              >
                <span style={{ flex: 1 }}>
                  <Button
                    sx={{ width: "100%" }}
                    aria-label="add"
                    variant="contained"
                    size="small"
                    color="primary"
                    disableElevation
                    endIcon={<AddIcon />}
                    onClick={() => {
                      const updatedVehicle: SelectedVehicleProps = {
                        ...props.selected,
                        hasCustomContainers: true,
                        containerCounts: {
                          1: Number(nodeValues[1]) || 0,
                          2: Number(nodeValues[2]) || 0,
                          4: Number(nodeValues[4]) || 0,
                          8: Number(nodeValues[8]) || 0,
                          16: Number(nodeValues[16]) || 0,
                          24: Number(nodeValues[24]) || 0,
                          32: Number(nodeValues[32]) || 0,
                        }
                      };
                      props.actions.onVehicleLoadoutChange(updatedVehicle);
                    }}>
                    Assign
                  </Button>
                </span>
              </Tooltip>

              {/* Reset button */}
              <Tooltip
                title="Reset containers to vehicle's maximum capacity"
                enterDelay={750}
                enterNextDelay={750}
              >
                <span style={{ flex: 1 }}>
                  <Button
                    sx={{ width: "100%" }}
                    aria-label="reset"
                    variant="outlined"
                    size="small"
                    color="secondary"
                    endIcon={<RestartIcon />}
                    onClick={() => {
                      props.actions.onVehicleReset(props.selected);
                    }}>
                    Reset
                  </Button>
                </span>
              </Tooltip>
            </Box>
          </Paper>
        </Box>
      </Collapse>
    </>
  );
}
