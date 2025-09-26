import { Router, Request, Response } from 'express';
import { auditLogger } from '../services/auditLogger.js';

const router = Router();

/**
 * Get audit logs for a specific scenario
 */
router.get('/scenarios/:scenarioId/audit', (req: Request, res: Response) => {
  try {
    const { scenarioId } = req.params;
    const auditLogs = auditLogger.getAuditLogs(scenarioId);

    res.json({
      success: true,
      data: auditLogs
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch audit logs'
    });
  }
});

/**
 * Get calculation logs for a specific scenario
 */
router.get('/scenarios/:scenarioId/calculations', (req: Request, res: Response) => {
  try {
    const { scenarioId } = req.params;
    const calculationLogs = auditLogger.getCalculationLogs(scenarioId);

    res.json({
      success: true,
      data: calculationLogs
    });
  } catch (error) {
    console.error('Error fetching calculation logs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch calculation logs'
    });
  }
});

/**
 * Get audit statistics for a scenario or overall
 */
router.get('/audit/stats/:scenarioId?', (req: Request, res: Response) => {
  try {
    const { scenarioId } = req.params;
    const stats = auditLogger.getAuditStats(scenarioId);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching audit stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch audit statistics'
    });
  }
});

/**
 * Export all logs for a scenario
 */
router.get('/scenarios/:scenarioId/export-logs', (req: Request, res: Response) => {
  try {
    const { scenarioId } = req.params;
    const exportData = auditLogger.exportLogs(scenarioId);

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="audit-logs-${scenarioId}.json"`);
    res.json(exportData);
  } catch (error) {
    console.error('Error exporting audit logs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export audit logs'
    });
  }
});

/**
 * Get user's audit history
 */
router.get('/users/:userId/audit', (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { limit = 100, offset = 0 } = req.query;

    const allUserLogs = auditLogger.getUserAuditLogs(userId);
    const paginatedLogs = allUserLogs.slice(
      parseInt(offset as string),
      parseInt(offset as string) + parseInt(limit as string)
    );

    res.json({
      success: true,
      data: {
        logs: paginatedLogs,
        total: allUserLogs.length,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string)
      }
    });
  } catch (error) {
    console.error('Error fetching user audit logs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user audit logs'
    });
  }
});

export { router as auditRouter };