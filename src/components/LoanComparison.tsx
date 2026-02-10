// src/components/LoanComparison.tsx
import { useMemo } from 'react';
import type { MortgageInputs } from '../lib/types';
import { monthlyPI, generateAmortizationSchedule } from '../lib/mortgageUtils';
import { formatCurrency } from '../lib/formatters';

interface ComparisonScenario {
    name: string;
    inputs: Partial<MortgageInputs>;
}

interface LoanComparisonProps {
    baseInputs: MortgageInputs;
}

export default function LoanComparison({ baseInputs }: LoanComparisonProps) {
    // Create comparison scenarios
    const scenarios: ComparisonScenario[] = useMemo(() => [
        { name: 'Current', inputs: {} },
        { name: '15-Year', inputs: { term: 15 } },
        { name: '+$200/mo Extra', inputs: { extraPayment: 200 } },
        { name: '+$500/mo Extra', inputs: { extraPayment: 500 } },
    ], []);

    // Calculate metrics for each scenario
    const comparisons = useMemo(() => {
        return scenarios.map(scenario => {
            const inputs = { ...baseInputs, ...scenario.inputs };
            const loanAmt = inputs.homeValue * (1 - inputs.downPct / 100);
            const monthlyPayment = monthlyPI(loanAmt, inputs.rate, inputs.term);

            const schedule = generateAmortizationSchedule(
                loanAmt,
                inputs.rate,
                inputs.term,
                inputs.firstPaymentDate,
                inputs.extraPayment,
                inputs.paymentInterval,
                inputs.extraAnnualPayment,
                inputs.startPaymentNumber,
                inputs.taxYr,
                inputs.homeValue
            );

            const totalInterest = schedule.reduce((sum, p) => sum + p.interestDue, 0);
            const totalPayments = schedule.length;
            const payoffDate = schedule.length > 0
                ? schedule[schedule.length - 1].paymentDate
                : '';
            const yearsToPayoff = totalPayments / 12;

            return {
                name: scenario.name,
                monthlyPayment,
                totalInterest,
                totalPayments,
                payoffDate,
                yearsToPayoff,
                loanAmt,
            };
        });
    }, [baseInputs, scenarios]);

    // Calculate savings compared to base scenario
    const baseScenario = comparisons[0];

    return (
        <div className="mt-8 p-4 bg-white rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-4 text-center">Loan Comparison</h3>
            <p className="text-sm text-gray-500 text-center mb-4">
                See how different terms and extra payments affect your loan
            </p>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                                Scenario
                            </th>
                            <th scope="col" className="px-3 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                                Monthly P&I
                            </th>
                            <th scope="col" className="px-3 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                                Total Interest
                            </th>
                            <th scope="col" className="px-3 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                                Interest Savings
                            </th>
                            <th scope="col" className="px-3 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                                Payoff Time
                            </th>
                            <th scope="col" className="px-3 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                                Time Saved
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {comparisons.map((comp, index) => {
                            const interestSavings = baseScenario.totalInterest - comp.totalInterest;
                            const timeSaved = baseScenario.yearsToPayoff - comp.yearsToPayoff;
                            const isBase = index === 0;

                            return (
                                <tr
                                    key={comp.name}
                                    className={isBase ? 'bg-blue-50' : 'hover:bg-gray-50'}
                                >
                                    <td className="px-3 py-3 text-sm font-medium">
                                        {comp.name}
                                        {isBase && <span className="text-xs text-blue-600 ml-2">(Current)</span>}
                                    </td>
                                    <td className="px-3 py-3 text-sm text-right">
                                        {formatCurrency(comp.monthlyPayment)}
                                    </td>
                                    <td className="px-3 py-3 text-sm text-right">
                                        {formatCurrency(comp.totalInterest)}
                                    </td>
                                    <td className={`px-3 py-3 text-sm text-right ${interestSavings > 0 ? 'text-green-600 font-semibold' : ''}`}>
                                        {isBase ? '—' : formatCurrency(interestSavings)}
                                    </td>
                                    <td className="px-3 py-3 text-sm text-right">
                                        {comp.yearsToPayoff.toFixed(1)} years
                                    </td>
                                    <td className={`px-3 py-3 text-sm text-right ${timeSaved > 0 ? 'text-green-600 font-semibold' : ''}`}>
                                        {isBase ? '—' : `${timeSaved.toFixed(1)} years`}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Summary insights */}
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-sm mb-2">Key Insights:</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                    {comparisons[1] && comparisons[1].totalInterest < baseScenario.totalInterest && (
                        <li className="flex items-start">
                            <span className="text-green-500 mr-2">✓</span>
                            A 15-year term saves {formatCurrency(baseScenario.totalInterest - comparisons[1].totalInterest)} in interest
                        </li>
                    )}
                    {comparisons[2] && comparisons[2].totalInterest < baseScenario.totalInterest && (
                        <li className="flex items-start">
                            <span className="text-green-500 mr-2">✓</span>
                            Adding $200/mo extra saves {formatCurrency(baseScenario.totalInterest - comparisons[2].totalInterest)} and pays off {(baseScenario.yearsToPayoff - comparisons[2].yearsToPayoff).toFixed(1)} years earlier
                        </li>
                    )}
                    {comparisons[3] && comparisons[3].totalInterest < baseScenario.totalInterest && (
                        <li className="flex items-start">
                            <span className="text-green-500 mr-2">✓</span>
                            Adding $500/mo extra saves {formatCurrency(baseScenario.totalInterest - comparisons[3].totalInterest)} and pays off {(baseScenario.yearsToPayoff - comparisons[3].yearsToPayoff).toFixed(1)} years earlier
                        </li>
                    )}
                </ul>
            </div>
        </div>
    );
}
