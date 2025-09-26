import { AuditLogEntry, CalculationLog } from '../types/index.js';
import { v4 as uuidv4 } from 'uuid';

class AuditLogger {
  private auditLogs: Map<string, AuditLogEntry[]> = new Map();
  private calculationLogs: Map<string, CalculationLog[]> = new Map();
  private readonly version = '1.0.0';

  /**
   * Log an audit event
   */
  logAudit(params: {
    scenarioId: string;
    userId: string;
    action: AuditLogEntry['action'];
    entity: AuditLogEntry['entity'];
    entityId?: string;
    changes?: AuditLogEntry['changes'];
    description: string;
    metadata?: Partial<AuditLogEntry['metadata']>;
  }): AuditLogEntry {
    const auditEntry: AuditLogEntry = {
      id: uuidv4(),
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
      }})
    };

    // Store the audit log
    if (!this.auditLogs.has(params.scenarioId)) {
      this.auditLogs.set(params.scenarioId, []);
    }
    this.auditLogs.get(params.scenarioId)!.push(auditEntry);

    console.log(`[AUDIT] ${params.action} ${params.entity} for scenario ${params.scenarioId} by user ${params.userId}`);
    return auditEntry;
  }

  /**
   * Log a calculation event
   */
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
  }): CalculationLog {
    const calculationLog: CalculationLog = {
      id: uuidv4(),
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

    // Store the calculation log
    if (!this.calculationLogs.has(params.scenarioId)) {
      this.calculationLogs.set(params.scenarioId, []);
    }
    this.calculationLogs.get(params.scenarioId)!.push(calculationLog);

    console.log(`[CALCULATION] ${params.calculationType} for scenario ${params.scenarioId} - ${params.executionTime}ms`);
    return calculationLog;
  }

  /**
   * Get audit logs for a scenario
   */
  getAuditLogs(scenarioId: string): AuditLogEntry[] {
    return this.auditLogs.get(scenarioId) || [];
  }

  /**
   * Get calculation logs for a scenario
   */
  getCalculationLogs(scenarioId: string): CalculationLog[] {
    return this.calculationLogs.get(scenarioId) || [];
  }

  /**
   * Get all audit logs for a user
   */
  getUserAuditLogs(userId: string): AuditLogEntry[] {
    const allLogs: AuditLogEntry[] = [];
    for (const logs of this.auditLogs.values()) {
      allLogs.push(...logs.filter(log => log.userId === userId));
    }
    return allLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  /**
   * Get statistics about audit logs
   */
  getAuditStats(scenarioId?: string): {
    totalAuditLogs: number;
    totalCalculationLogs: number;
    actionBreakdown: Record<string, number>;
    entityBreakdown: Record<string, number>;
    calculationBreakdown: Record<string, number>;
    averageExecutionTime: number;
    successRate: number;
  } {
    let auditLogs: AuditLogEntry[] = [];
    let calculationLogs: CalculationLog[] = [];

    if (scenarioId) {
      auditLogs = this.getAuditLogs(scenarioId);
      calculationLogs = this.getCalculationLogs(scenarioId);
    } else {
      // Get all logs
      for (const logs of this.auditLogs.values()) {
        auditLogs.push(...logs);
      }
      for (const logs of this.calculationLogs.values()) {
        calculationLogs.push(...logs);
      }
    }

    const actionBreakdown: Record<string, number> = {};
    const entityBreakdown: Record<string, number> = {};
    const calculationBreakdown: Record<string, number> = {};

    // Count audit log actions and entities
    auditLogs.forEach(log => {
      actionBreakdown[log.action] = (actionBreakdown[log.action] || 0) + 1;
      entityBreakdown[log.entity] = (entityBreakdown[log.entity] || 0) + 1;
    });

    // Count calculation types
    calculationLogs.forEach(log => {
      calculationBreakdown[log.calculationType] = (calculationBreakdown[log.calculationType] || 0) + 1;
    });

    // Calculate average execution time
    const totalExecutionTime = calculationLogs.reduce((sum, log) => sum + log.executionTime, 0);
    const averageExecutionTime = calculationLogs.length > 0 ? totalExecutionTime / calculationLogs.length : 0;

    // Calculate success rate
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

  /**
   * Export logs for a scenario
   */
  exportLogs(scenarioId: string): {
    scenarioId: string;
    exportedAt: string;
    auditLogs: AuditLogEntry[];
    calculationLogs: CalculationLog[];
    statistics: ReturnType<AuditLogger['getAuditStats']>;
  } {
    return {
      scenarioId,
      exportedAt: new Date().toISOString(),
      auditLogs: this.getAuditLogs(scenarioId),
      calculationLogs: this.getCalculationLogs(scenarioId),
      statistics: this.getAuditStats(scenarioId)
    };
  }

  /**
   * Create a measurement wrapper for tracking calculation performance
   */
  measureCalculation<T>(
    scenarioId: string,
    userId: string,
    calculationType: CalculationLog['calculationType'],
    inputs: any,
    fn: () => T,
    formula?: string
  ): T {
    const startTime = Date.now();
    let success = true;
    let error: string | undefined;
    let result: T | undefined = undefined;

    try {
      result = fn();
      return result;
    } catch (err) {
      success = false;
      error = err instanceof Error ? err.message : 'Unknown error';
      throw err;
    } finally {
      const executionTime = Date.now() - startTime;
      const logData: Parameters<typeof this.logCalculation>[0] = {
        scenarioId,
        userId,
        calculationType,
        inputs,
        outputs: success && result ? (result as any) : {},
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

// Singleton instance
export const auditLogger = new AuditLogger();