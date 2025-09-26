import { Scenario, FundingRound, CapTableSnapshot, ExitScenario, CalculationResult } from '../types';
export declare class FinancialEngine {
    private static readonly INITIAL_SHARES;
    private static readonly ROUNDING_PRECISION;
    static calculateCapTable(scenario: Scenario, fundingRounds: FundingRound[]): CalculationResult;
    private static createInitialCapTable;
    private static processRound;
    private static processPricedRound;
    private static processSAFERound;
    private static adjustESOP;
    private static processFounderSecondary;
    private static recalculateEquityPercentages;
    private static calculateDilutionAnalysis;
    static calculateExitReturns(capTableSnapshot: CapTableSnapshot, exitValuation: number): ExitScenario;
    private static validateCapTable;
    private static roundToDecimals;
}
//# sourceMappingURL=financialEngine.d.ts.map