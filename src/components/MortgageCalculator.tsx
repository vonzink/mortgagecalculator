// src/components/MortgageCalculator.tsx
import { useState, useMemo } from "react";
import {
    monthlyPI,
    monthlyEscrows,
    generateAmortizationSchedule,
} from "../lib/mortgageUtils";
import InputGrid from "./InputGrid";
import EscrowToggle from "./EscrowToggle";
import PaymentPie from "./PaymentPie";
import AmortizationTable from "./AmortizationTable";
import AmortizationGraph from "./AmortizationGraph";

export default function MortgageCalculator() {
    /* ---------- Inputs & state ---------- */
    const [inputs, setInputs] = useState({
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
    });
    const [include, setInclude] = useState({
        tax: true,
        insurance: true,
        pmi: true,
        hoa: true,
    });
    const [showExtras, setShowExtras] = useState(false);
    const [showAmort, setShowAmort] = useState(false);

    /* ---------- Derived values ---------- */
    const loanAmt = useMemo(
        () => inputs.homeValue * (1 - inputs.downPct / 100),
        [inputs.homeValue, inputs.downPct]
    );

    const piMo = useMemo(
        () => monthlyPI(loanAmt, inputs.rate, inputs.term),
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

    const fullPmt =
        piMo +
        (include.tax ? taxMo : 0) +
        (include.insurance ? insMo : 0) +
        (include.pmi ? pmiMo : 0) +
        (include.hoa ? hoa : 0);

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
                inputs.taxYr
            ),
        [inputs, loanAmt]
    );

    /* ---------- Handlers ---------- */
    const updateInput = (key: string, value: number | string) =>
        setInputs((prev) => ({ ...prev, [key]: value }));

    /* ---------- Render ---------- */
    return (
        <div className="flex flex-col mx-auto p-4">
            <h1 className="text-3xl font-bold text-center mb-6">
                Mountain State Financial Group
            </h1>

            {/* Inputs + 6-slice pie chart */}
            <div className="flex justify-center mb-8 gap-8">
                {/* Inputs card */}
                <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg">
                    <h2 className="text-2xl font-bold text-center p-4 bg-gray-100">
                    </h2>
                    <div className="p-4">
                        <InputGrid
                            inputs={inputs}
                            onChange={updateInput}
                            showExtras={showExtras}
                        />
                    </div>
                    <button
                        className="text-blue-600 underline mt-2 ml-4"
                        onClick={() => setShowExtras(!showExtras)}
                    >
                        {showExtras
                            ? "Hide Extra Payment Options"
                            : "Show Extra Payment Options"}
                    </button>
                    <div className="p-4 border-t bg-gray-50">
                        {/* (EscrowToggle moved under pie) */}
                    </div>
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
                    {/* Monthly Payment box now directly under the pie */}
                    <div className="mt-4 bg-slate-100 rounded-xl p-4 w-full max-w-xs text-center">
                        <p className="text-lg mb-1">Monthly Payment</p>
                        <p className="text-3xl font-bold">${fullPmt.toFixed(2)}</p>
                    </div>

                    <div className="mt-4 bg-gray-50 p-4 rounded-lg shadow-sm">
                        <EscrowToggle include={include} setInclude={setInclude} />
                    </div>
                </div>
            </div>

            {/* Monthly payment box */}
            <div className="flex justify-center mb-8">
                <div className="bg-slate-100 rounded-xl p-6 w-full max-w-md text-center">
                    <p className="text-lg mb-2">Monthly Payment</p>
                    <p className="text-3xl font-bold">${fullPmt.toFixed(2)}</p>
                </div>
            </div>

            {/* Toggle amortization */}
            <div className="flex justify-center mb-4">
                <button
                    onClick={() => setShowAmort(!showAmort)}
                    className="glow-btn w-3/4 mx-auto p-4"
                >
                    {showAmort
                        ? "Hide Amortization Schedule"
                        : "Show Amortization Schedule"}
                </button>
            </div>

            {/* Table + graph */}
            {showAmort && (
                <>
                    <div className="w-full mx-auto">
                        <AmortizationTable schedule={amortSchedule} />
                    </div>
                    <AmortizationGraph schedule={amortSchedule} />
                </>
            )}
        </div>
    );
}
