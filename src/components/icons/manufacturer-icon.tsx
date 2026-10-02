import { useTheme } from "@/lib/theme-provider";

/**
 * Generates the manufacturer icon path based on manufacturer name.
 * @param manufacturerName The manufacturer name to generate path for
 * @returns The formatted path to the manufacturer icon
 */
export const GetManufacturerIconPath = (manufacturerName: string): string => {
  const theme = useTheme();
  return `/${manufacturerName.toLowerCase().replace(/\s+/g, "_").replace("'", '_')}_${theme.isDarkMode ? 'light' : 'dark'}.png`;
};

/**
 * Properties for the ManufacturerIcon component.
 */
export interface ManufacturerIconProps {
  /** The manufacturer name */
  manufacturer: string;
  /** The icon size in pixels (default: 24) */
  size?: number;
  /** Additional CSS styles to apply */
  style?: React.CSSProperties;
  /** Additional CSS class name */
  className?: string;
}

/**
 * Renders a manufacturer icon with consistent styling and error handling.
 * @param props The component props
 * @returns A manufacturer icon component
 */
export const ManufacturerIcon = ({
  manufacturer,
  size = 24,
  style = {},
  className
}: ManufacturerIconProps) => {
  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    // Hide image if it fails to load
    (e.target as HTMLImageElement).style.display = "none";
  };

  return (
    <img
      src={GetManufacturerIconPath(manufacturer)}
      alt={`${manufacturer} logo`}
      className={className}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        marginRight: "8px",
        objectFit: "contain",
        ...style
      }}
      onError={handleError}
    />
  );
};