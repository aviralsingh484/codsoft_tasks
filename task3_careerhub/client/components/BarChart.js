// Simple horizontal bar chart made with divs (no chart library needed)
export default function BarChart({ items, color = 'bg-terra-500' }) {
  const max = Math.max(1, ...items.map((i) => i.value));
  if (items.length === 0) return <p className="text-sm text-muted">No data yet</p>;

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.label}>
          <div className="flex justify-between text-sm">
            <span className="capitalize">{item.label}</span>
            <span className="font-medium">{item.value}</span>
          </div>
          <div className="mt-1 h-2.5 rounded bg-sand-100">
            <div className={`h-2.5 rounded ${color}`} style={{ width: (item.value / max) * 100 + '%' }} />
          </div>
        </div>
      ))}
    </div>
  );
}
