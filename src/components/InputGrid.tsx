// src/components/InputGrid.tsx
import { useState, useEffect, useCallback } from "react";
import type { MortgageInputs, MortgageInputKey } from "../lib/types";
import { INPUT_CONSTRAINTS, clampValue } from "../lib/types";

/**
 * A number input + range slider pair. The text input uses local state so users
 * can freely type values. The value is committed (and clamped) on blur or Enter.
 * The range slider commits immediately on every change.
 */
function SliderInput({
    label,
    constraintKey,
    value,
    onChange,
    step,
    ariaLabel,
}: {
    label: string;
    constraintKey: keyof typeof INPUT_CONSTRAINTS;
    value: number;
    onChange: (key: keyof typeof INPUT_CONSTRAINTS, val: number) => void;
    step?: number;
    ariaLabel: string;
}) {
    const c = INPUT_CONSTRAINTS[constraintKey];
    const [localValue, setLocalValue] = useState(String(value));

    // Sync local state when the parent value changes (e.g. from slider or scenario load)
    useEffect(() => {
        setLocalValue(String(value));
    }, [value]);

    const commitValue = useCallback(() => {
        const parsed = Number(localValue);
        if (isNaN(parsed)) {
            setLocalValue(String(value));
            return;
        }
        const clamped = clampValue(constraintKey, parsed);
        setLocalValue(String(clamped));
        onChange(constraintKey, clamped);
    }, [localValue, value, constraintKey, onChange]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") commitValue();
    };

    return (
        <div>
            <label className="block text-sm font-semibold">{label}</label>
            <input
                type="number"
                value={localValue}
                step={step ?? c.step}
                onChange={(e) => setLocalValue(e.target.value)}
                onBlur={commitValue}
                onKeyDown={handleKeyDown}
                className="w-full mt-1 p-2 border rounded"
                min={c.min}
                max={c.max}
            />
            <input
                type="range"
                min={c.min}
                max={c.max}
                step={c.step}
                value={value}
                onChange={(e) => onChange(constraintKey, Number(e.target.value))}
                className="w-full mt-2"
                aria-label={ariaLabel}
            />
        </div>
    );
}

export default function InputGrid({
    inputs,
    onChange,
    showExtras,
}: {
    inputs: MortgageInputs;
    onChange: (key: MortgageInputKey, val: number | string) => void;
    showExtras?: boolean;
}) {
    const handleNumericChange = useCallback(
        (key: keyof typeof INPUT_CONSTRAINTS, value: number) => {
            onChange(key, value);
        },
        [onChange],
    );

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <SliderInput
                label="Home Value ($)"
                constraintKey="homeValue"
                value={inputs.homeValue}
                onChange={handleNumericChange}
                ariaLabel="Home value slider"
            />

            <SliderInput
                label="Down % (0-100)"
                constraintKey="downPct"
                value={inputs.downPct}
                onChange={handleNumericChange}
                ariaLabel="Down payment percentage slider"
            />

            <SliderInput
                label="Interest Rate % (annual)"
                constraintKey="rate"
                value={inputs.rate}
                onChange={handleNumericChange}
                step={0.01}
                ariaLabel="Interest rate slider"
            />

            <SliderInput
                label="Term (years)"
                constraintKey="term"
                value={inputs.term}
                onChange={handleNumericChange}
                ariaLabel="Loan term slider"
            />

            <SliderInput
                label="Annual Tax ($)"
                constraintKey="taxYr"
                value={inputs.taxYr}
                onChange={handleNumericChange}
                ariaLabel="Annual tax slider"
            />

            <SliderInput
                label="Annual Insurance ($)"
                constraintKey="insYr"
                value={inputs.insYr}
                onChange={handleNumericChange}
                ariaLabel="Annual insurance slider"
            />

            <SliderInput
                label="HOA Fee ($/mo)"
                constraintKey="hoaMo"
                value={inputs.hoaMo}
                onChange={handleNumericChange}
                ariaLabel="HOA fee slider"
            />

            <SliderInput
                label="PMI ($/mo)"
                constraintKey="pmiMo"
                value={inputs.pmiMo}
                onChange={handleNumericChange}
                ariaLabel="PMI slider"
            />

            {/* Payment Frequency */}
            <div>
                <label className="block text-sm font-semibold">Payment Frequency</label>
                <select
                    value={inputs.paymentFrequency}
                    onChange={(e) => onChange("paymentFrequency", e.target.value)}
                    className="w-full mt-1 p-2 border rounded bg-white"
                    aria-label="Payment frequency"
                >
                    <option value="monthly">Monthly (12/year)</option>
                    <option value="biweekly">Bi-Weekly (26/year)</option>
                </select>
                {inputs.paymentFrequency === "biweekly" && (
                    <p className="text-xs text-green-600 mt-1">
                        Bi-weekly pays off loan faster (equivalent to 13 monthly payments/year)
                    </p>
                )}
            </div>

            {/* First Payment Date */}
            <div>
                <label className="block text-sm font-semibold">First Payment Date</label>
                <input
                    type="date"
                    value={inputs.firstPaymentDate}
                    onChange={(e) => onChange("firstPaymentDate", e.target.value)}
                    className="w-full mt-1 p-2 border rounded"
                />
            </div>

            {/* Conditionally rendered extra payment options */}
            {showExtras && (
                <>
                    <SliderInput
                        label="Extra Payment ($/mo)"
                        constraintKey="extraPayment"
                        value={inputs.extraPayment}
                        onChange={handleNumericChange}
                        ariaLabel="Extra payment slider"
                    />

                    <SliderInput
                        label="Interval (Every N mo)"
                        constraintKey="paymentInterval"
                        value={inputs.paymentInterval}
                        onChange={handleNumericChange}
                        ariaLabel="Payment interval slider"
                    />

                    <SliderInput
                        label="Annual Extra ($ in Jan)"
                        constraintKey="extraAnnualPayment"
                        value={inputs.extraAnnualPayment}
                        onChange={handleNumericChange}
                        ariaLabel="Annual extra payment slider"
                    />

                    <SliderInput
                        label="Start at Payment #"
                        constraintKey="startPaymentNumber"
                        value={inputs.startPaymentNumber}
                        onChange={handleNumericChange}
                        ariaLabel="Start payment number slider"
                    />
                </>
            )}
        </div>
    );
}
