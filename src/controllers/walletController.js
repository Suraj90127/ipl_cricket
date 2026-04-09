import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import RechargeHistory from '../models/RechargeHistory.js';
import WithdrawHistory from '../models/WithdrawHistory.js';
import PaymentMethod from '../models/PaymentMethod.js';

export async function recharge(req, res) {
  const { amount } = req.body;
  const user = await User.findById(req.userId);
  // user.balance += Number(amount);
  // await user.save();
  await RechargeHistory.create({ userId: user._id, amount, status: 'pending', date: new Date() });
  const transaction = await Transaction.create({ userId: user._id, amount, type: 'recharge', status: 'pending' });
  res.json({ balance: user.balance, transaction });
}

export async function withdraw(req, res) {
  const { amount, upiId, method = 'upi', accountNumber, ifsc, accountName } = req.body;
  const amt = Number(amount);
  if (!amt || amt <= 0) return res.status(400).json({ message: 'Amount is required' });

  let selectedUpi = '';
  let selectedAccName = '';
  let selectedAccNo = '';
  let selectedIfsc = '';

  

  // If no details in body, try to get from saved payment methods
  if (method === 'upi') {
  
      const upiMethod = await PaymentMethod.findOne({ user: req.userId, type: 'upi' });
      if (upiMethod) selectedUpi = upiMethod.upiId;
    
  }
  if (method === 'bank') {
   
      const bankMethod = await PaymentMethod.findOne({ user: req.userId, type: 'bank' });
      if (bankMethod) {
        selectedAccName = bankMethod.accountName;
        selectedAccNo = bankMethod.accountNumber;
        selectedIfsc = bankMethod.ifsc;
      }
    
  }

  if (method === 'upi') {
    if (!selectedUpi) return res.status(400).json({ message: 'UPI ID is required' });
  } else if (method === 'bank') {
    if (!selectedAccName || !selectedAccNo || !selectedIfsc) return res.status(400).json({ message: 'Bank details are required' });
  } else {
    return res.status(400).json({ message: 'Invalid withdrawal method' });
  }

  const user = await User.findById(req.userId);
  if (user.balance < amt) return res.status(400).json({ message: 'Insufficient balance' });
  user.balance -= amt;
  await user.save();
  const note = method === 'upi'
    ? `UPI: ${selectedUpi}`
    : `Bank: ${selectedAccName} | ${selectedAccNo} | ${selectedIfsc}`;

  await WithdrawHistory.create({
    userId: user._id,
    amount: amt,
    status: 'requested',
    date: new Date(),
    method,
    upiId: method === 'upi' ? selectedUpi : undefined,
    accountName: method === 'bank' ? selectedAccName : undefined,
    accountNumber: method === 'bank' ? selectedAccNo : undefined,
    ifsc: method === 'bank' ? selectedIfsc : undefined
  });
  const transaction = await Transaction.create({
    userId: user._id,
    amount: -amt,
    type: 'withdraw',
    status: 'requested',
    note,
    description: note
  });
  res.json({ balance: user.balance, transaction });
}

export async function transactions(req, res) {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.max(1, Number(req.query.limit) || 10);
  const filter = { userId: req.userId };
  const [txs, total] = await Promise.all([
    Transaction.find(filter).sort({ date: -1 }).skip((page - 1) * limit).limit(limit),
    Transaction.countDocuments(filter)
  ]);
  const user = await User.findById(req.userId);
  res.json({
    balance: user.balance,
    transactions: txs,
    total,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(total / limit))
  });
}
