// src/lib/types.ts

export type PaymentFrequency = 'monthly' | 'biweekly';

export interface MortgageInputs {
    homeValue: number;
    downPct: number;
    rate: number;
    term: number;
    taxYr: number;
    insYr: number;
    hoaMo: number;
    pmiMo: number;
    extraPayment: number;
    paymentInterval: number;
    extraAnnualPayment: number;
    startPaymentNumber: number;
    firstPaymentDate: string;
    paymentFrequency: PaymentFrequency;
}

export type MortgageInputKey = keyof MortgageInputs;

export interface InputConstraints {
    min: number;
    max: number;
    step: number;
}

export const INPUT_CONSTRAINTS: Record<keyof Omit<MortgageInputs, 'firstPaymentDate' | 'paymentFrequency'>, InputConstraints> = {
    homeValue: { min: 50000, max: 2000000, step: 1000 },
    downPct: { min: 0, max: 100, step: 1 },
    rate: { min: 0, max: 15, step: 0.01 },
    term: { min: 1, max: 30, step: 1 },
    taxYr: { min: 0, max: 50000, step: 100 },
    insYr: { min: 0, max: 20000, step: 100 },
    hoaMo: { min: 0, max: 2000, step: 10 },
    pmiMo: { min: 0, max: 500, step: 5 },
    extraPayment: { min: 0, max: 10000, step: 50 },
    paymentInterval: { min: 1, max: 12, step: 1 },
    extraAnnualPayment: { min: 0, max: 50000, step: 100 },
    startPaymentNumber: { min: 1, max: 360, step: 1 },
};

export function clampValue(key: keyof typeof INPUT_CONSTRAINTS, value: number): number {
    const constraints = INPUT_CONSTRAINTS[key];
    return Math.min(Math.max(value, constraints.min), constraints.max);
}

export function validateInput(key: keyof typeof INPUT_CONSTRAINTS, value: number): boolean {
    const constraints = INPUT_CONSTRAINTS[key];
    return value >= constraints.min && value <= constraints.max;
}
