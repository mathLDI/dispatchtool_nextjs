'use client';

import Card from '../../lib/component/Card';

import { useState } from 'react';

export default function ClientComponent({ fetchWeather }) {
    const [airportValue, setairportValue] = useState('');
    const [weatherData, setWeatherData] = useState(null);
    const [error, setError] = useState('');

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



        <Card title="Weather" className="bg-blue-200" style={{ width: '300px' }}>

            <div>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        value={airportValue.toUpperCase()}
                        onChange={(e) => setairportValue(e.target.value.toUpperCase())}
                        maxLength={4}
                    />
                    <button type="submit">Submit</button>
                </form>

                {error && <p className='bg-orange-400' style={{ color: 'red' }}>{error}</p>}
                {weatherData && weatherData.data && weatherData.data.length > 0 && (
                    <div>
                        <h3>Weather Data:</h3>
                        <p>{weatherData.data[0].text}</p>
                    </div>
                )}
            </div>


        </Card>


    );
}
