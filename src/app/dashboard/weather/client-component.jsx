'use client';

import Card from '../../lib/component/Card';

import { useRccContext } from '../RccCalculatorContext'; // Use relative path
import { useState } from 'react';

export default function ClientComponent({ fetchWeather }) {

    const [error, setError] = useState('');

    const {
        airportValue, setAirportValue, // Corrected the function name here
        weatherData, setWeatherData      
    } = useRccContext();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!airportValue.trim()) {
            setError('Please enter a valid location');
            return;
        }
        setError('');
        console.log(`Input value: ${airportValue}`);
        const data = await fetchWeather(airportValue);
        setWeatherData(data);
    };

    return (
        <>
        <div>
        <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        value={airportValue.toUpperCase()}
                        onChange={(e) => setAirportValue(e.target.value.toUpperCase())} // Corrected the function name here
                        maxLength={4}
                    />
                    <button type="submit">Submit</button>
                </form>
        </div>
        
        <h1 className='py-5'>METAR</h1>
        <Card title="Weather" className="bg-blue-200" style={{ width: '300px' }}>
            <div>
                {error && <p className='bg-orange-400' style={{ color: 'red' }}>{error}</p>}
                {weatherData && weatherData.data && weatherData.data.length > 0 && (
                    <div>
                        <p>{weatherData.data[0].text}</p>
                    </div>
                )}
            </div>
        </Card>



        </>
        
    );
}