import { useState } from "react";
import "./primitives.css";

export interface NavDrawerItem {
  id: string;
  label: string;
}

export interface NavDrawerProps {
  items: NavDrawerItem[];
  onSelect?: (id: string) => void;
}

export function NavDrawer({ items, onSelect }: NavDrawerProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="hamburger"
        aria-expanded={open}
        aria-controls="phrim-nav-drawer"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="hamburger__bar hamburger__bar--top" aria-hidden="true" />
        <span className="hamburger__bar hamburger__bar--bottom" aria-hidden="true" />
      </button>
      {open ? (
        <div
          className="drawer-backdrop"
          role="presentation"
          onClick={() => setOpen(false)}
        >
          <div
            id="phrim-nav-drawer"
            className="drawer-sheet"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation"
            onClick={(event) => event.stopPropagation()}
          >
            {items.map((item, index) => (
              <button
                key={item.id}
                type="button"
                className="drawer-sheet__link"
                style={{ animationDelay: `${index * 60}ms` }}
                onClick={() => {
                  setOpen(false);
                  onSelect?.(item.id);
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </>
  );
}
