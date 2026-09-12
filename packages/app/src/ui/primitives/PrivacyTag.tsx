import "./primitives.css";

export interface PrivacyTagProps {
  visibility: "private" | "public";
}

export function PrivacyTag({ visibility }: PrivacyTagProps) {
  const isPrivate = visibility === "private";
  return (
    <span className={`privacy-tag privacy-tag--${visibility}`}>
      <span aria-hidden="true">{isPrivate ? "#" : "*"}</span>
      {isPrivate ? "Private" : "Public"}
    </span>
  );
}
