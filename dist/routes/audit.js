"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditRouter = void 0;
const express_1 = require("express");
const auditLogger_js_1 = require("../services/auditLogger.js");
const router = (0, express_1.Router)();
exports.auditRouter = router;
router.get('/scenarios/:scenarioId/audit', (req, res) => {
    try {
        const { scenarioId } = req.params;
        const auditLogs = auditLogger_js_1.auditLogger.getAuditLogs(scenarioId);
        res.json({
            success: true,
            data: auditLogs
        });
    }
    catch (error) {
        console.error('Error fetching audit logs:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch audit logs'
        });
    }
});
router.get('/scenarios/:scenarioId/calculations', (req, res) => {
    try {
        const { scenarioId } = req.params;
        const calculationLogs = auditLogger_js_1.auditLogger.getCalculationLogs(scenarioId);
        res.json({
            success: true,
            data: calculationLogs
        });
    }
    catch (error) {
        console.error('Error fetching calculation logs:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch calculation logs'
        });
    }
});
router.get('/audit/stats/:scenarioId?', (req, res) => {
    try {
        const { scenarioId } = req.params;
        const stats = auditLogger_js_1.auditLogger.getAuditStats(scenarioId);
        res.json({
            success: true,
            data: stats
        });
    }
    catch (error) {
        console.error('Error fetching audit stats:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch audit statistics'
        });
    }
});
router.get('/scenarios/:scenarioId/export-logs', (req, res) => {
    try {
        const { scenarioId } = req.params;
        const exportData = auditLogger_js_1.auditLogger.exportLogs(scenarioId);
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="audit-logs-${scenarioId}.json"`);
        res.json(exportData);
    }
    catch (error) {
        console.error('Error exporting audit logs:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to export audit logs'
        });
    }
});
router.get('/users/:userId/audit', (req, res) => {
    try {
        const { userId } = req.params;
        const { limit = 100, offset = 0 } = req.query;
        const allUserLogs = auditLogger_js_1.auditLogger.getUserAuditLogs(userId);
        const paginatedLogs = allUserLogs.slice(parseInt(offset), parseInt(offset) + parseInt(limit));
        res.json({
            success: true,
            data: {
                logs: paginatedLogs,
                total: allUserLogs.length,
                limit: parseInt(limit),
                offset: parseInt(offset)
            }
        });
    }
    catch (error) {
        console.error('Error fetching user audit logs:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch user audit logs'
        });
    }
});
//# sourceMappingURL=audit.js.map