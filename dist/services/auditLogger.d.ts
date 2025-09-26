import { AuditLogEntry, CalculationLog } from '../types/index.js';
declare class AuditLogger {
    private auditLogs;
    private calculationLogs;
    private readonly version;
    logAudit(params: {
        scenarioId: string;
        userId: string;
        action: AuditLogEntry['action'];
        entity: AuditLogEntry['entity'];
        entityId?: string;
        changes?: AuditLogEntry['changes'];
        description: string;
        metadata?: Partial<AuditLogEntry['metadata']>;
    }): AuditLogEntry;
    logCalculation(params: {
        scenarioId: string;
        userId: string;
        calculationType: CalculationLog['calculationType'];
        inputs: CalculationLog['inputs'];
        outputs: CalculationLog['outputs'];
        formula?: string;
        executionTime: number;
        success?: boolean;
        error?: string;
    }): CalculationLog;
    getAuditLogs(scenarioId: string): AuditLogEntry[];
    getCalculationLogs(scenarioId: string): CalculationLog[];
    getUserAuditLogs(userId: string): AuditLogEntry[];
    getAuditStats(scenarioId?: string): {
        totalAuditLogs: number;
        totalCalculationLogs: number;
        actionBreakdown: Record<string, number>;
        entityBreakdown: Record<string, number>;
        calculationBreakdown: Record<string, number>;
        averageExecutionTime: number;
        successRate: number;
    };
    exportLogs(scenarioId: string): {
        scenarioId: string;
        exportedAt: string;
        auditLogs: AuditLogEntry[];
        calculationLogs: CalculationLog[];
        statistics: ReturnType<AuditLogger['getAuditStats']>;
    };
    measureCalculation<T>(scenarioId: string, userId: string, calculationType: CalculationLog['calculationType'], inputs: any, fn: () => T, formula?: string): T;
}
export declare const auditLogger: AuditLogger;
export {};
//# sourceMappingURL=auditLogger.d.ts.map