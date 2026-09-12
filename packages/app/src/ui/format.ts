export function formatMinorToDisplay(minor: string, prefix = "$"): string {
  const digitsOnly = minor.replace(/[^0-9]/g, "") || "0";
  const padded = digitsOnly.padStart(3, "0");
  const integerPart = padded.slice(0, -2);
  const decimalPart = padded.slice(-2);
  const withSeparators = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${prefix}${withSeparators}.${decimalPart}`;
}

export function formatBpsToPercent(bps: string): string {
  const digitsOnly = bps.replace(/[^0-9]/g, "") || "0";
  const padded = digitsOnly.padStart(3, "0");
  const integerPart = padded.slice(0, -2);
  const decimalPart = padded.slice(-2);
  return `${integerPart}.${decimalPart}%`;
}

export function truncateMiddle(value: string, visibleStart = 10, visibleEnd = 6): string {
  if (value.length <= visibleStart + visibleEnd + 1) {
    return value;
  }
  return `${value.slice(0, visibleStart)}…${value.slice(-visibleEnd)}`;
}
