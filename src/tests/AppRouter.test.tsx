import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useMediaQuery } from "react-responsive";
import "@testing-library/jest-dom/vitest";

import { AppProvider } from "@/app/provider";
import { AppRouter } from "@/app/router";
import { AppNavigation } from "@/app/navigation";
import { useCanvas } from "@/lib/canvas-provider";

// jsdom cannot render WebGL. Keep the real viewer, vehicle loading, and router.
vi.mock("@/components/canvas/canvas", () => ({ Canvas: () => null }));
vi.mock("react-responsive", () => ({ useMediaQuery: vi.fn(() => false) }));

const CanvasState = () => {
  const { state } = useCanvas();
  return (
    <>
      <output aria-label="Canvas vehicle count">{state.vehicles.length}</output>
      <output aria-label="Canvas cargo summary">
        {state.vehicles.map(vehicle => `${vehicle.name}: ${vehicle.size} SCU`).join(", ")}
      </output>
    </>
  );
};

const renderApp = (url = "/") => {
  window.history.replaceState(null, "", url);
  return render(
    <AppProvider>
      <AppNavigation sx={{}} />
      <AppRouter sx={{}} />
      <CanvasState />
    </AppProvider>
  );
};

beforeEach(() => {
  vi.mocked(useMediaQuery).mockReturnValue(false);
});

afterEach(() => {
  cleanup();
  window.history.replaceState(null, "", "/");
});

