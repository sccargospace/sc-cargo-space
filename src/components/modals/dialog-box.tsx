import { ReactNode } from "react";
//import { styled } from "@mui/material/styles";
import {
  Dialog, DialogTitle, IconButton,
  SxProps, Theme, styled
} from "@mui/material";
import {
  Close as CloseIcon
} from "@mui/icons-material";

/**
 * Styled dialog component with custom spacing and styling.
 */
const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogContent-root": {
    padding: theme.spacing(2),
  },
  "& .MuiDialogActions-root": {
    padding: theme.spacing(1),
  },
}));

/**
 * Properties for the DialogBox component.
 */
export interface DialogBoxProps {
  /** Title displayed in the dialog header */
  title: string;
  /** Whether the dialog is open */
  open: boolean;
  /** Maximum width of the dialog */
  width?: "xs" | "sm" | "md" | "lg" | "xl";
  /** Whether the dialog should take full width */
  fullWidth?: boolean;
  /** Callback function when dialog is closed */
  onClose: () => void;
  /** Additional styling props */
  sx?: SxProps<Theme>;
  /** Child components to render in the dialog */
  children: ReactNode;
}

/**
 * Reusable dialog component with a title bar and close button.
 * Provides consistent styling and behavior across all modals in the application.
 * @param props Dialog configuration and content
 */
export const DialogBox = (props: DialogBoxProps) => {
  return (
    <BootstrapDialog
      onClose={props.onClose}
      aria-labelledby="customized-dialog-title"
      open={props.open}
      fullWidth={props.fullWidth}
      maxWidth={props.width}
      sx={{
        overflowY: "auto",
        ...props.sx
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
        {props.title}
      </DialogTitle>
      <IconButton
        aria-label="close"
        onClick={props.onClose}
        sx={(theme) => ({
          position: "absolute",
          right: 8,
          top: 8,
          color: theme.palette.grey[500],
        })}
      >
        <CloseIcon />
      </IconButton>
      {props.children}
    </BootstrapDialog>
  );
}