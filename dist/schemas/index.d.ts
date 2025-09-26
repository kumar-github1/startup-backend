import { z } from 'zod';
export declare const FounderSchema: z.ZodObject<{
    name: z.ZodString;
    initialEquity: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    name: string;
    initialEquity: number;
}, {
    name: string;
    initialEquity: number;
}>;
export declare const ESOPSchema: z.ZodObject<{
    poolSize: z.ZodNumber;
    isPreMoney: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    poolSize: number;
    isPreMoney: boolean;
}, {
    poolSize: number;
    isPreMoney: boolean;
}>;
export declare const SAFETermsSchema: z.ZodEffects<z.ZodObject<{
    valuationCap: z.ZodOptional<z.ZodNumber>;
    discount: z.ZodOptional<z.ZodNumber>;
    mfn: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    valuationCap?: number | undefined;
    discount?: number | undefined;
    mfn?: boolean | undefined;
}, {
    valuationCap?: number | undefined;
    discount?: number | undefined;
    mfn?: boolean | undefined;
}>, {
    valuationCap?: number | undefined;
    discount?: number | undefined;
    mfn?: boolean | undefined;
}, {
    valuationCap?: number | undefined;
    discount?: number | undefined;
    mfn?: boolean | undefined;
}>;
export declare const FundingRoundSchema: z.ZodEffects<z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    roundType: z.ZodEnum<["SAFE", "PRICED"]>;
    capitalRaised: z.ZodNumber;
    valuation: z.ZodOptional<z.ZodNumber>;
    isPreMoney: z.ZodBoolean;
    safeTerms: z.ZodOptional<z.ZodEffects<z.ZodObject<{
        valuationCap: z.ZodOptional<z.ZodNumber>;
        discount: z.ZodOptional<z.ZodNumber>;
        mfn: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        valuationCap?: number | undefined;
        discount?: number | undefined;
        mfn?: boolean | undefined;
    }, {
        valuationCap?: number | undefined;
        discount?: number | undefined;
        mfn?: boolean | undefined;
    }>, {
        valuationCap?: number | undefined;
        discount?: number | undefined;
        mfn?: boolean | undefined;
    }, {
        valuationCap?: number | undefined;
        discount?: number | undefined;
        mfn?: boolean | undefined;
    }>>;
    esopAdjustment: z.ZodOptional<z.ZodObject<{
        newPoolSize: z.ZodNumber;
        isPreMoney: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        isPreMoney: boolean;
        newPoolSize: number;
    }, {
        isPreMoney: boolean;
        newPoolSize: number;
    }>>;
    founderSecondary: z.ZodOptional<z.ZodArray<z.ZodObject<{
        founderId: z.ZodString;
        sharesAmount: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        founderId: string;
        sharesAmount: number;
    }, {
        founderId: string;
        sharesAmount: number;
    }>, "many">>;
    date: z.ZodString;
    investorName: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    name: string;
    isPreMoney: boolean;
    roundType: "SAFE" | "PRICED";
    date: string;
    capitalRaised: number;
    investorName: string;
    esopAdjustment?: {
        isPreMoney: boolean;
        newPoolSize: number;
    } | undefined;
    valuation?: number | undefined;
    safeTerms?: {
        valuationCap?: number | undefined;
        discount?: number | undefined;
        mfn?: boolean | undefined;
    } | undefined;
    founderSecondary?: {
        founderId: string;
        sharesAmount: number;
    }[] | undefined;
}, {
    id: string;
    name: string;
    isPreMoney: boolean;
    roundType: "SAFE" | "PRICED";
    date: string;
    capitalRaised: number;
    investorName: string;
    esopAdjustment?: {
        isPreMoney: boolean;
        newPoolSize: number;
    } | undefined;
    valuation?: number | undefined;
    safeTerms?: {
        valuationCap?: number | undefined;
        discount?: number | undefined;
        mfn?: boolean | undefined;
    } | undefined;
    founderSecondary?: {
        founderId: string;
        sharesAmount: number;
    }[] | undefined;
}>, {
    id: string;
    name: string;
    isPreMoney: boolean;
    roundType: "SAFE" | "PRICED";
    date: string;
    capitalRaised: number;
    investorName: string;
    esopAdjustment?: {
        isPreMoney: boolean;
        newPoolSize: number;
    } | undefined;
    valuation?: number | undefined;
    safeTerms?: {
        valuationCap?: number | undefined;
        discount?: number | undefined;
        mfn?: boolean | undefined;
    } | undefined;
    founderSecondary?: {
        founderId: string;
        sharesAmount: number;
    }[] | undefined;
}, {
    id: string;
    name: string;
    isPreMoney: boolean;
    roundType: "SAFE" | "PRICED";
    date: string;
    capitalRaised: number;
    investorName: string;
    esopAdjustment?: {
        isPreMoney: boolean;
        newPoolSize: number;
    } | undefined;
    valuation?: number | undefined;
    safeTerms?: {
        valuationCap?: number | undefined;
        discount?: number | undefined;
        mfn?: boolean | undefined;
    } | undefined;
    founderSecondary?: {
        founderId: string;
        sharesAmount: number;
    }[] | undefined;
}>;
export declare const CreateScenarioSchema: z.ZodEffects<z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    founders: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        initialEquity: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        name: string;
        initialEquity: number;
    }, {
        name: string;
        initialEquity: number;
    }>, "many">;
    initialESOP: z.ZodOptional<z.ZodObject<{
        poolSize: z.ZodNumber;
        isPreMoney: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        poolSize: number;
        isPreMoney: boolean;
    }, {
        poolSize: number;
        isPreMoney: boolean;
    }>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    founders: {
        name: string;
        initialEquity: number;
    }[];
    description?: string | undefined;
    initialESOP?: {
        poolSize: number;
        isPreMoney: boolean;
    } | undefined;
}, {
    name: string;
    founders: {
        name: string;
        initialEquity: number;
    }[];
    description?: string | undefined;
    initialESOP?: {
        poolSize: number;
        isPreMoney: boolean;
    } | undefined;
}>, {
    name: string;
    founders: {
        name: string;
        initialEquity: number;
    }[];
    description?: string | undefined;
    initialESOP?: {
        poolSize: number;
        isPreMoney: boolean;
    } | undefined;
}, {
    name: string;
    founders: {
        name: string;
        initialEquity: number;
    }[];
    description?: string | undefined;
    initialESOP?: {
        poolSize: number;
        isPreMoney: boolean;
    } | undefined;
}>;
export declare const UpdateScenarioSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    founders: z.ZodOptional<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        initialEquity: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        name: string;
        initialEquity: number;
    }, {
        name: string;
        initialEquity: number;
    }>, "many">>;
    initialESOP: z.ZodOptional<z.ZodObject<{
        poolSize: z.ZodNumber;
        isPreMoney: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        poolSize: number;
        isPreMoney: boolean;
    }, {
        poolSize: number;
        isPreMoney: boolean;
    }>>;
    fundingRounds: z.ZodOptional<z.ZodArray<z.ZodEffects<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        roundType: z.ZodEnum<["SAFE", "PRICED"]>;
        capitalRaised: z.ZodNumber;
        valuation: z.ZodOptional<z.ZodNumber>;
        isPreMoney: z.ZodBoolean;
        safeTerms: z.ZodOptional<z.ZodEffects<z.ZodObject<{
            valuationCap: z.ZodOptional<z.ZodNumber>;
            discount: z.ZodOptional<z.ZodNumber>;
            mfn: z.ZodOptional<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            valuationCap?: number | undefined;
            discount?: number | undefined;
            mfn?: boolean | undefined;
        }, {
            valuationCap?: number | undefined;
            discount?: number | undefined;
            mfn?: boolean | undefined;
        }>, {
            valuationCap?: number | undefined;
            discount?: number | undefined;
            mfn?: boolean | undefined;
        }, {
            valuationCap?: number | undefined;
            discount?: number | undefined;
            mfn?: boolean | undefined;
        }>>;
        esopAdjustment: z.ZodOptional<z.ZodObject<{
            newPoolSize: z.ZodNumber;
            isPreMoney: z.ZodBoolean;
        }, "strip", z.ZodTypeAny, {
            isPreMoney: boolean;
            newPoolSize: number;
        }, {
            isPreMoney: boolean;
            newPoolSize: number;
        }>>;
        founderSecondary: z.ZodOptional<z.ZodArray<z.ZodObject<{
            founderId: z.ZodString;
            sharesAmount: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            founderId: string;
            sharesAmount: number;
        }, {
            founderId: string;
            sharesAmount: number;
        }>, "many">>;
        date: z.ZodString;
        investorName: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
        name: string;
        isPreMoney: boolean;
        roundType: "SAFE" | "PRICED";
        date: string;
        capitalRaised: number;
        investorName: string;
        esopAdjustment?: {
            isPreMoney: boolean;
            newPoolSize: number;
        } | undefined;
        valuation?: number | undefined;
        safeTerms?: {
            valuationCap?: number | undefined;
            discount?: number | undefined;
            mfn?: boolean | undefined;
        } | undefined;
        founderSecondary?: {
            founderId: string;
            sharesAmount: number;
        }[] | undefined;
    }, {
        id: string;
        name: string;
        isPreMoney: boolean;
        roundType: "SAFE" | "PRICED";
        date: string;
        capitalRaised: number;
        investorName: string;
        esopAdjustment?: {
            isPreMoney: boolean;
            newPoolSize: number;
        } | undefined;
        valuation?: number | undefined;
        safeTerms?: {
            valuationCap?: number | undefined;
            discount?: number | undefined;
            mfn?: boolean | undefined;
        } | undefined;
        founderSecondary?: {
            founderId: string;
            sharesAmount: number;
        }[] | undefined;
    }>, {
        id: string;
        name: string;
        isPreMoney: boolean;
        roundType: "SAFE" | "PRICED";
        date: string;
        capitalRaised: number;
        investorName: string;
        esopAdjustment?: {
            isPreMoney: boolean;
            newPoolSize: number;
        } | undefined;
        valuation?: number | undefined;
        safeTerms?: {
            valuationCap?: number | undefined;
            discount?: number | undefined;
            mfn?: boolean | undefined;
        } | undefined;
        founderSecondary?: {
            founderId: string;
            sharesAmount: number;
        }[] | undefined;
    }, {
        id: string;
        name: string;
        isPreMoney: boolean;
        roundType: "SAFE" | "PRICED";
        date: string;
        capitalRaised: number;
        investorName: string;
        esopAdjustment?: {
            isPreMoney: boolean;
            newPoolSize: number;
        } | undefined;
        valuation?: number | undefined;
        safeTerms?: {
            valuationCap?: number | undefined;
            discount?: number | undefined;
            mfn?: boolean | undefined;
        } | undefined;
        founderSecondary?: {
            founderId: string;
            sharesAmount: number;
        }[] | undefined;
    }>, "many">>;
    capTable: z.ZodOptional<z.ZodArray<z.ZodAny, "many">>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    description?: string | undefined;
    founders?: {
        name: string;
        initialEquity: number;
    }[] | undefined;
    initialESOP?: {
        poolSize: number;
        isPreMoney: boolean;
    } | undefined;
    fundingRounds?: {
        id: string;
        name: string;
        isPreMoney: boolean;
        roundType: "SAFE" | "PRICED";
        date: string;
        capitalRaised: number;
        investorName: string;
        esopAdjustment?: {
            isPreMoney: boolean;
            newPoolSize: number;
        } | undefined;
        valuation?: number | undefined;
        safeTerms?: {
            valuationCap?: number | undefined;
            discount?: number | undefined;
            mfn?: boolean | undefined;
        } | undefined;
        founderSecondary?: {
            founderId: string;
            sharesAmount: number;
        }[] | undefined;
    }[] | undefined;
    capTable?: any[] | undefined;
}, {
    name?: string | undefined;
    description?: string | undefined;
    founders?: {
        name: string;
        initialEquity: number;
    }[] | undefined;
    initialESOP?: {
        poolSize: number;
        isPreMoney: boolean;
    } | undefined;
    fundingRounds?: {
        id: string;
        name: string;
        isPreMoney: boolean;
        roundType: "SAFE" | "PRICED";
        date: string;
        capitalRaised: number;
        investorName: string;
        esopAdjustment?: {
            isPreMoney: boolean;
            newPoolSize: number;
        } | undefined;
        valuation?: number | undefined;
        safeTerms?: {
            valuationCap?: number | undefined;
            discount?: number | undefined;
            mfn?: boolean | undefined;
        } | undefined;
        founderSecondary?: {
            founderId: string;
            sharesAmount: number;
        }[] | undefined;
    }[] | undefined;
    capTable?: any[] | undefined;
}>;
export declare const CalculateRequestSchema: z.ZodObject<{
    scenarioId: z.ZodString;
    fundingRounds: z.ZodArray<z.ZodEffects<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        roundType: z.ZodEnum<["SAFE", "PRICED"]>;
        capitalRaised: z.ZodNumber;
        valuation: z.ZodOptional<z.ZodNumber>;
        isPreMoney: z.ZodBoolean;
        safeTerms: z.ZodOptional<z.ZodEffects<z.ZodObject<{
            valuationCap: z.ZodOptional<z.ZodNumber>;
            discount: z.ZodOptional<z.ZodNumber>;
            mfn: z.ZodOptional<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            valuationCap?: number | undefined;
            discount?: number | undefined;
            mfn?: boolean | undefined;
        }, {
            valuationCap?: number | undefined;
            discount?: number | undefined;
            mfn?: boolean | undefined;
        }>, {
            valuationCap?: number | undefined;
            discount?: number | undefined;
            mfn?: boolean | undefined;
        }, {
            valuationCap?: number | undefined;
            discount?: number | undefined;
            mfn?: boolean | undefined;
        }>>;
        esopAdjustment: z.ZodOptional<z.ZodObject<{
            newPoolSize: z.ZodNumber;
            isPreMoney: z.ZodBoolean;
        }, "strip", z.ZodTypeAny, {
            isPreMoney: boolean;
            newPoolSize: number;
        }, {
            isPreMoney: boolean;
            newPoolSize: number;
        }>>;
        founderSecondary: z.ZodOptional<z.ZodArray<z.ZodObject<{
            founderId: z.ZodString;
            sharesAmount: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            founderId: string;
            sharesAmount: number;
        }, {
            founderId: string;
            sharesAmount: number;
        }>, "many">>;
        date: z.ZodString;
        investorName: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
        name: string;
        isPreMoney: boolean;
        roundType: "SAFE" | "PRICED";
        date: string;
        capitalRaised: number;
        investorName: string;
        esopAdjustment?: {
            isPreMoney: boolean;
            newPoolSize: number;
        } | undefined;
        valuation?: number | undefined;
        safeTerms?: {
            valuationCap?: number | undefined;
            discount?: number | undefined;
            mfn?: boolean | undefined;
        } | undefined;
        founderSecondary?: {
            founderId: string;
            sharesAmount: number;
        }[] | undefined;
    }, {
        id: string;
        name: string;
        isPreMoney: boolean;
        roundType: "SAFE" | "PRICED";
        date: string;
        capitalRaised: number;
        investorName: string;
        esopAdjustment?: {
            isPreMoney: boolean;
            newPoolSize: number;
        } | undefined;
        valuation?: number | undefined;
        safeTerms?: {
            valuationCap?: number | undefined;
            discount?: number | undefined;
            mfn?: boolean | undefined;
        } | undefined;
        founderSecondary?: {
            founderId: string;
            sharesAmount: number;
        }[] | undefined;
    }>, {
        id: string;
        name: string;
        isPreMoney: boolean;
        roundType: "SAFE" | "PRICED";
        date: string;
        capitalRaised: number;
        investorName: string;
        esopAdjustment?: {
            isPreMoney: boolean;
            newPoolSize: number;
        } | undefined;
        valuation?: number | undefined;
        safeTerms?: {
            valuationCap?: number | undefined;
            discount?: number | undefined;
            mfn?: boolean | undefined;
        } | undefined;
        founderSecondary?: {
            founderId: string;
            sharesAmount: number;
        }[] | undefined;
    }, {
        id: string;
        name: string;
        isPreMoney: boolean;
        roundType: "SAFE" | "PRICED";
        date: string;
        capitalRaised: number;
        investorName: string;
        esopAdjustment?: {
            isPreMoney: boolean;
            newPoolSize: number;
        } | undefined;
        valuation?: number | undefined;
        safeTerms?: {
            valuationCap?: number | undefined;
            discount?: number | undefined;
            mfn?: boolean | undefined;
        } | undefined;
        founderSecondary?: {
            founderId: string;
            sharesAmount: number;
        }[] | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    fundingRounds: {
        id: string;
        name: string;
        isPreMoney: boolean;
        roundType: "SAFE" | "PRICED";
        date: string;
        capitalRaised: number;
        investorName: string;
        esopAdjustment?: {
            isPreMoney: boolean;
            newPoolSize: number;
        } | undefined;
        valuation?: number | undefined;
        safeTerms?: {
            valuationCap?: number | undefined;
            discount?: number | undefined;
            mfn?: boolean | undefined;
        } | undefined;
        founderSecondary?: {
            founderId: string;
            sharesAmount: number;
        }[] | undefined;
    }[];
    scenarioId: string;
}, {
    fundingRounds: {
        id: string;
        name: string;
        isPreMoney: boolean;
        roundType: "SAFE" | "PRICED";
        date: string;
        capitalRaised: number;
        investorName: string;
        esopAdjustment?: {
            isPreMoney: boolean;
            newPoolSize: number;
        } | undefined;
        valuation?: number | undefined;
        safeTerms?: {
            valuationCap?: number | undefined;
            discount?: number | undefined;
            mfn?: boolean | undefined;
        } | undefined;
        founderSecondary?: {
            founderId: string;
            sharesAmount: number;
        }[] | undefined;
    }[];
    scenarioId: string;
}>;
export declare const ExitSimulationSchema: z.ZodObject<{
    scenarioId: z.ZodString;
    exitValuation: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    scenarioId: string;
    exitValuation: number;
}, {
    scenarioId: string;
    exitValuation: number;
}>;
//# sourceMappingURL=index.d.ts.map