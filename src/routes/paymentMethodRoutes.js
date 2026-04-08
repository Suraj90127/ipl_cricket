import { Router } from 'express';
import { addPaymentMethod, getPaymentMethods, deletePaymentMethod, setDefaultPaymentMethod } from '../controllers/paymentMethodController.js';
import requireAuth from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, getPaymentMethods);
router.post('/', requireAuth, addPaymentMethod);
router.delete('/:id', requireAuth, deletePaymentMethod);
router.patch('/:id/default', requireAuth, setDefaultPaymentMethod);

export default router;
