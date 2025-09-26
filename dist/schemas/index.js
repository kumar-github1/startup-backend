"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExitSimulationSchema = exports.CalculateRequestSchema = exports.UpdateScenarioSchema = exports.CreateScenarioSchema = exports.FundingRoundSchema = exports.SAFETermsSchema = exports.ESOPSchema = exports.FounderSchema = void 0;
const zod_1 = require("zod");
exports.FounderSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Founder name is required'),
    initialEquity: zod_1.z.number().min(0).max(100, 'Initial equity must be between 0 and 100%'),
});
exports.ESOPSchema = zod_1.z.object({
    poolSize: zod_1.z.number().min(0).max(100, 'ESOP pool size must be between 0 and 100%'),
    isPreMoney: zod_1.z.boolean(),
});
exports.SAFETermsSchema = zod_1.z.object({
    valuationCap: zod_1.z.number().positive().optional(),
    discount: zod_1.z.number().min(0).max(100).optional(),
    mfn: zod_1.z.boolean().optional(),
}).refine((data) => data.valuationCap !== undefined || data.discount !== undefined, { message: 'SAFE must have either valuation cap or discount (or both)' });
exports.FundingRoundSchema = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string().min(1, 'Round name is required'),
    roundType: zod_1.z.enum(['SAFE', 'PRICED']),
    capitalRaised: zod_1.z.number().positive('Capital raised must be positive'),
    valuation: zod_1.z.number().positive().optional(),
    isPreMoney: zod_1.z.boolean(),
    safeTerms: exports.SAFETermsSchema.optional(),
    esopAdjustment: zod_1.z.object({
        newPoolSize: zod_1.z.number().min(0).max(100),
        isPreMoney: zod_1.z.boolean(),
    }).optional(),
    founderSecondary: zod_1.z.array(zod_1.z.object({
        founderId: zod_1.z.string(),
        sharesAmount: zod_1.z.number().positive(),
    })).optional(),
    date: zod_1.z.string(),
    investorName: zod_1.z.string().min(1, 'Investor name is required'),
}).refine((data) => {
    if (data.roundType === 'PRICED') {
        return data.valuation !== undefined;
    }
    if (data.roundType === 'SAFE') {
        return data.safeTerms !== undefined;
    }
    return true;
}, { message: 'Priced rounds require valuation, SAFE rounds require SAFE terms' });
exports.CreateScenarioSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Scenario name is required'),
    description: zod_1.z.string().optional(),
    founders: zod_1.z.array(exports.FounderSchema).min(1, 'At least one founder is required'),
    initialESOP: exports.ESOPSchema.optional(),
}).refine((data) => {
    const foundersEquity = data.founders.reduce((sum, founder) => sum + founder.initialEquity, 0);
    const esopEquity = data.initialESOP?.poolSize || 0;
    if (!data.initialESOP || !data.initialESOP.poolSize || data.initialESOP.poolSize === 0) {
        return Math.abs(foundersEquity - 100) < 0.01;
    }
    return Math.abs(foundersEquity + esopEquity - 100) < 0.01;
}, { message: 'Total equity must equal 100%. Either founder equity alone or founder equity plus ESOP must total 100%' });
exports.UpdateScenarioSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Scenario name is required').optional(),
    description: zod_1.z.string().optional(),
    founders: zod_1.z.array(exports.FounderSchema).min(1, 'At least one founder is required').optional(),
    initialESOP: exports.ESOPSchema.optional(),
    fundingRounds: zod_1.z.array(exports.FundingRoundSchema).optional(),
    capTable: zod_1.z.array(zod_1.z.any()).optional(),
});
exports.CalculateRequestSchema = zod_1.z.object({
    scenarioId: zod_1.z.string(),
    fundingRounds: zod_1.z.array(exports.FundingRoundSchema),
});
exports.ExitSimulationSchema = zod_1.z.object({
    scenarioId: zod_1.z.string(),
    exitValuation: zod_1.z.number().positive('Exit valuation must be positive'),
});
//# sourceMappingURL=index.js.map