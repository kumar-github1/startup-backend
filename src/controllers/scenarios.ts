import { Request, Response } from 'express';
import { z } from 'zod';
import database from '../services/database';
import { FinancialEngine } from '../services/financialEngine';
import {
  CreateScenarioSchema,
  UpdateScenarioSchema,
  CalculateRequestSchema,
  ExitSimulationSchema,
} from '../schemas';
import { CreateScenarioRequest, UpdateScenarioRequest } from '../types';
import { sendSuccess, sendError, TypedRequest } from '../middleware/validation';

const ParamSchema = z.object({
  id: z.string(),
});

// GET /api/scenarios
export const getAllScenarios = async (_req: Request, res: Response): Promise<void> => {
  try {
    const scenarios = await database.getAllScenarios();
    sendSuccess(res, scenarios);
  } catch (error) {
    console.error('Error fetching scenarios:', error);
    sendError(res, 'Failed to fetch scenarios');
  }
};

// GET /api/scenarios/:id
export const getScenario = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = ParamSchema.parse(req.params);
    const scenario = await database.getScenario(id);
    
    if (!scenario) {
      sendError(res, 'Scenario not found', 404);
      return;
    }
    
    sendSuccess(res, scenario);
  } catch (error) {
    sendError(res, 'Failed to fetch scenario');
  }
};

// POST /api/scenarios
export const createScenario = async (req: TypedRequest, res: Response): Promise<void> => {
  try {
    const validatedData = CreateScenarioSchema.parse(req.body);
    const scenario = await database.createScenario(validatedData as CreateScenarioRequest);
    sendSuccess(res, scenario, 'Scenario created successfully');
  } catch (error) {
    if (error instanceof z.ZodError) {
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
    sendError(res, 'Failed to create scenario');
  }
};

// PUT /api/scenarios/:id
export const updateScenario = async (req: TypedRequest, res: Response): Promise<void> => {
  try {
    const { id } = ParamSchema.parse(req.params);
    const validatedData = UpdateScenarioSchema.parse(req.body);
    
    const scenario = await database.updateScenario(id, validatedData as UpdateScenarioRequest);
    
    if (!scenario) {
      sendError(res, 'Scenario not found', 404);
      return;
    }
    
    sendSuccess(res, scenario, 'Scenario updated successfully');
  } catch (error) {
    if (error instanceof z.ZodError) {
      sendError(res, 'Validation failed', 400);
      return;
    }
    sendError(res, 'Failed to update scenario');
  }
};

// DELETE /api/scenarios/:id
export const deleteScenario = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = ParamSchema.parse(req.params);
    const deleted = await database.deleteScenario(id);
    
    if (!deleted) {
      sendError(res, 'Scenario not found', 404);
      return;
    }
    
    sendSuccess(res, null, 'Scenario deleted successfully');
  } catch (error) {
    sendError(res, 'Failed to delete scenario');
  }
};

// POST /api/calculate
export const calculateCapTable = async (req: TypedRequest, res: Response): Promise<void> => {
  try {
    const validatedData = CalculateRequestSchema.parse(req.body);
    const scenario = await database.getScenario(validatedData.scenarioId);
    
    if (!scenario) {
      sendError(res, 'Scenario not found', 404);
      return;
    }
    
    const result = FinancialEngine.calculateCapTable(scenario, validatedData.fundingRounds);

    // Update scenario with calculated cap table and funding rounds
    await database.updateScenario(validatedData.scenarioId, {
      fundingRounds: validatedData.fundingRounds,
      capTable: result.capTable,
    } as UpdateScenarioRequest);
    
    sendSuccess(res, result, 'Cap table calculated successfully');
  } catch (error) {
    if (error instanceof z.ZodError) {
      sendError(res, 'Validation failed', 400);
      return;
    }
    sendError(res, 'Failed to calculate cap table');
  }
};

// POST /api/exit-simulation
export const calculateExitReturns = async (req: TypedRequest, res: Response): Promise<void> => {
  try {
    const validatedData = ExitSimulationSchema.parse(req.body);
    const scenario = await database.getScenario(validatedData.scenarioId);
    
    if (!scenario) {
      sendError(res, 'Scenario not found', 404);
      return;
    }
    
    if (!scenario.capTable || scenario.capTable.length === 0) {
      sendError(res, 'No cap table data found. Please calculate cap table first.', 400);
      return;
    }
    
    // Use the latest cap table snapshot
    const latestCapTable = scenario.capTable[scenario.capTable.length - 1];
    const exitScenario = FinancialEngine.calculateExitReturns(latestCapTable, validatedData.exitValuation);
    
    sendSuccess(res, exitScenario, 'Exit returns calculated successfully');
  } catch (error) {
    if (error instanceof z.ZodError) {
      sendError(res, 'Validation failed', 400);
      return;
    }
    sendError(res, 'Failed to calculate exit returns');
  }
};

// GET /api/scenarios/search?q=query
export const searchScenarios = async (req: Request, res: Response): Promise<void> => {
  try {
    const query = req.query.q as string;
    if (!query) {
      sendError(res, 'Search query is required', 400);
      return;
    }
    
    const scenarios = await database.searchScenarios(query);
    sendSuccess(res, scenarios);
  } catch (error) {
    sendError(res, 'Failed to search scenarios');
  }
};

// GET /api/stats
export const getStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    const stats = await database.getStats();
    sendSuccess(res, stats);
  } catch (error) {
    sendError(res, 'Failed to fetch statistics');
  }
};