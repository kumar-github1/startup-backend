import { Request, Response } from 'express';
import { TypedRequest } from '../middleware/validation';
export declare const getAllScenarios: (_req: Request, res: Response) => Promise<void>;
export declare const getScenario: (req: Request, res: Response) => Promise<void>;
export declare const createScenario: (req: TypedRequest, res: Response) => Promise<void>;
export declare const updateScenario: (req: TypedRequest, res: Response) => Promise<void>;
export declare const deleteScenario: (req: Request, res: Response) => Promise<void>;
export declare const calculateCapTable: (req: TypedRequest, res: Response) => Promise<void>;
export declare const calculateExitReturns: (req: TypedRequest, res: Response) => Promise<void>;
export declare const searchScenarios: (req: Request, res: Response) => Promise<void>;
export declare const getStats: (_req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=scenarios.d.ts.map