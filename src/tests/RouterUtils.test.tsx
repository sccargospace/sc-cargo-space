import { describe, it, expect } from "vitest";
import { ParseVehiclesFromRouter } from "@/lib/router-utils";

describe("RouterUtils", () => {
  describe("ParseVehiclesFromRouter", () => {
    it("parses basic vehicle with official layout (no container specs)", () => {
      const result = ParseVehiclesFromRouter("reclaimer-official");
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        vehicle: "reclaimer",
        official: true,
        containerSizes: undefined // No container specs means use AutoFill
      });
    });

    it("parses basic vehicle with unofficial layout (no container specs)", () => {
      const result = ParseVehiclesFromRouter("reclaimer-unofficial");
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        vehicle: "reclaimer",
        official: false,
        containerSizes: undefined // No container specs means use AutoFill
      });
    });

    it("parses vehicle with custom containers", () => {
      const result = ParseVehiclesFromRouter("reclaimer-official-q1-w2");
      expect(result).toHaveLength(1);
      expect(result[0].vehicle).toBe("reclaimer");
      expect(result[0].official).toBe(true);
      expect(result[0].containerSizes?.get(1)).toBe(1); // q1 = 1 × 1scu
      expect(result[0].containerSizes?.get(2)).toBe(2); // w2 = 2 × 2scu
    });

    it("parses multiple vehicles with mixed configurations", () => {
      const result = ParseVehiclesFromRouter("reclaimer-official-q1-w2,asgard-unofficial");
      expect(result).toHaveLength(2);

      // First vehicle has custom containers
      expect(result[0].vehicle).toBe("reclaimer");
      expect(result[0].official).toBe(true);
      expect(result[0].containerSizes?.get(1)).toBe(1);
      expect(result[0].containerSizes?.get(2)).toBe(2);

      // Second vehicle uses AutoFill
      expect(result[1].vehicle).toBe("asgard");
      expect(result[1].official).toBe(false);
      expect(result[1].containerSizes).toBeUndefined();
    });

    it("parses vehicle with complex name containing hyphens", () => {
      const result = ParseVehiclesFromRouter("hull-c-official-q1");
      expect(result).toHaveLength(1);
      expect(result[0].vehicle).toBe("hull-c");
      expect(result[0].official).toBe(true);
      expect(result[0].containerSizes?.get(1)).toBe(1);
    });

    it("parses all container sizes", () => {
      const result = ParseVehiclesFromRouter("reclaimer-official-q1-w2-e3-r4-t5-y6-u7");
      expect(result).toHaveLength(1);
      expect(result[0].containerSizes?.get(1)).toBe(1);  // q = 1scu
      expect(result[0].containerSizes?.get(2)).toBe(2);  // w = 2scu
      expect(result[0].containerSizes?.get(4)).toBe(3);  // e = 4scu
      expect(result[0].containerSizes?.get(8)).toBe(4);  // r = 8scu
      expect(result[0].containerSizes?.get(16)).toBe(5); // t = 16scu
      expect(result[0].containerSizes?.get(24)).toBe(6); // y = 24scu
      expect(result[0].containerSizes?.get(32)).toBe(7); // u = 32scu
    });

    it("ignores invalid container specifications", () => {
      const result = ParseVehiclesFromRouter("reclaimer-official-q1-x99-w2");
      expect(result).toHaveLength(1);
      expect(result[0].containerSizes?.get(1)).toBe(1);
      expect(result[0].containerSizes?.get(2)).toBe(2);
      expect(result[0].containerSizes?.has(99)).toBe(false);
    });

    it("handles empty input", () => {
      const result = ParseVehiclesFromRouter("");
      expect(result).toHaveLength(0);
    });

    it("handles undefined input", () => {
      const result = ParseVehiclesFromRouter(undefined);
      expect(result).toHaveLength(0);
    });

    it("skips vehicles without layout specification", () => {
      const result = ParseVehiclesFromRouter("reclaimer-q1,asgard-official");
      expect(result).toHaveLength(1);
      expect(result[0].vehicle).toBe("asgard");
      expect(result[0].containerSizes).toBeUndefined();
    });
  });
});