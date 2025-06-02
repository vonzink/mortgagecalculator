type Props = {
    label: string;
    value: number | string;
    onChange: (val: number | string) => void;
    type?: "number" | "date";
};

export default function InputField({ label, value, onChange, type = "number" }: Props) {
    return (
        <label className="flex flex-col text-sm font-medium text-gray-700">
            <span className="mb-1">{label}</span>
            <input
                type={type}
                className="border border-gray-300 rounded-md px-3 py-1.5 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={value}
                onChange={(e) =>
                    onChange(type === "number" ? parseFloat(e.target.value || "0") : e.target.value)
                }
            />
        </label>
    );
}