import { VehicleSchemaProps } from "@/lib/vehicle-schema";

/** Manufacturer aliases live here so they need not be repeated in each ship schema. */
const ManufacturerSearchAliases: Record<string, string[]> = {
  RSI: ["Roberts Space Industries"],
  "Consolidated Outland": ["CO"],
};

/** Match every query word against ship names, aliases, and manufacturer names. */
export const FilterVehicles = (vehicles: VehicleSchemaProps[], query: string) => {
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return vehicles;

  return vehicles.filter(vehicle => {
    const searchableText = [
      vehicle.name,
      ...(vehicle.alternativeNames ?? []),
      ...(vehicle.searchAliases ?? []),
      vehicle.manufacturer,
      ...(ManufacturerSearchAliases[vehicle.manufacturer] ?? []),
    ].join(" ").toLowerCase();

    return words.every(word => searchableText.includes(word));
  });
};
