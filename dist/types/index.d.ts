export interface Founder {
    id: string;
    name: string;
    role?: 'CEO' | 'CTO' | 'Co-Founder' | 'Other';
    initialEquity: number;
    currentShares: number;
    currentEquity: number;
}
export interface ESOP {
    poolSize: number;
    isPreMoney: boolean;
    allocatedShares: number;
    availableShares: number;
}
export interface InvestorStake {
    investorName: string;
    shares: number;
    equity: number;
    roundId: string;
}
export interface SAFETerms {
    valuationCap?: number | undefined;
    discount?: number | undefined;
    mfn?: boolean | undefined;
}
export interface FundingRound {
    id: string;
    name: string;
    roundType: 'SAFE' | 'PRICED';
    capitalRaised: number;
    valuation?: number | undefined;
    isPreMoney: boolean;
    safeTerms?: SAFETerms | undefined;
    esopAdjustment?: {
        newPoolSize: number;
        isPreMoney: boolean;
    } | undefined;
    founderSecondary?: {
        founderId: string;
        sharesAmount: number;
    }[] | undefined;
    date: string;
    investorName: string;
}
export interface CapTableEntry {
    stakeholder: string;
    stakeholderType: 'founder' | 'esop' | 'investor';
    shares: number;
    equity: number;
    roundId?: string;
}
export interface CapTableSnapshot {
    roundId: string;
    roundName: string;
    preMoneyValuation: number;
    postMoneyValuation: number;
    entries: CapTableEntry[];
    totalShares: number;
}
export interface ExitScenario {
    exitValuation: number;
    returns: {
        stakeholder: string;
        stakeholderType: 'founder' | 'esop' | 'investor';
        equity: number;
        cashReturn: number;
    }[];
}
export interface Scenario {
    id: string;
    name: string;
    description: string;
    founders: Founder[];
    initialESOP?: ESOP;
    fundingRounds: FundingRound[];
    capTable: CapTableSnapshot[];
    exitScenarios: ExitScenario[];
    createdAt: string;
    updatedAt: string;
}
export interface CalculationResult {
    scenario: Scenario;
    capTable: CapTableSnapshot[];
    dilutionAnalysis: {
        founderId: string;
        founderName: string;
        initialEquity: number;
        finalEquity: number;
        totalDilution: number;
        roundByRoundDilution: {
            roundId: string;
            roundName: string;
            equityBefore: number;
            equityAfter: number;
            dilution: number;
        }[];
    }[];
    validationErrors: string[];
}
export interface CreateScenarioRequest {
    name: string;
    description?: string | undefined;
    founders: Omit<Founder, 'id' | 'currentShares' | 'currentEquity'>[];
    initialESOP?: Omit<ESOP, 'allocatedShares' | 'availableShares'> | undefined;
}
export interface UpdateScenarioRequest extends Partial<CreateScenarioRequest> {
    fundingRounds?: FundingRound[] | undefined;
    capTable?: CapTableSnapshot[] | undefined;
}
export interface CalculateRequest {
    scenarioId: string;
    fundingRounds: FundingRound[];
}
export interface ExitSimulationRequest {
    scenarioId: string;
    exitValuation: number;
}
export interface AuditLogEntry {
    id: string;
    scenarioId: string;
    userId: string;
    action: 'CREATE' | 'UPDATE' | 'DELETE' | 'CALCULATE' | 'EXPORT' | 'VIEW';
    entity: 'SCENARIO' | 'FOUNDER' | 'FUNDING_ROUND' | 'ESOP' | 'CAP_TABLE' | 'EXIT_ANALYSIS' | 'WHAT_IF';
    entityId?: string;
    changes?: {
        field: string;
        oldValue: any;
        newValue: any;
    }[];
    metadata?: {
        userAgent?: string;
        ipAddress?: string;
        timestamp: string;
        duration?: number;
        success: boolean;
        error?: string;
    };
    timestamp: string;
    description: string;
}
export interface CalculationLog {
    id: string;
    scenarioId: string;
    userId: string;
    calculationType: 'CAP_TABLE' | 'DILUTION' | 'EXIT_RETURNS' | 'WHAT_IF' | 'ESOP_ADJUSTMENT';
    inputs: {
        [key: string]: any;
    };
    outputs: {
        [key: string]: any;
    };
    formula?: string;
    executionTime: number;
    timestamp: string;
    version: string;
    success: boolean;
    error?: string;
}
//# sourceMappingURL=index.d.ts.map