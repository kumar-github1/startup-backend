import {
  Scenario,
  FundingRound,
  CapTableSnapshot,
  CapTableEntry,
  ExitScenario,
  CalculationResult,
} from '../types';

export class FinancialEngine {
  private static readonly INITIAL_SHARES = 10_000_000; // 10M shares initially
  private static readonly ROUNDING_PRECISION = 6;

  /**
   * Calculate complete cap table evolution through all funding rounds
   */
  static calculateCapTable(scenario: Scenario, fundingRounds: FundingRound[]): CalculationResult {
    const validationErrors: string[] = [];
    const capTableSnapshots: CapTableSnapshot[] = [];
    
    try {
      // Start with initial cap table
      let currentCapTable = this.createInitialCapTable(scenario);
      let totalShares = this.INITIAL_SHARES;
      
      // Add initial snapshot
      capTableSnapshots.push({
        roundId: 'initial',
        roundName: 'Initial',
        preMoneyValuation: 0,
        postMoneyValuation: 0,
        entries: currentCapTable,
        totalShares,
      });

      // Process each funding round
      for (const round of fundingRounds) {
        try {
          const result = this.processRound(currentCapTable, round, totalShares);
          currentCapTable = result.capTable;
          totalShares = result.totalShares;
          
          capTableSnapshots.push({
            roundId: round.id,
            roundName: round.name,
            preMoneyValuation: result.preMoneyValuation,
            postMoneyValuation: result.postMoneyValuation,
            entries: currentCapTable,
            totalShares,
          });
        } catch (error) {
          validationErrors.push(`Round ${round.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      // Calculate dilution analysis
      const dilutionAnalysis = this.calculateDilutionAnalysis(scenario, capTableSnapshots);

      // Validate final cap table
      const finalValidation = this.validateCapTable(currentCapTable);
      validationErrors.push(...finalValidation);

      return {
        scenario: {
          ...scenario,
          capTable: capTableSnapshots,
        },
        capTable: capTableSnapshots,
        dilutionAnalysis,
        validationErrors,
      };
    } catch (error) {
      validationErrors.push(`Fatal error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return {
        scenario,
        capTable: capTableSnapshots,
        dilutionAnalysis: [],
        validationErrors,
      };
    }
  }

  /**
   * Create initial cap table from scenario setup
   */
  private static createInitialCapTable(scenario: Scenario): CapTableEntry[] {
    const entries: CapTableEntry[] = [];
    
    // Add founders
    for (const founder of scenario.founders) {
      const shares = Math.round((founder.initialEquity / 100) * this.INITIAL_SHARES);
      entries.push({
        stakeholder: founder.name,
        stakeholderType: 'founder',
        shares,
        equity: this.roundToDecimals(founder.initialEquity, this.ROUNDING_PRECISION),
      });
    }

    // Add initial ESOP if exists
    if (scenario.initialESOP && scenario.initialESOP.poolSize > 0) {
      const shares = Math.round((scenario.initialESOP.poolSize / 100) * this.INITIAL_SHARES);
      entries.push({
        stakeholder: 'ESOP Pool',
        stakeholderType: 'esop',
        shares,
        equity: this.roundToDecimals(scenario.initialESOP.poolSize, this.ROUNDING_PRECISION),
      });
    }

    return entries;
  }

  /**
   * Process a single funding round
   */
  private static processRound(
    currentCapTable: CapTableEntry[],
    round: FundingRound,
    currentTotalShares: number
  ): {
    capTable: CapTableEntry[];
    totalShares: number;
    preMoneyValuation: number;
    postMoneyValuation: number;
  } {
    let newCapTable = [...currentCapTable];
    let totalShares = currentTotalShares;
    let preMoneyValuation = 0;
    let postMoneyValuation = 0;

    // Handle ESOP adjustments first (if pre-money)
    if (round.esopAdjustment && round.esopAdjustment.isPreMoney) {
      const result = this.adjustESOP(newCapTable, round.esopAdjustment.newPoolSize, totalShares, true);
      newCapTable = result.capTable;
      totalShares = result.totalShares;
    }

    if (round.roundType === 'PRICED') {
      const result = this.processPricedRound(newCapTable, round, totalShares);
      newCapTable = result.capTable;
      totalShares = result.totalShares;
      preMoneyValuation = result.preMoneyValuation;
      postMoneyValuation = result.postMoneyValuation;
    } else if (round.roundType === 'SAFE') {
      // SAFE rounds don't immediately dilute - they convert in the next priced round
      // For now, we'll track them as a note and convert at a standard conversion price
      const result = this.processSAFERound(newCapTable, round, totalShares);
      newCapTable = result.capTable;
      totalShares = result.totalShares;
      preMoneyValuation = result.preMoneyValuation;
      postMoneyValuation = result.postMoneyValuation;
    }

    // Handle ESOP adjustments (if post-money)
    if (round.esopAdjustment && !round.esopAdjustment.isPreMoney) {
      const result = this.adjustESOP(newCapTable, round.esopAdjustment.newPoolSize, totalShares, false);
      newCapTable = result.capTable;
      totalShares = result.totalShares;
    }

    // Handle founder secondary sales
    if (round.founderSecondary) {
      newCapTable = this.processFounderSecondary(newCapTable, round.founderSecondary);
    }

    // Recalculate equity percentages
    newCapTable = this.recalculateEquityPercentages(newCapTable, totalShares);

    return {
      capTable: newCapTable,
      totalShares,
      preMoneyValuation,
      postMoneyValuation,
    };
  }

  /**
   * Process a priced funding round
   */
  private static processPricedRound(
    capTable: CapTableEntry[],
    round: FundingRound,
    totalShares: number
  ): {
    capTable: CapTableEntry[];
    totalShares: number;
    preMoneyValuation: number;
    postMoneyValuation: number;
  } {
    if (!round.valuation) {
      throw new Error('Priced round must have valuation');
    }

    const preMoneyValuation = round.isPreMoney ? round.valuation : round.valuation - round.capitalRaised;
    const postMoneyValuation = round.isPreMoney ? round.valuation + round.capitalRaised : round.valuation;
    
    const sharePrice = preMoneyValuation / totalShares;
    const newShares = Math.round(round.capitalRaised / sharePrice);
    const newTotalShares = totalShares + newShares;

    // Add investor to cap table
    const newCapTable = [...capTable];
    const investorEquity = (newShares / newTotalShares) * 100;
    
    newCapTable.push({
      stakeholder: round.investorName,
      stakeholderType: 'investor',
      shares: newShares,
      equity: this.roundToDecimals(investorEquity, this.ROUNDING_PRECISION),
      roundId: round.id,
    });

    return {
      capTable: newCapTable,
      totalShares: newTotalShares,
      preMoneyValuation,
      postMoneyValuation,
    };
  }

  /**
   * Process a SAFE round (simplified conversion)
   */
  private static processSAFERound(
    capTable: CapTableEntry[],
    round: FundingRound,
    totalShares: number
  ): {
    capTable: CapTableEntry[];
    totalShares: number;
    preMoneyValuation: number;
    postMoneyValuation: number;
  } {
    if (!round.safeTerms) {
      throw new Error('SAFE round must have SAFE terms');
    }

    // For SAFE, we need to estimate conversion
    // This is simplified - in reality, SAFEs convert in the next priced round
    const estimatedValuation = round.safeTerms.valuationCap || 10_000_000; // Default if no cap
    const discount = round.safeTerms.discount || 0;
    
    // Calculate effective price per share considering discount
    const baseSharePrice = estimatedValuation / totalShares;
    const effectiveSharePrice = baseSharePrice * (1 - discount / 100);
    
    const newShares = Math.round(round.capitalRaised / effectiveSharePrice);
    const newTotalShares = totalShares + newShares;

    // Add SAFE investor to cap table
    const newCapTable = [...capTable];
    const investorEquity = (newShares / newTotalShares) * 100;
    
    newCapTable.push({
      stakeholder: `${round.investorName} (SAFE)`,
      stakeholderType: 'investor',
      shares: newShares,
      equity: this.roundToDecimals(investorEquity, this.ROUNDING_PRECISION),
      roundId: round.id,
    });

    return {
      capTable: newCapTable,
      totalShares: newTotalShares,
      preMoneyValuation: estimatedValuation,
      postMoneyValuation: estimatedValuation + round.capitalRaised,
    };
  }

  /**
   * Adjust ESOP pool size
   */
  private static adjustESOP(
    capTable: CapTableEntry[],
    newPoolSize: number,
    totalShares: number,
    isPreMoney: boolean
  ): { capTable: CapTableEntry[]; totalShares: number } {
    const newCapTable = [...capTable];
    const esopIndex = newCapTable.findIndex(entry => entry.stakeholderType === 'esop');

    if (isPreMoney) {
      // For pre-money ESOP, we need to calculate new total shares to achieve the target ESOP percentage
      // If ESOP should be X%, then: esopShares / totalNewShares = X/100
      // So: totalNewShares = esopShares / (X/100) = esopShares * 100/X
      // And: esopShares = totalNewShares * X/100
      // Since everyone gets diluted proportionally, we solve for: totalNewShares = totalShares / (1 - X/100)

      const targetESOPPercentage = newPoolSize / 100;
      const newTotalShares = Math.round(totalShares / (1 - targetESOPPercentage));
      const targetShares = Math.round(newTotalShares * targetESOPPercentage);

      if (esopIndex >= 0) {
        // Update existing ESOP pool
        newCapTable[esopIndex].shares = targetShares;
      } else {
        // Create new ESOP pool
        newCapTable.push({
          stakeholder: 'ESOP Pool',
          stakeholderType: 'esop',
          shares: targetShares,
          equity: newPoolSize,
        });
      }

      return {
        capTable: newCapTable,
        totalShares: newTotalShares,
      };
    } else {
      // Post-money ESOP: Issue new shares to achieve target percentage
      const currentESOPShares = esopIndex >= 0 ? capTable[esopIndex].shares : 0;

      // For post-money ESOP: targetShares / (totalShares + additionalShares) = newPoolSize/100
      // Solving for additionalShares: targetShares = (totalShares + additionalShares) * newPoolSize/100
      // We want: currentESOPShares + additionalShares = (totalShares + additionalShares) * newPoolSize/100
      // So: additionalShares = (totalShares * newPoolSize/100 - currentESOPShares) / (1 - newPoolSize/100)

      const targetPercentage = newPoolSize / 100;
      const additionalShares = Math.round(
        (totalShares * targetPercentage - currentESOPShares) / (1 - targetPercentage)
      );

      const finalESOPShares = currentESOPShares + Math.max(0, additionalShares);
      const finalTotalShares = totalShares + Math.max(0, additionalShares);

      if (esopIndex >= 0) {
        // Update existing ESOP pool
        newCapTable[esopIndex].shares = finalESOPShares;
      } else {
        // Create new ESOP pool
        newCapTable.push({
          stakeholder: 'ESOP Pool',
          stakeholderType: 'esop',
          shares: finalESOPShares,
          equity: newPoolSize,
        });
      }

      return {
        capTable: newCapTable,
        totalShares: finalTotalShares,
      };
    }
  }

  /**
   * Process founder secondary sales
   */
  private static processFounderSecondary(
    capTable: CapTableEntry[],
    secondaryTransactions: { founderId: string; sharesAmount: number }[]
  ): CapTableEntry[] {
    const newCapTable = [...capTable];
    
    for (const transaction of secondaryTransactions) {
      const founderIndex = newCapTable.findIndex(
        entry => entry.stakeholderType === 'founder' && entry.stakeholder.includes(transaction.founderId)
      );
      
      if (founderIndex >= 0) {
        newCapTable[founderIndex].shares -= transaction.sharesAmount;
        if (newCapTable[founderIndex].shares < 0) {
          throw new Error(`Founder ${transaction.founderId} cannot sell more shares than owned`);
        }
      }
    }
    
    return newCapTable;
  }

  /**
   * Recalculate equity percentages based on current shares
   */
  private static recalculateEquityPercentages(
    capTable: CapTableEntry[],
    totalShares: number
  ): CapTableEntry[] {
    return capTable.map(entry => ({
      ...entry,
      equity: this.roundToDecimals((entry.shares / totalShares) * 100, this.ROUNDING_PRECISION),
    }));
  }

  /**
   * Calculate dilution analysis for founders
   */
  private static calculateDilutionAnalysis(
    scenario: Scenario,
    capTableSnapshots: CapTableSnapshot[]
  ): CalculationResult['dilutionAnalysis'] {
    const analysis: CalculationResult['dilutionAnalysis'] = [];

    for (const founder of scenario.founders) {
      const founderId = founder.id;
      const founderName = founder.name;
      const initialEquity = founder.initialEquity;

      const roundByRoundDilution = [];
      let previousEquity = initialEquity;

      for (let i = 1; i < capTableSnapshots.length; i++) {
        const snapshot = capTableSnapshots[i];
        const founderEntry = snapshot.entries.find(
          entry => entry.stakeholderType === 'founder' && entry.stakeholder === founderName
        );
        
        const currentEquity = founderEntry ? founderEntry.equity : 0;
        const dilution = this.roundToDecimals(previousEquity - currentEquity, this.ROUNDING_PRECISION);

        roundByRoundDilution.push({
          roundId: snapshot.roundId,
          roundName: snapshot.roundName,
          equityBefore: this.roundToDecimals(previousEquity, this.ROUNDING_PRECISION),
          equityAfter: this.roundToDecimals(currentEquity, this.ROUNDING_PRECISION),
          dilution,
        });

        previousEquity = currentEquity;
      }

      const finalSnapshot = capTableSnapshots[capTableSnapshots.length - 1];
      const finalFounderEntry = finalSnapshot.entries.find(
        entry => entry.stakeholderType === 'founder' && entry.stakeholder === founderName
      );
      const finalEquity = finalFounderEntry ? finalFounderEntry.equity : 0;
      const totalDilution = this.roundToDecimals(initialEquity - finalEquity, this.ROUNDING_PRECISION);

      analysis.push({
        founderId,
        founderName,
        initialEquity: this.roundToDecimals(initialEquity, this.ROUNDING_PRECISION),
        finalEquity: this.roundToDecimals(finalEquity, this.ROUNDING_PRECISION),
        totalDilution,
        roundByRoundDilution,
      });
    }

    return analysis;
  }

  /**
   * Calculate exit returns for all stakeholders
   */
  static calculateExitReturns(
    capTableSnapshot: CapTableSnapshot,
    exitValuation: number
  ): ExitScenario {
    const returns = capTableSnapshot.entries.map(entry => ({
      stakeholder: entry.stakeholder,
      stakeholderType: entry.stakeholderType,
      equity: entry.equity,
      cashReturn: this.roundToDecimals((entry.equity / 100) * exitValuation, 2),
    }));

    return {
      exitValuation,
      returns,
    };
  }

  /**
   * Validate cap table integrity
   */
  private static validateCapTable(capTable: CapTableEntry[]): string[] {
    const errors: string[] = [];
    
    // Check total equity sums to ~100%
    const totalEquity = capTable.reduce((sum, entry) => sum + entry.equity, 0);
    if (Math.abs(totalEquity - 100) > 5.5) {
      errors.push(`Total equity is ${totalEquity.toFixed(2)}%, should be 100%`);
    }

    // Check no negative shares
    const negativeShares = capTable.filter(entry => entry.shares < 0);
    if (negativeShares.length > 0) {
      errors.push(`Negative shares found for: ${negativeShares.map(e => e.stakeholder).join(', ')}`);
    }

    return errors;
  }

  /**
   * Utility function to round to specified decimal places
   */
  private static roundToDecimals(value: number, decimals: number): number {
    return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
  }
}