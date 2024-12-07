'use client';

import { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import NewChoiceListbox from '../../lib/component/NewChoiceListbox'; // Use the correct casing
import Card from '../../lib/component/Card';
import { CustomButton } from '../../lib/component/Button';
import { useRccContext } from '../RccCalculatorContext';
import { CrosswindComponent } from '../../lib/component/functions/crosswindComponent.js';
import { HeadwindTailwindComponent } from '../../lib/component/functions/headwindTailwindComponent.js';
import useAuth from '../../../hooks/useAuth'; // Import useAuth hook
import { ChevronDoubleLeftIcon } from '@heroicons/react/solid';


const SecondPageCrosswindCalculator = () => {
    useAuth(); // Ensure only authenticated users can access this component

    const {
        aircraftType, setAircraftType,
        runwayHeading, setRunwayHeading,
        windDirection, setWindDirection,
        windSpeed, setWindSpeed,
        magneticVar, setMagneticVar,
        eastOrWestVar, setEastOrWestVar,
        flightDetails, setFlightDetails,
        allWeatherData,
    } = useRccContext();

    const [airport, setAirport] = useState(''); // Initialize as empty string
    const [runways, setRunways] = useState([]);
    const [selectedRunway, setSelectedRunway] = useState('')
    const [runwayWarning, setRunwayWarning] = useState('');
    const [resetKey, setResetKey] = useState(0); // Add reset key state
    const [airportVariation, setAirportVariation] = useState(0);
    const [latLongWarning, setLatLongWarning] = useState('');
    const [selectedWind, setSelectedWind] = useState('steady');




    const buttonAircraftType = ["DHC-8", "HS-748", "ATR-72"];
    const buttonEastOrWest = ["West", "East"];
    const [callDxp] = useState(null);
    const integerWindDirection = parseInt(windDirection, 10);
    const integerWindSpeed = parseInt(windSpeed, 10);
    const integerRunwayHeading = parseInt(runwayHeading, 10);
    const integerMagneticVar = parseInt(magneticVar, 10);

    const [resetListBox, setResetListBox] = useState(false);

    const CrosswindComp = CrosswindComponent(
        integerWindDirection,
        integerRunwayHeading,
        integerWindSpeed,
        eastOrWestVar,
        integerMagneticVar
    );

    const CrosswindComponentNoNegOneDigit = parseFloat(Math.abs(CrosswindComp).toFixed(0));

    const HeadwindTailwindComp = HeadwindTailwindComponent(
        integerWindDirection,
        integerRunwayHeading,
        integerWindSpeed,
        eastOrWestVar,
        integerMagneticVar
    );


    //console.log('HeadwindTailwindComp:', HeadwindTailwindComp);
    //console.log("CrosswindComp:", CrosswindComp);

    const HeadwindTailwindComponentNoNegOneDigit = parseFloat(Math.abs(HeadwindTailwindComp).toFixed(0));

    // Add useEffect to reset airportVariation on airport change
    useEffect(() => {
        setRunwayHeading(0);
        setWindDirection(0);
        setWindSpeed(0);
        setEastOrWestVar('West');
        setMagneticVar(0); // Add this line to reset magnetic variation
    }, [airport, setEastOrWestVar, setRunwayHeading, setWindDirection, setWindSpeed, setMagneticVar]); // Add setMagneticVar to dependencies

    // Update resetButtonHandler
    const resetButtonHandler = () => {
        setResetListBox(true);
        setWindDirection(0);
        setRunwayHeading(0);
        setWindSpeed(0);
        setAircraftType("DHC-8");
        setMagneticVar(0);
        setAirport('');
        setSelectedRunway('');
        setRunwayWarning('');
        setRunways([]);
        setResetKey(prev => prev + 1);
        setAirportVariation(0);
        setLatLongWarning(''); // Add this line
    };



    // Update useEffect for reset handling
    useEffect(() => {
        if (resetListBox) {
            setAirport('');
            setSelectedRunway('');
            setRunways([]);
            setRunwayWarning('');
            setLatLongWarning(''); // Add this line
        }
        return () => {
            if (resetListBox) {
                setResetListBox(false);
            }
        };
    }, [resetListBox]);


    const resetListbox1Handler = () => {
        setResetListBox(false);
    };

    const resetListbox2Handler = () => {
        setResetListBox(false);
    };

    const combinedAirports = [...flightDetails.icaoAirports, ...flightDetails.icaoAirportALTN];

    // Add length check helper
    const isValidIcaoCode = (code) => {
        return code && code.length === 4;
    };

    // Add NOAA API function
    // Wrap roundDeclination in useCallback
    // Update roundDeclination function added + 1 because most calculation where -1 over qc and ontario

    const roundDeclination = useCallback((value) => {
        // For negative values, flip sign, round, then flip back
        const isNegative = value < 0;
        const absValue = Math.abs(value);
        const decimal = absValue % 1;

        // Round based on decimal
        let roundedValue = decimal >= 0.5 ? Math.ceil(absValue) : Math.floor(absValue);

        // Restore negative sign if needed
        if (isNegative) {
            roundedValue = -roundedValue;
        }

        // Add 1 for positive, subtract 1 for negative
        return roundedValue + (roundedValue >= 0 ? 1 : -1);
    }, []);

    // Wrap fetchDeclination in useCallback
    const fetchDeclination = useCallback(async (latitude, longitude) => {
        if (!latitude || !longitude) {
            setLatLongWarning('No latitude/longitude data available for this airport');
            return 0;
        }
        setLatLongWarning(''); // Clear warning if coordinates exist

        const baseUrl = 'https://www.ngdc.noaa.gov/geomag-web/calculators/calculateDeclination';
        const currentDate = new Date();
        const params = new URLSearchParams({
            lat1: latitude,
            lon1: longitude,
            key: 'zNEw7',
            resultFormat: 'json',
            startYear: currentDate.getFullYear(),
            startMonth: currentDate.getMonth() + 1,
            startDay: currentDate.getDate()
        });

        try {
            const response = await fetch(`${baseUrl}?${params}`);
            if (!response.ok) throw new Error('Failed to fetch declination');
            const data = await response.json();
            const rawDeclination = data.result[0].declination;
            console.group('Declination Debug');
            console.log('Raw declination:', rawDeclination);
            console.log('Latitude used:', latitude);
            console.log('Longitude used:', longitude);
            console.log('Calculation date:', `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${currentDate.getDate()}`);
            console.log('Rounded declination:', roundDeclination(rawDeclination));
            console.groupEnd();
            return roundDeclination(rawDeclination);
        } catch (error) {
            console.error('Error fetching declination:', error);
            return 0;
        }
    }, [setLatLongWarning, roundDeclination]);

    // Update useEffect with declination fetch
    // Update useEffect with warning handling
    useEffect(() => {
        const fetchAirportData = async () => {
            if (isValidIcaoCode(airport)) {
                try {
                    const upperAirport = airport.toUpperCase();
                    console.log('Fetching data for airport:', upperAirport);

                    const [runwayResponse, latLongResponse] = await Promise.all([
                        fetch(`/api/runways?airport=${upperAirport}`),
                        fetch(`/api/latlong?airport=${upperAirport}`)
                    ]);

                    if (!runwayResponse.ok || !latLongResponse.ok) {
                        throw new Error('Failed to fetch airport data');
                    }

                    const runwayData = await runwayResponse.json();
                    const latLongData = await latLongResponse.json();

                    const airportRunways = runwayData[upperAirport] || [];
                    const airportData = latLongData[upperAirport] || {};

                    setRunways(airportRunways);

                    if (airportData.latitude && airportData.longitude) {
                        setLatLongWarning(''); // Clear warning
                        console.log(`Fetching declination for ${upperAirport}`);
                        const declination = await fetchDeclination(
                            airportData.latitude,
                            airportData.longitude
                        );
                        console.log(`Declination for ${upperAirport}: ${declination}°`);
                        setAirportVariation(declination);
                    } else {
                        console.log('No lat/long data found for airport');
                        setLatLongWarning('No LAT/LONG data available for this airport');
                        setAirportVariation(0);
                    }

                    if (airportRunways.length === 0) {
                        setRunwayWarning('No runways found in database');
                    } else {
                        setRunwayWarning('');
                    }
                } catch (error) {
                    console.error('Failed to fetch airport data:', error);
                    setRunways([]);
                    setRunwayWarning('Error fetching airport data');
                    setLatLongWarning('Error fetching airport data');
                    setAirportVariation(0);
                }
            } else {
                setRunways([]);
                setRunwayWarning('');
                setLatLongWarning('');
                setAirportVariation(0);
            }
        };

        if (isValidIcaoCode(airport)) {
            fetchAirportData();
        }
    }, [airport, fetchDeclination]);





    // Update the runway dropdown UI to show a message when no runways are found
    <select
        className="bg-white border rounded p-1"
        value={selectedRunway}
        onChange={(e) => {
            setSelectedRunway(e.target.value);
            const heading = parseInt(e.target.value.split('/')[0].replace(/[LRC]/g, '')) * 10;
            if (!isNaN(heading)) {
                setRunwayHeading(heading);
            }
        }}
    >
        <option value="">
            {runways.length === 0 ? "No runways found" : "Select Runway"}
        </option>
        {runways.map((runway) => (
            <option key={runway} value={runway}>
                {runway}
            </option>
        ))}
    </select>

    // Add function to split runway pairs into individual ends
    const splitRunwayPairs = (runwayPairs) => {
        const individualRunways = [];
        runwayPairs.forEach(pair => {
            const [end1, end2] = pair.split('/');
            individualRunways.push(end1, end2);
        });
        return individualRunways.sort((a, b) => {
            // Extract numbers for sorting
            const numA = parseInt(a.replace(/[LRC]/g, ''));
            const numB = parseInt(b.replace(/[LRC]/g, ''));
            return numA - numB;
        });
    };


    // Add useEffect to monitor airportVariation changes
    // Add debugging useEffect
    useEffect(() => {
        console.log('eastOrWestVar changed:', eastOrWestVar);
    }, [eastOrWestVar]);

    // Update handleTransferVariation with explicit state updates
    const handleTransferVariation = () => {
        if (airportVariation) {
            const isEast = airportVariation > 0;
            console.log('Transferring variation:', airportVariation);
            console.log('Setting to:', isEast ? 'East' : 'West');

            // Set states in order
            setEastOrWestVar(isEast ? 'East' : 'West');
            setMagneticVar(Math.abs(airportVariation));
        }
    };

    // Update useEffect with proper dependencies
    useEffect(() => {
        if (airport && airportVariation !== 0) {
            setEastOrWestVar(airportVariation < 0 ? 'West' : 'East');
        }
    }, [airportVariation, airport, setEastOrWestVar]);


    // Add function to get latest METAR and parse wind
    const getLatestMetarWind = (airport) => {
        if (!airport || !allWeatherData[airport]) return null;

        // Get latest METAR
        const latestMetar = allWeatherData[airport].data
            .filter(item => item.type === 'metar')
            .sort((a, b) => {
                const timeA = a.text.match(/\d{2}\d{4}Z/)[0];
                const timeB = b.text.match(/\d{2}\d{4}Z/)[0];
                return timeB.localeCompare(timeA);
            })[0];

        if (!latestMetar) return null;

        // Extract wind info using regex
        const windMatch = latestMetar.text.match(/\b(\d{3})(\d{2,3})(?:G(\d{2,3}))?KT\b/);
        if (!windMatch) return null;

        return {
            direction: windMatch[1],
            steady: windMatch[2],
            gust: windMatch[3] || null
        };
    };


    // Update WindBubble component
    const WindBubble = ({ value, onClick, isGust, selected }) => (
        <button
            onClick={onClick}
            className={`flex justify-center items-center px-3 py-1 rounded-full text-sm shadow-sm text-black dark:text-white
                ${selected
                    ? 'bg-sky-100 dark:bg-sky-900 text-blue-600'
                    : 'bg-gray-100 dark:bg-gray-700 hover:bg-sky-100 dark:hover:bg-sky-900 hover:text-blue-600'
                }`}
        >
            {isGust ? `G${value}` : value}
        </button>
    );

    // Add direction indicator function
    const formatMagneticVar = (value) => {
        if (value === 0) return '0';
        return value < 0 ? `W${Math.abs(value)}` : `E${value}`;
    };


    // Function to calculate HeadwindTailwindComp for a given runway heading
    const calculateHeadwindTailwindComp = (runwayHeading) => {
        return HeadwindTailwindComponent(
            integerWindDirection,
            runwayHeading,
            integerWindSpeed,
            eastOrWestVar,
            integerMagneticVar
        );
    };




    return (
        <div className="flex flex-col flex-wrap p-4 space-x-4" style={{ fontFamily: 'Roboto, sans-serif', fontSize: '12px', lineHeight: '1.25' }}>
            <Card cardTitle={"Crosswind Calculator"} status={null} className="w-full sm:w-auto">
                <div className="space-y-4">
                    <div className="flex flex-col">

                        <div className="flex justify-between items-center mb-2">
                            <div className="dark:text-white">
                                Airport:<span style={{ fontStyle: 'italic', color: 'gray', marginRight: '2px' }}>(Optional)</span>
                            </div>

                            <NewChoiceListbox
                                value={airport}
                                choices={['', ...combinedAirports]}
                                callback={setAirport}
                                reset={resetListBox}
                                resetCallback={resetListbox2Handler}
                                placeholder="Select airport"
                                allowManualInput={true}
                                key={`airport-${resetKey}`}
                                className="dark:bg-gray-800 dark:text-white" // Add dark mode styling
                            />
                        </div>

                        <div className="flex justify-between items-center mb-2">
                            <div className="dark:text-white">Aircraft type: </div>
                            <NewChoiceListbox
                                value={aircraftType}
                                choices={buttonAircraftType}
                                callback={setAircraftType}
                                reset={resetListBox}
                                resetCallback={resetListbox1Handler}
                            />
                        </div>

                        <div className="flex justify-between items-center mb-2">
                            <div className="dark:text-white">Runway Heading:</div>
                            <div className="flex flex-col space-y-1">
                                <div className="flex space-x-2">
                                    <input
                                        className="bg-white dark:bg-gray-800 text-black dark:text-white border dark:border-gray-600 rounded p-1 w-24"
                                        type="number"
                                        max={360}
                                        min={0}
                                        value={runwayHeading}
                                        onChange={(e) => {
                                            const v = e.target.value;
                                            if (!isNaN(v) && v >= 0 && v <= 360) {
                                                setRunwayHeading(v);
                                            }
                                        }}
                                    />
                                    {airport && ( // Only show select when airport is selected
                                        <select
                                            className="bg-white dark:bg-gray-800 text-black dark:text-white border dark:border-gray-600 rounded p-1 w-24"
                                            value={selectedRunway}
                                            onChange={(e) => {
                                                setSelectedRunway(e.target.value);
                                                const heading = parseInt(e.target.value.split('/')[0].replace(/[LRC]/g, '')) * 10;
                                                if (!isNaN(heading)) {
                                                    setRunwayHeading(heading);
                                                }
                                            }}
                                        >
                                            <option value="">
                                                {runways.length === 0 ? "No runways found" : "Select Runway"}
                                            </option>
                                            {splitRunwayPairs(runways).map((runway) => {
                                                const heading = parseInt(runway.replace(/[LRC]/g, '')) * 10;
                                                const headwindTailwindComp = calculateHeadwindTailwindComp(heading);
                                                const isTailwind = headwindTailwindComp < 0;

                                                return (
                                                    <option
                                                        key={runway}
                                                        value={runway}
                                                        className={isTailwind ? 'bg-orange-200' : ''}
                                                    >
                                                        {runway}
                                                    </option>
                                                );
                                            })}
                                        </select>
                                    )}
                                </div>
                                {runwayWarning && (
                                    <div className="text-red-500 text-sm">
                                        {runwayWarning}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-between items-center mb-2">
                            <div className="dark:text-white">Magnetic Variation:</div>
                            <div className="flex flex-col">
                                <div className="flex items-center space-x-2">
                                    <NewChoiceListbox
                                        value={eastOrWestVar}
                                        choices={buttonEastOrWest}
                                        callback={setEastOrWestVar}
                                        reset={resetListBox}
                                        resetCallback={resetListbox1Handler}
                                        key={`eastWest-${eastOrWestVar}`}
                                    />
                                    <input
                                        className="bg-white dark:bg-gray-800 text-black dark:text-white border dark:border-gray-600 rounded p-1 w-16"
                                        type="number"
                                        max={20}
                                        min={0}
                                        value={integerMagneticVar}
                                        onChange={(e) => {
                                            const v = e.target.value;
                                            if (!isNaN(v) && v >= 0 && v <= 20) {
                                                setMagneticVar(v);
                                            }
                                        }}
                                    />
                                    {airport && airportVariation !== 0 && (
                                        <WindBubble
                                            value={Math.abs(airportVariation)}
                                            onClick={handleTransferVariation}
                                        />
                                    )}
                                </div>
                                {latLongWarning && (
                                    <div className="text-red-500 text-sm mt-1">
                                        {latLongWarning}
                                    </div>
                                )}
                            </div>
                        </div>


                        <div className="flex justify-between items-center mb-2">
                            <div className="dark:text-white">Wind Direction:</div>
                            <div className="flex items-center space-x-2">
                                <input
                                    className="bg-white dark:bg-gray-800 text-black dark:text-white border dark:border-gray-600 rounded p-1 w-24"
                                    type="number"
                                    max={360}
                                    min={0}
                                    value={integerWindDirection}
                                    onChange={(e) => {
                                        const v = e.target.value;
                                        if (!isNaN(v) && v >= 0 && v <= 360) {
                                            setWindDirection(v);
                                        }
                                    }}
                                />
                                {airport && getLatestMetarWind(airport) && (
                                    <WindBubble
                                        value={getLatestMetarWind(airport).direction}
                                        onClick={() => setWindDirection(getLatestMetarWind(airport).direction)}
                                    />
                                )}
                            </div>
                        </div>

                        <div className="flex justify-between items-center mb-2">
                            <div className="dark:text-white">Wind Speed:</div>
                            <div className="flex items-center space-x-2">
                                <input
                                    className="bg-white dark:bg-gray-800 text-black dark:text-white border dark:border-gray-600 rounded p-1 w-24"
                                    type="number"
                                    max={200}
                                    min={0}
                                    value={integerWindSpeed}
                                    onChange={(e) => {
                                        const v = e.target.value;
                                        if (!isNaN(v) && v >= 0) {
                                            setWindSpeed(v);
                                        }
                                    }}
                                />
                                {airport && getLatestMetarWind(airport) && (
                                    <div className="flex space-x-2">
                                        <WindBubble
                                            value={getLatestMetarWind(airport).steady}
                                            onClick={() => setWindSpeed(getLatestMetarWind(airport).steady)}
                                        />
                                        {getLatestMetarWind(airport).gust && (
                                            <WindBubble
                                                value={getLatestMetarWind(airport).gust}
                                                onClick={() => setWindSpeed(getLatestMetarWind(airport).gust)}
                                                isGust={true}
                                            />
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <CustomButton title={"Reset"} onClickCallback={resetButtonHandler} />
                        </div>
                    </div>
                </div>
            </Card>

            <Card cardTitle={"Results Crosswind"} status={callDxp} className="w-full sm:w-auto">
                <div className="space-y-2">
                    <div className="flex justify-between">
                        <div className="dark:text-white">{HeadwindTailwindComp < 0 ? 'Tailwind:' : 'Headwind:'}</div>
                        <div className="dark:text-white">{HeadwindTailwindComponentNoNegOneDigit} kts</div>
                    </div>
                    <div className="flex justify-between">
                        <div className="dark:text-white">
                            {CrosswindComp === 0 ? 'No Crosswind:' : (CrosswindComp < 0 ? 'Left Crosswind:' : 'Right Crosswind:')}
                        </div>
                        <div className="dark:text-white">{CrosswindComponentNoNegOneDigit} kts</div>
                    </div>
                </div>
            </Card>

            <div className="space-y-2 w-full sm:w-auto">
                {aircraftType === "ATR-72" && CrosswindComponentNoNegOneDigit > 35 && (
                    <div className="bg-red-600 rounded-md p-2 text-white text-center">
                        Over Max Crosswind
                    </div>
                )}
                {aircraftType === "DHC-8" && CrosswindComponentNoNegOneDigit > 36 && (
                    <div className="bg-red-600 rounded-md p-2 text-white text-center">
                        Over Max Crosswind
                    </div>
                )}

                {aircraftType === "DHC-8" && HeadwindTailwindComp < -10 && HeadwindTailwindComp > -21 && (
                    <div className="bg-orange-400 rounded-md p-2 text-white text-center">
                        Over Max Tailwind for the DHC-8 106, DHC-8 300
                    </div>
                )}


                {aircraftType === "ATR-72" && HeadwindTailwindComp < -15 && (
                    <div className="bg-red-600 rounded-md p-2 text-white text-center">
                        Over Max Tailwind for the ATR-72
                    </div>
                )}

                {aircraftType === "DHC-8" && HeadwindTailwindComp < -20 && (
                    <div className="bg-red-600 rounded-md p-2 text-white text-center">
                        Over Max Tailwind
                    </div>
                )}
                {aircraftType === "HS-748" && CrosswindComponentNoNegOneDigit > 30 && (
                    <div className="bg-red-600 rounded-md p-2 text-white text-center">
                        Over Max Crosswind
                    </div>
                )}
                {aircraftType === "HS-748" && HeadwindTailwindComp < -10 && (
                    <div className="bg-red-600 rounded-md p-2 text-white text-center">
                        Over Max Tailwind
                    </div>
                )}
                {integerWindSpeed > 50 && (
                    <div className="bg-red-600 rounded-md p-2 text-white text-center">
                        Over Max Speed on the Ground
                    </div>
                )}

                {aircraftType === "ATR-72" && integerWindSpeed > 40 && (
                    <div className="bg-red-600 rounded-md p-2 text-white text-center">
                        Over Max Speed on the Ground for ATR-72
                    </div>
                )}

                {aircraftType === "ATR-72" && integerWindSpeed > 35 && (
                    <div className="bg-orange-400 rounded-md p-2 text-white text-center">
                        Over Max Cargo Door Wind Speed Operation for ATR-72
                    </div>
                )}

            </div>

        </div>
    );
};

SecondPageCrosswindCalculator.propTypes = {
    aircraftType: PropTypes.string,
    setAircraftType: PropTypes.func,
    runwayHeading: PropTypes.string,
    setRunwayHeading: PropTypes.func,
    windDirection: PropTypes.string,
    setWindDirection: PropTypes.func,
    initialWindSpeed: PropTypes.number,
    setWindSpeed: PropTypes.func,
    eastOrWestVar: PropTypes.string,
    setEastOrWestVar: PropTypes.func,
    initialMagneticVar: PropTypes.number,
    setMagneticVar: PropTypes.func,
};

export default SecondPageCrosswindCalculator;
