import { Router } from 'express';
import { listQuestions, createTemplateQuestions } from '../controllers/questionController.js';

const router = Router();
router.get('/questions/:matchId', listQuestions);
router.post('/questions/:matchId/templates', createTemplateQuestions);

export default router;
