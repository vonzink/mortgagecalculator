// src/components/AmortizationTable.tsx
import { useState, useMemo, Fragment } from "react";
import type { AmortizationPayment } from "../lib/mortgageUtils";

const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });

type SortKey = keyof AmortizationPayment | ""; // "" = unsorted

export default function AmortizationTable({
                                              schedule,
                                          }: {
    schedule: AmortizationPayment[];
}) {
    /* ---------- Sorting ---------- */
    const [sortKey, setSortKey] = useState<SortKey>("");
    const [asc, setAsc] = useState(true);

    const sorted = useMemo(() => {
        if (!sortKey) return schedule;
        const dir = asc ? 1 : -1;
        return [...schedule].sort((a, b) => {
            const valA = a[sortKey];
            const valB = b[sortKey];
            return valA < valB ? -dir : valA > valB ? dir : 0;
        });
    }, [schedule, sortKey, asc]);

    /* ---------- Year‐collapse ---------- */
    const [collapsed, setCollapsed] = useState<Set<number>>(new Set());
    const toggleYear = (yr: number) =>
        setCollapsed((prev) => {
            const next = new Set(prev);
            next.has(yr) ? next.delete(yr) : next.add(yr);
            return next;
        });

    /* ---------- CSV ---------- */
    const exportToCSV = () => {
        const csvRows = [
            [
                "Payment #",
                "Date",
                "Interest Rate",
                "Interest Due",
                "Payment Due",
                "Extra Payments",
                "Principal Paid",
                "Balance",
                "Year",
                "Tax Returned",
                "Cumulative Tax Returned",
            ],
            ...sorted.map((p) => [
                p.paymentNumber,
                formatDate(p.paymentDate),
                p.interestRate.toFixed(2),
                p.interestDue.toFixed(2),
                p.paymentAmount.toFixed(2),
                p.extraPayments.toFixed(2),
                p.principalPaid.toFixed(2),
                p.remainingBalance.toFixed(2),
                p.year,
                p.taxReturned.toFixed(2),
                p.cumulativeTaxReturned.toFixed(2),
            ]),
        ];

        const blob = new Blob([csvRows.map((r) => r.join(",")).join("\n")], {
            type: "text/csv",
        });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "amortization_schedule.csv";
        link.click();
        URL.revokeObjectURL(link.href);
    };

    /* ---------- UI ---------- */
    const headers: { label: string; key: SortKey }[] = [
        { label: "#", key: "paymentNumber" },
        { label: "Date", key: "" }, // date sorting not vital
        { label: "Interest Rate", key: "interestRate" },
        { label: "Interest Due", key: "interestDue" },
        { label: "Payment Due", key: "paymentAmount" },
        { label: "Extra Payments", key: "extraPayments" },
        { label: "Principal", key: "principalPaid" },
        { label: "Balance", key: "remainingBalance" },
    ];

    return (
        <div className="outer-table mt-4 p-4 w-full mx-auto">
            {/* ─── Add “Print” and “CSV” buttons ─── */}
            <div className="flex gap-4 mb-4">
                <button
                    onClick={() => window.print()}
                    className="px-4 py-2 bg-green-600 text-white rounded shadow hover:bg-green-700 no-print"
                >
                    Print Table
                </button>
                <button
                    onClick={exportToCSV}
                    className="px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 no-print"
                >
                    Export CSV
                </button>
            </div>

            {/* ─── “printable” wrapper: only this section shows up in PDF ─── */}
            <div className="printable">
                <div className="p-4 bg-gray-50 border-b">
                    <h3 className="text-lg font-semibold no-underline p-4">
                        Amortization Schedule
                    </h3>
                    <p className="text-sm text-gray-500 p-4">
                        Breakdown of every payment over the loan term
                    </p>
                </div>

                <div className="overflow-x-auto p-4">
                    <table className="min-w-full divide-y divide-gray-300">
                        <thead className="bg-gray-50">
                        <tr>
                            {headers.map(({ label, key }) => (
                                <th
                                    key={label}
                                    className="p-3 text-left text-xs font-semibold text-gray-600 select-none cursor-pointer"
                                    onClick={() => {
                                        if (!key) return;
                                        setAsc(key === sortKey ? !asc : true);
                                        setSortKey(key);
                                    }}
                                >
                                    {label}
                                    {key === sortKey && (asc ? " ▲" : " ▼")}
                                </th>
                            ))}
                        </tr>
                        </thead>

                        <tbody className="bg-white divide-y divide-gray-200">
                        {sorted.map((p, idx, arr) => {
                            const firstOfYear = idx === 0 || p.year !== arr[idx - 1].year;
                            const isCollapsed = collapsed.has(p.year);

                            return (
                                <Fragment key={p.paymentNumber}>
                                    {firstOfYear && (
                                        <>
                                            {/* Year header row */}
                                            <tr
                                                className="bg-gray-100 cursor-pointer"
                                                onClick={() => toggleYear(p.year)}
                                            >
                                                <td colSpan={headers.length} className="p-2 font-medium">
                                                    {isCollapsed ? "▶" : "▼"} {p.year}
                                                </td>
                                            </tr>

                                            {/* Column sub‐header for this year */}
                                            <tr className="bg-gray-50">
                                                {headers.map(({ label }) => (
                                                    <th
                                                        key={`subheader-${p.year}-${label}`}
                                                        className="p-3 text-left text-xs font-semibold text-gray-600 uppercase"
                                                    >
                                                        {label}
                                                    </th>
                                                ))}
                                            </tr>
                                        </>
                                    )}

                                    {!isCollapsed && (
                                        <tr>
                                            <td className="p-3 text-sm">{p.paymentNumber}</td>
                                            <td className="p-3 text-sm">{formatDate(p.paymentDate)}</td>
                                            <td className="p-3 text-sm">{p.interestRate.toFixed(2)}%</td>
                                            <td className="p-3 text-sm">${p.interestDue.toFixed(2)}</td>
                                            <td className="p-3 text-sm">${p.paymentAmount.toFixed(2)}</td>
                                            <td className="p-3 text-sm">${p.extraPayments.toFixed(2)}</td>
                                            <td className="p-3 text-sm">${p.principalPaid.toFixed(2)}</td>
                                            <td className="p-3 text-sm">${p.remainingBalance.toFixed(2)}</td>
                                        </tr>
                                    )}
                                </Fragment>
                            );
                        })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}