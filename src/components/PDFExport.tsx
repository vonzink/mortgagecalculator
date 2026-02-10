// src/components/PDFExport.tsx
import type { MortgageInputs } from '../lib/types';
import type { AmortizationPayment } from '../lib/mortgageUtils';
import { formatCurrency } from '../lib/formatters';

interface PDFExportProps {
    inputs: MortgageInputs;
    schedule: AmortizationPayment[];
    monthlyPayment: number;
    loanAmount: number;
}

export default function PDFExport({ inputs, schedule, monthlyPayment, loanAmount }: PDFExportProps) {
    const totalInterest = schedule.reduce((sum, p) => sum + p.interestDue, 0);
    const totalPaid = schedule.reduce((sum, p) => sum + p.paymentAmount + p.extraPayments + p.additionalPayment, 0);
    const payoffDate = schedule.length > 0 ? schedule[schedule.length - 1].paymentDate : 'N/A';
    const pmiDropOff = schedule.find(p => !p.pmiActive);

    const handleExportPDF = () => {
        // Create a new window with printable content
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            alert('Please allow popups to export PDF');
            return;
        }

        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Mortgage Summary - Mountain State Financial Group</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        padding: 40px;
                        color: #1f2937;
                    }
                    h1 {
                        text-align: center;
                        color: #008f51;
                        border-bottom: 2px solid #008f51;
                        padding-bottom: 10px;
                    }
                    h2 {
                        color: #374151;
                        margin-top: 30px;
                    }
                    .summary-grid {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 20px;
                        margin: 20px 0;
                    }
                    .summary-box {
                        background: #f9fafb;
                        padding: 15px;
                        border-radius: 8px;
                        border: 1px solid #e5e7eb;
                    }
                    .summary-box h3 {
                        margin: 0 0 10px 0;
                        color: #6b7280;
                        font-size: 14px;
                    }
                    .summary-box .value {
                        font-size: 24px;
                        font-weight: bold;
                        color: #1f2937;
                    }
                    .highlight {
                        background: #f0fdf4;
                        border-color: #16a34a;
                    }
                    .highlight .value {
                        color: #16a34a;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-top: 20px;
                        font-size: 12px;
                    }
                    th, td {
                        border: 1px solid #e5e7eb;
                        padding: 8px;
                        text-align: left;
                    }
                    th {
                        background: #f3f4f6;
                        font-weight: 600;
                    }
                    .footer {
                        margin-top: 40px;
                        text-align: center;
                        color: #9ca3af;
                        font-size: 12px;
                    }
                    @media print {
                        body { padding: 20px; }
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body>
                <h1>Mountain State Financial Group</h1>
                <h2>Mortgage Summary</h2>

                <div class="summary-grid">
                    <div class="summary-box">
                        <h3>Home Value</h3>
                        <div class="value">${formatCurrency(inputs.homeValue)}</div>
                    </div>
                    <div class="summary-box">
                        <h3>Loan Amount</h3>
                        <div class="value">${formatCurrency(loanAmount)}</div>
                    </div>
                    <div class="summary-box">
                        <h3>Down Payment</h3>
                        <div class="value">${inputs.downPct}% (${formatCurrency(inputs.homeValue * inputs.downPct / 100)})</div>
                    </div>
                    <div class="summary-box">
                        <h3>Interest Rate</h3>
                        <div class="value">${inputs.rate}%</div>
                    </div>
                    <div class="summary-box">
                        <h3>Loan Term</h3>
                        <div class="value">${inputs.term} years</div>
                    </div>
                    <div class="summary-box highlight">
                        <h3>Monthly Payment (P&I)</h3>
                        <div class="value">${formatCurrency(monthlyPayment)}</div>
                    </div>
                </div>

                <h2>Loan Totals</h2>
                <div class="summary-grid">
                    <div class="summary-box">
                        <h3>Total Interest Paid</h3>
                        <div class="value">${formatCurrency(totalInterest)}</div>
                    </div>
                    <div class="summary-box">
                        <h3>Total Amount Paid</h3>
                        <div class="value">${formatCurrency(totalPaid)}</div>
                    </div>
                    <div class="summary-box">
                        <h3>Number of Payments</h3>
                        <div class="value">${schedule.length}</div>
                    </div>
                    <div class="summary-box highlight">
                        <h3>Payoff Date</h3>
                        <div class="value">${new Date(payoffDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                    </div>
                </div>

                ${inputs.pmiMo > 0 && pmiDropOff ? `
                <h2>PMI Information</h2>
                <div class="summary-box" style="max-width: 300px;">
                    <h3>PMI Drops Off</h3>
                    <div class="value">Payment #${pmiDropOff.paymentNumber}</div>
                    <p style="color: #6b7280; margin-top: 5px;">${new Date(pmiDropOff.paymentDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}</p>
                </div>
                ` : ''}

                <h2>Monthly Escrow Breakdown</h2>
                <table>
                    <tr>
                        <th>Item</th>
                        <th>Annual</th>
                        <th>Monthly</th>
                    </tr>
                    <tr>
                        <td>Property Tax</td>
                        <td>${formatCurrency(inputs.taxYr)}</td>
                        <td>${formatCurrency(inputs.taxYr / 12)}</td>
                    </tr>
                    <tr>
                        <td>Home Insurance</td>
                        <td>${formatCurrency(inputs.insYr)}</td>
                        <td>${formatCurrency(inputs.insYr / 12)}</td>
                    </tr>
                    ${inputs.hoaMo > 0 ? `
                    <tr>
                        <td>HOA Fees</td>
                        <td>${formatCurrency(inputs.hoaMo * 12)}</td>
                        <td>${formatCurrency(inputs.hoaMo)}</td>
                    </tr>
                    ` : ''}
                    ${inputs.pmiMo > 0 ? `
                    <tr>
                        <td>PMI</td>
                        <td>${formatCurrency(inputs.pmiMo * 12)}</td>
                        <td>${formatCurrency(inputs.pmiMo)}</td>
                    </tr>
                    ` : ''}
                </table>

                <div class="footer">
                    <p>Generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    <p>Mountain State Financial Group - Mortgage Calculator</p>
                </div>

                <button class="no-print" onclick="window.print()" style="margin-top: 20px; padding: 10px 20px; cursor: pointer;">
                    Print / Save as PDF
                </button>
            </body>
            </html>
        `;

        printWindow.document.write(html);
        printWindow.document.close();
    };

    return (
        <button
            onClick={handleExportPDF}
            className="px-4 py-2 bg-purple-600 text-white rounded shadow hover:bg-purple-700 focus:ring-2 focus:ring-purple-400 focus:outline-none text-sm"
            aria-label="Export mortgage summary to PDF"
        >
            Export PDF Summary
        </button>
    );
}
