import type { AppNavItem } from "../primitives/PageShell";

export type AppPageId = "facility" | "collateral" | "draw" | "result" | "history";

export function buildNavItems(current: AppPageId): AppNavItem[] {
  const items: { id: AppPageId; label: string }[] = [
    { id: "facility", label: "Setup" },
    { id: "collateral", label: "Collateral" },
    { id: "draw", label: "Draw" },
    { id: "result", label: "Result" },
    { id: "history", label: "History" },
  ];
  return items.map((item) => ({ ...item, current: item.id === current }));
}
