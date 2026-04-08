import { Router } from 'express';
import { getPublicSettings } from '../controllers/settingsController.js';

const router = Router();

// public settings (banner etc.)
router.get('/settings', getPublicSettings);

export default router;
