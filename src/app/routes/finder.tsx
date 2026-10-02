import { useReducer, useEffect, useCallback } from "react";
import { useSearchParams, Link as RouterLink } from "react-router-dom";
import {
  Box, Typography, Container, Paper, TextField,
  Button, Chip, Grid2,
  List, ListItem, ListItemText, ListItemIcon,
  Alert, Divider, Link, FormControlLabel, Checkbox,
} from "@mui/material";
import {
  Search as SearchIcon,
  RestartAlt as RestartIcon,
  Launch as LaunchIcon,
} from "@mui/icons-material";

import { FindVehiclesForContainers, FinderResult } from "@/lib/finder";
import { IsMobile } from "@/lib/util";
import { CommunityLogo } from "@/components/icons/community-logo";
import { useCanvas } from "@/lib/canvas-provider";
import { ManufacturerIcon } from "@/components/icons/manufacturer-icon";
import { NormalizedVehicleRouterName } from "@/lib/router-utils";

/**
 * Finder page component that provides search and discovery functionality.
 * Allows users to input container requirements and find suitable vehicles.
 * Supports URL-based sharing of container inputs and results.
 */
export const FinderRoute = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const isMobile = IsMobile();
  const { setVisible } = useCanvas();

  // Hide canvas when FinderPage is mounted
  useEffect(() => {
    setVisible(false);
  }, [setVisible]);

  // Define container keys at the top
  const containerKeys = [1, 2, 4, 8, 16, 24, 32];

  // Initialize state from URL parameters or defaults
  const initializeFromURL = () => {
    const urlInputs: any = {
      1: "0", 2: "0", 4: "0", 8: "0", 16: "0", 24: "0", 32: "0"
    };

    containerKeys.forEach(size => {
      const paramValue = searchParams.get(`c${size}`);
      if (paramValue && !isNaN(parseInt(paramValue))) {
        urlInputs[size] = paramValue;
      }
    });

    return urlInputs;
  };

  // Use simple reducer pattern like VehicleNode
  const [finderState, setFinderState] = useReducer(
    (prev: any, next: any) => ({ ...prev, ...next }),
    {
      ...initializeFromURL(),
      results: [] as FinderResult[],
      hasSearched: false,
      // Filter states
      showConceptShips: true,
      showUnofficialGrids: true,
    }
  );

  /**
   * Gets display name for a vehicle result, hiding "(Official)" text
   */
  const getDisplayName = (result: FinderResult): string => {
    if (result.useUnofficial) {
      return `${result.schema.name} (Unofficial)`;
    } else {
      return result.schema.name; // Don't show "(Official)"
    }
  };

  /**
   * Checks if a vehicle is a concept ship based on its name
   */
  const isConceptShip = (result: FinderResult): boolean => {
    return result.schema.name.toLowerCase().includes('concept');
  };

  /**
   * Applies filters to the search results and sorts by utilization descending
   */
  const getFilteredResults = (): FinderResult[] => {
    return finderState.results
      .filter((result: FinderResult) => {
        // Filter concept ships
        if (!finderState.showConceptShips && isConceptShip(result)) {
          return false;
        }

        // Filter unofficial grids
        if (!finderState.showUnofficialGrids && result.useUnofficial) {
          return false;
        }

        return true;
      })
      .sort((a: FinderResult, b: FinderResult) => b.utilization - a.utilization);
  };

  /**
   * Generates a URL to the viewer page with the current container specifications
   */
  const generateViewerUrl = (result: FinderResult): string => {
    const vehicleName = NormalizedVehicleRouterName(result.schema.name);
    const layoutType = result.useUnofficial ? 'unofficial' : 'official';

    // Build container specifications from current search inputs
    let containerSpecs = '';
    const containerCodes = ['q', 'w', 'e', 'r', 't', 'y', 'u']; // q=1scu, w=2scu, e=4scu, r=8scu, t=16scu, y=24scu, u=32scu

    containerKeys.forEach((size, index) => {
      const count = parseInt(finderState[size]) || 0;
      if (count > 0) {
        containerSpecs += `-${containerCodes[index]}${count}`;
      }
    });

    return `/v1/viewer/${vehicleName}-${layoutType}${containerSpecs}`;
  };

  // Update URL when inputs change
  const updateURL = (inputs: any) => {
    const params = new URLSearchParams();

    containerKeys.forEach(size => {
      const count = parseInt(inputs[size]) || 0;
      if (count > 0) {
        params.set(`c${size}`, count.toString());
      }
    });

    setSearchParams(params, { replace: true });
  };

  // Load from URL on component mount and perform auto-search if containers are specified
  useEffect(() => {
    const urlInputs = initializeFromURL();
    setFinderState(urlInputs);

    // Auto-search if URL contains container parameters
    const hasURLContainers = containerKeys.some(size => {
      const count = parseInt(urlInputs[size]) || 0;
      return count > 0;
    });

    if (hasURLContainers) {
      // Perform search with URL inputs
      const containerSizes = new Map<number, number>();
      containerKeys.forEach(size => {
        const count = parseInt(urlInputs[size]) || 0;
        if (count > 0) {
          containerSizes.set(size, count);
        }
      });

      const searchResults = FindVehiclesForContainers(containerSizes, true);

      setFinderState({
        hasSearched: true,
        results: searchResults
      });
    }
  }, []); // Empty dependency array - only run on mount

  /**
   * Performs a search with the given inputs
   */
  const performSearch = useCallback((inputs: any) => {
    const containerSizes = new Map<number, number>();

    containerKeys.forEach(size => {
      const count = parseInt(inputs[size]) || 0;
      if (count > 0) {
        containerSizes.set(size, count);
      }
    });

    const hasAny = containerKeys.some(size => (parseInt(inputs[size]) || 0) > 0);

    if (hasAny) {
      const searchResults = FindVehiclesForContainers(containerSizes, true);
      setFinderState({
        hasSearched: true,
        results: searchResults
      });
    } else {
      setFinderState({
        hasSearched: false,
        results: []
      });
    }
  }, []);

  /**
   * Handles input changes for container quantities, updates URL, and auto-searches
   */
  const handleContainerInputChange = (size: number, value: string) => {
    const newInputs = {
      ...finderState,
      [size]: value
    };
    setFinderState({ [size]: value });
    updateURL(newInputs);
    performSearch(newInputs);
  };

  /**
   * Calculates total SCU from current inputs
   */
  const getTotalSCU = () => {
    return containerKeys.reduce((total, size) => {
      const count = parseInt(finderState[size]) || 0;
      return total + (size * count);
    }, 0);
  };

  /**
   * Checks if any containers are specified
   */
  const hasContainers = () => {
    return containerKeys.some(size => (parseInt(finderState[size]) || 0) > 0);
  };

  /**
   * Handles resetting all container inputs to their default state
   */
  const handleReset = () => {
    const defaultInputs: any = {
      1: "0", 2: "0", 4: "0", 8: "0", 16: "0", 24: "0", 32: "0"
    };
    setFinderState({
      ...defaultInputs,
      results: [],
      hasSearched: false
    });
    updateURL(defaultInputs);
  };

  return (
    <Box
      sx={{
        backgroundColor: 'background.default',
        minHeight: 'calc(100vh - 56px)',
      }}
    >
      <Container maxWidth="lg" sx={{ py: isMobile ? 2 : 4, px: isMobile ? 2 : 3 }}>
        {/* Container Input Section */}
        <Paper elevation={2} sx={{ p: isMobile ? 2 : 4, mb: isMobile ? 3 : 4 }}>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 3 }}
          >
            Specify the number of containers for each SCU size.
          </Typography>

          <Grid2 container spacing={isMobile ? 1.5 : 2} sx={{ mb: 3 }}>
            {containerKeys.map((size) => (
              <Grid2 size={{ xs: 6, sm: 4, md: 3, lg: 1.7 }} key={size}>
                <TextField
                  size={isMobile ? "medium" : "small"}
                  label={`${size} SCU`}
                  variant="outlined"
                  value={finderState[size]}
                  onChange={(e) => handleContainerInputChange(size, e.target.value)}
                  type="number"
                  inputProps={{ min: 0, max: 999 }}
                  fullWidth
                />
              </Grid2>
            ))}
          </Grid2>

          {/* Summary and Reset */}
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2
          }}>
            {hasContainers() ? (
              <Typography variant="body2" color="text.secondary">
                <strong>Total: {getTotalSCU()} SCU</strong> across{' '}
                {containerKeys.reduce((total, size) => total + (parseInt(finderState[size]) || 0), 0)} containers
              </Typography>
            ) : (
              <Box />
            )}
            <Button
              variant="outlined"
              size="small"
              color="secondary"
              startIcon={<RestartIcon />}
              onClick={handleReset}
              disabled={!hasContainers()}
              sx={{ textTransform: 'none' }}
            >
              Reset
            </Button>
          </Box>
        </Paper>

        {/* Results Section */}
        {finderState.hasSearched && (
          <Paper elevation={2} sx={{ p: isMobile ? 2 : 4 }}>
            {/* Results header with inline filters */}
            <Box sx={{
              display: 'flex',
              alignItems: isMobile ? 'flex-start' : 'center',
              justifyContent: 'space-between',
              flexDirection: isMobile ? 'column' : 'row',
              gap: isMobile ? 1 : 2,
              mb: 2
            }}>
              <Typography
                variant={isMobile ? "h6" : "h5"}
                sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
              >
                <SearchIcon fontSize={isMobile ? "medium" : "large"} sx={{ color: 'text.primary' }} />
                Results ({getFilteredResults().length} of {finderState.results.length})
              </Typography>

              {finderState.results.length > 0 && (
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={finderState.showConceptShips}
                        onChange={(e) => setFinderState({ showConceptShips: e.target.checked })}
                        size="small"
                        color="primary"
                      />
                    }
                    label={<Typography variant="body2">Concepts</Typography>}
                    sx={{ mr: 0 }}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={finderState.showUnofficialGrids}
                        onChange={(e) => setFinderState({ showUnofficialGrids: e.target.checked })}
                        size="small"
                        color="primary"
                      />
                    }
                    label={<Typography variant="body2">Unofficial</Typography>}
                    sx={{ mr: 0 }}
                  />
                </Box>
              )}
            </Box>

            {getFilteredResults().length === 0 ? (
              <Alert severity="warning" sx={{ fontSize: isMobile ? '0.875rem' : '1rem' }}>
                {finderState.results.length === 0
                  ? "No vehicles found that can accommodate your container requirements. Try reducing the number of containers or using smaller container sizes."
                  : "No vehicles match your current filters. Try adjusting the filter settings above."
                }
              </Alert>
            ) : (
              <List sx={{ p: 0 }}>
                {getFilteredResults().map((result: FinderResult, index: number) => (
                  <Box key={`${result.schema.name}-${result.useUnofficial}`}>
                    {index > 0 && <Divider />}
                    <ListItem sx={{
                      py: isMobile ? 1.5 : 1.5,
                      px: isMobile ? 1 : 2,
                      flexDirection: isMobile ? 'column' : 'row',
                      alignItems: isMobile ? 'flex-start' : 'center'
                    }}>
                      <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        flex: 1,
                        minWidth: 0,
                        width: isMobile ? '100%' : 'auto',
                      }}>
                        <ListItemIcon sx={{ minWidth: isMobile ? 36 : 44 }}>
                          <ManufacturerIcon
                            manufacturer={result.schema.manufacturer}
                            size={isMobile ? 24 : 28}
                          />
                        </ListItemIcon>

                        <ListItemText
                          sx={{ flex: 1, my: 0 }}
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                              <Link
                                component={RouterLink}
                                to={generateViewerUrl(result)}
                                variant="body1"
                                sx={{
                                  fontWeight: 600,
                                  textDecoration: 'none',
                                  color: 'primary.main',
                                  '&:hover': { textDecoration: 'underline' }
                                }}
                                title="View in Viewer"
                              >
                                {getDisplayName(result)}
                              </Link>
                              <LaunchIcon sx={{ fontSize: 14, color: 'primary.main', opacity: 0.7 }} />
                              {/* {result.perfectFit && (
                                <Chip label="Perfect Fit" color="success" size="small" />
                              )} */}
                              {isConceptShip(result) && (
                                <Chip label="Concept" color="warning" size="small" variant="outlined" />
                              )}
                              {result.useUnofficial && (
                                <Chip label="Unofficial" color="info" size="small" variant="outlined" />
                              )}
                            </Box>
                          }
                        />
                      </Box>

                      {/* Stats chips */}
                      <Box sx={{
                        display: 'flex',
                        gap: 1,
                        flexWrap: 'wrap',
                        mt: isMobile ? 1 : 0,
                        ml: isMobile ? 4.5 : 0,
                        flexShrink: 0,
                      }}>
                        <Chip
                          label={`${result.utilization.toFixed(0)}%`}
                          variant="outlined"
                          size="small"
                          color={result.utilization > 90 ? 'success' : result.utilization > 50 ? 'primary' : 'default'}
                        />
                        <Chip
                          label={`${result.capacity - result.requestedSCU} SCU free`}
                          variant="outlined"
                          size="small"
                        />
                      </Box>
                    </ListItem>
                  </Box>
                ))}
              </List>
            )}
          </Paper>
        )}
      </Container>

      {/* Made by the community logo - desktop only */}
      {!isMobile && <CommunityLogo />}
    </Box>
  );
};