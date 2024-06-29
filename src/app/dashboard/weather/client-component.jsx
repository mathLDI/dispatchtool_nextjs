'use client';

import Card from '../../lib/component/Card';

import { useRccContext } from '../RccCalculatorContext'; // Use relative path
import { useState } from 'react';
import AirportSidebar from '../../lib/component/AirportSidebar';

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
            <div className='flex'>
                <div className='p-5'>
                    <AirportSidebar></AirportSidebar>
                </div>

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


                <div>
                    <h1 className='py-5'>METAR</h1>
                    <Card title="Weather" className="bg-blue-200" style={{ width: '300px' }}>
                        <div>
                            {error && <p className='bg-orange-400' style={{ color: 'red' }}>{error}</p>}
                            {weatherData && weatherData.data && weatherData.data.length > 0 && (
                                <div>
                                    <p>{weatherData.data.find(item => item.type === 'metar').text}</p>
                                </div>
                            )}
                        </div>
                    </Card>
                    <h1 className='py-5'>TAF</h1>
                    <Card title="Weather" className="bg-blue-200" style={{ width: '300px' }}>
                        <div>
                            {error && <p className='bg-orange-400' style={{ color: 'red' }}>{error}</p>}
                            {weatherData && weatherData.data && weatherData.data.length > 0 && (
                                <div>
                                    <p>{weatherData.data.find(item => item.type === 'taf').text}</p>
                                </div>
                            )}
                        </div>
                    </Card>
                    <h1 className='py-5'>NOTAM</h1>

                    <Card title="Weather" className="bg-blue-200" style={{ width: '300px' }}>
                        <div>
                            {error && <p className='bg-orange-400' style={{ color: 'red' }}>{error}</p>}
                            {weatherData && weatherData.data && weatherData.data.length > 0 && (
                                <div>
                                    {weatherData.data.filter(item => item.type === 'notam').map((notam, index) => (
                                        <div key={index} className="mb-4"> {/* Adjust mb-4 for the desired gap between NOTAMs */}
                                            {notam.text.split('\n').map((line, lineIndex) => (
                                                <p key={lineIndex} className="mb-1">{line}</p>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </Card>
                </div>





            </div>


        </>

    );
}