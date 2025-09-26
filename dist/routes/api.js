"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const scenarios_1 = require("../controllers/scenarios");
const router = (0, express_1.Router)();
router.get('/scenarios', scenarios_1.getAllScenarios);
router.get('/scenarios/search', scenarios_1.searchScenarios);
router.get('/scenarios/:id', scenarios_1.getScenario);
router.post('/scenarios', scenarios_1.createScenario);
router.put('/scenarios/:id', scenarios_1.updateScenario);
router.delete('/scenarios/:id', scenarios_1.deleteScenario);
router.post('/calculate', scenarios_1.calculateCapTable);
router.post('/exit-simulation', scenarios_1.calculateExitReturns);
router.get('/stats', scenarios_1.getStats);
exports.default = router;
//# sourceMappingURL=api.js.map