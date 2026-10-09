const styles = {
  placed: 'bg-mauve-light/40 text-plum',
  preparing: 'bg-amber-100 text-amber-900',
  ready: 'bg-green-100 text-green-900',
  completed: 'bg-gray-200 text-gray-700',
  cancelled: 'bg-red-100 text-red-900',
  confirmed: 'bg-green-100 text-green-900',
  paid: 'bg-green-100 text-green-900',
  pending: 'bg-amber-100 text-amber-900',
};

export default function StatusBadge({ status }) {
  return (
    <span className={`inline-block rounded px-2 py-0.5 text-xs font-semibold capitalize ${styles[status] || 'bg-gray-200'}`}>
      {status}
    </span>
  );
}
