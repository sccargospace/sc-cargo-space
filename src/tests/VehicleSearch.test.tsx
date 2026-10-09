import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";

import { AppProvider } from "@/app/provider";
import { VehiclePicker } from "@/components/vehicle-picker/vehicle-picker";
import { FilterVehicles } from "@/lib/vehicle-search";
import { VehicleSchemas } from "@/lib/vehicle-schema";
import { SelectedVehicleProps } from "@/lib/selected-vehicle";

afterEach(cleanup);

const constellations = VehicleSchemas.filter(vehicle => vehicle.name.startsWith("Constellation "));

describe("Vehicle search", () => {
  it.each(["Connie", "connie", "CONNIE", "  CoNnIe  "])(
    "finds all Constellation variants with %s",
    query => {
      expect(constellations).toHaveLength(4);
      expect(FilterVehicles(VehicleSchemas, query)).toEqual(constellations);
    }
  );

  it("matches manufacturer names and their alternatives", () => {
    const rsiShips = VehicleSchemas.filter(vehicle => vehicle.manufacturer === "RSI");
    expect(FilterVehicles(VehicleSchemas, "rsi")).toEqual(rsiShips);
    expect(FilterVehicles(VehicleSchemas, "Roberts Space Industries")).toEqual(rsiShips);
    expect(FilterVehicles(VehicleSchemas, "drake")).toEqual(
      VehicleSchemas.filter(vehicle => vehicle.manufacturer === "Drake")
    );
    expect(FilterVehicles(VehicleSchemas, "CO Nomad").map(vehicle => vehicle.name)).toEqual(["Nomad"]);
  });

  it("combines manufacturer, nickname, and ship name in any order", () => {
    const taurus = constellations.filter(vehicle => vehicle.name.includes("Taurus"));
    expect(FilterVehicles(VehicleSchemas, "rsi connie taurus")).toEqual(taurus);
    expect(FilterVehicles(VehicleSchemas, "Taurus   Connie RSI")).toEqual(taurus);
    expect(FilterVehicles(VehicleSchemas, "drake connie")).toEqual([]);
  });

  it("matches previous names without duplicating a ship when multiple names match", () => {
    const ship = { ...VehicleSchemas[0], name: "New name", alternativeNames: ["Old name", "Old nickname"] };
    expect(FilterVehicles([ship], "old")).toEqual([ship]);
    expect(FilterVehicles([ship], "new")).toEqual([ship]);
  });

  it("keeps all ships for blank searches and supports partial canonical names", () => {
    expect(FilterVehicles(VehicleSchemas, "   ")).toEqual(VehicleSchemas);
    expect(FilterVehicles(VehicleSchemas, "constell")).toEqual(constellations);
    expect(FilterVehicles(VehicleSchemas, "no-such-ship")).toEqual([]);
  });
});

describe("Vehicle picker aliases", () => {
  it("shows canonical ship names and selects the actual ship through its nickname", async () => {
    const user = userEvent.setup();
    const onVehiclePicked = vi.fn();
    render(
      <AppProvider>
        <VehiclePicker vehicles={[]} onVehiclePicked={onVehiclePicked} />
      </AppProvider>
    );

    const input = screen.getByRole("combobox", { name: "Add Vehicle" });
    await user.type(input, "Connie");
    expect(screen.getAllByRole("option").map(option => option.textContent)).toEqual(
      constellations.map(vehicle => vehicle.name)
    );

    const taurus = constellations.find(vehicle => vehicle.name.includes("Taurus"))!;
    await user.click(screen.getByRole("option", { name: taurus.name }));
    expect(onVehiclePicked).toHaveBeenCalledExactlyOnceWith(taurus);
    expect(input).toHaveValue("");
  });

  it("keeps already-selected ships disabled when searching by an alias", async () => {
    const user = userEvent.setup();
    const selected: SelectedVehicleProps = {
      schema: constellations[0],
      useUnofficial: false,
      hasCustomContainers: false,
      containerCounts: { 1: 0, 2: 0, 4: 0, 8: 0, 16: 0, 24: 0, 32: 0 },
    };
    const onVehiclePicked = vi.fn();
    render(
      <AppProvider>
        <VehiclePicker vehicles={[selected]} onVehiclePicked={onVehiclePicked} />
      </AppProvider>
    );

    await user.type(screen.getByRole("combobox", { name: "Add Vehicle" }), "connie");
    const option = screen.getByRole("option", { name: selected.schema.name });
    expect(option).toHaveAttribute("aria-disabled", "true");
    expect(onVehiclePicked).not.toHaveBeenCalled();
    expect(screen.getAllByRole("option")).toHaveLength(4);
  });
});
