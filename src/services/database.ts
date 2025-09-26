import { v4 as uuidv4 } from 'uuid';
import {
  Scenario,
  Founder,
  CreateScenarioRequest,
  UpdateScenarioRequest,
} from '../types';

class InMemoryDatabase {
  private scenarios: Map<string, Scenario> = new Map();

  constructor() {
    // Initialize with some sample data for development
    this.initializeSampleData();
  }

  // Scenario CRUD operations
  async createScenario(request: CreateScenarioRequest): Promise<Scenario> {
    const id = uuidv4();
    const now = new Date().toISOString();
    
    const founders: Founder[] = request.founders.map(f => ({
      id: uuidv4(),
      name: f.name,
      initialEquity: f.initialEquity,
      currentShares: 0, // Will be calculated
      currentEquity: f.initialEquity,
    }));

    const scenario: Scenario = {
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

  async getScenario(id: string): Promise<Scenario | null> {
    return this.scenarios.get(id) || null;
  }

  async getAllScenarios(): Promise<Scenario[]> {
    return Array.from(this.scenarios.values());
  }

  async updateScenario(id: string, request: UpdateScenarioRequest): Promise<Scenario | null> {
    const scenario = this.scenarios.get(id);
    if (!scenario) {
      return null;
    }

    const updatedScenario: Scenario = {
      ...scenario,
      name: request.name || scenario.name,
      description: request.description || scenario.description,
      updatedAt: new Date().toISOString(),
    };

    // Update founders if provided
    if (request.founders) {
      updatedScenario.founders = request.founders.map(f => ({
        id: scenario.founders.find(existing => existing.name === f.name)?.id || uuidv4(),
        name: f.name,
        initialEquity: f.initialEquity,
        currentShares: 0,
        currentEquity: f.initialEquity,
      }));
    }

    // Update ESOP if provided
    if (request.initialESOP) {
      updatedScenario.initialESOP = {
        ...request.initialESOP,
        allocatedShares: 0,
        availableShares: 0,
      };
    }

    // Update funding rounds if provided
    if (request.fundingRounds) {
      updatedScenario.fundingRounds = request.fundingRounds;
    }

    // Update cap table if provided
    if (request.capTable) {
      updatedScenario.capTable = request.capTable;
    }

    this.scenarios.set(id, updatedScenario);
    return updatedScenario;
  }

  async deleteScenario(id: string): Promise<boolean> {
    return this.scenarios.delete(id);
  }

  // Utility methods
  async searchScenarios(query: string): Promise<Scenario[]> {
    const allScenarios = Array.from(this.scenarios.values());
    const lowercaseQuery = query.toLowerCase();
    
    return allScenarios.filter(scenario =>
      scenario.name.toLowerCase().includes(lowercaseQuery) ||
      (scenario.description && scenario.description.toLowerCase().includes(lowercaseQuery)) ||
      scenario.founders.some(founder => founder.name.toLowerCase().includes(lowercaseQuery))
    );
  }

  async getScenariosByFounder(founderName: string): Promise<Scenario[]> {
    const allScenarios = Array.from(this.scenarios.values());
    const lowercaseFounderName = founderName.toLowerCase();
    
    return allScenarios.filter(scenario =>
      scenario.founders.some(founder => 
        founder.name.toLowerCase().includes(lowercaseFounderName)
      )
    );
  }

  // Initialize sample data for development/testing
  private initializeSampleData(): void {
    const sampleScenario: Scenario = {
      id: 'sample-1',
      name: 'TechStartup Inc',
      description: 'A sample SaaS startup with 2 founders',
      founders: [
        {
          id: 'founder-1',
          name: 'Alice Johnson',
          initialEquity: 60,
          currentShares: 6_000_000,
          currentEquity: 60,
        },
        {
          id: 'founder-2',
          name: 'Bob Smith',
          initialEquity: 30,
          currentShares: 3_000_000,
          currentEquity: 30,
        }
      ],
      initialESOP: {
        poolSize: 10,
        isPreMoney: true,
        allocatedShares: 0,
        availableShares: 1_000_000,
      },
      fundingRounds: [],
      capTable: [{
        roundId: 'initial',
        roundName: 'Initial Setup',
        preMoneyValuation: 0,
        postMoneyValuation: 10_000_000, // Initial company valuation
        entries: [
          {
            stakeholder: 'Alice Johnson',
            stakeholderType: 'founder',
            shares: 6_000_000,
            equity: 60,
            roundId: 'initial',
          },
          {
            stakeholder: 'Bob Smith',
            stakeholderType: 'founder',
            shares: 3_000_000,
            equity: 30,
            roundId: 'initial',
          },
          {
            stakeholder: 'ESOP Pool',
            stakeholderType: 'esop',
            shares: 1_000_000,
            equity: 10,
            roundId: 'initial',
          }
        ],
        totalShares: 10_000_000,
      }],
      exitScenarios: [],
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    };

    this.scenarios.set('sample-1', sampleScenario);

    // Add a more comprehensive test scenario with Seed and Series A rounds
    const testScenario: Scenario = {
      id: 'test-seed-series-a',
      name: 'StartupCorp - Seed to Series A',
      description: 'Test case showing Seed and Series A funding rounds with dilution',
      founders: [
        {
          id: 'founder-test-1',
          name: 'Jane Doe',
          initialEquity: 70,
          currentShares: 7_000_000,
          currentEquity: 35, // After dilution
        },
        {
          id: 'founder-test-2',
          name: 'John Smith',
          initialEquity: 20,
          currentShares: 2_000_000,
          currentEquity: 10, // After dilution
        }
      ],
      initialESOP: {
        poolSize: 10,
        isPreMoney: true,
        allocatedShares: 1_000_000,
        availableShares: 1_000_000,
      },
      fundingRounds: [
        {
          id: 'seed-round',
          name: 'Seed Round',
          roundType: 'PRICED',
          capitalRaised: 2_000_000,
          valuation: 8_000_000,
          isPreMoney: true,
          investorName: 'Seed VC',
          date: '2024-03-15',
        },
        {
          id: 'series-a-round',
          name: 'Series A',
          roundType: 'PRICED',
          capitalRaised: 10_000_000,
          valuation: 20_000_000,
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
              shares: 7_000_000,
              equity: 70,
            },
            {
              stakeholder: 'John Smith',
              stakeholderType: 'founder',
              shares: 2_000_000,
              equity: 20,
            },
            {
              stakeholder: 'ESOP Pool',
              stakeholderType: 'esop',
              shares: 1_000_000,
              equity: 10,
            }
          ],
          totalShares: 10_000_000,
        },
        {
          roundId: 'seed-round',
          roundName: 'Seed Round',
          preMoneyValuation: 8_000_000,
          postMoneyValuation: 10_000_000,
          entries: [
            {
              stakeholder: 'Jane Doe',
              stakeholderType: 'founder',
              shares: 7_000_000,
              equity: 56, // 7M / 12.5M
            },
            {
              stakeholder: 'John Smith',
              stakeholderType: 'founder',
              shares: 2_000_000,
              equity: 16, // 2M / 12.5M
            },
            {
              stakeholder: 'ESOP Pool',
              stakeholderType: 'esop',
              shares: 1_000_000,
              equity: 8, // 1M / 12.5M
            },
            {
              stakeholder: 'Seed VC',
              stakeholderType: 'investor',
              shares: 2_500_000,
              equity: 20, // 2.5M / 12.5M
              roundId: 'seed-round',
            }
          ],
          totalShares: 12_500_000,
        },
        {
          roundId: 'series-a-round',
          roundName: 'Series A',
          preMoneyValuation: 20_000_000,
          postMoneyValuation: 30_000_000,
          entries: [
            {
              stakeholder: 'Jane Doe',
              stakeholderType: 'founder',
              shares: 7_000_000,
              equity: 35, // After dilution with Series A and ESOP increase
            },
            {
              stakeholder: 'John Smith',
              stakeholderType: 'founder',
              shares: 2_000_000,
              equity: 10, // After dilution
            },
            {
              stakeholder: 'ESOP Pool',
              stakeholderType: 'esop',
              shares: 3_000_000,
              equity: 15, // Increased to 15%
            },
            {
              stakeholder: 'Seed VC',
              stakeholderType: 'investor',
              shares: 2_500_000,
              equity: 12.5, // Diluted
              roundId: 'seed-round',
            },
            {
              stakeholder: 'Growth Capital',
              stakeholderType: 'investor',
              shares: 5_500_000,
              equity: 27.5, // Series A investment
              roundId: 'series-a-round',
            }
          ],
          totalShares: 20_000_000,
        }
      ],
      exitScenarios: [],
      createdAt: '2024-01-15T00:00:00.000Z',
      updatedAt: '2024-09-20T00:00:00.000Z',
    };

    this.scenarios.set('test-seed-series-a', testScenario);
  }

  // Development helper to reset database
  async reset(): Promise<void> {
    this.scenarios.clear();
    this.initializeSampleData();
  }

  // Get database stats
  async getStats(): Promise<{
    totalScenarios: number;
    totalFounders: number;
    totalRounds: number;
  }> {
    const scenarios = Array.from(this.scenarios.values());
    
    return {
      totalScenarios: scenarios.length,
      totalFounders: scenarios.reduce((sum, s) => sum + s.founders.length, 0),
      totalRounds: scenarios.reduce((sum, s) => sum + s.fundingRounds.length, 0),
    };
  }
}

// Export singleton instance
export const database = new InMemoryDatabase();
export default database;