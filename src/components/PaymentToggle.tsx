// PaymentToggle.tsx
export default function PaymentToggle({ include, setInclude }: {
    include: { tax: boolean; insurance: boolean; pmi: boolean; hoa: boolean };
    setInclude: (val: typeof include) => void;
}) {
    return (
        <div className="pt-4 space-y-2">
            {Object.keys(include).map((key) => (
                <label key={key} className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        checked={include[key as keyof typeof include]}
                        onChange={() =>
                            setInclude({
                                ...include,
                                [key]: !include[key as keyof typeof include],
                            })
                        }
                    />
                    <span className="capitalize">Include {key.toUpperCase()}</span>
                </label>
            ))}
        </div>
    );
}
