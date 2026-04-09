import { format } from '../../utils/format.js';
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react';

export default function TransactionCard({ tx }) {
  const isCredit = tx.amount > 0;
  
  return (
    <div className="flex items-center justify-between p-4 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl mb-3 shadow-lg hover:bg-white/10 transition-colors">
      <div className="flex items-center gap-3">
        <div className={`p-2.5 rounded-2xl border border-white/5 ${isCredit ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
          {isCredit ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
        </div>
        <div>
          <p className="font-bold text-white capitalize leading-tight">{tx.type}</p>
          <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">{format.dateTime(tx.date)}</p>
        </div>
      </div>
      <div className="text-right">
        <p className={`font-bold text-lg tracking-tight ${isCredit ? 'text-emerald-400' : 'text-white'}`}>
          {isCredit ? '+' : '-'}₹{Math.abs(tx.amount).toFixed(2)}
        </p>
        <p className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${tx.status === 'completed' || tx.status === 'done' || tx.status === 'approved' ? 'text-emerald-400/60' : 'text-amber-400'}`}>
          {tx.status}
        </p>
      </div>
    </div>
  );
}
