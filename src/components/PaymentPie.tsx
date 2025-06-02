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

    return (
        <div className="w-80 h-80">
            <ResponsiveContainer>
                <PieChart>
                    <Pie data={data} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80}>
                        {data.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip formatter={(value) => `$${(value as number).toFixed(2)}`} />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}