describe("Viewer routing", () => {
  it.each(["/", "/?source=bookmark", "/#/", "/#/viewer"])(
    "renders an empty viewer at %s without changing the URL",
    (url) => {
      renderApp(url);

      expect(screen.getByRole("combobox", { name: "Add Vehicle" })).toBeInTheDocument();
      expect(screen.getByLabelText("Canvas vehicle count")).toHaveTextContent(/^0$/);
      expect(screen.queryByRole("button", { name: "delete" })).not.toBeInTheDocument();
      expect(window.location.href).toBe(new URL(url, window.location.origin).href);
      expect(screen.getByRole("button", { name: "Viewer" })).toHaveAttribute("aria-current", "page");
      expect(screen.getByRole("button", { name: "Finder" })).not.toHaveAttribute("aria-current");
    }
  );

  it("writes an unversioned URL when adding a ship, restores it on reload, and clears it on removal", async () => {
    const user = userEvent.setup();
    const app = renderApp();

    await user.type(screen.getByRole("combobox", { name: "Add Vehicle" }), "Cutter");
    // Typing in the picker alone must not change the landing URL.
    expect(window.location.hash).toBe("");
    await user.click(await screen.findByRole("option", { name: "Cutter" }));

    expect(window.location.hash).toBe("#/viewer/cutter-official");
    expect(screen.getByLabelText("Canvas vehicle count")).toHaveTextContent(/^1$/);
    expect(screen.getByRole("button", { name: "delete" })).toBeInTheDocument();

    const savedUrl = window.location.href;
    app.unmount();
    renderApp(savedUrl);
    expect(screen.getByLabelText("Canvas vehicle count")).toHaveTextContent(/^1$/);
    expect(window.location.href).toBe(savedUrl);

    await user.click(screen.getByRole("button", { name: "delete" }));
    expect(window.location.hash).toBe("#/viewer");
    expect(screen.getByLabelText("Canvas vehicle count")).toHaveTextContent(/^0$/);
    expect(screen.queryByRole("button", { name: "delete" })).not.toBeInTheDocument();
  });

  it.each(["/#/viewer/reclaimer-official-q1", "/#/v1/viewer/reclaimer-official-q1", "/#reclaimer-official-q1"])(
    "loads ships from the existing link %s",
    async (url) => {
      renderApp(url);

      await waitFor(() => {
        expect(screen.getByLabelText("Canvas vehicle count")).toHaveTextContent(/^1$/);
      });
      expect(screen.getByText("Reclaimer")).toBeInTheDocument();
      expect(window.location.hash).toBe("#/viewer/reclaimer-official-q1");
    }
  );

  it("redirects the old empty viewer link without adding a history entry", async () => {
    const historyLength = window.history.length;
    renderApp("/#/v1/viewer");

    await waitFor(() => expect(window.location.hash).toBe("#/viewer"));
    expect(screen.getByRole("combobox", { name: "Add Vehicle" })).toBeInTheDocument();
    expect(screen.getByLabelText("Canvas vehicle count")).toHaveTextContent(/^0$/);
    expect(window.history.length).toBe(historyLength);
  });

  it.each(["/#/v1/viewer/", "/#"])(
    "preserves multiple ships, layouts, and custom loads from %s",
    async (prefix) => {
      const loadout = "reclaimer-official-q1-w2,cutter-unofficial-q2";
      const historyLength = window.history.length;
      renderApp(`${prefix}${loadout}`);

      await waitFor(() => {
        expect(screen.getByLabelText("Canvas vehicle count")).toHaveTextContent(/^2$/);
      });
      expect(window.location.hash).toBe(`#/viewer/${loadout}`);
      expect(screen.getByLabelText("Canvas cargo summary")).toHaveTextContent("Reclaimer: 5 SCU, Cutter: 2 SCU");
      expect(screen.getByRole("button", { name: "Unofficial" })).toHaveAttribute("aria-pressed", "true");
      expect(window.history.length).toBe(historyLength);
    }
  );

  it("redirects the old Finder route to the unversioned page", async () => {
    renderApp("/#/v1/finder");

    await waitFor(() => expect(window.location.hash).toBe("#/finder"));
    expect(screen.getByRole("button", { name: "Finder" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("spinbutton", { name: "1 SCU" })).toHaveValue(0);
  });

  it("preserves Finder search inputs and generates unversioned result links", async () => {
    const user = userEvent.setup();
    const historyLength = window.history.length;
    renderApp("/#/v1/finder?c1=1&c2=1");

    await waitFor(() => expect(window.location.hash).toBe("#/finder?c1=1&c2=1"));
    expect(screen.getByRole("spinbutton", { name: "1 SCU" })).toHaveValue(1);
    expect(screen.getByRole("spinbutton", { name: "2 SCU" })).toHaveValue(1);
    expect(window.history.length).toBe(historyLength);

    const result = screen.getByRole("link", { name: "Cutter" });
    expect(result).toHaveAttribute("href", "#/viewer/cutter-official-q1-w1");
    await user.click(result);
    expect(window.location.hash).toBe("#/viewer/cutter-official-q1-w1");
    expect(screen.getByLabelText("Canvas cargo summary")).toHaveTextContent("Cutter: 3 SCU");
  });

  it("keeps Finder navigation working from the clean landing URL", async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getByRole("button", { name: "Finder" }));
    expect(window.location.hash).toBe("#/finder");
    expect(screen.getByRole("button", { name: "Finder" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("button", { name: "Viewer" })).not.toHaveAttribute("aria-current");
    expect(screen.queryByRole("combobox", { name: "Add Vehicle" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Viewer" }));
    expect(window.location.hash).toBe("#/viewer");
    expect(screen.getByRole("combobox", { name: "Add Vehicle" })).toBeInTheDocument();
    expect(screen.getByLabelText("Canvas vehicle count")).toHaveTextContent(/^0$/);
  });

  it("marks Viewer as active in the mobile menu without changing the landing URL", async () => {
    vi.mocked(useMediaQuery).mockReturnValue(true);
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getByRole("button", { name: "page navigation" }));
    expect(screen.getByRole("menuitem", { name: "Viewer" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("menuitem", { name: "Finder" })).not.toHaveAttribute("aria-current");
    expect(window.location.hash).toBe("");
    expect(screen.getByLabelText("Canvas vehicle count")).toHaveTextContent(/^0$/);
  });

  it.each(["/#/viewer/cutter-official", "/#/viewer", "/#/finder", "/#/"])(
    "returns Home from %s with a clean URL and an empty viewer",
    async (url) => {
      const user = userEvent.setup();
      renderApp(url);

      const home = screen.getByRole("link", { name: "Cargo Grid Viewer home" });
      expect(home).toHaveAttribute("href", "/");
      await user.click(home);

      expect(window.location.href).toBe(`${window.location.origin}/`);
      expect(screen.getByRole("combobox", { name: "Add Vehicle" })).toBeInTheDocument();
      expect(screen.getByLabelText("Canvas vehicle count")).toHaveTextContent(/^0$/);
      expect(screen.queryByRole("button", { name: "delete" })).not.toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Viewer" })).toHaveAttribute("aria-current", "page");
    }
  );

  it("preserves Back and Forward navigation after returning Home", async () => {
    const user = userEvent.setup();
    renderApp("/#/viewer/cutter-official");
    await user.click(screen.getByRole("link", { name: "Cargo Grid Viewer home" }));

    await act(async () => window.history.back());
    await waitFor(() => {
      expect(window.location.hash).toBe("#/viewer/cutter-official");
      expect(screen.getByLabelText("Canvas vehicle count")).toHaveTextContent(/^1$/);
    });

    await act(async () => window.history.forward());
    await waitFor(() => {
      expect(window.location.href).toBe(`${window.location.origin}/`);
      expect(screen.getByLabelText("Canvas vehicle count")).toHaveTextContent(/^0$/);
    });

    await user.type(screen.getByRole("combobox", { name: "Add Vehicle" }), "Cutter");
    await user.click(await screen.findByRole("option", { name: "Cutter" }));
    expect(window.location.hash).toBe("#/viewer/cutter-official");
    expect(screen.getByLabelText("Canvas vehicle count")).toHaveTextContent(/^1$/);
  });

  it("allows keyboard activation of Home on mobile", async () => {
    vi.mocked(useMediaQuery).mockReturnValue(true);
    const user = userEvent.setup();
    renderApp("/#/viewer/cutter-official");

    screen.getByRole("link", { name: "Cargo Grid Viewer home" }).focus();
    await user.keyboard("{Enter}");

    expect(window.location.href).toBe(`${window.location.origin}/`);
    expect(screen.getByLabelText("Canvas vehicle count")).toHaveTextContent(/^0$/);
  });
});
