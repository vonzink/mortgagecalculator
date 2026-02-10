// src/components/AmortizationTable.tsx
import { useState, useMemo, Fragment } from "react";
import type { AmortizationPayment } from "../lib/mortgageUtils";
import { formatCurrency } from "../lib/formatters";

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
            if (next.has(yr)) {
                next.delete(yr);
            } else {
                next.add(yr);
            }
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
                "PMI Active",
                "LTV %",
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
                p.pmiActive ? "Yes" : "No",
                (p.ltv * 100).toFixed(1),
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
    const headers: { label: string; key: SortKey; description: string }[] = [
        { label: "#", key: "paymentNumber", description: "Payment number" },
        { label: "Date", key: "", description: "Payment date" },
        { label: "Rate", key: "interestRate", description: "Interest rate" },
        { label: "Interest", key: "interestDue", description: "Interest due" },
        { label: "Payment", key: "paymentAmount", description: "Payment amount due" },
        { label: "Extra", key: "extraPayments", description: "Extra payments" },
        { label: "Principal", key: "principalPaid", description: "Principal paid" },
        { label: "Balance", key: "remainingBalance", description: "Remaining balance" },
    ];

    const handleSort = (key: SortKey) => {
        if (!key) return;
        setAsc(key === sortKey ? !asc : true);
        setSortKey(key);
    };

    const handleKeyDown = (e: React.KeyboardEvent, key: SortKey) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleSort(key);
        }
    };

    const handleYearKeyDown = (e: React.KeyboardEvent, year: number) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleYear(year);
        }
    };

    return (
        <div className="outer-table mt-4 p-2 sm:p-4 w-full mx-auto" role="region" aria-label="Amortization Schedule">
            {/* ─── Add "Print" and "CSV" buttons ─── */}
            <div className="flex flex-wrap gap-2 sm:gap-4 mb-4">
                <button
                    onClick={() => window.print()}
                    className="px-3 py-2 sm:px-4 bg-green-600 text-white rounded shadow hover:bg-green-700 focus:ring-2 focus:ring-green-400 focus:outline-none no-print text-sm sm:text-base"
                    aria-label="Print amortization table"
                >
                    Print Table
                </button>
                <button
                    onClick={exportToCSV}
                    className="px-3 py-2 sm:px-4 bg-blue-600 text-white rounded shadow hover:bg-blue-700 focus:ring-2 focus:ring-blue-400 focus:outline-none no-print text-sm sm:text-base"
                    aria-label="Export amortization schedule to CSV"
                >
                    Export CSV
                </button>
            </div>

            {/* ─── "printable" wrapper: only this section shows up in PDF ─── */}
            <div className="printable">
                <div className="p-2 sm:p-4 bg-gray-50 border-b">
                    <h3 className="text-lg font-semibold no-underline p-2 sm:p-4" id="amort-table-heading">
                        Amortization Schedule
                    </h3>
                    <p className="text-sm text-gray-500 px-2 sm:px-4" id="amort-table-desc">
                        Breakdown of every payment over the loan term. Click year headers to expand/collapse.
                    </p>
                </div>

                <div className="overflow-x-auto p-2 sm:p-4">
                    <table
                        className="min-w-full divide-y divide-gray-300"
                        aria-labelledby="amort-table-heading"
                        aria-describedby="amort-table-desc"
                    >
                        <thead className="bg-gray-50">
                        <tr>
                            {headers.map(({ label, key, description }) => (
                                <th
                                    key={label}
                                    scope="col"
                                    className="p-2 sm:p-3 text-left text-xs font-semibold text-gray-600 select-none cursor-pointer hover:bg-gray-100 focus:bg-gray-200 focus:outline-none"
                                    onClick={() => handleSort(key)}
                                    onKeyDown={(e) => handleKeyDown(e, key)}
                                    tabIndex={key ? 0 : -1}
                                    role={key ? "button" : undefined}
                                    aria-sort={key === sortKey ? (asc ? "ascending" : "descending") : undefined}
                                    aria-label={key ? `Sort by ${description}` : description}
                                >
                                    {label}
                                    {key === sortKey && (
                                        <span aria-hidden="true">{asc ? " ▲" : " ▼"}</span>
                                    )}
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
                                                className="bg-gray-100 cursor-pointer hover:bg-gray-200 focus-within:bg-gray-200"
                                                onClick={() => toggleYear(p.year)}
                                                onKeyDown={(e) => handleYearKeyDown(e, p.year)}
                                                tabIndex={0}
                                                role="button"
                                                aria-expanded={!isCollapsed}
                                                aria-label={`${p.year} payments, ${isCollapsed ? 'click to expand' : 'click to collapse'}`}
                                            >
                                                <td colSpan={headers.length} className="p-2 font-medium">
                                                    <span aria-hidden="true">{isCollapsed ? "▶" : "▼"}</span> {p.year}
                                                </td>
                                            </tr>

                                            {/* Column sub‐header for this year */}
                                            {!isCollapsed && (
                                                <tr className="bg-gray-50">
                                                    {headers.map(({ label, description }) => (
                                                        <th
                                                            key={`subheader-${p.year}-${label}`}
                                                            scope="col"
                                                            className="p-2 sm:p-3 text-left text-xs font-semibold text-gray-600 uppercase"
                                                            aria-label={description}
                                                        >
                                                            {label}
                                                        </th>
                                                    ))}
                                                </tr>
                                            )}
                                        </>
                                    )}

                                    {!isCollapsed && (
                                        <tr className={p.pmiActive ? "" : "bg-green-50"}>
                                            <td className="p-2 sm:p-3 text-xs sm:text-sm">{p.paymentNumber}</td>
                                            <td className="p-2 sm:p-3 text-xs sm:text-sm">{formatDate(p.paymentDate)}</td>
                                            <td className="p-2 sm:p-3 text-xs sm:text-sm">{p.interestRate.toFixed(2)}%</td>
                                            <td className="p-2 sm:p-3 text-xs sm:text-sm">{formatCurrency(p.interestDue)}</td>
                                            <td className="p-2 sm:p-3 text-xs sm:text-sm">{formatCurrency(p.paymentAmount)}</td>
                                            <td className="p-2 sm:p-3 text-xs sm:text-sm">{formatCurrency(p.extraPayments)}</td>
                                            <td className="p-2 sm:p-3 text-xs sm:text-sm">{formatCurrency(p.principalPaid)}</td>
                                            <td className="p-2 sm:p-3 text-xs sm:text-sm">{formatCurrency(p.remainingBalance)}</td>
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
