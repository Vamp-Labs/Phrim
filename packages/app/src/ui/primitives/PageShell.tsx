import type { ReactNode } from "react";
import { AsciiBackground } from "../ascii/AsciiBackground";
import type { ThemeId } from "../ascii/types";
import { BrandButton } from "./BrandButton";
import { NavDrawer } from "./NavDrawer";
import { NavPill } from "./NavPill";
import "./primitives.css";

export interface AppNavItem {
  id: string;
  label: string;
  current?: boolean;
}

export interface PageShellProps {
  themeId: ThemeId;
  title: string;
  navItems: AppNavItem[];
  onNavigate?: (id: string) => void;
  dense?: boolean;
  headerExtra?: ReactNode;
  children: ReactNode;
}

export function PageShell({
  themeId,
  title,
  navItems,
  onNavigate,
  dense = false,
  headerExtra,
  children,
}: PageShellProps) {
  const eyebrow = navItems.find((item) => item.current)?.label ?? "Phrim";

  return (
    <div className="page noise-overlay">
      <AsciiBackground theme={themeId} />
      <div className="page__chrome">
        <header className="app-header">
          <BrandButton label="Phrim home" onClick={() => onNavigate?.("facility")} />
          <div className="app-header__nav-pill">
            <NavPill items={navItems} onSelect={onNavigate} />
          </div>
          {headerExtra !== undefined ? <div className="app-header__extra">{headerExtra}</div> : null}
          <NavDrawer
            items={navItems.map((item) => ({ id: item.id, label: item.label }))}
            onSelect={onNavigate}
          />
        </header>
        <div className={`page__content${dense ? " page__content--dense" : ""}`}>
          <header className="page-title">
            <p className="page-title__eyebrow">
              <span className="page-title__rule" aria-hidden="true" />
              {eyebrow}
            </p>
            <h1 className="page-title__heading">{title}</h1>
          </header>
          {children}
        </div>
      </div>
    </div>
  );
}
