import { z } from 'zod';

export const FounderSchema = z.object({
  name: z.string().min(1, 'Founder name is required'),
  initialEquity: z.number().min(0).max(100, 'Initial equity must be between 0 and 100%'),
});

export const ESOPSchema = z.object({
  poolSize: z.number().min(0).max(100, 'ESOP pool size must be between 0 and 100%'),
  isPreMoney: z.boolean(),
});

export const SAFETermsSchema = z.object({
  valuationCap: z.number().positive().optional(),
  discount: z.number().min(0).max(100).optional(),
  mfn: z.boolean().optional(),
}).refine(
  (data) => data.valuationCap !== undefined || data.discount !== undefined,
  { message: 'SAFE must have either valuation cap or discount (or both)' }
);

export const FundingRoundSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Round name is required'),
  roundType: z.enum(['SAFE', 'PRICED']),
  capitalRaised: z.number().positive('Capital raised must be positive'),
  valuation: z.number().positive().optional(),
  isPreMoney: z.boolean(),
  safeTerms: SAFETermsSchema.optional(),
  esopAdjustment: z.object({
    newPoolSize: z.number().min(0).max(100),
    isPreMoney: z.boolean(),
  }).optional(),
  founderSecondary: z.array(z.object({
    founderId: z.string(),
    sharesAmount: z.number().positive(),
  })).optional(),
  date: z.string(),
  investorName: z.string().min(1, 'Investor name is required'),
}).refine(
  (data) => {
    if (data.roundType === 'PRICED') {
      return data.valuation !== undefined;
    }
    if (data.roundType === 'SAFE') {
      return data.safeTerms !== undefined;
    }
    return true;
  },
  { message: 'Priced rounds require valuation, SAFE rounds require SAFE terms' }
);

export const CreateScenarioSchema = z.object({
  name: z.string().min(1, 'Scenario name is required'),
  description: z.string().optional(),
  founders: z.array(FounderSchema).min(1, 'At least one founder is required'),
  initialESOP: ESOPSchema.optional(),
}).refine(
  (data) => {
    const foundersEquity = data.founders.reduce((sum, founder) => sum + founder.initialEquity, 0);
    const esopEquity = data.initialESOP?.poolSize || 0;

    // If no ESOP is specified or ESOP pool size is 0, allow founder equity to equal 100%
    // If ESOP is specified with a non-zero pool, total must equal 100%
    if (!data.initialESOP || !data.initialESOP.poolSize || data.initialESOP.poolSize === 0) {
      return Math.abs(foundersEquity - 100) < 0.01;
    }

    return Math.abs(foundersEquity + esopEquity - 100) < 0.01;
  },
  { message: 'Total equity must equal 100%. Either founder equity alone or founder equity plus ESOP must total 100%' }
);

export const UpdateScenarioSchema = z.object({
  name: z.string().min(1, 'Scenario name is required').optional(),
  description: z.string().optional(),
  founders: z.array(FounderSchema).min(1, 'At least one founder is required').optional(),
  initialESOP: ESOPSchema.optional(),
  fundingRounds: z.array(FundingRoundSchema).optional(),
  capTable: z.array(z.any()).optional(), // Allow cap table snapshots
});

export const CalculateRequestSchema = z.object({
  scenarioId: z.string(),
  fundingRounds: z.array(FundingRoundSchema),
});

export const ExitSimulationSchema = z.object({
  scenarioId: z.string(),
  exitValuation: z.number().positive('Exit valuation must be positive'),
});