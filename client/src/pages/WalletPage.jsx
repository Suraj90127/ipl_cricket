import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import WalletCard from '../components/cards/WalletCard.jsx';
import TransactionCard from '../components/cards/TransactionCard.jsx';
import { useWalletStore } from '../store/walletStore.js';
import { DollarSign, CheckCircle2, AlertCircle, ChevronLeft, ChevronRight, IndianRupee } from 'lucide-react';

const PAGE_SIZE = 8;

function PaymentMethodForm({ onAdd, type }) {
  const [upiId, setUpiId] = useState('');
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [message, setMessage] = useState('');
  const { addPaymentMethod } = useWalletStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      await addPaymentMethod({
        type,
        upiId: type === 'upi' ? upiId : undefined,
        accountName: type === 'bank' ? accountName : undefined,
        accountNumber: type === 'bank' ? accountNumber : undefined,
        ifsc: type === 'bank' ? ifsc : undefined,
      });
      setMessage('Added!');
      setUpiId(''); setAccountName(''); setAccountNumber(''); setIfsc('');
      onAdd && onAdd();
    } catch {
      setMessage('Failed to add');
    }
  };

  return (
  <form
  onSubmit={handleSubmit}
  className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-5 space-y-3 shadow-lg"
>

  {/* UPI */}
  {type === "upi" ? (
    <div>
      <label className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-1 block">
        UPI ID
      </label>

      <input
        type="text"
        value={upiId}
        onChange={(e) => setUpiId(e.target.value)}
        placeholder="example@upi"
        required
        className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/20 focus:border-teal-400/50 outline-none transition"
      />
    </div>
  ) : (
    <>
      {/* Account Name */}
      <div>
      
        <input
          type="text"
          value={accountName}
          onChange={(e) => setAccountName(e.target.value)}
          placeholder="Enter account name"
          required
          className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/20 focus:border-teal-400/50 outline-none transition"
        />
      </div>

      {/* Account Number */}
      <div>
       

        <input
          type="text"
          value={accountNumber}
          onChange={(e) => setAccountNumber(e.target.value)}
          placeholder="Enter account number"
          required
          className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/20 focus:border-teal-400/50 outline-none transition"
        />
      </div>

      {/* IFSC */}
      <div>
      

        <input
          type="text"
          value={ifsc}
          onChange={(e) => setIfsc(e.target.value)}
          placeholder="Enter IFSC"
          required
          className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/20 focus:border-teal-400/50 outline-none transition"
        />
      </div>
    </>
  )}

  {/* Submit */}
  <button
    type="submit"
    className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-black font-bold shadow-lg shadow-teal-500/20 hover:scale-[1.02] active:scale-95 transition"
  >
    Add {type === "upi" ? "UPI" : "Bank"} Method
  </button>

  {/* Message */}
  {message && (
    <div className="text-sm text-center text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg py-2">
      {message}
    </div>
  )}

</form>
  );
}

function PaymentMethodPopup({ open, type, onClose, onAdded }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-[#0b1220] border border-white/10 rounded-3xl p-6 w-full max-w-xs shadow-2xl relative animate-slide-up">
        <button onClick={onClose} className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors">x</button>
        <h2 className="text-lg font-bold text-white mb-4">Add {type === 'upi' ? 'UPI' : 'Bank'} Method</h2>
        <PaymentMethodForm type={type} onAdd={onAdded} />
      </div>
    </div>
  );
}

