"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStats = exports.searchScenarios = exports.calculateExitReturns = exports.calculateCapTable = exports.deleteScenario = exports.updateScenario = exports.createScenario = exports.getScenario = exports.getAllScenarios = void 0;
const zod_1 = require("zod");
const database_1 = __importDefault(require("../services/database"));
const financialEngine_1 = require("../services/financialEngine");
const schemas_1 = require("../schemas");
const validation_1 = require("../middleware/validation");
const ParamSchema = zod_1.z.object({
    id: zod_1.z.string(),
});
const getAllScenarios = async (_req, res) => {
    try {
        const scenarios = await database_1.default.getAllScenarios();
        (0, validation_1.sendSuccess)(res, scenarios);
    }
    catch (error) {
        console.error('Error fetching scenarios:', error);
        (0, validation_1.sendError)(res, 'Failed to fetch scenarios');
    }
};
exports.getAllScenarios = getAllScenarios;
const getScenario = async (req, res) => {
    try {
        const { id } = ParamSchema.parse(req.params);
        const scenario = await database_1.default.getScenario(id);
        if (!scenario) {
            (0, validation_1.sendError)(res, 'Scenario not found', 404);
            return;
        }
        (0, validation_1.sendSuccess)(res, scenario);
    }
    catch (error) {
        (0, validation_1.sendError)(res, 'Failed to fetch scenario');
    }
};
exports.getScenario = getScenario;
const createScenario = async (req, res) => {
    try {
        const validatedData = schemas_1.CreateScenarioSchema.parse(req.body);
        const scenario = await database_1.default.createScenario(validatedData);
        (0, validation_1.sendSuccess)(res, scenario, 'Scenario created successfully');
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            const details = error.errors.map(err => ({
                path: err.path.join('.'),
                message: err.message,
            }));
            res.status(400).json({
                success: false,
                error: 'Validation failed',
                details
            });
            return;
        }
        console.error('Error creating scenario:', error);
        (0, validation_1.sendError)(res, 'Failed to create scenario');
    }
};
exports.createScenario = createScenario;
const updateScenario = async (req, res) => {
    try {
        const { id } = ParamSchema.parse(req.params);
        const validatedData = schemas_1.UpdateScenarioSchema.parse(req.body);
        const scenario = await database_1.default.updateScenario(id, validatedData);
        if (!scenario) {
            (0, validation_1.sendError)(res, 'Scenario not found', 404);
            return;
        }
        (0, validation_1.sendSuccess)(res, scenario, 'Scenario updated successfully');
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            (0, validation_1.sendError)(res, 'Validation failed', 400);
            return;
        }
        (0, validation_1.sendError)(res, 'Failed to update scenario');
    }
};
exports.updateScenario = updateScenario;
const deleteScenario = async (req, res) => {
    try {
        const { id } = ParamSchema.parse(req.params);
        const deleted = await database_1.default.deleteScenario(id);
        if (!deleted) {
            (0, validation_1.sendError)(res, 'Scenario not found', 404);
            return;
        }
        (0, validation_1.sendSuccess)(res, null, 'Scenario deleted successfully');
    }
    catch (error) {
        (0, validation_1.sendError)(res, 'Failed to delete scenario');
    }
};
exports.deleteScenario = deleteScenario;
const calculateCapTable = async (req, res) => {
    try {
        const validatedData = schemas_1.CalculateRequestSchema.parse(req.body);
        const scenario = await database_1.default.getScenario(validatedData.scenarioId);
        if (!scenario) {
            (0, validation_1.sendError)(res, 'Scenario not found', 404);
            return;
        }
        const result = financialEngine_1.FinancialEngine.calculateCapTable(scenario, validatedData.fundingRounds);
        await database_1.default.updateScenario(validatedData.scenarioId, {
            fundingRounds: validatedData.fundingRounds,
            capTable: result.capTable,
        });
        (0, validation_1.sendSuccess)(res, result, 'Cap table calculated successfully');
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            (0, validation_1.sendError)(res, 'Validation failed', 400);
            return;
        }
        (0, validation_1.sendError)(res, 'Failed to calculate cap table');
    }
};
exports.calculateCapTable = calculateCapTable;
const calculateExitReturns = async (req, res) => {
    try {
        const validatedData = schemas_1.ExitSimulationSchema.parse(req.body);
        const scenario = await database_1.default.getScenario(validatedData.scenarioId);
        if (!scenario) {
            (0, validation_1.sendError)(res, 'Scenario not found', 404);
            return;
        }
        if (!scenario.capTable || scenario.capTable.length === 0) {
            (0, validation_1.sendError)(res, 'No cap table data found. Please calculate cap table first.', 400);
            return;
        }
        const latestCapTable = scenario.capTable[scenario.capTable.length - 1];
        const exitScenario = financialEngine_1.FinancialEngine.calculateExitReturns(latestCapTable, validatedData.exitValuation);
        (0, validation_1.sendSuccess)(res, exitScenario, 'Exit returns calculated successfully');
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            (0, validation_1.sendError)(res, 'Validation failed', 400);
            return;
        }
        (0, validation_1.sendError)(res, 'Failed to calculate exit returns');
    }
};
exports.calculateExitReturns = calculateExitReturns;
const searchScenarios = async (req, res) => {
    try {
        const query = req.query.q;
        if (!query) {
            (0, validation_1.sendError)(res, 'Search query is required', 400);
            return;
        }
        const scenarios = await database_1.default.searchScenarios(query);
        (0, validation_1.sendSuccess)(res, scenarios);
    }
    catch (error) {
        (0, validation_1.sendError)(res, 'Failed to search scenarios');
    }
};
exports.searchScenarios = searchScenarios;
const getStats = async (_req, res) => {
    try {
        const stats = await database_1.default.getStats();
        (0, validation_1.sendSuccess)(res, stats);
    }
    catch (error) {
        (0, validation_1.sendError)(res, 'Failed to fetch statistics');
    }
};
exports.getStats = getStats;
//# sourceMappingURL=scenarios.js.map