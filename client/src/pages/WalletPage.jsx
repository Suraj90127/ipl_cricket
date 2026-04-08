import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
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
  className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-sm"
>

  {/* UPI */}
  {type === "upi" ? (
    <div>
      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">
        UPI ID
      </label>

      <input
        type="text"
        value={upiId}
        onChange={(e) => setUpiId(e.target.value)}
        placeholder="example@upi"
        required
        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
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
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
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
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
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
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        />
      </div>
    </>
  )}

  {/* Submit */}
  <button
    type="submit"
    className="w-full py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition"
  >
    Add {type === "upi" ? "UPI" : "Bank"} Method
  </button>

  {/* Message */}
  {message && (
    <div className="text-sm text-center text-green-600 bg-green-50 rounded-lg py-2">
      {message}
    </div>
  )}

</form>
  );
}

function PaymentMethodPopup({ open, type, onClose, onAdded }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl p-6 w-full max-w-xs shadow-lg relative">
        <button onClick={onClose} className="absolute top-2 right-2 text-slate-400 hover:text-slate-700">&times;</button>
        <h2 className="text-lg font-bold mb-3">Add {type === 'upi' ? 'UPI' : 'Bank'} Method</h2>
        <PaymentMethodForm type={type} onAdd={onAdded} />
      </div>
    </div>
  );
}

export default function WalletPage() {
  const { balance,user, transactions, fetchTransactions, recharge, withdraw, totalPages, paymentMethods, fetchPaymentMethods, addPaymentMethod } = useWalletStore();
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
    <div className="space-y-6 pt-2 ">
      <WalletCard
        balance={balance}
        activeMode={mode}
        onSelectMode={(nextMode) => {
          setMode(nextMode);
          setMessage({ text: '', type: '' });
        }}
      />
      
   <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-5">

  {/* Amount */}
  <div>
    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">
      Enter Amount
    </label>

    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
        <IndianRupee size={18} />
      </span>

      <input
        type="number"
        value={amountInput}
        onChange={(e) => setAmountInput(e.target.value)}
        placeholder="0.00"
        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
          className={`py-2.5 rounded-xl text-sm font-semibold border transition
          ${
            withdrawMethod === "upi"
              ? "bg-indigo-600 text-white border-indigo-600"
              : "bg-slate-50 border-slate-200 text-slate-600 hover:border-indigo-500"
          }`}
        >
          UPI
        </button>

        <button
          type="button"
          onClick={() => setWithdrawMethod("bank")}
          className={`py-2.5 rounded-xl text-sm font-semibold border transition
          ${
            withdrawMethod === "bank"
              ? "bg-indigo-600 text-white border-indigo-600"
              : "bg-slate-50 border-slate-200 text-slate-600 hover:border-indigo-500"
          }`}
        >
          Bank Card
        </button>

      </div>


      {/* Add Methods */}
  {withdrawMethod === "upi" && (
  <>
    {savedUpi ? (
      <div className="p-3 rounded-xl border bg-slate-50 flex justify-between items-center">
        <div>
          {/* <p className="text-sm font-semibold text-slate-800">Saved UPI</p> */}
          <p className="text-xs text-slate-500">{savedUpi.upiId}</p>
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
        className="w-full py-2.5 rounded-xl border border-dashed border-slate-300 text-sm font-semibold text-slate-600 hover:bg-indigo-50 hover:border-indigo-500"
      >
        + Add UPI
      </button>
    )}
  </>
)}

   {withdrawMethod === "bank" && (
  <>
    {savedBank ? (
      <div className="p-3 rounded-xl border bg-slate-50 flex justify-between items-center">
        <div>
          <p className="text-sm font-semibold text-slate-800">
            {savedBank.accountName}
          </p>
          <p className="text-xs text-slate-500">
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
        className="w-full py-2.5 rounded-xl border border-dashed border-slate-300 text-sm font-semibold text-slate-600 hover:bg-indigo-50 hover:border-indigo-500"
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
    className="w-full py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition"
  >
    {mode === "withdraw" ? "Withdraw Money" : "Recharge Wallet"}
  </button>


  {/* Message */}
  {message.text && (
    <div
      className={`flex items-center gap-2 text-sm font-medium p-3 rounded-lg
      ${
        message.type === "error"
          ? "bg-red-50 text-red-600"
          : "bg-green-50 text-green-600"
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

      <div className="space-y-3 mt-4">
        <div className="flex items-center justify-between px-1 mb-4">
          <h3 className="font-bold text-slate-800 text-lg">Recent Transactions</h3>
          {transactions.length > 0 && (
            <span className="text-xs text-slate-400 font-medium">{transactions.length} shown</span>
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
          <div className="text-center py-10 opacity-60 bg-white/50 rounded-2xl border border-slate-100 border-dashed">
            <p className="text-slate-500 font-medium tracking-wide">No transactions yet</p>
          </div>
        )}
      </div>

  
    </div>
  );
}
