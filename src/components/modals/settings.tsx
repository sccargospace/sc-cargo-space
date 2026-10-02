import React, { useState } from "react";
import {
  Box, Stack, Button,
  FormControlLabel,
  DialogContent, Typography,
  Switch, Card, CardContent,
  Grid2, Chip
} from "@mui/material";
import {
  Save as SaveIcon,
  Undo as UndoIcon
} from "@mui/icons-material";
import { MuiColorInput } from "mui-color-input";

import { DialogBox } from "@/components/modals/dialog-box";
import { useSettings, ContainerColorsProps } from "@/lib/settings-provider";

/**
 * Properties for the Settings modal component.
 */
export interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Modal component for managing application settings.
 * Provides controls for visual settings, container colors, and display options.
 * Changes are stored in localStorage and applied to global state.
 */
export const SettingsModal = ({ isOpen, onClose }: SettingsModalProps) => {
  const { settings, updateSettings } = useSettings();
  const [tempSettings, setTempSettings] = useState(settings);
  const [hasPendingChanges, setHasPendingChanges] = useState(false);
  const containerKeys = [1, 2, 4, 8, 16, 24, 32];

  /**
   * Handles switch changes for boolean settings.
   * @param event The switch change event
   */
  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    setTempSettings({
      ...tempSettings,
      [name]: checked
    });
    setHasPendingChanges(true);
  };

  /**
   * Handles color changes for container colors.
   * @param color The new color value
   * @param size The container size to update color for
   */
  const handleColorChange = (color: string, size: number) => {
    setTempSettings({
      ...tempSettings,
      containerColors: {
        ...tempSettings.containerColors,
        [size]: color
      }
    });
    setHasPendingChanges(true);
  };

  /**
   * Handles color change for unsecured containers.
   * @param color The new color value
   */
  const handleUnsecureColorChange = (color: string) => {
    setTempSettings({
      ...tempSettings,
      unsecure_container_color: color
    });
    setHasPendingChanges(true);
  };

  /**
   * Handles form submission, saving settings and closing the modal.
   */
  const handleSubmit = () => {
    updateSettings(tempSettings);
    setHasPendingChanges(false);
    onClose();
  };

  /**
   * Discards temporary changes and reverts to current saved settings.
   */
  const handleDiscard = () => {
    setTempSettings(settings);
    setHasPendingChanges(false);
  };

  return (
    <DialogBox
      title="Settings"
      open={isOpen}
      onClose={onClose}
      width="lg"
      fullWidth={true}
    >
      <DialogContent dividers sx={{ p: 0 }}>
        <Box sx={{ p: 3 }}>
          <Stack spacing={3}>
            {/* Display Settings Section */}
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Display Settings
                </Typography>
                <Stack spacing={2}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={tempSettings.isDarkMode}
                        onChange={(e) => {
                          setTempSettings({
                            ...tempSettings,
                            isDarkMode: e.target.checked
                          });
                          setHasPendingChanges(true);
                        }
                        }
                      />
                    }
                    label={`${tempSettings.isDarkMode ? 'Dark' : 'Light'} Mode`}
                  />
                  <FormControlLabel
                    control={<Switch checked={tempSettings.showGrid} onChange={handleCheckboxChange} name="showGrid" />}
                    label="Show grid"
                  />
                  <FormControlLabel
                    control={<Switch checked={tempSettings.showGridBase} onChange={handleCheckboxChange} name="showGridBase" />}
                    label="Show ship grid base"
                  />
                  <FormControlLabel
                    control={<Switch checked={tempSettings.showVehicleLabels} onChange={handleCheckboxChange} name="showVehicleLabels" />}
                    label="Show vehicle labels"
                  />
                  <FormControlLabel
                    control={<Switch checked={tempSettings.showContainerLabels} onChange={handleCheckboxChange} name="showContainerLabels" />}
                    label="Show container labels"
                  />
                </Stack>
              </CardContent>
            </Card>

            {/* Behavior Settings Section */}
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Behavior
                </Typography>
                <Stack spacing={2}>
                  <FormControlLabel
                    control={<Switch checked={tempSettings.autoExpandVehicle} onChange={handleCheckboxChange} name="autoExpandVehicle" />}
                    label="Automatically expand selected vehicles"
                  />
                  <FormControlLabel
                    control={<Switch checked={tempSettings.showPerfStats} onChange={handleCheckboxChange} name="showPerfStats" />}
                    label="Show performance statistics (FPS)"
                  />
                </Stack>
              </CardContent>
            </Card>

            {/* Container Colors Section */}
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Container Colors
                </Typography>
                <Stack spacing={2}>
                  <FormControlLabel
                    control={<Switch checked={tempSettings.useUnsecureContainerColor} onChange={handleCheckboxChange} name="useUnsecureContainerColor" />}
                    label="Use custom color for unsecured containers"
                  />

                  <Grid2 container spacing={2} sx={{ mt: 1 }}>
                    {containerKeys.map((size: number) => (
                      <Grid2 size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={`${size}-color-setting`}>
                        <Box sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 1,
                          p: 1,
                          border: 1,
                          borderColor: 'divider',
                          borderRadius: 1,
                          backgroundColor: 'background.paper'
                        }}>
                          <Chip
                            label={`${size} SCU`}
                            size="small"
                            variant="filled"
                            sx={{
                              alignSelf: 'center',
                              fontWeight: 'bold',
                              backgroundColor: tempSettings.containerColors[size as keyof ContainerColorsProps],
                              color: 'white',
                              textShadow: '0 0 2px rgba(0,0,0,0.5)'
                            }}
                          />
                          <MuiColorInput
                            format="hex"
                            fallbackValue="#ffffff"
                            value={tempSettings.containerColors[size as keyof ContainerColorsProps]}
                            onChange={(color) => handleColorChange(color, size)}
                            size="small"
                          />
                        </Box>
                      </Grid2>
                    ))}

                    {tempSettings.useUnsecureContainerColor && (
                      <Grid2 size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                        <Box sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 1,
                          p: 1,
                          border: 1,
                          borderColor: 'error.main',
                          borderRadius: 1,
                          backgroundColor: 'background.paper'
                        }}>
                          <Chip
                            label="Unsecured"
                            size="small"
                            variant="filled"
                            sx={{
                              alignSelf: 'center',
                              fontWeight: 'bold',
                              backgroundColor: tempSettings.unsecure_container_color,
                              color: 'white',
                              textShadow: '0 0 2px rgba(0,0,0,0.5)'
                            }}
                          />
                          <MuiColorInput
                            format="hex"
                            fallbackValue="#ffffff"
                            value={tempSettings.unsecure_container_color}
                            onChange={(color) => handleUnsecureColorChange(color)}
                            size="small"
                          />
                        </Box>
                      </Grid2>
                    )}
                  </Grid2>
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Box>
      </DialogContent>
      <Box sx={{
        p: 3,
        borderTop: 1,
        borderColor: 'divider',
        backgroundColor: 'background.default'
      }}>
        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button
            variant="outlined"
            onClick={handleDiscard}
            disabled={!hasPendingChanges}
            startIcon={<UndoIcon />}
          >
            Reset
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!hasPendingChanges}
            startIcon={<SaveIcon />}
          >
            Save Changes
          </Button>
        </Stack>
      </Box>
    </DialogBox>
  );
}