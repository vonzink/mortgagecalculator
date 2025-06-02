// src/components/EscrowToggle.tsx
import type { Dispatch, SetStateAction } from "react";

export default function EscrowToggle({
                                         include,
                                         setInclude,
                                     }: {
    include: Record<string, boolean>;
    setInclude: Dispatch<SetStateAction<Record<string, boolean>>>;
}) {
    return (
        <div>
            <h2 className="text-xl font-semibold mb-4 text-center text-gray-800">
                Escrow Inclusions
            </h2>

            <div className="space-y-4">
                {Object.entries(include).map(([key, val]) => (
                    <div key={key} className="flex items-center space-x-3 p-2">
                        <input
                            type="checkbox"
                            id={`checkbox-${key}`}
                            checked={val}
                            onChange={() => setInclude({ ...include, [key]: !val })}
                            className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />
                        <label
                            htmlFor={`checkbox-${key}`}
                            className="capitalize text-sm font-medium text-gray-700 cursor-pointer"
                        >
                            Include {key}
                        </label>
                    </div>
                ))}
            </div>
        </div>
    );
}
