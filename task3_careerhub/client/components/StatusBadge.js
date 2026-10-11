export const STATUSES = ['applied', 'shortlisted', 'interview', 'hired', 'rejected'];

const colors = {
  applied: 'bg-sand-100 text-ink border-sand-300',
  shortlisted: 'bg-amber-100 text-amber-800 border-amber-200',
  interview: 'bg-orange-100 text-orange-800 border-orange-200',
  hired: 'bg-green-100 text-green-800 border-green-200',
  rejected: 'bg-red-100 text-red-800 border-red-200',
  open: 'bg-green-100 text-green-800 border-green-200',
  closed: 'bg-stone-200 text-stone-700 border-stone-300'
};

export default function StatusBadge({ status }) {
  return (
    <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${colors[status]}`}>
      {status}
    </span>
  );
}
