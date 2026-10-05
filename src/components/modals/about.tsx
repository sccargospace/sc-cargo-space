import { useState } from "react";
import {
  Box, Typography, Card, CardContent,
  Stack, TableBody, TableRow, TableCell,
  Link, Table, TableHead, TableContainer,
  DialogContent, Button, Chip, Grid2
} from "@mui/material";
import {
  OpenInNew as OpenInNewIcon,
  Reddit as RedditIcon,
  GitHub as GitHubIcon,
  RocketLaunch as RocketIcon,
  Forum as ForumIcon,
  PrivacyTip as PrivacyTipIcon
} from "@mui/icons-material";

//import { StateContext } from "../../lib/State";
import { DialogBox } from "@/components/modals/dialog-box";
import { PrivacyModal } from "@/components/modals/privacy";

/**
 * Properties for a dependency used in the About modal.
 */
interface DependencyProps {
  department: string;
  relatedTo: string;
  name: string;
  licensePeriod: string;
  material: string;
  licenseType: string;
  link: string;
  remoteVersion: string;
  installedVersion: string;
  definedVersion: string;
  author: string;
}
import otherImport from "@/licenses/other.json";
import packagesImport from "@/licenses/packages.json";
const Dependencies: DependencyProps[] = [...otherImport, ...packagesImport];

/**
 * Properties for the About modal component.
 */
export interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}


/**
 * About modal component.
 *
 */
export const AboutModal = ({ isOpen, onClose }: AboutModalProps) => {
  const [privacyOpen, setPrivacyOpen] = useState(false);

  return (
    <>
      <DialogBox
        title="About Cargo Grid Viewer"
        open={isOpen}
        onClose={onClose}
        width="lg"
      >
        <DialogContent dividers sx={{ p: 0 }}>
          <Stack spacing={0}>
            {/* App Info Section */}
            <Card variant="outlined" sx={{ borderRadius: 0, borderLeft: 0, borderRight: 0, borderTop: 0 }}>
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <Box sx={{ mb: 3 }}>
                  <img
                    src="/MadeByTheCommunity_Black.png"
                    alt="Made by the Community"
                    style={{
                      width: '100%',
                      maxWidth: 128,
                      height: 'auto'
                    }}
                  />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                  This is an unofficial Star Citizen fan site, not affiliated with the Cloud Imperium group of companies.
                  All content on this site not authored by its host or users are property of their respective owners.
                </Typography>
              </CardContent>
            </Card>

            {/* Links Section */}
            <Card variant="outlined" sx={{ borderRadius: 0, borderLeft: 0, borderRight: 0 }}>
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Links & Support
                </Typography>

                <Grid2 container spacing={2} justifyContent="center">
                  <Grid2>
                    <Button
                      variant="outlined"
                      onClick={() => {
                        onClose();
                        setPrivacyOpen(true);
                      }}
                      startIcon={<PrivacyTipIcon />}
                      sx={{ minWidth: 140 }}
                    >
                      Privacy Policy
                    </Button>
                  </Grid2>
                  <Grid2>
                    <Button
                      variant="outlined"
                      href="https://www.reddit.com/user/bjax15"
                      target="_blank"
                      rel="noopener noreferrer"
                      startIcon={<RedditIcon />}
                      endIcon={<OpenInNewIcon />}
                      sx={{ minWidth: 140 }}
                    >
                      Reddit
                    </Button>
                  </Grid2>
                  <Grid2>
                    <Button
                      variant="outlined"
                      href="https://robertsspaceindustries.com/community-hub/user/bjax"
                      target="_blank"
                      rel="noopener noreferrer"
                      startIcon={<ForumIcon />}
                      endIcon={<OpenInNewIcon />}
                      sx={{ minWidth: 140 }}
                    >
                      RSI
                    </Button>
                  </Grid2>
                  <Grid2>
                    <Button
                      variant="outlined"
                      href="https://www.robertsspaceindustries.com/enlist?referral=STAR-CB9X-6C5M"
                      target="_blank"
                      rel="noopener noreferrer"
                      startIcon={<RocketIcon />}
                      endIcon={<OpenInNewIcon />}
                      sx={{ minWidth: 140 }}
                    >
                      Referral Code: STAR-CB9X-6C5M
                    </Button>
                  </Grid2>
                  <Grid2>
                    <Button
                      variant="outlined"
                      href="https://github.com/sccargospace/sc-cargo.space"
                      target="_blank"
                      rel="noopener noreferrer"
                      startIcon={<GitHubIcon />}
                      endIcon={<OpenInNewIcon />}
                      sx={{ minWidth: 140 }}
                    >
                      GitHub
                    </Button>
                  </Grid2>
                </Grid2>
              </CardContent>
            </Card>

            {/* Dependencies Section */}
            <Card variant="outlined" sx={{ borderRadius: 0, borderLeft: 0, borderRight: 0, borderBottom: 0 }}>
              <CardContent sx={{ py: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Acknowledgments
                </Typography>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  This project was made possible with the following open source libraries and resources:
                </Typography>

                <TableContainer sx={{ maxHeight: 400 }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Package</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>License</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Author</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Link</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Dependencies.map((dependency, index) => (
                        <TableRow key={`dep-${index}`} hover>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                              {dependency.name}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={dependency.licenseType}
                              size="small"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {dependency.author}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {dependency.link && (
                              <Link
                                href={dependency.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                sx={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 0.5,
                                  fontSize: '0.875rem'
                                }}
                              >
                                View
                                <OpenInNewIcon fontSize="inherit" />
                              </Link>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Stack>
        </DialogContent>
      </DialogBox>
      <PrivacyModal
        isOpen={privacyOpen}
        onClose={() => setPrivacyOpen(false)}
      />
    </>
  );
};
