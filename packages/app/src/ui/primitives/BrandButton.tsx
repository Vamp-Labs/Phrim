import "./primitives.css";

export interface BrandButtonProps {
  label: string;
  onClick?: () => void;
}

export function BrandButton({ label, onClick }: BrandButtonProps) {
  return (
    <button type="button" className="brand-button" onClick={onClick} aria-label={label}>
      <img src="/assets/logo.webp" alt="" aria-hidden="true" />
    </button>
  );
}
