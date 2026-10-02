import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import "@testing-library/jest-dom/vitest";

import { AboutModal } from "@/components/modals/about";
import { AppProvider } from "@/app/provider";

describe("AboutModal", () => {
  it("renders unofficial website notice", () => {
    render(
      <AppProvider>
        <AboutModal isOpen={true} onClose={() => { }} />
      </AppProvider>
    );

    expect(screen.getByText("This is an unofficial Star Citizen fan site, not affiliated with the Cloud Imperium group of companies. All content on this site not authored by its host or users are property of their respective owners.")).toBeInTheDocument();
  });
});