export default function WalletPage() {
  const { balance,user, transactions, fetchTransactions, recharge, withdraw, totalPages, paymentMethods, fetchPaymentMethods, addPaymentMethod } = useWalletStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [amountInput, setAmountInput] = useState('50');
  const [upiId, setUpiId] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState('upi');
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifsc, setIfsc] = useState('');
  // Support ?mode=withdraw in URL
  function getInitialMode() {
    const params = new URLSearchParams(location.search);
    if (params.get('mode') === 'withdraw') return 'withdraw';
    if (params.get('mode') === 'recharge') return 'recharge';
    if (location.state?.mode) return location.state.mode;
    return 'recharge';
  }
  const [mode, setMode] = useState(getInitialMode());
  const [message, setMessage] = useState({ text: '', type: '' });
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchTransactions({ page, limit: PAGE_SIZE });
  }, [page]);

    useEffect(() => {
   window.scrollTo(0, 0);
  }, [user]);
  // If the query string changes, update mode accordingly
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('mode') === 'withdraw' && mode !== 'withdraw') setMode('withdraw');
    if (params.get('mode') === 'recharge' && mode !== 'recharge') setMode('recharge');
  }, [location.search]);

  const handleRecharge = async () => {
    setMessage({ text: '', type: '' });
    const amt = Number(amountInput);
    if (!amt || amt <= 0) {
      setMessage({ text: 'Enter a valid amount', type: 'error' });
      return;
    }
    try {
      await recharge(amt);
      setMessage({ text: 'Recharge requested successfully', type: 'success' });
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    } catch {
      setMessage({ text: 'Recharge failed', type: 'error' });
    }
  };

  const handleWithdraw = async () => {
    setMessage({ text: '', type: '' });
    const amt = Number(amountInput);
    if (!amt || amt <= 0) {
      setMessage({ text: 'Enter a valid amount', type: 'error' });
        setTimeout(() => setMessage({ text: '', type: '' }), 3000);
      return;
    }

    const normalizedUpi = upiId.trim();
    const trimmedAccName = accountName.trim();
    const trimmedAccNo = accountNumber.trim();
    const trimmedIfsc = ifsc.trim();

    // Check if payment method is already saved, if yes, skip manual input validation
    if (withdrawMethod === 'upi') {
      const savedUpi = paymentMethods.find(m => m.type === 'upi');
      if (!savedUpi && !normalizedUpi) {
        setMessage({ text: 'Please enter your UPI ID', type: 'error' });
          setTimeout(() => setMessage({ text: '', type: '' }), 3000);
        return;
      }
    }
    if (withdrawMethod === 'bank') {
      const savedBank = paymentMethods.find(m => m.type === 'bank');
      if (!savedBank && (!trimmedAccName || !trimmedAccNo || !trimmedIfsc)) {
        setMessage({ text: 'Please fill bank name, account and IFSC', type: 'error' });
          setTimeout(() => setMessage({ text: '', type: '' }), 3000);
        return;
      }
    }

    try {
      await withdraw({
        amount: amt,
        method: withdrawMethod,
        upiId: withdrawMethod === 'upi' ? normalizedUpi : undefined,
        accountName: withdrawMethod === 'bank' ? trimmedAccName : undefined,
        accountNumber: withdrawMethod === 'bank' ? trimmedAccNo : undefined,
        ifsc: withdrawMethod === 'bank' ? trimmedIfsc : undefined
      });
      await fetchTransactions({ page, limit: PAGE_SIZE });
      setAmountInput('');
      setUpiId('');
      setAccountName('');
      setAccountNumber('');
      setIfsc('');
      setMessage({ text: 'Withdraw requested successfully', type: 'success' });
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    } catch {
      setMessage({ text: 'Withdraw failed', type: 'error' });
        setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    }
  };

  const handleSubmit = async () => {
    if (mode === 'withdraw') {
      await handleWithdraw();
      return;
    }
    await handleRecharge();
          navigate(`/payment?amount=${amountInput}`);

  };

  // --- Payment method state ---
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [addType, setAddType] = useState('upi');

  // Fetch payment methods
  useEffect(() => {
    fetchPaymentMethods();
  }, [showAddPopup]);

  // Helper: check if UPI/bank exists
  const hasUpi = paymentMethods.some(m => m.type === 'upi');
  const hasBank = paymentMethods.some(m => m.type === 'bank');

