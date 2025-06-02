// src/components/PieChartGroup.tsx
import PieChartDisplay from "./PieChartDisplay";

export default function PieChartGroup({
                                          piMo,
                                          taxMo,
                                          insMo,
                                          pmiMo,
                                          hoa,
                                          include,
                                      }: {
    piMo: number;
    taxMo: number;
    insMo: number;
    pmiMo: number;
    hoa: number;
    include: { tax: boolean; insurance: boolean; pmi: boolean; hoa: boolean };
}) {
    const fullData = [
        { name: "PI", value: piMo },
        { name: "Tax", value: taxMo },
        { name: "Insurance", value: insMo },
        { name: "PMI", value: pmiMo },
        { name: "HOA", value: hoa },
    ];

    const customData = [
        { name: "PI", value: piMo },
        ...(include.tax ? [{ name: "Tax", value: taxMo }] : []),
        ...(include.insurance ? [{ name: "Insurance", value: insMo }] : []),
        ...(include.pmi ? [{ name: "PMI", value: pmiMo }] : []),
        ...(include.hoa ? [{ name: "HOA", value: hoa }] : []),
    ];

    const fullTotal = fullData.reduce((sum, d) => sum + d.value, 0);
    const customTotal = customData.reduce((sum, d) => sum + d.value, 0);

    return (
        <div className="spacing p-4">
            <h3 className="text-lg font-semibold text-center mb-4 p-4">
                Payment Breakdown
            </h3>
            <div className="flex justify-center p-4">
                <div className="grid grid-cols-2 gap-8 mt-6 w-full max-w-4xl p-4">
                    <PieChartDisplay
                        data={fullData}
                        label="Full Monthly Payment"
                        total={fullTotal}
                    />
                    <PieChartDisplay
                        data={customData}
                        label="Custom Payment"
                        total={customTotal}
                    />
                </div>
            </div>
        </div>
    );
}