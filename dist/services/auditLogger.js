"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditLogger = void 0;
const uuid_1 = require("uuid");
class AuditLogger {
    constructor() {
        this.auditLogs = new Map();
        this.calculationLogs = new Map();
        this.version = '1.0.0';
    }
    logAudit(params) {
        const auditEntry = {
            id: (0, uuid_1.v4)(),
            scenarioId: params.scenarioId,
            userId: params.userId,
            action: params.action,
            entity: params.entity,
            description: params.description,
            timestamp: new Date().toISOString(),
            ...(params.entityId !== undefined && { entityId: params.entityId }),
            ...(params.changes !== undefined && { changes: params.changes }),
            ...(params.metadata !== undefined && { metadata: {
                    timestamp: new Date().toISOString(),
                    success: true,
                    ...params.metadata
                } })
        };
        if (!this.auditLogs.has(params.scenarioId)) {
            this.auditLogs.set(params.scenarioId, []);
        }
        this.auditLogs.get(params.scenarioId).push(auditEntry);
        console.log(`[AUDIT] ${params.action} ${params.entity} for scenario ${params.scenarioId} by user ${params.userId}`);
        return auditEntry;
    }
    logCalculation(params) {
        const calculationLog = {
            id: (0, uuid_1.v4)(),
            scenarioId: params.scenarioId,
            userId: params.userId,
            calculationType: params.calculationType,
            inputs: params.inputs,
            outputs: params.outputs,
            executionTime: params.executionTime,
            timestamp: new Date().toISOString(),
            version: this.version,
            success: params.success ?? true,
            ...(params.formula !== undefined && { formula: params.formula }),
            ...(params.error !== undefined && { error: params.error })
        };
        if (!this.calculationLogs.has(params.scenarioId)) {
            this.calculationLogs.set(params.scenarioId, []);
        }
        this.calculationLogs.get(params.scenarioId).push(calculationLog);
        console.log(`[CALCULATION] ${params.calculationType} for scenario ${params.scenarioId} - ${params.executionTime}ms`);
        return calculationLog;
    }
    getAuditLogs(scenarioId) {
        return this.auditLogs.get(scenarioId) || [];
    }
    getCalculationLogs(scenarioId) {
        return this.calculationLogs.get(scenarioId) || [];
    }
    getUserAuditLogs(userId) {
        const allLogs = [];
        for (const logs of this.auditLogs.values()) {
            allLogs.push(...logs.filter(log => log.userId === userId));
        }
        return allLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }
    getAuditStats(scenarioId) {
        let auditLogs = [];
        let calculationLogs = [];
        if (scenarioId) {
            auditLogs = this.getAuditLogs(scenarioId);
            calculationLogs = this.getCalculationLogs(scenarioId);
        }
        else {
            for (const logs of this.auditLogs.values()) {
                auditLogs.push(...logs);
            }
            for (const logs of this.calculationLogs.values()) {
                calculationLogs.push(...logs);
            }
        }
        const actionBreakdown = {};
        const entityBreakdown = {};
        const calculationBreakdown = {};
        auditLogs.forEach(log => {
            actionBreakdown[log.action] = (actionBreakdown[log.action] || 0) + 1;
            entityBreakdown[log.entity] = (entityBreakdown[log.entity] || 0) + 1;
        });
        calculationLogs.forEach(log => {
            calculationBreakdown[log.calculationType] = (calculationBreakdown[log.calculationType] || 0) + 1;
        });
        const totalExecutionTime = calculationLogs.reduce((sum, log) => sum + log.executionTime, 0);
        const averageExecutionTime = calculationLogs.length > 0 ? totalExecutionTime / calculationLogs.length : 0;
        const successfulCalculations = calculationLogs.filter(log => log.success).length;
        const successRate = calculationLogs.length > 0 ? (successfulCalculations / calculationLogs.length) * 100 : 100;
        return {
            totalAuditLogs: auditLogs.length,
            totalCalculationLogs: calculationLogs.length,
            actionBreakdown,
            entityBreakdown,
            calculationBreakdown,
            averageExecutionTime: Math.round(averageExecutionTime * 100) / 100,
            successRate: Math.round(successRate * 100) / 100
        };
    }
    exportLogs(scenarioId) {
        return {
            scenarioId,
            exportedAt: new Date().toISOString(),
            auditLogs: this.getAuditLogs(scenarioId),
            calculationLogs: this.getCalculationLogs(scenarioId),
            statistics: this.getAuditStats(scenarioId)
        };
    }
    measureCalculation(scenarioId, userId, calculationType, inputs, fn, formula) {
        const startTime = Date.now();
        let success = true;
        let error;
        let result = undefined;
        try {
            result = fn();
            return result;
        }
        catch (err) {
            success = false;
            error = err instanceof Error ? err.message : 'Unknown error';
            throw err;
        }
        finally {
            const executionTime = Date.now() - startTime;
            const logData = {
                scenarioId,
                userId,
                calculationType,
                inputs,
                outputs: success && result ? result : {},
                executionTime,
                success,
            };
            if (formula !== undefined) {
                logData.formula = formula;
            }
            if (error !== undefined) {
                logData.error = error;
            }
            this.logCalculation(logData);
        }
    }
}
exports.auditLogger = new AuditLogger();
//# sourceMappingURL=auditLogger.js.map