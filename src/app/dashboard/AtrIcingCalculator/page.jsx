'use client';

import { useState } from 'react';
import useAuth from '../../../hooks/useAuth';
import { findMaxFlightLevel } from '../../lib/component/functions/atrMaxFlightLevel';
import { useRccContext } from '../RccCalculatorContext'; // Add this import


const weights = [29000, 31000, 33000, 35000, 37000, 39000, 41000, 43000, 45000, 47000, 48500, 49600];
const temperatures = [-10, -5, 0, 5, 10, 15, 20];
const flightLevels = [
    [250, 250, 250, 250, 250, 250, 250],
    [250, 250, 250, 250, 250, 250, 250],
    [250, 250, 250, 250, 250, 250, 240],
    [250, 250, 250, 250, 240, 240, 220],
    [250, 250, 250, 240, 220, 220, 200],
    [250, 250, 240, 220, 220, 200, 200],
    [240, 240, 220, 220, 200, 200, 180],
    [220, 220, 220, 200, 200, 180, 160],
    [220, 200, 200, 200, 180, 160, 160],
    [200, 200, 180, 180, 160, 160, 140],
    [200, 180, 180, 180, 160, 140, 120],
    [200, 180, 180, 160, 160, 140, 120]
];

const AtrIcingCalculator = () => {
    useAuth();

    const [weight, setWeight] = useState('35000');
    const [temperature, setTemperature] = useState('10');
    const [result, setResult] = useState(null);
    const [selectedCell, setSelectedCell] = useState({ row: -1, col: -1 });
    const { darkMode } = useRccContext(); // Add this line


    const handleCalculate = () => {
        const weightValue = parseFloat(weight);
        const temperatureValue = parseFloat(temperature);
        const level = findMaxFlightLevel(weightValue, temperatureValue);
        setResult(level);

        // Find closest indices for highlighting
        let weightIndex = weights.findIndex(w => w > weightValue);
        if (weightIndex === -1) weightIndex = weights.length - 1;
        const exactWeightIndex = weights.findIndex(w => w === weightValue);
        if (exactWeightIndex !== -1) weightIndex = exactWeightIndex;

        let tempIndex = temperatures.findIndex(t => t >= temperatureValue);
        if (tempIndex === -1) tempIndex = temperatures.length - 1;

        setSelectedCell({ row: weightIndex, col: tempIndex });
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleCalculate();
        }
    };

    return (
        
<div className="pt-20">
      
        <div className={`p-10 max-w-5xl mx-auto ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="mb-8 flex gap-6 items-end">
                <div className="relative">
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                        Weight (lb)
                    </label>
                    <input
                        type="number"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className={`block w-40 px-4 py-3 rounded-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500 shadow-sm transition-all duration-200 
                        ${darkMode ? 'bg-gray-700 text-gray-200' : 'bg-white text-gray-900'}`}
                    />
                </div>
                <div className="relative">
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                        Temperature (ISA @ Cruise)
                    </label>
                    <input
                        type="number"
                        value={temperature}
                        onChange={(e) => setTemperature(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className={`block w-40 px-4 py-3 rounded-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500 shadow-sm transition-all duration-200 
                        ${darkMode ? 'bg-gray-700 text-gray-200' : 'bg-white text-gray-900'}`}
                    />
                </div>
                <button
                    onClick={handleCalculate}
                    className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transform hover:scale-105 transition-all duration-200 shadow-md font-medium"
                >
                    Calculate
                </button>
            </div>

            {result && (
    <div className={`mb-8 p-6 rounded-lg shadow-md ${typeof result === 'string'
            ? darkMode ? 'bg-amber-900/50 border border-amber-700' : 'bg-amber-50 border border-amber-200'
            : darkMode ? 'bg-green-900/50 border border-green-700' : 'bg-green-50 border border-green-200'
        }`}>
        <span className={`font-medium text-lg ${darkMode ? 'text-gray-200' : ''}`}>
            Maximum Flight Level:
        </span>
        {/* Add margin-left to create space */}
        <span className={`text-lg ml-2 ${typeof result === 'string'
            ? darkMode ? 'text-amber-400' : 'text-amber-800'
            : darkMode ? 'text-green-400' : 'text-green-800'}`}>
            {typeof result === 'number' ? `FL${result}` : result}
        </span>
    </div>
)}

            <div className={`rounded-xl shadow-lg overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <div className="overflow-x-auto">
                    <table className={`min-w-full divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                        <thead className={darkMode ? 'bg-gray-900' : 'bg-gray-50'}>
                            <tr>
                                <th className={`px-6 py-4 text-left text-sm font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                                    Weight
                                </th>
                                {temperatures.map(temp => (
                                    <th key={temp} className={`px-6 py-4 text-center text-sm font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                                        {temp}°C
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                            {weights.map((w, rowIndex) => (
                                <tr key={w} className={`transition-colors duration-150 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                                        {w}
                                    </td>
                                    {flightLevels[rowIndex].map((level, colIndex) => (
                                        <td
                                            key={colIndex}
                                            className={`px-6 py-4 whitespace-nowrap text-sm text-center ${selectedCell.row === rowIndex && selectedCell.col === colIndex
                                                    ? darkMode ? 'bg-blue-900/50 text-blue-400 font-medium'
                                                        : 'bg-blue-50 text-blue-700 font-medium'
                                                    : darkMode ? 'text-gray-400' : 'text-gray-500'
                                                }`}
                                        >
                                            {level}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        </div>
    );
};


export default AtrIcingCalculator;