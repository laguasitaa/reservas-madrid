export function nightsBetween(startISO: string, endISO: string): number {
  const start = new Date(`${startISO}T00:00:00Z`);
  const end = new Date(`${endISO}T00:00:00Z`);
  const ms = end.getTime() - start.getTime();
  return Math.max(0, Math.round(ms / (1000 * 60 * 60 * 24)));
}

export function pricePerNight(
  amount: number | null,
  nights: number
): number | null {
  if (amount == null || nights <= 0) return null;
  return amount / nights;
}
