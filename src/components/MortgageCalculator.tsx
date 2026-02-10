// src/components/MortgageCalculator.tsx
import { useState, useMemo, lazy, Suspense } from "react";
import {
    monthlyPI,
    biWeeklyPI,
    monthlyEscrows,
    generateAmortizationSchedule,
} from "../lib/mortgageUtils";
import type { MortgageInputs, MortgageInputKey } from "../lib/types";
import InputGrid from "./InputGrid";
import EscrowToggle from "./EscrowToggle";
import type { EscrowInclusions } from "./EscrowToggle";
import PaymentPie from "./PaymentPie";
import { ChartErrorBoundary } from "./ErrorBoundary";
import ScenarioManager from "./ScenarioManager";
import PDFExport from "./PDFExport";

// Lazy load heavy components (Recharts)
const AmortizationTable = lazy(() => import("./AmortizationTable"));
const AmortizationGraph = lazy(() => import("./AmortizationGraph"));
const LoanComparison = lazy(() => import("./LoanComparison"));

// Loading fallback component
const LoadingFallback = () => (
    <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        <span className="ml-3 text-gray-600">Loading...</span>
    </div>
);

export default function MortgageCalculator() {
    /* ---------- Inputs & state ---------- */
    const [inputs, setInputs] = useState<MortgageInputs>({
        homeValue: 500000,
        downPct: 20,
        rate: 7,
        term: 30,
        taxYr: 2700,
        insYr: 1500,
        hoaMo: 0,
        pmiMo: 0,
        extraPayment: 0,
        paymentInterval: 1,
        extraAnnualPayment: 0,
        startPaymentNumber: 1,
        firstPaymentDate: new Date().toISOString().split("T")[0],
        paymentFrequency: 'monthly',
    });
    const [include, setInclude] = useState<EscrowInclusions>({
        tax: false,
        insurance: false,
        pmi: false,
        hoa: false,
    });
    const [showExtras, setShowExtras] = useState(false);
    const [showAmort, setShowAmort] = useState(false);
    const [showComparison, setShowComparison] = useState(false);

    /* ---------- Derived values ---------- */
    const loanAmt = useMemo(
        () => inputs.homeValue * (1 - inputs.downPct / 100),
        [inputs.homeValue, inputs.downPct]
    );

    const piMo = useMemo(
        () => monthlyPI(loanAmt, inputs.rate, inputs.term),
        [loanAmt, inputs.rate, inputs.term]
    );

    // Bi-weekly payment (half of monthly, paid 26 times = 13 months equivalent)
    const piBiWeekly = useMemo(
        () => biWeeklyPI(loanAmt, inputs.rate, inputs.term),
        [loanAmt, inputs.rate, inputs.term]
    );

    // first-payment interest ≈ balance * r / 12
    const firstInterestMo = (loanAmt * inputs.rate) / 100 / 12;
    const firstPrincipalMo = Math.max(0, piMo - firstInterestMo);

    const { taxMo, insMo, hoaMo: hoa, pmiMo } = useMemo(
        () =>
            monthlyEscrows({
                taxYr: inputs.taxYr,
                insuranceYr: inputs.insYr,
                hoaMo: inputs.hoaMo,
                pmiMo: inputs.pmiMo,
            }),
        [inputs.taxYr, inputs.insYr, inputs.hoaMo, inputs.pmiMo]
    );

    // Calculate full payment based on frequency
    const basePmt = inputs.paymentFrequency === 'biweekly' ? piBiWeekly : piMo;
    const escrowPmt = inputs.paymentFrequency === 'biweekly'
        ? ((include.tax ? taxMo : 0) + (include.insurance ? insMo : 0) + (include.pmi ? pmiMo : 0) + (include.hoa ? hoa : 0)) / 2
        : (include.tax ? taxMo : 0) + (include.insurance ? insMo : 0) + (include.pmi ? pmiMo : 0) + (include.hoa ? hoa : 0);

    const fullPmt = basePmt + escrowPmt;

    const amortSchedule = useMemo(
        () =>
            generateAmortizationSchedule(
                loanAmt,
                inputs.rate,
                inputs.term,
                inputs.firstPaymentDate,
                inputs.extraPayment,
                inputs.paymentInterval,
                inputs.extraAnnualPayment,
                inputs.startPaymentNumber,
                inputs.taxYr,
                inputs.homeValue // Pass homeValue for LTV/PMI calculations
            ),
        [inputs, loanAmt]
    );

    // Find when PMI drops off
    const pmiDropOffPayment = useMemo(() => {
        const dropOffIndex = amortSchedule.findIndex(p => !p.pmiActive);
        return dropOffIndex >= 0 ? amortSchedule[dropOffIndex] : null;
    }, [amortSchedule]);

    // Calculate current LTV
    const currentLTV = useMemo(() => {
        return inputs.homeValue > 0 ? (loanAmt / inputs.homeValue) * 100 : 0;
    }, [loanAmt, inputs.homeValue]);

    /* ---------- Handlers ---------- */
    const updateInput = (key: MortgageInputKey, value: number | string) =>
        setInputs((prev) => ({ ...prev, [key]: value }));

    const loadScenario = (scenarioInputs: MortgageInputs) => {
        setInputs(scenarioInputs);
    };

    /* ---------- Render ---------- */
    return (
        <div className="flex flex-col mx-auto p-4">
            <div className="flex justify-center mb-6">
                <img
                    src="https://msfg-media.s3.us-west-2.amazonaws.com/Assets/LOGOS/MSFG+Home+Loans/MSFG-Color-Transparent.png"
                    alt="MSFG Home Loans"
                    className="h-16 sm:h-20 w-auto object-contain"
                />
            </div>

            {/* Scenario Manager & PDF Export */}
            <div className="max-w-2xl mx-auto w-full px-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <ScenarioManager
                    currentInputs={inputs}
                    onLoadScenario={loadScenario}
                />
                <PDFExport
                    inputs={inputs}
                    schedule={amortSchedule}
                    monthlyPayment={piMo}
                    loanAmount={loanAmt}
                />
            </div>

            {/* Inputs + 6-slice pie chart */}
            <div className="flex flex-col lg:flex-row justify-center mb-8 gap-4 lg:gap-8">
                {/* Inputs card */}
                <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg">
                    <h2 className="text-2xl font-bold text-center p-4 bg-gray-100">
                        Mortgage Details
                    </h2>
                    <div className="p-4">
                        <InputGrid
                            inputs={inputs}
                            onChange={updateInput}
                            showExtras={showExtras}
                        />
                    </div>
                    <button
                        className="text-blue-600 underline mt-2 ml-4 mb-4"
                        onClick={() => setShowExtras(!showExtras)}
                    >
                        {showExtras
                            ? "Hide Extra Payment Options"
                            : "Show Extra Payment Options"}
                    </button>
                </div>

                {/* 6-slice PaymentPie + EscrowToggle */}
                <div className="flex flex-col items-center">
                    <PaymentPie
                        principal={firstPrincipalMo}
                        interest={firstInterestMo}
                        tax={include.tax ? taxMo : 0}
                        insurance={include.insurance ? insMo : 0}
                        pmi={include.pmi ? pmiMo : 0}
                        hoa={include.hoa ? hoa : 0}
                    />
                    {/* Payment box now directly under the pie */}
                    <div className="mt-4 bg-slate-100 rounded-xl p-3 sm:p-4 w-full max-w-xs text-center">
                        <p className="text-lg mb-1">
                            {inputs.paymentFrequency === 'biweekly' ? 'Bi-Weekly Payment' : 'Monthly Payment'}
                        </p>
                        <p className="text-3xl font-bold">${fullPmt.toFixed(2)}</p>
                        {inputs.paymentFrequency === 'biweekly' && (
                            <p className="text-xs text-green-600 mt-2">
                                26 payments/year = ${(fullPmt * 26).toFixed(2)}/year
                            </p>
                        )}
                    </div>

                    <div className="mt-4 bg-gray-50 p-4 rounded-lg shadow-sm">
                        <EscrowToggle include={include} setInclude={setInclude} />
                    </div>

                    {/* PMI Info */}
                    {inputs.pmiMo > 0 && (
                        <div className="mt-4 bg-blue-50 p-4 rounded-lg shadow-sm text-sm">
                            <p className="font-semibold text-blue-800">PMI Information</p>
                            <p className="text-blue-700">Current LTV: {currentLTV.toFixed(1)}%</p>
                            {pmiDropOffPayment ? (
                                <p className="text-green-700">
                                    PMI drops off: Payment #{pmiDropOffPayment.paymentNumber} ({pmiDropOffPayment.paymentDate})
                                </p>
                            ) : currentLTV <= 78 ? (
                                <p className="text-green-700">PMI not required (LTV ≤ 78%)</p>
                            ) : (
                                <p className="text-blue-700">PMI required until LTV reaches 78%</p>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Toggle buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-4 px-4">
                <button
                    onClick={() => setShowComparison(!showComparison)}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                >
                    {showComparison ? "Hide Loan Comparison" : "Compare Loan Options"}
                </button>
                <button
                    onClick={() => setShowAmort(!showAmort)}
                    className="glow-btn p-4"
                >
                    {showAmort
                        ? "Hide Amortization Schedule"
                        : "Show Amortization Schedule"}
                </button>
            </div>

            {/* Loan Comparison */}
            {showComparison && (
                <Suspense fallback={<LoadingFallback />}>
                    <ChartErrorBoundary>
                        <div className="w-full max-w-6xl mx-auto px-4">
                            <LoanComparison baseInputs={inputs} />
                        </div>
                    </ChartErrorBoundary>
                </Suspense>
            )}

            {/* Table + graph (lazy loaded with error boundaries) */}
            {showAmort && (
                <Suspense fallback={<LoadingFallback />}>
                    <ChartErrorBoundary>
                        <div className="w-full mx-auto">
                            <AmortizationTable schedule={amortSchedule} />
                        </div>
                    </ChartErrorBoundary>
                    <ChartErrorBoundary>
                        <AmortizationGraph schedule={amortSchedule} />
                    </ChartErrorBoundary>
                </Suspense>
            )}
        </div>
    );
}
