import {
  useState
} from "react";
import {
  Box, MenuItem, SxProps,
  Stack, IconButton, Tooltip,
  Divider, Button, Menu,
} from "@mui/material";
import {

} from "@mui/material";
import {
  Settings as SettingsIcon,
  Info as InfoIcon,
  Help as HelpIcon,
  GridView as ViewerIcon,
  Search as FinderIcon,
  Menu as MenuIcon
} from "@mui/icons-material";
import { useLocation, useNavigate } from "react-router-dom";

import { IsMobile } from "@/lib/util";
import { DynamicIconButton } from "@/components/buttons/dynamic-icon-button";
import { AppIcon } from "@/components/icons/app-icon";
import { SettingsModal } from "@/components/modals/settings";
import { AboutModal } from "@/components/modals/about";
import { HelpModal } from "@/components/modals/help";

/**
 * Page navigation component for desktop users.
 * Displays navigation buttons for different app pages.
 */
const PageNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  //const { updateState } = useContext(StateContext);

  /**
   * Determines if a route is currently active.
   * @param route The route to check
   * @returns True if the route is active
   */
  const isActiveRoute = (route: string) => {
    return location.pathname.startsWith(route)
      || (route === '/v1/viewer' && location.pathname === '/');
  };

  /**
   * Handles navigation to a new page.
   * Clears selected vehicles when navigating away from the Viewer page.
   * @param route The route to navigate to
   */
  const handleNavigation = (route: string) => {
    // If navigating away from the viewer page, clear selected vehicles
    if (isActiveRoute('/v1/viewer') && !route.startsWith('/v1/viewer')) {
      // updateState({
      //   selectedVehicles: []
      // });
    }
    navigate(route);
  };

  return (
    <Stack
      direction="row"
      spacing={1}
      sx={{
        alignItems: "center",
      }}
    >
      <Button
        variant={isActiveRoute('/v1/viewer') ? 'contained' : 'text'}
        aria-current={isActiveRoute('/v1/viewer') ? 'page' : undefined}
        size="small"
        startIcon={<ViewerIcon />}
        onClick={() => handleNavigation('/v1/viewer')}
        sx={{
          textTransform: 'none',
          fontWeight: isActiveRoute('/v1/viewer') ? 600 : 400,
        }}
      >
        Viewer
      </Button>

      <Button
        variant={isActiveRoute('/v1/finder') ? 'contained' : 'text'}
        aria-current={isActiveRoute('/v1/finder') ? 'page' : undefined}
        size="small"
        startIcon={<FinderIcon />}
        onClick={() => handleNavigation('/v1/finder')}
        sx={{
          textTransform: 'none',
          fontWeight: isActiveRoute('/v1/finder') ? 600 : 400,
        }}
      >
        Finder
      </Button>
    </Stack>
  );
};

/**
 * Mobile page navigation component that displays a menu with page options.
 */
const MobilePageNavigation = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const open = Boolean(anchorEl);

  /**
   * Determines if a route is currently active.
   * @param route The route to check
   * @returns True if the route is active
   */
  const isActiveRoute = (route: string) => {
    return location.pathname.startsWith(route)
      || (route === '/v1/viewer' && location.pathname === '/');
  };

  /**
   * Handles navigation to a new page.
   * Clears selected vehicles when navigating away from the Viewer page.
   * @param route The route to navigate to
   */
  const handleNavigation = (route: string) => {
    // If navigating away from the viewer page, clear selected vehicles
    if (isActiveRoute('/v1/viewer') && !route.startsWith('/v1/viewer')) {
      // updateState({
      //   selectedVehicles: []
      // });
    }
    navigate(route);
    setAnchorEl(null); // Close menu after navigation
  };

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Tooltip title="Pages" placement="bottom">
        <IconButton
          aria-label="page navigation"
          size="small"
          color="default"
          onClick={handleClick}
        >
          <MenuIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <MenuItem
          onClick={() => handleNavigation('/v1/viewer')}
          selected={isActiveRoute('/v1/viewer')}
          aria-current={isActiveRoute('/v1/viewer') ? 'page' : undefined}
        >
          <ViewerIcon sx={{ mr: 1 }} />
          Viewer
        </MenuItem>
        <MenuItem
          onClick={() => handleNavigation('/v1/finder')}
          selected={isActiveRoute('/v1/finder')}
          aria-current={isActiveRoute('/v1/finder') ? 'page' : undefined}
        >
          <FinderIcon sx={{ mr: 1 }} />
          Finder
        </MenuItem>
      </Menu>
    </>
  );
};



export interface AppNavigationProps {
  sx: SxProps;
}

/**
 * Mobile navigation component that provides a collapsible interface for vehicle selection
 * and management on mobile devices. Toggles between canvas view and navigation controls.
 */
export const AppNavigation = ({ sx }: AppNavigationProps) => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const size = IsMobile() ? "small" : "medium";

  return (
    <>
      <Box
        sx={sx}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            minHeight: "56px", // Ensure consistent height
            padding: "0 8px", // Reduce padding for more space
            justifyContent: 'space-between', // Distribute space evenly
          }}
        >
          {/* Logo with Mobile Menu */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Mobile Page Navigation - Mobile only */}
            {IsMobile() && <MobilePageNavigation />}

            <AppIcon />
          </Box>

          {/* Page Navigation - Desktop only */}
          {!IsMobile() && (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <PageNavigation />
            </Box>
          )}

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Stack
              direction="row"
              spacing={0.5} // Reduced spacing for mobile
              divider={<Divider orientation="vertical" flexItem />}
              sx={{
                alignItems: "center",
              }}
            >
              <DynamicIconButton
                tooltipText="Settings"
                buttonLabel="settings"
                tooltipPlacement="bottom"
                onClick={() => {
                  setSettingsOpen(true);
                }}
              >
                <SettingsIcon fontSize={size} />
              </DynamicIconButton>

              <DynamicIconButton
                tooltipText="About"
                buttonLabel="about"
                tooltipPlacement="bottom"
                onClick={() => {
                  setAboutOpen(true);
                }}
              >
                <InfoIcon fontSize={size} />
              </DynamicIconButton>

              <DynamicIconButton
                tooltipText="Help"
                buttonLabel="help"
                tooltipPlacement="bottom"
                onClick={() => {
                  setHelpOpen(true);
                }}
              >
                <HelpIcon fontSize={size} />
              </DynamicIconButton>
            </Stack>
          </Box>
        </Box>
      </Box>

      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
      <AboutModal
        isOpen={aboutOpen}
        onClose={() => setAboutOpen(false)}
      />
      <HelpModal
        isOpen={helpOpen}
        onClose={() => setHelpOpen(false)}
      />
    </>
  );
}
