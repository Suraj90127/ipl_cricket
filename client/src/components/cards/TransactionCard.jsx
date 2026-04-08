import { format } from '../../utils/format.js';
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react';

export default function TransactionCard({ tx }) {
  const isCredit = tx.amount > 0;
  
  return (
    <div className="flex items-center justify-between p-4 rounded-2xl premium-card bg-white border border-slate-100 mb-3">
      <div className="flex items-center gap-3">
        <div className={`p-2.5 rounded-full ${isCredit ? 'bg-emerald-50 text-emerald-500' : 'bg-red-50 text-red-500'}`}>
          {isCredit ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
        </div>
        <div>
          <p className="font-bold text-slate-800 capitalize leading-tight">{tx.type}</p>
          <p className="text-[11px] font-medium text-slate-400 mt-0.5">{format.dateTime(tx.date)}</p>
        </div>
      </div>
      <div className="text-right">
        <p className={`font-bold text-base ${isCredit ? 'text-emerald-500' : 'text-slate-800'}`}>
          {isCredit ? '+' : '-'}₹{Math.abs(tx.amount).toFixed(2)}
        </p>
        <p className={`text-[10px] font-bold uppercase tracking-widest mt-0.5 ${tx.status === 'completed' ? 'text-slate-400' : 'text-amber-500'}`}>
          {tx.status}
        </p>
      </div>
    </div>
  );
}
