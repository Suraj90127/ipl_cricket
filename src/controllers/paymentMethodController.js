import PaymentMethod from '../models/PaymentMethod.js';

export const getPaymentMethods = async (req, res) => {
  try {
    const methods = await PaymentMethod.find({ user: req.userId });
    res.json(methods);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch payment methods' });
  }
};

export const addPaymentMethod = async (req, res) => {
  try {
    const { type, upiId, accountName, accountNumber, ifsc, isDefault } = req.body;
    
    const method = new PaymentMethod({
      user: req.userId,
      type,
      upiId,
      accountName,
      accountNumber,
      ifsc,
      isDefault: !!isDefault
    });
    if (isDefault) {
      await PaymentMethod.updateMany({ user: req.userId }, { isDefault: false });
    }
    await method.save();
    res.status(201).json(method);
  } catch (err) {
    res.status(400).json({ error: 'Failed to add payment method' });
  }
};

export const setDefaultPaymentMethod = async (req, res) => {
  try {
    await PaymentMethod.updateMany({ user: req.userId }, { isDefault: false });
    const method = await PaymentMethod.findByIdAndUpdate(
      req.params.id,
      { isDefault: true },
      { new: true }
    );
    res.json(method);
  } catch (err) {
    res.status(400).json({ error: 'Failed to set default payment method' });
  }
};

export const deletePaymentMethod = async (req, res) => {
  try {
    await PaymentMethod.deleteOne({ _id: req.params.id, user: req.userId });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: 'Failed to delete payment method' });
  }
};
