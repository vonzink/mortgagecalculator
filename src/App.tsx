// src/App.tsx
import MortgageCalculator from "./components/MortgageCalculator";
import "./styles.css";

export default function App() {
    return (
        <main className="min-h-screen bg-slate-100 p-6 flex justify-center items-start">
            <MortgageCalculator />
        </main>
    );
}