const savedUpi = paymentMethods.find(m => m.type === "upi");
const savedBank = paymentMethods.find(m => m.type === "bank");
  // --- Withdraw UI logic ---
  return (
    <div className="space-y-6 pt-2 min-h-screen bg-gradient-to-br from-[#0b1220] via-[#071a1a] to-[#05070f] -mx-4 px-4 pb-20 relative overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-teal-400/10 blur-3xl rounded-full"></div>
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-cyan-400/10 blur-3xl rounded-full"></div>

      <WalletCard
        balance={balance}
        activeMode={mode}
        onSelectMode={(nextMode) => {
          setMode(nextMode);
          setMessage({ text: '', type: '' });
        }}
      />
      
   <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-5 shadow-lg space-y-5 relative z-10">

  {/* Amount */}
  <div>
    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2 block">
      Enter Amount
    </label>

    <div className="relative group">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-teal-400 transition-colors">
        <IndianRupee size={18} />
      </span>

      <input
        type="number"
        value={amountInput}
        onChange={(e) => setAmountInput(e.target.value)}
        placeholder="0.00"
        className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white text-lg font-bold placeholder-white/20 focus:border-teal-400/50 outline-none transition"
      />
    </div>
  </div>


  {/* Withdraw Methods */}
  {mode === "withdraw" && (
    <div className="space-y-3">

      <div className="grid grid-cols-2 gap-3">

        <button
          type="button"
          onClick={() => setWithdrawMethod("upi")}
          className={`py-2.5 rounded-xl text-sm font-bold border transition
          ${
            withdrawMethod === "upi"
              ? "bg-teal-400/20 text-teal-400 border-teal-400/50"
              : "bg-white/5 border-white/10 text-white/40 hover:border-teal-400/30"
          }`}
        >
          UPI
        </button>

        <button
          type="button"
          onClick={() => setWithdrawMethod("bank")}
          className={`py-2.5 rounded-xl text-sm font-bold border transition
          ${
            withdrawMethod === "bank"
              ? "bg-teal-400/20 text-teal-400 border-teal-400/50"
              : "bg-white/5 border-white/10 text-white/40 hover:border-teal-400/30"
          }`}
        >
          Bank Card
        </button>

      </div>


      {/* Add Methods */}
  {withdrawMethod === "upi" && (
  <>
    {savedUpi ? (
      <div className="p-3 rounded-xl border border-white/10 bg-white/5 flex justify-between items-center">
        <div>
          {/* <p className="text-sm font-semibold text-slate-800">Saved UPI</p> */}
          <p className="text-xs font-bold text-white/80">{savedUpi.upiId}</p>
        </div>

        {/* <button
          onClick={() => {
            setAddType("upi");
            setShowAddPopup(true);
          }}
          className="text-xs text-indigo-600 font-semibold"
        >
          Change
        </button> */}
      </div>
    ) : (
      <button
        type="button"
        onClick={() => {
          setAddType("upi");
          setShowAddPopup(true);
        }}
        className="w-full py-2.5 rounded-xl border border-dashed border-white/20 bg-white/5 text-sm font-bold text-white/40 hover:border-teal-400/50 hover:text-teal-400 transition"
      >
        + Add UPI
      </button>
    )}
  </>
)}

   {withdrawMethod === "bank" && (
  <>
    {savedBank ? (
      <div className="p-3 rounded-xl border border-white/10 bg-white/5 flex justify-between items-center">
        <div>
          <p className="text-sm font-bold text-white/80">
            {savedBank.accountName}
          </p>
          <p className="text-xs font-medium text-white/40">
            ****{savedBank.accountNumber?.slice(-4)}
          </p>
        </div>

        {/* <button
          onClick={() => {
            setAddType("bank");
            setShowAddPopup(true);
          }}
          className="text-xs text-indigo-600 font-semibold"
        >
          Change
        </button> */}
      </div>
    ) : (
      <button
        type="button"
        onClick={() => {
          setAddType("bank");
          setShowAddPopup(true);
        }}
        className="w-full py-2.5 rounded-xl border border-dashed border-white/20 bg-white/5 text-sm font-bold text-white/40 hover:border-teal-400/50 hover:text-teal-400 transition"
      >
        + Add Bank Card
      </button>
    )}
  </>
)}

    </div>
  )}


  {/* Submit Button */}
  <button
    onClick={handleSubmit}
    className="w-full py-3 rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-500 text-black font-bold shadow-lg shadow-teal-500/20 hover:scale-[1.02] active:scale-95 transition"
  >
    {mode === "withdraw" ? "Request Withdrawal" : "Add Funds"}
  </button>


  {/* Message */}
  {message.text && (
    <div
      className={`flex items-center gap-2 text-sm font-bold p-3 rounded-xl border
      ${
        message.type === "error"
          ? "bg-red-500/10 text-red-400 border-red-500/20"
          : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
      }`}
    >
      {message.type === "error" ? (
        <AlertCircle size={16} />
      ) : (
        <CheckCircle2 size={16} />
      )}

      {message.text}
    </div>
  )}
</div>

  
      {/* Only show popup if showAddPopup is true */}
      <PaymentMethodPopup
        open={showAddPopup}
        type={addType}
        onClose={() => setShowAddPopup(false)}
        onAdded={() => { setShowAddPopup(false); }}
      />

      <div className="space-y-3 mt-4 relative z-10">
        <div className="flex items-center justify-between px-1 mb-4">
          <h3 className="font-bold text-white text-lg">Recent Transactions</h3>
          {transactions.length > 0 && (
            <span className="text-xs text-white/40 font-bold uppercase tracking-widest">{transactions.length} shown</span>
          )}
        </div>
        {transactions.length > 0 ? (
          <>
            {transactions.map((tx) => (
              <TransactionCard tx={tx} key={tx._id ?? tx.date} />
            ))}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 disabled:opacity-30 hover:border-accent hover:text-accent transition-all"
                >
                  <ChevronLeft size={18} />
                </button>
                <span className="text-sm font-semibold text-slate-600">
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 disabled:opacity-30 hover:border-accent hover:text-accent transition-all"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-10 bg-white/5 rounded-3xl border border-white/10 border-dashed">
            <p className="text-white/40 font-bold tracking-wide">No transactions yet</p>
          </div>
        )}
      </div>

  
    </div>
  );
}
