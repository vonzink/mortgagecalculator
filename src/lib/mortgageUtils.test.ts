import { describe, it, expect } from 'vitest';
import {
    round,
    monthlyPI,
    biWeeklyPI,
    monthlyEscrows,
    generateAmortizationSchedule,
} from './mortgageUtils';

describe('round', () => {
    it('rounds to 2 decimal places', () => {
        expect(round(123.456)).toBe(123.46);
        expect(round(123.454)).toBe(123.45);
        expect(round(100)).toBe(100);
    });
});

describe('monthlyPI', () => {
    it('calculates correct monthly payment for standard 30-year mortgage', () => {
        // $400,000 loan at 7% for 30 years
        const payment = monthlyPI(400000, 7, 30);
        expect(payment).toBeCloseTo(2661.21, 0); // Allow small rounding differences
    });

    it('calculates correct monthly payment for 15-year mortgage', () => {
        // $300,000 loan at 6% for 15 years
        const payment = monthlyPI(300000, 6, 15);
        expect(payment).toBeCloseTo(2531.57, 0);
    });

    it('handles 0% interest rate', () => {
        // $120,000 loan at 0% for 10 years = $1,000/month
        const payment = monthlyPI(120000, 0, 10);
        expect(payment).toBe(1000);
    });

    it('handles very small principal', () => {
        const payment = monthlyPI(1000, 5, 5);
        expect(payment).toBeGreaterThan(0);
        expect(payment).toBeLessThan(100);
    });

    it('handles high interest rates', () => {
        const payment = monthlyPI(100000, 15, 30);
        expect(payment).toBeCloseTo(1264.44, 0);
    });
});

describe('biWeeklyPI', () => {
    it('returns half of monthly payment', () => {
        const monthly = monthlyPI(400000, 7, 30);
        const biWeekly = biWeeklyPI(400000, 7, 30);
        expect(biWeekly).toBeCloseTo(monthly / 2, 2);
    });
});

describe('monthlyEscrows', () => {
    it('calculates monthly escrow amounts correctly', () => {
        const escrows = monthlyEscrows({
            taxYr: 3600,
            insuranceYr: 1200,
            hoaMo: 150,
            pmiMo: 100,
        });

        expect(escrows.taxMo).toBe(300);
        expect(escrows.insMo).toBe(100);
        expect(escrows.hoaMo).toBe(150);
        expect(escrows.pmiMo).toBe(100);
    });

    it('handles zero values', () => {
        const escrows = monthlyEscrows({
            taxYr: 0,
            insuranceYr: 0,
            hoaMo: 0,
            pmiMo: 0,
        });

        expect(escrows.taxMo).toBe(0);
        expect(escrows.insMo).toBe(0);
        expect(escrows.hoaMo).toBe(0);
        expect(escrows.pmiMo).toBe(0);
    });
});

describe('generateAmortizationSchedule', () => {
    it('generates correct number of payments for standard loan', () => {
        const schedule = generateAmortizationSchedule(
            400000, // loanAmount
            7,      // annualRate
            30,     // termYears
            '2024-01-01'
        );

        expect(schedule.length).toBe(360); // 30 years * 12 months
    });

    it('first payment has correct interest calculation', () => {
        const schedule = generateAmortizationSchedule(
            400000,
            7,
            30,
            '2024-01-01'
        );

        const firstPayment = schedule[0];
        // First month interest = $400,000 * 0.07 / 12 = $2,333.33
        expect(firstPayment.interestDue).toBeCloseTo(2333.33, 0);
    });

    it('last payment brings balance to zero', () => {
        const schedule = generateAmortizationSchedule(
            400000,
            7,
            30,
            '2024-01-01'
        );

        const lastPayment = schedule[schedule.length - 1];
        expect(lastPayment.remainingBalance).toBeCloseTo(0, 0);
    });

    it('handles extra monthly payments', () => {
        const scheduleNoExtra = generateAmortizationSchedule(
            400000, 7, 30, '2024-01-01'
        );

        const scheduleWithExtra = generateAmortizationSchedule(
            400000, 7, 30, '2024-01-01',
            500,  // extraPayment
            1     // paymentInterval (every month)
        );

        // With extra payments, loan should be paid off sooner
        expect(scheduleWithExtra.length).toBeLessThan(scheduleNoExtra.length);
    });

    it('handles extra annual payments in January', () => {
        const schedule = generateAmortizationSchedule(
            400000, 7, 30, '2024-01-01',
            0,     // no monthly extra
            1,     // interval
            5000   // annual extra in January
        );

        // Find January payments
        const januaryPayments = schedule.filter(p => {
            const date = new Date(p.paymentDate);
            return date.getMonth() === 0; // January
        });

        // Each January should have additional payment of $5000
        januaryPayments.forEach(payment => {
            expect(payment.additionalPayment).toBe(5000);
        });
    });

    it('handles 0% interest rate', () => {
        const schedule = generateAmortizationSchedule(
            120000, 0, 10, '2024-01-01'
        );

        expect(schedule.length).toBe(120); // 10 years

        // All interest should be 0
        schedule.forEach(payment => {
            expect(payment.interestDue).toBe(0);
        });

        // Monthly payment should be principal / months
        expect(schedule[0].paymentAmount).toBe(1000);
    });

    it('respects startPaymentNumber for extra payments', () => {
        const schedule = generateAmortizationSchedule(
            400000, 7, 30, '2024-01-01',
            500,   // extraPayment
            1,     // every month
            0,     // no annual extra
            12     // start at payment 12
        );

        // Payments 1-11 should have no extra
        for (let i = 0; i < 11; i++) {
            expect(schedule[i].extraPayments).toBe(0);
        }

        // Payment 12 and onwards should have extra
        expect(schedule[11].extraPayments).toBe(500);
    });

    it('tracks cumulative tax return', () => {
        const schedule = generateAmortizationSchedule(
            400000, 7, 30, '2024-01-01',
            0, 1, 0, 1,
            1200 // yearlyTaxReturn
        );

        // Monthly tax return = $1200 / 12 = $100
        expect(schedule[0].taxReturned).toBe(100);
        expect(schedule[11].cumulativeTaxReturned).toBe(1200);
    });

    it('payment dates increment correctly', () => {
        const schedule = generateAmortizationSchedule(
            100000, 5, 5, '2024-06-15'
        );

        expect(schedule[0].paymentDate).toBe('2024-06-15');
        expect(schedule[1].paymentDate).toBe('2024-07-15');
        expect(schedule[12].paymentDate).toBe('2025-06-15');
    });

    it('stops when balance reaches zero with large extra payments', () => {
        const schedule = generateAmortizationSchedule(
            100000, 5, 30, '2024-01-01',
            10000  // Large extra payment
        );

        // Should pay off much sooner than 360 payments
        expect(schedule.length).toBeLessThan(20);
        expect(schedule[schedule.length - 1].remainingBalance).toBe(0);
    });
});

describe('edge cases', () => {
    it('handles minimum loan amount', () => {
        const schedule = generateAmortizationSchedule(
            1000, 5, 1, '2024-01-01'
        );
        expect(schedule.length).toBe(12);
    });

    it('handles 1-year term', () => {
        const schedule = generateAmortizationSchedule(
            12000, 6, 1, '2024-01-01'
        );
        expect(schedule.length).toBe(12);
    });
});
