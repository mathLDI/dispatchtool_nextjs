'use client';

import { useState, useEffect } from "react";
import { ChoiceListbox } from '../../lib/component/ListBox';
import Card from '../../lib/component/Card';
import { CustomButton } from '../../lib/component/Button';
import PropTypes from "prop-types";
import { useRccContext } from '../RccCalculatorContext'; // Use relative path
import { CrosswindComponent } from '../../lib/component/functions/crosswindComponent.js';
import { HeadwindTailwindComponent } from '../../lib/component/functions/headwindTailwindComponent.js';

const SecondPageCrosswindCalculator = ({ onFocus, onBlur }) => {
    const {
        aircraftType, setAircraftType,
        runwayHeading, setRunwayHeading,
        windDirection, setWindDirection,
        windSpeed, setWindSpeed,
        magneticVar, setMagneticVar,
        eastOrWestVar, setEastOrWestVar
    } = useRccContext();

    const buttonAircraftType = ["DHC-8", "HS-748"];
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

    useEffect(() => {
        console.log('SecondPageCrosswindCalculator is re-rendering');
    }, []);

    return (
        <div className="flex flex-col flex-wrap p-4 space-x-4"> {/* Use flex-wrap to allow wrapping */}

            <Card cardTitle={"Crosswind Calculator"} status={null} className="w-full sm:w-auto">
                <div className="space-y-4">

                    <div className="flex flex-col">
                        <div className="flex justify-between items-center mb-2">
                            <div>Aircraft type: </div>
                            <ChoiceListbox
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
                                onFocus={onFocus}
                                onBlur={onBlur}
                            />
                        </div>

                        <div className="flex justify-between items-center mb-2">
                            <div>Magnetic Variation:</div>

                            <ChoiceListbox
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
                                onFocus={onFocus}
                                onBlur={onBlur}
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
                                onFocus={onFocus}
                                onBlur={onBlur}
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
                                onFocus={onFocus}
                                onBlur={onBlur}
                            />
                        </div>

                        <div>
                            <CustomButton
                                title={"Reset"} onClickCallback={resetButtonHandler} />
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
                {aircraftType === "DHC-8" && CrosswindComponentNoNegOneDigit > 36 && (
                    <div className="bg-red-600 rounded-md p-2 text-white text-center">
                        Over Max Crosswind
                    </div>
                )}
                {aircraftType === "DHC-8" && HeadwindTailwindComp < -10 && HeadwindTailwindComp > -21 && (
                    <div className="bg-orange-400 rounded-md p-2 text-white text-center">
                        Over Max Tailwind for the DHC-8 106 and DHC-8 300
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
    onFocus: PropTypes.func,
    onBlur: PropTypes.func,
};

export default SecondPageCrosswindCalculator;
