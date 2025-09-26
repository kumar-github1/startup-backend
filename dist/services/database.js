"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.database = void 0;
const uuid_1 = require("uuid");
class InMemoryDatabase {
    constructor() {
        this.scenarios = new Map();
        this.initializeSampleData();
    }
    async createScenario(request) {
        const id = (0, uuid_1.v4)();
        const now = new Date().toISOString();
        const founders = request.founders.map(f => ({
            id: (0, uuid_1.v4)(),
            name: f.name,
            initialEquity: f.initialEquity,
            currentShares: 0,
            currentEquity: f.initialEquity,
        }));
        const scenario = {
            id,
            name: request.name,
            description: request.description || '',
            founders,
            fundingRounds: [],
            capTable: [],
            exitScenarios: [],
            createdAt: now,
            updatedAt: now,
        };
        if (request.initialESOP) {
            scenario.initialESOP = {
                ...request.initialESOP,
                allocatedShares: 0,
                availableShares: 0,
            };
        }
        this.scenarios.set(id, scenario);
        return scenario;
    }
    async getScenario(id) {
        return this.scenarios.get(id) || null;
    }
    async getAllScenarios() {
        return Array.from(this.scenarios.values());
    }
    async updateScenario(id, request) {
        const scenario = this.scenarios.get(id);
        if (!scenario) {
            return null;
        }
        const updatedScenario = {
            ...scenario,
            name: request.name || scenario.name,
            description: request.description || scenario.description,
            updatedAt: new Date().toISOString(),
        };
        if (request.founders) {
            updatedScenario.founders = request.founders.map(f => ({
                id: scenario.founders.find(existing => existing.name === f.name)?.id || (0, uuid_1.v4)(),
                name: f.name,
                initialEquity: f.initialEquity,
                currentShares: 0,
                currentEquity: f.initialEquity,
            }));
        }
        if (request.initialESOP) {
            updatedScenario.initialESOP = {
                ...request.initialESOP,
                allocatedShares: 0,
                availableShares: 0,
            };
        }
        if (request.fundingRounds) {
            updatedScenario.fundingRounds = request.fundingRounds;
        }
        if (request.capTable) {
            updatedScenario.capTable = request.capTable;
        }
        this.scenarios.set(id, updatedScenario);
        return updatedScenario;
    }
    async deleteScenario(id) {
        return this.scenarios.delete(id);
    }
    async searchScenarios(query) {
        const allScenarios = Array.from(this.scenarios.values());
        const lowercaseQuery = query.toLowerCase();
        return allScenarios.filter(scenario => scenario.name.toLowerCase().includes(lowercaseQuery) ||
            (scenario.description && scenario.description.toLowerCase().includes(lowercaseQuery)) ||
            scenario.founders.some(founder => founder.name.toLowerCase().includes(lowercaseQuery)));
    }
    async getScenariosByFounder(founderName) {
        const allScenarios = Array.from(this.scenarios.values());
        const lowercaseFounderName = founderName.toLowerCase();
        return allScenarios.filter(scenario => scenario.founders.some(founder => founder.name.toLowerCase().includes(lowercaseFounderName)));
    }
    initializeSampleData() {
        const sampleScenario = {
            id: 'sample-1',
            name: 'TechStartup Inc',
            description: 'A sample SaaS startup with 2 founders',
            founders: [
                {
                    id: 'founder-1',
                    name: 'Alice Johnson',
                    initialEquity: 60,
                    currentShares: 6000000,
                    currentEquity: 60,
                },
                {
                    id: 'founder-2',
                    name: 'Bob Smith',
                    initialEquity: 30,
                    currentShares: 3000000,
                    currentEquity: 30,
                }
            ],
            initialESOP: {
                poolSize: 10,
                isPreMoney: true,
                allocatedShares: 0,
                availableShares: 1000000,
            },
            fundingRounds: [],
            capTable: [{
                    roundId: 'initial',
                    roundName: 'Initial Setup',
                    preMoneyValuation: 0,
                    postMoneyValuation: 10000000,
                    entries: [
                        {
                            stakeholder: 'Alice Johnson',
                            stakeholderType: 'founder',
                            shares: 6000000,
                            equity: 60,
                            roundId: 'initial',
                        },
                        {
                            stakeholder: 'Bob Smith',
                            stakeholderType: 'founder',
                            shares: 3000000,
                            equity: 30,
                            roundId: 'initial',
                        },
                        {
                            stakeholder: 'ESOP Pool',
                            stakeholderType: 'esop',
                            shares: 1000000,
                            equity: 10,
                            roundId: 'initial',
                        }
                    ],
                    totalShares: 10000000,
                }],
            exitScenarios: [],
            createdAt: '2025-01-01T00:00:00.000Z',
            updatedAt: '2025-01-01T00:00:00.000Z',
        };
        this.scenarios.set('sample-1', sampleScenario);
        const testScenario = {
            id: 'test-seed-series-a',
            name: 'StartupCorp - Seed to Series A',
            description: 'Test case showing Seed and Series A funding rounds with dilution',
            founders: [
                {
                    id: 'founder-test-1',
                    name: 'Jane Doe',
                    initialEquity: 70,
                    currentShares: 7000000,
                    currentEquity: 35,
                },
                {
                    id: 'founder-test-2',
                    name: 'John Smith',
                    initialEquity: 20,
                    currentShares: 2000000,
                    currentEquity: 10,
                }
            ],
            initialESOP: {
                poolSize: 10,
                isPreMoney: true,
                allocatedShares: 1000000,
                availableShares: 1000000,
            },
            fundingRounds: [
                {
                    id: 'seed-round',
                    name: 'Seed Round',
                    roundType: 'PRICED',
                    capitalRaised: 2000000,
                    valuation: 8000000,
                    isPreMoney: true,
                    investorName: 'Seed VC',
                    date: '2024-03-15',
                },
                {
                    id: 'series-a-round',
                    name: 'Series A',
                    roundType: 'PRICED',
                    capitalRaised: 10000000,
                    valuation: 20000000,
                    isPreMoney: true,
                    investorName: 'Growth Capital',
                    date: '2024-09-20',
                    esopAdjustment: {
                        newPoolSize: 15,
                        isPreMoney: true,
                    },
                }
            ],
            capTable: [
                {
                    roundId: 'initial',
                    roundName: 'Initial Setup',
                    preMoneyValuation: 0,
                    postMoneyValuation: 0,
                    entries: [
                        {
                            stakeholder: 'Jane Doe',
                            stakeholderType: 'founder',
                            shares: 7000000,
                            equity: 70,
                        },
                        {
                            stakeholder: 'John Smith',
                            stakeholderType: 'founder',
                            shares: 2000000,
                            equity: 20,
                        },
                        {
                            stakeholder: 'ESOP Pool',
                            stakeholderType: 'esop',
                            shares: 1000000,
                            equity: 10,
                        }
                    ],
                    totalShares: 10000000,
                },
                {
                    roundId: 'seed-round',
                    roundName: 'Seed Round',
                    preMoneyValuation: 8000000,
                    postMoneyValuation: 10000000,
                    entries: [
                        {
                            stakeholder: 'Jane Doe',
                            stakeholderType: 'founder',
                            shares: 7000000,
                            equity: 56,
                        },
                        {
                            stakeholder: 'John Smith',
                            stakeholderType: 'founder',
                            shares: 2000000,
                            equity: 16,
                        },
                        {
                            stakeholder: 'ESOP Pool',
                            stakeholderType: 'esop',
                            shares: 1000000,
                            equity: 8,
                        },
                        {
                            stakeholder: 'Seed VC',
                            stakeholderType: 'investor',
                            shares: 2500000,
                            equity: 20,
                            roundId: 'seed-round',
                        }
                    ],
                    totalShares: 12500000,
                },
                {
                    roundId: 'series-a-round',
                    roundName: 'Series A',
                    preMoneyValuation: 20000000,
                    postMoneyValuation: 30000000,
                    entries: [
                        {
                            stakeholder: 'Jane Doe',
                            stakeholderType: 'founder',
                            shares: 7000000,
                            equity: 35,
                        },
                        {
                            stakeholder: 'John Smith',
                            stakeholderType: 'founder',
                            shares: 2000000,
                            equity: 10,
                        },
                        {
                            stakeholder: 'ESOP Pool',
                            stakeholderType: 'esop',
                            shares: 3000000,
                            equity: 15,
                        },
                        {
                            stakeholder: 'Seed VC',
                            stakeholderType: 'investor',
                            shares: 2500000,
                            equity: 12.5,
                            roundId: 'seed-round',
                        },
                        {
                            stakeholder: 'Growth Capital',
                            stakeholderType: 'investor',
                            shares: 5500000,
                            equity: 27.5,
                            roundId: 'series-a-round',
                        }
                    ],
                    totalShares: 20000000,
                }
            ],
            exitScenarios: [],
            createdAt: '2024-01-15T00:00:00.000Z',
            updatedAt: '2024-09-20T00:00:00.000Z',
        };
        this.scenarios.set('test-seed-series-a', testScenario);
    }
    async reset() {
        this.scenarios.clear();
        this.initializeSampleData();
    }
    async getStats() {
        const scenarios = Array.from(this.scenarios.values());
        return {
            totalScenarios: scenarios.length,
            totalFounders: scenarios.reduce((sum, s) => sum + s.founders.length, 0),
            totalRounds: scenarios.reduce((sum, s) => sum + s.fundingRounds.length, 0),
        };
    }
}
exports.database = new InMemoryDatabase();
exports.default = exports.database;
//# sourceMappingURL=database.js.map