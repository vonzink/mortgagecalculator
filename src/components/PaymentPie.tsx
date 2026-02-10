// src/components/PaymentPie.tsx
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const COLORS = ["#16a34a", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#f472b6"];

export default function PaymentPie({
                                       principal,
                                       interest,
                                       tax,
                                       insurance,
                                       pmi,
                                       hoa,
                                   }: {
    principal: number;
    interest: number;
    tax: number;
    insurance: number;
    pmi: number;
    hoa: number;
}) {
    const data = [
        { name: "Principal", value: principal },
        { name: "Interest", value: interest },
        { name: "Tax", value: tax },
        { name: "Insurance", value: insurance },
        { name: "PMI", value: pmi },
        { name: "HOA", value: hoa },
    ];

    // Filter out zero values for cleaner display
    const filteredData = data.filter(d => d.value > 0);

    return (
        <div className="w-full max-w-xs sm:max-w-sm h-64 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={filteredData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius="40%"
                        outerRadius="65%"
                        aria-label="Payment breakdown pie chart"
                    >
                        {filteredData.map((entry) => (
                            <Cell
                                key={`cell-${entry.name}`}
                                fill={COLORS[data.findIndex(d => d.name === entry.name) % COLORS.length]}
                            />
                        ))}
                    </Pie>
                    <Tooltip formatter={(value) => `$${(value as number).toFixed(2)}`} />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}