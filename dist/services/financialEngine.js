"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FinancialEngine = void 0;
class FinancialEngine {
    static calculateCapTable(scenario, fundingRounds) {
        const validationErrors = [];
        const capTableSnapshots = [];
        try {
            let currentCapTable = this.createInitialCapTable(scenario);
            let totalShares = this.INITIAL_SHARES;
            capTableSnapshots.push({
                roundId: 'initial',
                roundName: 'Initial',
                preMoneyValuation: 0,
                postMoneyValuation: 0,
                entries: currentCapTable,
                totalShares,
            });
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
                }
                catch (error) {
                    validationErrors.push(`Round ${round.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
                }
            }
            const dilutionAnalysis = this.calculateDilutionAnalysis(scenario, capTableSnapshots);
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
        }
        catch (error) {
            validationErrors.push(`Fatal error: ${error instanceof Error ? error.message : 'Unknown error'}`);
            return {
                scenario,
                capTable: capTableSnapshots,
                dilutionAnalysis: [],
                validationErrors,
            };
        }
    }
    static createInitialCapTable(scenario) {
        const entries = [];
        for (const founder of scenario.founders) {
            const shares = Math.round((founder.initialEquity / 100) * this.INITIAL_SHARES);
            entries.push({
                stakeholder: founder.name,
                stakeholderType: 'founder',
                shares,
                equity: this.roundToDecimals(founder.initialEquity, this.ROUNDING_PRECISION),
            });
        }
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
    static processRound(currentCapTable, round, currentTotalShares) {
        let newCapTable = [...currentCapTable];
        let totalShares = currentTotalShares;
        let preMoneyValuation = 0;
        let postMoneyValuation = 0;
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
        }
        else if (round.roundType === 'SAFE') {
            const result = this.processSAFERound(newCapTable, round, totalShares);
            newCapTable = result.capTable;
            totalShares = result.totalShares;
            preMoneyValuation = result.preMoneyValuation;
            postMoneyValuation = result.postMoneyValuation;
        }
        if (round.esopAdjustment && !round.esopAdjustment.isPreMoney) {
            const result = this.adjustESOP(newCapTable, round.esopAdjustment.newPoolSize, totalShares, false);
            newCapTable = result.capTable;
            totalShares = result.totalShares;
        }
        if (round.founderSecondary) {
            newCapTable = this.processFounderSecondary(newCapTable, round.founderSecondary);
        }
        newCapTable = this.recalculateEquityPercentages(newCapTable, totalShares);
        return {
            capTable: newCapTable,
            totalShares,
            preMoneyValuation,
            postMoneyValuation,
        };
    }
    static processPricedRound(capTable, round, totalShares) {
        if (!round.valuation) {
            throw new Error('Priced round must have valuation');
        }
        const preMoneyValuation = round.isPreMoney ? round.valuation : round.valuation - round.capitalRaised;
        const postMoneyValuation = round.isPreMoney ? round.valuation + round.capitalRaised : round.valuation;
        const sharePrice = preMoneyValuation / totalShares;
        const newShares = Math.round(round.capitalRaised / sharePrice);
        const newTotalShares = totalShares + newShares;
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
    static processSAFERound(capTable, round, totalShares) {
        if (!round.safeTerms) {
            throw new Error('SAFE round must have SAFE terms');
        }
        const estimatedValuation = round.safeTerms.valuationCap || 10000000;
        const discount = round.safeTerms.discount || 0;
        const baseSharePrice = estimatedValuation / totalShares;
        const effectiveSharePrice = baseSharePrice * (1 - discount / 100);
        const newShares = Math.round(round.capitalRaised / effectiveSharePrice);
        const newTotalShares = totalShares + newShares;
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
    static adjustESOP(capTable, newPoolSize, totalShares, isPreMoney) {
        const newCapTable = [...capTable];
        const esopIndex = newCapTable.findIndex(entry => entry.stakeholderType === 'esop');
        if (isPreMoney) {
            const targetESOPPercentage = newPoolSize / 100;
            const newTotalShares = Math.round(totalShares / (1 - targetESOPPercentage));
            const targetShares = Math.round(newTotalShares * targetESOPPercentage);
            if (esopIndex >= 0) {
                newCapTable[esopIndex].shares = targetShares;
            }
            else {
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
        }
        else {
            const currentESOPShares = esopIndex >= 0 ? capTable[esopIndex].shares : 0;
            const targetPercentage = newPoolSize / 100;
            const additionalShares = Math.round((totalShares * targetPercentage - currentESOPShares) / (1 - targetPercentage));
            const finalESOPShares = currentESOPShares + Math.max(0, additionalShares);
            const finalTotalShares = totalShares + Math.max(0, additionalShares);
            if (esopIndex >= 0) {
                newCapTable[esopIndex].shares = finalESOPShares;
            }
            else {
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
    static processFounderSecondary(capTable, secondaryTransactions) {
        const newCapTable = [...capTable];
        for (const transaction of secondaryTransactions) {
            const founderIndex = newCapTable.findIndex(entry => entry.stakeholderType === 'founder' && entry.stakeholder.includes(transaction.founderId));
            if (founderIndex >= 0) {
                newCapTable[founderIndex].shares -= transaction.sharesAmount;
                if (newCapTable[founderIndex].shares < 0) {
                    throw new Error(`Founder ${transaction.founderId} cannot sell more shares than owned`);
                }
            }
        }
        return newCapTable;
    }
    static recalculateEquityPercentages(capTable, totalShares) {
        return capTable.map(entry => ({
            ...entry,
            equity: this.roundToDecimals((entry.shares / totalShares) * 100, this.ROUNDING_PRECISION),
        }));
    }
    static calculateDilutionAnalysis(scenario, capTableSnapshots) {
        const analysis = [];
        for (const founder of scenario.founders) {
            const founderId = founder.id;
            const founderName = founder.name;
            const initialEquity = founder.initialEquity;
            const roundByRoundDilution = [];
            let previousEquity = initialEquity;
            for (let i = 1; i < capTableSnapshots.length; i++) {
                const snapshot = capTableSnapshots[i];
                const founderEntry = snapshot.entries.find(entry => entry.stakeholderType === 'founder' && entry.stakeholder === founderName);
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
            const finalFounderEntry = finalSnapshot.entries.find(entry => entry.stakeholderType === 'founder' && entry.stakeholder === founderName);
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
    static calculateExitReturns(capTableSnapshot, exitValuation) {
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
    static validateCapTable(capTable) {
        const errors = [];
        const totalEquity = capTable.reduce((sum, entry) => sum + entry.equity, 0);
        if (Math.abs(totalEquity - 100) > 5.5) {
            errors.push(`Total equity is ${totalEquity.toFixed(2)}%, should be 100%`);
        }
        const negativeShares = capTable.filter(entry => entry.shares < 0);
        if (negativeShares.length > 0) {
            errors.push(`Negative shares found for: ${negativeShares.map(e => e.stakeholder).join(', ')}`);
        }
        return errors;
    }
    static roundToDecimals(value, decimals) {
        return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
    }
}
exports.FinancialEngine = FinancialEngine;
FinancialEngine.INITIAL_SHARES = 10000000;
FinancialEngine.ROUNDING_PRECISION = 6;
//# sourceMappingURL=financialEngine.js.map