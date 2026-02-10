// src/lib/formatters.ts

/**
 * Format a number as US currency
 */
export function formatCurrency(value: number, options?: Intl.NumberFormatOptions): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
        ...options,
    }).format(value);
}

/**
 * Format a number as currency without cents (for large values)
 */
export function formatCurrencyWhole(value: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
}

/**
 * Format a number as a percentage
 */
export function formatPercent(value: number, decimals: number = 2): string {
    return new Intl.NumberFormat('en-US', {
        style: 'percent',
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    }).format(value / 100);
}

/**
 * Format a number with thousand separators
 */
export function formatNumber(value: number, decimals: number = 0): string {
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    }).format(value);
}

/**
 * Format a date string to a readable format
 */
export function formatDate(dateString: string, options?: Intl.DateTimeFormatOptions): string {
    const defaultOptions: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    };
    return new Date(dateString).toLocaleDateString('en-US', options || defaultOptions);
}

/**
 * Format a date to ISO string (YYYY-MM-DD)
 */
export function formatDateISO(date: Date): string {
    return date.toISOString().split('T')[0];
}
