export function Spinner({ size = 20 }: { size?: number }) {
  return (
    <div
      className="inline-block animate-spin rounded-full border-2 border-slate-200 border-t-slate-600"
      style={{ width: size, height: size }}
    />
  );
}
