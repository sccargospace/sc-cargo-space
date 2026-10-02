import {
  Stack, DialogContent, Typography, Card, CardContent,
  List, ListItem, ListItemIcon, ListItemText, Box
} from "@mui/material";
import {
  Mouse as MouseIcon,
  CameraAlt as CameraIcon,
  DirectionsCar as VehicleIcon,
  PanTool as PanIcon,
  RotateRight as RotateIcon,
  ZoomIn as ZoomIcon,
  TouchApp as TouchIcon
} from "@mui/icons-material";

import { DialogBox } from "./dialog-box";

/**
 * Properties for the Help modal component.
 */
export interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Modal component that displays help information and usage instructions.
 * Provides guidance on camera controls and vehicle interaction with improved UI.
 */
export const HelpModal = ({ isOpen, onClose }: HelpModalProps) => {
  return (
    <DialogBox
      title="Help & Controls"
      open={isOpen}
      onClose={onClose}
      width="md"
      fullWidth={true}
    >
      <DialogContent dividers sx={{ p: 0 }}>
        <Stack spacing={0}>
          {/* Camera Controls Section */}
          <Card variant="outlined" sx={{ borderRadius: 0, borderLeft: 0, borderRight: 0, borderTop: 0 }}>
            <CardContent sx={{ py: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <CameraIcon color="primary" />
                <Typography variant="h6" component="h3">
                  Camera Controls
                </Typography>
              </Box>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Navigate around your vehicle using these camera controls:
              </Typography>

              <List disablePadding>
                <ListItem disablePadding sx={{ mb: 1 }}>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <PanIcon color="action" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="body1">
                        <Typography component="span" sx={{ fontWeight: 600 }}>Pan camera:</Typography> Left mouse button [Hold]
                      </Typography>
                    }
                    secondary="Click and drag to move the camera view around"
                  />
                </ListItem>

                <ListItem disablePadding sx={{ mb: 1 }}>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <RotateIcon color="action" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="body1">
                        <Typography component="span" sx={{ fontWeight: 600 }}>Rotate camera:</Typography> Right mouse button [Hold]
                      </Typography>
                    }
                    secondary="Click and drag to rotate the camera around the vehicle"
                  />
                </ListItem>

                <ListItem disablePadding>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <ZoomIcon color="action" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="body1">
                        <Typography component="span" sx={{ fontWeight: 600 }}>Zoom camera:</Typography> Scroll wheel
                      </Typography>
                    }
                    secondary="Use mouse wheel to zoom in and out of the vehicle"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>

          {/* Vehicle Interaction Section */}
          <Card variant="outlined" sx={{ borderRadius: 0, borderLeft: 0, borderRight: 0 }}>
            <CardContent sx={{ py: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <VehicleIcon color="primary" />
                <Typography variant="h6" component="h3">
                  Vehicle Interaction
                </Typography>
              </Box>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Interact with containers and vehicle components:
              </Typography>

              <List disablePadding>
                <ListItem disablePadding>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <TouchIcon color="action" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="body1">
                        <Typography component="span" sx={{ fontWeight: 600 }}>Drag containers:</Typography> Left mouse button [Hold]
                      </Typography>
                    }
                    secondary="Click and drag containers to move them around the cargo grid"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>

          {/* Tips Section */}
          <Card variant="outlined" sx={{ borderRadius: 0, borderLeft: 0, borderRight: 0, borderBottom: 0 }}>
            <CardContent sx={{ py: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <MouseIcon color="primary" />
                <Typography variant="h6" component="h3">
                  Tips & Tricks
                </Typography>
              </Box>

              <List disablePadding>
                <ListItem disablePadding sx={{ mb: 1 }}>
                  <ListItemText
                    primary="Use the Vehicle Finder to discover ships that can fit your container requirements"
                    sx={{
                      '& .MuiListItemText-primary': {
                        fontSize: '0.875rem',
                        color: 'text.secondary'
                      }
                    }}
                  />
                </ListItem>

                <ListItem disablePadding sx={{ mb: 1 }}>
                  <ListItemText
                    primary="Switch between official and unofficial grid layouts in the settings"
                    sx={{
                      '& .MuiListItemText-primary': {
                        fontSize: '0.875rem',
                        color: 'text.secondary'
                      }
                    }}
                  />
                </ListItem>

                <ListItem disablePadding>
                  <ListItemText
                    primary="Share your cargo configurations by copying the URL - it includes your container setup"
                    sx={{
                      '& .MuiListItemText-primary': {
                        fontSize: '0.875rem',
                        color: 'text.secondary'
                      }
                    }}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Stack>
      </DialogContent>
    </DialogBox>
  );
};