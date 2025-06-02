// src/components/InputGrid.tsx


export default function InputGrid({
                                      inputs,
                                      onChange,
                                      showExtras,
                                  }: {
    inputs: {
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
    };
    onChange: (key: string, val: number | string) => void;
    showExtras?: boolean;
}) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Home Value */}
            <div>
                <label className="block text-sm font-semibold">Home Value ($)</label>
                <input
                    type="number"
                    value={inputs.homeValue}
                    onChange={(e) => onChange("homeValue", Number(e.target.value))}
                    className="w-full mt-1 p-2 border rounded"
                />
                <input
                    type="range"
                    min={50000}
                    max={1000000}
                    step={1000}
                    value={inputs.homeValue}
                    onChange={(e) => onChange("homeValue", Number(e.target.value))}
                    className="w-full mt-2"
                />
            </div>

            {/* Down Payment % */}
            <div>
                <label className="block text-sm font-semibold">Down % (0–100)</label>
                <input
                    type="number"
                    value={inputs.downPct}
                    onChange={(e) => onChange("downPct", Number(e.target.value))}
                    className="w-full mt-1 p-2 border rounded"
                    min={0}
                    max={100}
                />
                <input
                    type="range"
                    min={0}
                    max={100}
                    step={1}
                    value={inputs.downPct}
                    onChange={(e) => onChange("downPct", Number(e.target.value))}
                    className="w-full mt-2"
                />
            </div>

            {/* Interest Rate % */}
            <div>
                <label className="block text-sm font-semibold">Interest Rate % (annual)</label>
                <input
                    type="number"
                    step="0.01"
                    value={inputs.rate}
                    onChange={(e) => onChange("rate", Number(e.target.value))}
                    className="w-full mt-1 p-2 border rounded"
                    min={0}
                    max={15}
                />
                <input
                    type="range"
                    min={0}
                    max={15}
                    step={0.01}
                    value={inputs.rate}
                    onChange={(e) => onChange("rate", Number(e.target.value))}
                    className="w-full mt-2"
                />
            </div>

            {/* Term (years) */}
            <div>
                <label className="block text-sm font-semibold">Term (years)</label>
                <input
                    type="number"
                    value={inputs.term}
                    onChange={(e) => onChange("term", Number(e.target.value))}
                    className="w-full mt-1 p-2 border rounded"
                    min={1}
                    max={30}
                />
                <input
                    type="range"
                    min={1}
                    max={30}
                    step={1}
                    value={inputs.term}
                    onChange={(e) => onChange("term", Number(e.target.value))}
                    className="w-full mt-2"
                />
            </div>

            {/* Annual Tax */}
            <div>
                <label className="block text-sm font-semibold">Annual Tax ($)</label>
                <input
                    type="number"
                    value={inputs.taxYr}
                    onChange={(e) => onChange("taxYr", Number(e.target.value))}
                    className="w-full mt-1 p-2 border rounded"
                    min={0}
                    max={20000}
                />
                <input
                    type="range"
                    min={0}
                    max={20000}
                    step={100}
                    value={inputs.taxYr}
                    onChange={(e) => onChange("taxYr", Number(e.target.value))}
                    className="w-full mt-2"
                />
            </div>

            {/* Annual Insurance */}
            <div>
                <label className="block text-sm font-semibold">Annual Insurance ($)</label>
                <input
                    type="number"
                    value={inputs.insYr}
                    onChange={(e) => onChange("insYr", Number(e.target.value))}
                    className="w-full mt-1 p-2 border rounded"
                    min={0}
                    max={20000}
                />
                <input
                    type="range"
                    min={0}
                    max={20000}
                    step={100}
                    value={inputs.insYr}
                    onChange={(e) => onChange("insYr", Number(e.target.value))}
                    className="w-full mt-2"
                />
            </div>

            {/* Monthly HOA */}
            <div>
                <label className="block text-sm font-semibold">HOA Fee ($/mo)</label>
                <input
                    type="number"
                    value={inputs.hoaMo}
                    onChange={(e) => onChange("hoaMo", Number(e.target.value))}
                    className="w-full mt-1 p-2 border rounded"
                    min={0}
                    max={2000}
                />
                <input
                    type="range"
                    min={0}
                    max={2000}
                    step={10}
                    value={inputs.hoaMo}
                    onChange={(e) => onChange("hoaMo", Number(e.target.value))}
                    className="w-full mt-2"
                />
            </div>

            {/* PMI (monthly dollars) */}
            <div>
                <label className="block text-sm font-semibold">PMI ($/mo)</label>
                <input
                    type="number"
                    value={inputs.pmiMo}
                    onChange={(e) => onChange("pmiMo", Number(e.target.value))}
                    className="w-full mt-1 p-2 border rounded"
                    min={0}
                    max={500}
                />
                <input
                    type="range"
                    min={0}
                    max={500}
                    step={5}
                    value={inputs.pmiMo}
                    onChange={(e) => onChange("pmiMo", Number(e.target.value))}
                    className="w-full mt-2"
                />
            </div>

            {/* First Payment Date (no slider) */}
            <div className="sm:col-span-2">
                <label className="block text-sm font-semibold">First Payment Date</label>
                <input
                    type="date"
                    value={inputs.firstPaymentDate}
                    onChange={(e) => onChange("firstPaymentDate", e.target.value)}
                    className="w-full mt-1 p-2 border rounded"
                />
            </div>

            {/* Conditionally rendered “extras” */}
            {showExtras && (
                <>
                    {/* Extra Payment Amount */}
                    <div>
                        <label className="block text-sm font-semibold">Extra Payment ($/mo)</label>
                        <input
                            type="number"
                            value={inputs.extraPayment}
                            onChange={(e) => onChange("extraPayment", Number(e.target.value))}
                            className="w-full mt-1 p-2 border rounded"
                            min={0}
                            max={5000}
                        />
                        <input
                            type="range"
                            min={0}
                            max={5000}
                            step={50}
                            value={inputs.extraPayment}
                            onChange={(e) => onChange("extraPayment", Number(e.target.value))}
                            className="w-full mt-2"
                        />
                    </div>

                    {/* Extra Payment Interval */}
                    <div>
                        <label className="block text-sm font-semibold">Interval (Every N mo)</label>
                        <input
                            type="number"
                            value={inputs.paymentInterval}
                            onChange={(e) => onChange("paymentInterval", Number(e.target.value))}
                            className="w-full mt-1 p-2 border rounded"
                            min={1}
                            max={12}
                        />
                        <input
                            type="range"
                            min={1}
                            max={12}
                            step={1}
                            value={inputs.paymentInterval}
                            onChange={(e) => onChange("paymentInterval", Number(e.target.value))}
                            className="w-full mt-2"
                        />
                    </div>

                    {/* Extra Annual Payment (January) */}
                    <div>
                        <label className="block text-sm font-semibold">Annual Extra ($ in Jan)</label>
                        <input
                            type="number"
                            value={inputs.extraAnnualPayment}
                            onChange={(e) => onChange("extraAnnualPayment", Number(e.target.value))}
                            className="w-full mt-1 p-2 border rounded"
                            min={0}
                            max={20000}
                        />
                        <input
                            type="range"
                            min={0}
                            max={20000}
                            step={100}
                            value={inputs.extraAnnualPayment}
                            onChange={(e) => onChange("extraAnnualPayment", Number(e.target.value))}
                            className="w-full mt-2"
                        />
                    </div>

                    {/* Extra Payment Start Number */}
                    <div>
                        <label className="block text-sm font-semibold">Start at Payment #</label>
                        <input
                            type="number"
                            value={inputs.startPaymentNumber}
                            onChange={(e) => onChange("startPaymentNumber", Number(e.target.value))}
                            className="w-full mt-1 p-2 border rounded"
                            min={1}
                            max={360}
                        />
                        <input
                            type="range"
                            min={1}
                            max={360}
                            step={1}
                            value={inputs.startPaymentNumber}
                            onChange={(e) => onChange("startPaymentNumber", Number(e.target.value))}
                            className="w-full mt-2"
                        />
                    </div>
                </>
            )}
        </div>
    );
}