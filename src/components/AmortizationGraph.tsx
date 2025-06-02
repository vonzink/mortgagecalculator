// components/AmortizationGraph.tsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { AmortizationPayment } from "../lib/mortgageUtils";

export default function AmortizationGraph({ schedule }: { schedule: AmortizationPayment[] }) {
    // Group data by year for better visualization
    const yearlyData = schedule.reduce((acc, payment) => {
        const year = payment.year;
        if (!acc[year]) {
            acc[year] = {
                year,
                balance: payment.remainingBalance,
                principalPaid: payment.principalPaid,
                interestPaid: payment.interestDue,
                totalInterestPaid: 0,
                totalPrincipalPaid: 0,
            };
        } else {
            // Use the last payment of the year for the balance
            acc[year].balance = payment.remainingBalance;
            acc[year].principalPaid += payment.principalPaid;
            acc[year].interestPaid += payment.interestDue;
        }
        return acc;
    }, {} as Record<number, any>);

    // Calculate cumulative totals
    let totalInterest = 0;
    let totalPrincipal = 0;
    const chartData = Object.values(yearlyData).map(data => {
        totalInterest += data.interestPaid;
        totalPrincipal += data.principalPaid;
        return {
            ...data,
            totalInterestPaid: totalInterest,
            totalPrincipalPaid: totalPrincipal,
        };
    });

    return (
        <div className="mt-8 p-4">
            <h3 className="text-xl font-semibold mb-4 text-center">Amortization Graph</h3>
            <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={chartData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="year" />
                        <YAxis />
                        <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`} />
                        <Legend />
                        <Line 
                            type="monotone" 
                            dataKey="balance" 
                            name="Remaining Balance" 
                            stroke="#8884d8" 
                            activeDot={{ r: 8 }} 
                        />
                        <Line 
                            type="monotone" 
                            dataKey="totalInterestPaid" 
                            name="Total Interest Paid" 
                            stroke="#82ca9d" 
                        />
                        <Line 
                            type="monotone" 
                            dataKey="totalPrincipalPaid" 
                            name="Total Principal Paid" 
                            stroke="#ffc658" 
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}