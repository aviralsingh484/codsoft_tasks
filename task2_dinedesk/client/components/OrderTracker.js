const steps = [
  { key: 'placed', label: 'Order placed', hint: 'We have your order' },
  { key: 'preparing', label: 'Preparing', hint: 'The kitchen is cooking' },
  { key: 'ready', label: 'Ready', hint: 'Ready to serve or collect' },
  { key: 'completed', label: 'Completed', hint: 'Enjoy your meal' },
];

export default function OrderTracker({ status }) {
  if (status === 'cancelled') {
    return <div className="error-box">This order was cancelled.</div>;
  }

  const currentIndex = steps.findIndex((s) => s.key === status);

  return (
    <ol className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {steps.map((step, index) => {
        const done = index <= currentIndex;
        const current = index === currentIndex;
        return (
          <li key={step.key} className="text-sm">
            <div className={`mb-2 h-2 rounded ${done ? 'bg-plum' : 'bg-cream-dark'}`} />
            <p className={current ? 'font-bold' : done ? 'font-semibold' : 'text-mauve-dark'}>{step.label}</p>
            <p className="text-xs text-mauve-dark">{current ? step.hint : ''}</p>
          </li>
        );
      })}
    </ol>
  );
}
