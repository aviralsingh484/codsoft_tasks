import VegDot from './VegDot';
import { rupees } from '../lib/format';

// one dish, laid out like a printed menu: name ......... price
export default function MenuLine({ item, children }) {
  return (
    <div className={`py-3 ${item.is_available ? '' : 'opacity-60'}`}>
      <div className="flex items-end gap-2">
        <VegDot veg={item.is_veg} />
        <span className="font-semibold leading-tight">{item.name}</span>
        <span className="mb-1 flex-1 border-b border-dotted border-mauve" />
        <span className="font-semibold leading-tight">{rupees(item.price)}</span>
      </div>
      {item.description && (
        <p className="mt-1 max-w-prose pl-6 text-sm text-plum-light">{item.description}</p>
      )}
      {children && <div className="mt-2 pl-6">{children}</div>}
    </div>
  );
}
