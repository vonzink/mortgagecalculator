// lib/mortgageUtils.ts
export const round = (n: number) => Math.round(n * 100) / 100;

const months = (yrs: number) => yrs * 12;

export function monthlyPI(principal: number, ratePct: number, termYears: number) {
    const r = ratePct / 100 / 12;
    const n = months(termYears);
    return r === 0
        ? principal / n
        : principal * (r * (1 + r) ** n) / ((1 + r) ** n - 1);
}

export function biWeeklyPI(principal: number, ratePct: number, termYears: number) {
    return monthlyPI(principal, ratePct, termYears) / 2;
}

export function monthlyEscrows(opts: {
    taxYr: number;
    insuranceYr: number;
    hoaMo: number;
    pmiMo: number;
}) {
    return {
        taxMo: opts.taxYr / 12,
        insMo: opts.insuranceYr / 12,
        hoaMo: opts.hoaMo,
        pmiMo: opts.pmiMo,
    };
}

export interface AmortizationPayment {
    paymentNumber: number;
    paymentDate: string;
    interestRate: number;
    interestDue: number;
    paymentAmount: number;
    extraPayments: number;
    additionalPayment: number;
    principalPaid: number;
    remainingBalance: number;
    year: number;
    taxReturned: number;
    cumulativeTaxReturned: number;
    pmiActive: boolean;
    ltv: number;
}

// PMI is typically removed when LTV reaches 78% (automatic) or 80% (by request)
export const PMI_REMOVAL_LTV = 0.78;

export function calculateLTV(remainingBalance: number, homeValue: number): number {
    if (homeValue <= 0) return 0;
    return remainingBalance / homeValue;
}

export function shouldPMIBeActive(ltv: number): boolean {
    return ltv > PMI_REMOVAL_LTV;
}

export function generateAmortizationSchedule(
    loanAmount: number,
    annualRate: number,
    termYears: number,
    startDate: string,
    extraPayment: number = 0,
    paymentInterval: number = 1,
    extraAnnualPayment: number = 0,
    startPaymentNumber: number = 1,
    yearlyTaxReturn: number = 0,
    homeValue: number = 0 // For LTV/PMI calculations
): AmortizationPayment[] {
    // If homeValue not provided, estimate from loan amount (assuming 20% down)
    const effectiveHomeValue = homeValue > 0 ? homeValue : loanAmount / 0.8;
    const schedule: AmortizationPayment[] = [];
    const monthlyRate = annualRate / 100 / 12;
    const totalPayments = termYears * 12;

    // Handle zero interest rate edge case
    const monthlyPayment = monthlyRate === 0
        ? loanAmount / totalPayments
        : loanAmount * monthlyRate / (1 - (1 + monthlyRate) ** -totalPayments);

    let balance = loanAmount;
    let cumulativeTax = 0;
    const currentDate = new Date(startDate);

    for (let i = 1; i <= totalPayments && balance > 0; i++) {
        const interest = balance * monthlyRate;
        const principal = monthlyPayment - interest;

        const applyExtra =
            i >= startPaymentNumber && (i - startPaymentNumber) % paymentInterval === 0;
        const extraPayments = applyExtra ? extraPayment : 0;

        const applyAnnualExtra = currentDate.getMonth() === 0; // January
        const additionalPayment = applyAnnualExtra ? extraAnnualPayment : 0;

        const totalPaid = principal + extraPayments + additionalPayment;
        balance = Math.max(0, balance - totalPaid);

        const taxReturned = yearlyTaxReturn / 12;
        cumulativeTax += taxReturned;

        // Calculate LTV and PMI status
        const ltv = calculateLTV(balance, effectiveHomeValue);
        const pmiActive = shouldPMIBeActive(ltv);

        schedule.push({
            paymentNumber: i,
            paymentDate: currentDate.toISOString().split('T')[0],
            interestRate: annualRate,
            interestDue: interest,
            paymentAmount: monthlyPayment,
            extraPayments,
            additionalPayment,
            principalPaid: principal,
            remainingBalance: balance,
            year: currentDate.getFullYear(),
            taxReturned,
            cumulativeTaxReturned: cumulativeTax,
            pmiActive,
            ltv,
        });

        currentDate.setMonth(currentDate.getMonth() + 1);

        if (balance <= 0) break;
    }

    return schedule;
}
