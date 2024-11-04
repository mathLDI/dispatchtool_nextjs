'use client';

import { useState } from "react";
import PropTypes from "prop-types";
import NewChoiceListbox from '../../lib/component/NewChoiceListbox';
import Card from '../../lib/component/Card';
import { CustomButton } from '../../lib/component/Button';
import { useRccContext } from '../RccCalculatorContext';
import { CrosswindComponent } from '../../lib/component/functions/crosswindComponent.js';
import { HeadwindTailwindComponent } from '../../lib/component/functions/headwindTailwindComponent.js';
import useAuth from '../../../hooks/useAuth'; // Import useAuth hook


const SecondPageCrosswindCalculator = () => {
    useAuth(); // Ensure only authenticated users can access this component

    const {
        aircraftType, setAircraftType,
        runwayHeading, setRunwayHeading,
        windDirection, setWindDirection,
        windSpeed, setWindSpeed,
        magneticVar, setMagneticVar,
        eastOrWestVar, setEastOrWestVar
    } = useRccContext();

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

    const CrosswindComponentNoNegOneDigit = parseFloat(Math.abs(CrosswindComp).toFixed(1));

    const HeadwindTailwindComp = HeadwindTailwindComponent(
        integerWindDirection,
        integerRunwayHeading,
        integerWindSpeed,
        eastOrWestVar,
        integerMagneticVar
    );

    const HeadwindTailwindComponentNoNegOneDigit = parseFloat(Math.abs(HeadwindTailwindComp).toFixed(1));

    const resetButtonHandler = () => {
        setResetListBox(true);
        setWindDirection(0);
        setRunwayHeading(0);
        setWindSpeed(0);
        setAircraftType("DHC-8");
        setMagneticVar(0);
    };

    const resetListbox1Handler = () => {
        setResetListBox(false);
    };

    return (
        <div className="flex flex-col flex-wrap p-4 space-x-4" style={{ fontFamily: 'Roboto, sans-serif', fontSize: '12px', lineHeight: '1.25' }}>
            <Card cardTitle={"Crosswind Calculator"} status={null} className="w-full sm:w-auto">
                <div className="space-y-4">
                    <div className="flex flex-col">
                        <div className="flex justify-between items-center mb-2">
                            <div>Aircraft type: </div>
                            <NewChoiceListbox
                                value={aircraftType}
                                choices={buttonAircraftType}
                                callback={setAircraftType}
                                reset={resetListBox}
                                resetCallback={resetListbox1Handler}
                            />
                        </div>

                        <div className="flex justify-between items-center mb-2">
                            <div>Runway Heading:</div>
                            <input
                                className="bg-white border rounded p-1 w-24"
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
                        </div>

                        <div className="flex justify-between items-center mb-2">
                            <div>Magnetic Variation:</div>
                            <NewChoiceListbox
                                value={eastOrWestVar}
                                choices={buttonEastOrWest}
                                callback={setEastOrWestVar}
                                reset={resetListBox}
                                resetCallback={resetListbox1Handler}
                            />
                            <input
                                className="bg-white border rounded p-1 w-16 ml-2"
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
                        </div>

                        <div className="flex justify-between items-center mb-2">
                            <div>Wind Direction:</div>
                            <input
                                className="bg-white border rounded p-1 w-24"
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
                        </div>

                        <div className="flex justify-between items-center mb-2">
                            <div>Wind Speed:</div>
                            <input
                                className="bg-white border rounded p-1 w-24"
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
                        <div>{HeadwindTailwindComp < 0 ? 'Tailwind:' : 'Headwind:'}</div>
                        <div>{HeadwindTailwindComponentNoNegOneDigit} kts</div>
                    </div>
                    <div className="flex justify-between">
                        <div>
                            {CrosswindComp === 0 ? 'No Crosswind:' : (CrosswindComp < 0 ? 'Left Crosswind:' : 'Right Crosswind:')}
                        </div>
                        <div>{CrosswindComponentNoNegOneDigit} kts</div>
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
