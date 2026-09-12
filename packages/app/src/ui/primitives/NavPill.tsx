import "./primitives.css";

export interface NavPillItem {
  id: string;
  label: string;
  current?: boolean;
}

export interface NavPillProps {
  items: NavPillItem[];
  onSelect?: (id: string) => void;
}

export function NavPill({ items, onSelect }: NavPillProps) {
  return (
    <nav className="nav-pill" aria-label="Primary">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          className="nav-pill__item"
          aria-current={item.current ? "page" : undefined}
          onClick={() => onSelect?.(item.id)}
        >
          {item.label}
        </button>
      ))}
    </nav>
  );
}
