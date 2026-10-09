// the usual green / red marker used on Indian menus
export default function VegDot({ veg }) {
  const color = veg ? 'border-green-700' : 'border-red-800';
  const dot = veg ? 'bg-green-700' : 'bg-red-800';
  return (
    <span
      title={veg ? 'Vegetarian' : 'Non-vegetarian'}
      className={`inline-flex h-4 w-4 shrink-0 items-center justify-center border-2 ${color}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
    </span>
  );
}
