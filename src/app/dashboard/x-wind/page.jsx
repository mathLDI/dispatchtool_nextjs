"use client"

import { useState, useEffect } from "react";
import { ChoiceListbox } from '../../lib/component/ListBox';
import Card from '../../lib/component/Card';
import { CustomButton } from '../../lib/component/Button';
import PropTypes from "prop-types";
import { useRccContext } from '../RccCalculatorContext'; // Use relative path
import { CrosswindComponent } from '../../lib/component/functions/crosswindComponent.js';
import { HeadwindTailwindComponent } from '../../lib/component/functions/headwindTailwindComponent.js';



const SecondPageCrosswindCalculator = () => {

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

    )

    const CrosswindComponentNoNegOneDigit = parseFloat(Math.abs(CrosswindComp,).toFixed(1));



    const HeadwindTailwindComp = HeadwindTailwindComponent(
        integerWindDirection,
        integerRunwayHeading,
        integerWindSpeed,
        eastOrWestVar,
        integerMagneticVar

    )

    const HeadwindTailwindComponentNoNegOneDigit = parseFloat(Math.abs(HeadwindTailwindComp,).toFixed(1));



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
    }, []); // assuming aircraftType is the state you are updating


    return (

        <div>


            <Card cardTitle={"Crosswind Calculator"} status={null}>
                <div>
                    <div className="flex flex-row justify-between items-center p-2">
                        <div>Aircraft type: </div>
                        <ChoiceListbox
                            value={aircraftType}
                            choices={buttonAircraftType}
                            callback={setAircraftType}
                            reset={resetListBox}
                            resetCallback={resetListbox1Handler}

                        />
                    </div>



                    <div className="flex flex-row justify-between items-center p-2">
                        <div>Runway Heading:</div>
                        <input
                            className="flex dark:bg-black"
                            type="number"
                            max={360}
                            min={0}
                            value={runwayHeading} // Replace 'yourValueState' with the state you want to manage the input's value
                            onChange={(e) => {
                                // Handle input value changes here
                                const v = e.target.value;
                                // You can add validation here to ensure the number is not longer than 5 digits
                                if (!isNaN(v) && v >= 0 && v <= 360) {
                                    setRunwayHeading(v); // Update the state with the new value
                                }
                            }}
                        />
                    </div>

                    {/**new section for magnetic variation below */}

                    <div className="flex flex-row justify-between items-center p-2">
                        <div>Magnetic Variation:</div>

                        <div className="flex ">



                            <div className="flex justify-end w-20 pr-10  ">

                                <ChoiceListbox
                                    value={eastOrWestVar}
                                    choices={buttonEastOrWest}
                                    callback={setEastOrWestVar}
                                    reset={resetListBox}
                                    resetCallback={resetListbox1Handler}

                                />
                            </div>


                            <div className="p-2">
                                <input
                                    className="flex dark:bg-black"
                                    type="number"
                                    max={20}
                                    min={0}
                                    value={integerMagneticVar
                                    } // Replace 'yourValueState' with the state you want to manage the input's value
                                    onChange={(e) => {
                                        // Handle input value changes here
                                        const v = e.target.value;
                                        // Ensure the input value is a non-negative number
                                        if (!isNaN(v) && v >= 0 && v <= 20) {
                                            setMagneticVar(v); // Update the state with the new value
                                        }
                                    }}
                                />
                            </div>



                        </div>

                    </div>

                    <div className="flex flex-row justify-between items-center p-2">
                        <div>Wind Direction:</div>
                        <input
                            className="flex dark:bg-black"
                            type="number"
                            max={360}
                            min={0}
                            value={integerWindDirection} // Replace 'yourValueState' with the state you want to manage the input's value
                            onChange={(e) => {
                                // Handle input value changes here
                                const v = e.target.value;
                                // Ensure the input value is a non-negative number
                                if (!isNaN(v) && v >= 0 && v <= 360) {
                                    setWindDirection(v); // Update the state with the new value
                                }
                            }}
                        />
                    </div>

                    <div className="flex flex-row justify-between items-center p-2">
                        <div>Wind Speed:</div>
                        <input
                            className="flex dark:bg-black"
                            type="number"
                            max={200}
                            min={0}
                            value={integerWindSpeed} // Replace 'yourValueState' with the state you want to manage the input's value
                            onChange={(e) => {
                                // Handle input value changes here
                                const v = e.target.value;
                                // Ensure the input value is a non-negative number
                                if (!isNaN(v) && v >= 0) {
                                    setWindSpeed(v); // Update the state with the new value
                                }
                            }}
                        />
                    </div>


                    <div className="p-2">
                        <CustomButton
                            title={"Reset"} onClickCallback={resetButtonHandler} />
                    </div>
                </div>

            </Card>

            <div >

                <div>
                    <Card cardTitle={"Results Crosswind"} status={callDxp}>
                        <div>
                            <div className="flex flex-row justify-between p-2">
                                {HeadwindTailwindComp < 0 && (
                                    <div>Tailwind:</div>
                                )}

                                {HeadwindTailwindComp >= 0 && (
                                    <div>Headwind:</div>
                                )}

                                <div >
                                    {HeadwindTailwindComponentNoNegOneDigit} kts
                                </div>
                            </div>

                            <div className="flex flex-row justify-between p-2">

                                {CrosswindComp == 0 && (
                                    <div>No Crosswind:</div>)}

                                {CrosswindComp < 0 && (
                                    <div>Left Crosswind:</div>)}

                                {CrosswindComp > 0 && (
                                    <div>Right Crosswind:</div>)}

                                <div >
                                    {CrosswindComponentNoNegOneDigit} kts
                                </div>
                            </div>

                        </div>


                    </Card>


                </div>


            </div>

            {/**All alerts below */}


            <div style={{ marginBottom: '10px' }}>
                {aircraftType === "DHC-8" && CrosswindComponentNoNegOneDigit > 36 &&
                    (<div className="flex flex-row bg-red-600 rounded-md p-2 text-white justify-center items-center">
                        Over Max Crosswind
                    </div>)}
            </div>

            <div style={{ marginBottom: '10px' }}>
                {aircraftType === "DHC-8" && HeadwindTailwindComp < -10 && HeadwindTailwindComp > -21 &&
                    (<div className="flex flex-row bg-orange-400 rounded-md p-2 text-white justify-center items-center">
                        Over Max Tailwind for the DHC-8 106 and DHC-8 300
                    </div>)}
            </div>

            <div style={{ marginBottom: '10px' }}>
                {aircraftType === "DHC-8" && HeadwindTailwindComp < -20 &&
                    (<div className="flex flex-row bg-red-600 rounded-md p-2 text-white justify-center items-center">
                        Over Max Tailwind
                    </div>)}
            </div>

            <div style={{ marginBottom: '10px' }}>
                {aircraftType === "HS-748" && CrosswindComponentNoNegOneDigit > 30 &&
                    (<div className="flex flex-row bg-red-600 rounded-md p-2 text-white justify-center items-center">
                        Over Max Crosswind
                    </div>)}
            </div>

            <div style={{ marginBottom: '10px' }}>
                {aircraftType === "HS-748" && HeadwindTailwindComp < -10 &&
                    (<div className="flex flex-row bg-red-600 rounded-md p-2 text-white justify-center items-center">
                        Over Max Tailwind
                    </div>)}
            </div>

            <div style={{ marginBottom: '10px' }}>
                {integerWindSpeed > 50 &&
                    (<div className="flex flex-row bg-red-600 rounded-md p-2 text-white justify-center items-center">
                        Over Max Speed on the Ground
                    </div>)}
            </div>


        </div>

    );

}

export default SecondPageCrosswindCalculator;


SecondPageCrosswindCalculator.propTypes = {
    aircraftType: PropTypes.string,
    setAircraftType: PropTypes.func, // Change to func instead of string
    runwayHeading: PropTypes.string,
    setRunwayHeading: PropTypes.func, // Change to func
    windDirection: PropTypes.string,
    setWindDirection: PropTypes.func, // Change to func
    initialWindSpeed: PropTypes.number,
    setWindSpeed: PropTypes.func, // Change to func
    eastOrWestVar: PropTypes.string,
    setEastOrWestVar: PropTypes.func,
    initialMagneticVar: PropTypes.number,
    setMagneticVar: PropTypes.func,

};

