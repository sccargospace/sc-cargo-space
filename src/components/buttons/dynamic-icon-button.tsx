import { ReactNode } from "react";
import {
  IconButton, Tooltip,
} from "@mui/material";

import { IsMobile } from "@/lib/util";

/**
 * Properties for the DynamicIconButton component.
 */
export interface DynamicIconButtonProps {
  tooltipPlacement: "top" | "bottom" | "left" | "right";
  tooltipText: string;
  buttonLabel: string;
  onClick: () => void;
  children: ReactNode;
};

/**
 * Reusable button component that sets size based on space.
 */
export const DynamicIconButton = (props: DynamicIconButtonProps) => {
  const size = IsMobile() ? "small" : "medium";
  return (
    <Tooltip title={props.tooltipText} placement={props.tooltipPlacement}>
      <IconButton
        aria-label={props.buttonLabel}
        size={size}
        color="default"
        onClick={props.onClick}
      >
        {props.children}
      </IconButton>
    </Tooltip>
  );
}