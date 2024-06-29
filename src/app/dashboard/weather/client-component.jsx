'use client';

import Card from '../../lib/component/Card';

import { useState } from 'react';

export default function ClientComponent({ fetchWeather }) {
    const [inputValue, setInputValue] = useState('');
    const [weatherData, setWeatherData] = useState(null);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!inputValue.trim()) {
            setError('Please enter a valid location');
            return;
        }
        setError('');
        console.log(`Input value: ${inputValue}`);
        const data = await fetchWeather(inputValue);
        setWeatherData(data);
    };

    return (



        <Card title="Weather" className="bg-blue-200" style={{ width: '300px' }}>

            <div>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        value={inputValue.toUpperCase()}
                        onChange={(e) => setInputValue(e.target.value.toUpperCase())}
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
