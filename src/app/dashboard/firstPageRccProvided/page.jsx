'use client';

import { useState } from "react";
import { ChoiceListbox } from '../../lib/component/ListBox';
import Card from '../../lib/component/Card';
import { CustomButton } from '../../lib/component/Button';
import PropTypes from "prop-types";
import { contaminent } from '../../lib/component/functions/runwayType';
import { useRccContext } from '../RccCalculatorContext'; // Use relative path


const FirstPageRccProvided = (props) => {
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
    const buttonAircraftType = ["DHC-8", "HS-748"];
    const [callDxp] = useState(null);
    const [resetListBox, setResetListBox] = useState(false);
    const integerRunwayLength = parseInt(runwayLength, 10);
    const integerCorrectedLandingDistance = parseInt(correctedLandingDistance, 10);

    const resetButtonHandler = () => {
        setResetListBox(true);
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
        <div>
            <Card cardTitle={"RWYCC Provided"} status={null} className="sm:w-[100%] md:w-[75%] lg:w-[50%] xl:w-[40%]">
                <div>
                    <div className="flex flex-row justify-between items-center p-2">
                        <div>Aircraft type:</div>
                        <ChoiceListbox
                            value={aircraftType}
                            choices={buttonAircraftType}
                            callback={setAircraftType}
                            reset={resetListBox}
                            resetCallback={resetListbox1Handler} />
                    </div>

                    <div className="flex flex-row justify-between items-center p-2">
                        <div>RWYCC: </div>
                        <ChoiceListbox
                            value={rwycc1}
                            choices={rwyccChoices}
                            callback={setRwycc1}
                            reset={resetListBox}
                            resetCallback={resetListbox1Handler} />
                        <ChoiceListbox
                            value={rwycc2}
                            choices={rwyccChoices}
                            callback={setRwycc2}
                            reset={resetListBox}
                            resetCallback={resetListbox1Handler} />
                        <ChoiceListbox
                            value={rwycc3}
                            choices={rwyccChoices}
                            callback={setRwycc3}
                            reset={resetListBox}
                            resetCallback={resetListbox1Handler} />
                    </div>

                    <div className="flex flex-row justify-between items-center p-2 ">
                        <div>Corrected TLR Landing Distance:</div>
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
                        <div>Landing Runway Length:</div>
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
                <Card cardTitle={"Results Takeoff"} status={callDxp} className="sm:w-[100%] md:w-[75%] lg:w-[50%] xl:w-[40%]">
                    <div>
                        <div className="flex flex-row justify-between p-2">
                            <div>RCC code:</div>
                            {CorrectedLandingRwyccToUse === "Corrected distance is longer than runway length!" || CorrectedLandingRwyccToUse === "Enter Distances" ? "" :
                                <div className={`flex ${lowestRcc === 0 ? 'text-red-500' : ''}`}>
                                    {lowestRcc}
                                </div>
                            }
                        </div>

                        <div className="flex flex-row justify-between p-2">
                            <div>Max crosswind:</div>
                            <div className={`flex ${lowestRcc === 0 ? 'text-red-500' : ''}`}>
                                {selectedRccToMaxXwindLandingTakeoff}
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            <div>
                <Card cardTitle={"Results Landing"} status={callDxp} className="sm:w-[100%] md:w-[75%] lg:w-[50%] xl:w-[40%]">
                    <div>
                        <div className="flex flex-row justify-between p-2">
                            <div>RCC code:</div>
                            <div className={`flex ${CorrectedLandingRwyccToUse === 0 ? 'text-red-500' : ''}`}>
                                {CorrectedLandingRwyccToUse}
                            </div>
                        </div>

                        <div className="flex flex-row justify-between p-2">
                            <div>Max crosswind:</div>
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
                                (<div className="flex flex-row bg-orange-400 rounded-md p-2 text-white justify-center items-center">
                                    Enter Distances
                                </div>)}
                        </div>
                    </div>
                </Card>
            </div>

            <div className="text-center"> 1/8&quot; / 0.13in / 3mm</div>
            <div className="text-center">COMPACTED SNOW ON A GRAVEL RWY = COMPACTED SNOW/GRAVEL MIX = NOT A CONTAMINANT</div>
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
