export default function SpainFlag({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 3 2"
      className={className}
      style={{ borderRadius: 2 }}
      aria-label="España"
    >
      <rect width="3" height="2" fill="#AA151B" />
      <rect y="0.5" width="3" height="1" fill="#F1BF00" />
    </svg>
  );
}
