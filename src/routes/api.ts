import { Router } from 'express';
import {
  getAllScenarios,
  getScenario,
  createScenario,
  updateScenario,
  deleteScenario,
  calculateCapTable,
  calculateExitReturns,
  searchScenarios,
  getStats,
} from '../controllers/scenarios';

const router = Router();

// Scenario CRUD routes
router.get('/scenarios', getAllScenarios);
router.get('/scenarios/search', searchScenarios);
router.get('/scenarios/:id', getScenario);
router.post('/scenarios', createScenario);
router.put('/scenarios/:id', updateScenario);
router.delete('/scenarios/:id', deleteScenario);

// Calculation routes
router.post('/calculate', calculateCapTable);
router.post('/exit-simulation', calculateExitReturns);

// Stats route
router.get('/stats', getStats);

export default router;