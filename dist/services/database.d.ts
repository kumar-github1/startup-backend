import { Scenario, CreateScenarioRequest, UpdateScenarioRequest } from '../types';
declare class InMemoryDatabase {
    private scenarios;
    constructor();
    createScenario(request: CreateScenarioRequest): Promise<Scenario>;
    getScenario(id: string): Promise<Scenario | null>;
    getAllScenarios(): Promise<Scenario[]>;
    updateScenario(id: string, request: UpdateScenarioRequest): Promise<Scenario | null>;
    deleteScenario(id: string): Promise<boolean>;
    searchScenarios(query: string): Promise<Scenario[]>;
    getScenariosByFounder(founderName: string): Promise<Scenario[]>;
    private initializeSampleData;
    reset(): Promise<void>;
    getStats(): Promise<{
        totalScenarios: number;
        totalFounders: number;
        totalRounds: number;
    }>;
}
export declare const database: InMemoryDatabase;
export default database;
//# sourceMappingURL=database.d.ts.map