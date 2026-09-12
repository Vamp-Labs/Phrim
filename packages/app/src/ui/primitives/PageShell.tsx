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
  children: ReactNode;
}

export function PageShell({ themeId, title, navItems, onNavigate, dense = false, children }: PageShellProps) {
  return (
    <div className="page">
      <AsciiBackground theme={themeId} />
      <div className="page__chrome">
        <header className="app-header">
          <BrandButton label="Phrim home" onClick={() => onNavigate?.("facility")} />
          <div className="app-header__nav-pill">
            <NavPill items={navItems} onSelect={onNavigate} />
          </div>
          <NavDrawer
            items={navItems.map((item) => ({ id: item.id, label: item.label }))}
            onSelect={onNavigate}
          />
        </header>
        <div className={`page__content${dense ? " page__content--dense" : ""}`}>
          <h1 className="visually-hidden">{title}</h1>
          {children}
        </div>
      </div>
    </div>
  );
}
