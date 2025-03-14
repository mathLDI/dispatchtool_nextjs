'use client';

import { useState } from "react";
import NewChoiceListbox from '../../lib/component/NewChoiceListbox'; // Use the correct casing
import Card from '../../lib/component/Card';
import { CustomButton } from '../../lib/component/Button';
import PropTypes from "prop-types";
import { contaminent } from '../../lib/component/functions/runwayType';
import { useRccContext } from '../RccCalculatorContext'; // Use relative path
import useAuth from '../../../hooks/useAuth'; // Import useAuth hook

const FirstPageRccProvided = (props) => {
    useAuth(); // Ensure only authenticated users can access this component

    const { } = props;

    const {
        aircraftType, setAircraftType,
        rwycc1, setRwycc1,
        rwycc2, setRwycc2,
        rwycc3, setRwycc3,
        correctedLandingDistance, setCorrectedLandingDistance,
        runwayLength, setRunwayLength
    } = useRccContext();

    const rwyccChoices = [6, 5, 4, 3, 2, 1, 0];
    const buttonAircraftType = ["DHC-8", "HS-748", "ATR-72"];
    const [callDxp] = useState(null);
    const [resetListBox, setResetListBox] = useState(false);
    const integerRunwayLength = parseInt(runwayLength, 10);
    const integerCorrectedLandingDistance = parseInt(correctedLandingDistance, 10);
    const [isExpanded, setIsExpanded] = useState(false);

    const resetButtonHandler = () => {
        setResetListBox(true);
        setTimeout(() => {
            setResetListBox(false);
        }, 0);
        setRwycc1(6);
        setRwycc2(6);
        setRwycc3(6);
        setRunwayLength(0);
        setCorrectedLandingDistance(0);
        setAircraftType("DHC-8");
    };

    const resetListbox1Handler = () => {
        setResetListBox(false);
    };

    const ldgDistLongerRwyLgth = integerCorrectedLandingDistance > integerRunwayLength ? true : false;

    const enterDistances =
        integerCorrectedLandingDistance === 0 ||
        integerRunwayLength === 0 ||
        isNaN(integerCorrectedLandingDistance) ||
        isNaN(integerRunwayLength)
            ? true
            : false;

    const CorrectedLandingRwyccToUse =
        integerCorrectedLandingDistance === 0 || integerRunwayLength === 0 ||
        isNaN(integerCorrectedLandingDistance) || isNaN(integerRunwayLength)
            ? undefined
            : integerCorrectedLandingDistance <= integerRunwayLength * 0.3333
                ? rwycc1
                : integerCorrectedLandingDistance > integerRunwayLength * 0.3333 && integerCorrectedLandingDistance < integerRunwayLength * 0.6666
                    ? Math.min(rwycc1, rwycc2)
                    : integerCorrectedLandingDistance >= integerRunwayLength * 0.6666
                        ? Math.min(rwycc1, rwycc2, rwycc3)
                        : undefined;

    const lowestRcc = Math.min(rwycc1, rwycc2, rwycc3);

    const contam = contaminent;

    const selectedRccToMaxXwindLandingTakeoff = aircraftType === "HS-748" && lowestRcc === 6 ? 30 : contam.find(item => item.code === lowestRcc)?.maxCrosswind;

    const selectedRccToMaxXwindLanding = aircraftType === "HS-748" && CorrectedLandingRwyccToUse === 6 ? 30 : contam.find(item => item.code === CorrectedLandingRwyccToUse)?.maxCrosswind;

    return (
        <div className="flex flex-col flex-wrap p-4 space-x-4" style={{ fontFamily: 'Roboto, sans-serif', fontSize: '12px', lineHeight: '1.25' }}>

            <div className="flex-1" name="calculator">

                <Card cardTitle={"RWYCC Provided"} status={null} className="w-full sm:w-auto">
                    <div>
                        <div className="flex flex-row justify-between items-center p-2">
                            <div className="dark:text-white">Aircraft type:</div>
                            <NewChoiceListbox
                                key={resetListBox ? 'reset-aircraft-type' : 'aircraft-type'}
                                value={aircraftType}
                                choices={buttonAircraftType}
                                callback={setAircraftType}
                                reset={resetListBox}
                                resetCallback={resetListbox1Handler}
                            />
                        </div>

                        <div className="flex flex-row justify-between items-center p-2">
                            <div className="dark:text-white">RWYCC: </div>
                            <NewChoiceListbox
                                key={resetListBox ? 'reset-rwycc1' : 'rwycc1'}
                                value={rwycc1}
                                choices={rwyccChoices}
                                callback={(value) => setRwycc1(Number(value))}  // Ensure the value is a number
                                reset={resetListBox}
                                resetCallback={resetListbox1Handler}
                            />
                            <NewChoiceListbox
                                key={resetListBox ? 'reset-rwycc2' : 'rwycc2'}
                                value={rwycc2}
                                choices={rwyccChoices}
                                callback={(value) => setRwycc2(Number(value))}  // Ensure the value is a number
                                reset={resetListBox}
                                resetCallback={resetListbox1Handler}
                            />
                            <NewChoiceListbox
                                key={resetListBox ? 'reset-rwycc3' : 'rwycc3'}
                                value={rwycc3}
                                choices={rwyccChoices}
                                callback={(value) => setRwycc3(Number(value))}  // Ensure the value is a number
                                reset={resetListBox}
                                resetCallback={resetListbox1Handler}
                            />
                        </div>

                        <div className="flex flex-row justify-between items-center p-2">
                            <div className="dark:text-white pr-2">Corrected TLR Landing Distance:</div>
                            <input
                                className="flex dark:bg-black"
                                type="number"
                                max={99999}
                                min={1000}
                                value={integerCorrectedLandingDistance} // Replace 'yourValueState' with the state you want to manage the input's value
                                onChange={(e) => {
                                    // Handle input value changes here
                                    const v = e.target.value;
                                    // You can add validation here to ensure the number is not longer than 5 digits
                                    if (!isNaN(v) && v >= 0) {
                                        setCorrectedLandingDistance(v); // Update the state with the new value
                                    }
                                }}
                            />
                        </div>

                        <div className="flex flex-row justify-between items-center p-2">
                            <div className="dark:text-white">Landing Runway Length:</div>
                            <input
                                className="flex dark:bg-black"
                                type="number"
                                max={99999}
                                min={1000}
                                value={integerRunwayLength} // Replace 'yourValueState' with the state you want to manage the input's value
                                onChange={(e) => {
                                    // Handle input value changes here
                                    const v = e.target.value;
                                    // Ensure the input value is a non-negative number
                                    if (!isNaN(v) && v >= 0) {
                                        setRunwayLength(v); // Update the state with the new value
                                    }
                                }}
                            />
                        </div>

                        <div className="p-2">
                            <CustomButton
                                title={"Reset RCC and Distances"} onClickCallback={resetButtonHandler} />
                        </div>
                    </div>
                </Card>

                <div>
                    <Card cardTitle={"Results Takeoff"} status={callDxp} className="w-full sm:w-auto">
                        <div>
                            <div className="flex flex-row justify-between p-2">
                                <div className="dark:text-white">RCC code:</div>
                                {CorrectedLandingRwyccToUse === "Corrected distance is longer than runway length!" || CorrectedLandingRwyccToUse === "Enter Distances" ? "" :
                                    <div className={`flex ${lowestRcc === 0 ? 'text-red-500' : ''}`}>
                                        {lowestRcc}
                                    </div>
                                }
                            </div>

                            <div className="flex flex-row justify-between p-2">
                                <div className="dark:text-white">Max crosswind:</div>
                                <div className={`flex ${lowestRcc === 0 ? 'text-red-500' : ''}`}>
                                    {selectedRccToMaxXwindLandingTakeoff}
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                <div>
                    <Card cardTitle={"Results Landing"} status={callDxp} className="w-full sm:w-auto">
                        <div>
                            <div className="flex flex-row justify-between p-2">
                                <div className="dark:text-white">RCC code:</div>
                                <div className={`flex ${CorrectedLandingRwyccToUse === 0 ? 'text-red-500' : ''}`}>
                                    {CorrectedLandingRwyccToUse}
                                </div>
                            </div>

                            <div className="flex flex-row justify-between p-2">
                                <div className="dark:text-white">Max crosswind:</div>
                                <div className={`flex ${CorrectedLandingRwyccToUse === 0 ? 'text-red-500' : ''}`}>
                                    {selectedRccToMaxXwindLanding}
                                </div>
                            </div>
                            <div style={{ marginBottom: '10px' }}>
                                {ldgDistLongerRwyLgth === true &&
                                    (<div className="flex flex-row bg-orange-400 rounded-md p-2 text-white justify-center items-center">
                                        Corrected distance is longer than runway length!
                                    </div>)}
                            </div>

                            <div style={{ marginBottom: '10px' }}>
                                {enterDistances === true &&
                                    (<div className="flex flex-row bg-blue-500 rounded-md p-2 text-white justify-center items-center">
                                        Enter Distances
                                    </div>)}
                            </div>
                        </div>
                    </Card>
                </div>

            </div>

            <div className="flex-1" name="depth_info">

                <div className="text-center">
                    <button onClick={() => setIsExpanded(!isExpanded)} className="text-blue-500 dark:text-blue-400 underline">
                        {isExpanded ? "Hide Depth Info" : "Show Depth Info"}
                    </button>
                    {isExpanded && (
                        <div className="mt-2">
                            <div className="dark:text-white">1/8&quot; / 0.13in / 3mm</div>
                            <div className="dark:text-white">COMPACTED SNOW ON A GRAVEL RWY =</div>
                            <div className="dark:text-white">COMPACTED SNOW/GRAVEL MIX = </div>
                            <div className="dark:text-white">NOT A CONTAMINANT </div>
                        </div>
                    )}
                </div>

            </div>

        </div>
    );
}

export default FirstPageRccProvided;

FirstPageRccProvided.propTypes = {
    aircraftType: PropTypes.string,
    setAircraftType: PropTypes.func,
    rwycc1: PropTypes.number,
    setRwycc1: PropTypes.func,
    rwycc2: PropTypes.number,
    setRwycc2: PropTypes.func,
    rwycc3: PropTypes.number,
    setRwycc3: PropTypes.func,
    correctedLandingDistance: PropTypes.number,
    setCorrectedLandingDistance: PropTypes.func,
    runwayLength: PropTypes.number,
    setRunwayLength: PropTypes.func,
};