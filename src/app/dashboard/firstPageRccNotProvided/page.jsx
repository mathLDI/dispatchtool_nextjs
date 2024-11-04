'use client';

import { useState } from "react";
import NewChoiceListbox from '../../lib/component/NewChoiceListbox';
import Card from '../../lib/component/Card';
import { CustomButton } from '../../lib/component/Button';
import PropTypes from "prop-types";
import { contaminent } from '../../lib/component/functions/runwayType';
import { RccToUse } from '../../lib/component/functions/finalRcc';
import useAuth from '../../../hooks/useAuth'; // Import useAuth hook


import { useRccContext } from '../RccCalculatorContext'; // Use relative path

const FirstPageRccNotProvided = (props) => {
    useAuth(); // Ensure only authenticated users can access this component

    const { } = props;

    const { aircraftType, setAircraftType } = useRccContext("");
    const { dropDownPavedOrGravel, setDropDownPavedOrGravel } = useRccContext("");
    const { contaminationCoverage1, setContaminationCoverage1 } = useRccContext("");
    const { contaminationCoverage2, setContaminationCoverage2 } = useRccContext("");
    const { contaminationCoverage3, setContaminationCoverage3 } = useRccContext("");
    const { contaminationCoverage4, setContaminationCoverage4 } = useRccContext("");
    const { runwayConditionDescriptionGravel1, setRunwayConditionDescriptionGravel1 } = useRccContext("");
    const { runwayConditionDescriptionPaved2, setRunwayConditionDescriptionPaved2 } = useRccContext("");
    const { runwayConditionDescriptionGravel3, setRunwayConditionDescriptionGravel3 } = useRccContext("");
    const { runwayConditionDescriptionPaved4, setRunwayConditionDescriptionPaved4 } = useRccContext("");

    const allGravelRunwayConditionDescription = [runwayConditionDescriptionGravel1, runwayConditionDescriptionGravel3];
    const allPavedRunwayConditionDescription = [runwayConditionDescriptionPaved2, runwayConditionDescriptionPaved4];
    const buttonAircraftType = ["DHC-8", "HS-748","ATR-72"];
    const contaminationCoverage2List = [0, 10, 20, 25, 30, 40, 50, 60, 70, 75, 80, 90, 100];
    const contaminationCoverage3List = [0, 10, 20, 25, 30, 40, 50, 60, 70, 75, 80, 90, 100];
    const [callDxp] = useState(null);
    const [resetListBox, setResetListBox] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);





    const resetButtonHandler = () => {
        setResetListBox(true);
        setContaminationCoverage1(0);
        setContaminationCoverage2(0);
        setContaminationCoverage3(0);
        setContaminationCoverage4(0);
        setRunwayConditionDescriptionGravel1("SELECT GRAVEL CONTAMINANT");
        setRunwayConditionDescriptionPaved2("SELECT PAVED CONTAMINANT");
        setRunwayConditionDescriptionGravel3("SELECT GRAVEL CONTAMINANT");
        setRunwayConditionDescriptionPaved4("SELECT PAVED CONTAMINANT");
        setAircraftType("DHC-8");
        setDropDownPavedOrGravel("GRAVEL");
    };

    const resetListbox1Handler = () => {
        setResetListBox(false);
    };

    const filteredDescriptions = contaminent
        .filter(item => {
            if (dropDownPavedOrGravel === "GRAVEL") {
                return item.PavedOrGravel.includes("GRAVEL");
            } else if (dropDownPavedOrGravel === "PAVED") {
                return item.PavedOrGravel.includes("PAVED");
            }
            return false;
        })
        .map(item => item.description);

    const contaminantChoices = filteredDescriptions;
    const contaminantChoicesExclude100 = filteredDescriptions.filter(item => !item.includes("100"));

    const rcc = RccToUse(
        runwayConditionDescriptionGravel1,
        runwayConditionDescriptionPaved2,
        runwayConditionDescriptionGravel3,
        runwayConditionDescriptionPaved4,
        dropDownPavedOrGravel,
        contaminationCoverage1,
        contaminationCoverage3,
        contaminationCoverage2,
        contaminationCoverage4
    );

console.log("rcctouse from notprovided::", rcc);

    const contam = contaminent;

    const performanceCheck =
        rcc.totalPercentage > 25 &&
        rcc.result <= 3 &&
        
        (contam.some(item => item.callDxp && item.description === runwayConditionDescriptionPaved2) ||
            contam.some(item => item.callDxp && item.description === runwayConditionDescriptionGravel1) ||
            contam.some(item => item.callDxp && item.description === runwayConditionDescriptionPaved4) ||
            contam.some(item => item.callDxp && item.description === runwayConditionDescriptionGravel3)
        );

    const OneHundredPercentCompactedSnow = runwayConditionDescriptionPaved2 !== "SELECT PAVED CONTAMINANT" &&
        dropDownPavedOrGravel === "PAVED" && runwayConditionDescriptionPaved2.includes("100%") ? true : false;

    const SeventyPercentBareAndDryUpgrade = rcc.singleOrMultiContam === 1 && rcc.result === 0 && rcc.totalPercentage === 30;

    const rccX = rcc.result;

    const selectedRccToMaxXwind = aircraftType === "HS-748" && rccX === 6 ? 30 : contam.find(item => item.code === rccX)?.maxCrosswind;

    const allRunwayConditionDescription = [
        runwayConditionDescriptionGravel1,
        runwayConditionDescriptionPaved2,
        runwayConditionDescriptionGravel3,
        runwayConditionDescriptionPaved4
    ];

  



    return (

        <div className="flex flex-col flex-wrap p-4 space-x-4" style={{ fontFamily: 'Roboto, sans-serif', fontSize: '12px', lineHeight: '1.25' }}>

            <div className="flex-1" name="rwyccNotProvided"  >

                <Card cardTitle={"RWYCC Not Provided"} status={null} className="w-full sm:w-auto">
                    <div>
                        <div className="flex flex-row justify-between items-center p-2">
                            <div>Aircraft type:</div>
                            <NewChoiceListbox
                                value={aircraftType}
                                choices={buttonAircraftType}
                                callback={setAircraftType}
                                reset={resetListBox}
                                resetCallback={resetListbox1Handler}
                            />
                        </div>

                        <div className="flex flex-row justify-between items-center p-2">
                            <div>Runway type:</div>
                            <NewChoiceListbox
                                value={dropDownPavedOrGravel}
                                choices={["GRAVEL", "PAVED"]}
                                callback={setDropDownPavedOrGravel}
                                reset={resetListBox}
                                resetCallback={resetListbox1Handler}

                            />

                        </div>

                        {dropDownPavedOrGravel === "PAVED" && (

                            <div className="flex flex-row justify-between items-center p-2">


                                <div>Contaminant 1:</div>

                                <div className="flex-grow  " style={{ minWidth: '300px' }}>
                                    <NewChoiceListbox
                                        value={runwayConditionDescriptionPaved2}
                                        choices={contaminantChoices}
                                        callback={setRunwayConditionDescriptionPaved2}
                                        reset={resetListBox}
                                        resetCallback={resetListbox1Handler}
                                    />
                                </div>

                                <div>% Coverage 1:</div>
                                <div className="flex-grow" style={{ minWidth: '100px' , maxWidth: '100px' }}>
                                    <NewChoiceListbox
                                        value={contaminationCoverage2}
                                        choices={contaminationCoverage2List}
                                        callback={(value) => setContaminationCoverage2(Number(value))}
                                        reset={resetListBox}
                                        resetCallback={resetListbox1Handler}
                                    />
                                </div>



                            </div>
                        )}

                        {runwayConditionDescriptionPaved2 !== "SELECT PAVED CONTAMINANT" && dropDownPavedOrGravel === "PAVED"
                            && runwayConditionDescriptionPaved2 !== 'Dry Snow or Wet Snow (Any depth) over 100% Compacted Snow' &&
                            runwayConditionDescriptionPaved2 !== '100% Compacted Snow: -15ºC and Colder OAT' &&
                            runwayConditionDescriptionPaved2 !== '100% Compact Snow: Warmer than -15ºC OAT' &&
                            runwayConditionDescriptionPaved2 !== 'Water on top of 100% Compacted Snow'
                            && rcc.topPercentageSelect !== 0 && (contaminationCoverage2 !== 0 && contaminationCoverage2 !== 100) && (
                                <div className="flex flex-row justify-between items-center p-2">
                                    <div>Contaminant 2:</div>
                                    <div className="flex-grow" style={{ minWidth: '300px' }}>

                                        <NewChoiceListbox
                                            value={runwayConditionDescriptionPaved4}
                                            choices={contaminantChoicesExclude100}
                                            callback={setRunwayConditionDescriptionPaved4}
                                            reset={resetListBox}
                                            resetCallback={resetListbox1Handler}

                                        />
                                    </div>

                                    <div>% Coverage 2:</div>
                                    <div className="flex-grow" style={{ minWidth: '100px' , maxWidth: '100px' }}>
                                        <NewChoiceListbox
                                            value={contaminationCoverage4}
                                            choices={contaminationCoverage3List}
                                            callback={(value) => setContaminationCoverage4(Number(value))}
                                            reset={resetListBox}
                                            resetCallback={resetListbox1Handler}
                                        />
                                    </div>
                                </div>
                            )}

                        {dropDownPavedOrGravel === "GRAVEL" && (
                            <div className="flex flex-row justify-between items-center p-2">
                                <div>Contaminant 1:</div>

                                <div className="flex-grow" style={{ minWidth: '300px' }}>
                                    <NewChoiceListbox
                                        value={runwayConditionDescriptionGravel1}
                                        choices={contaminantChoices}
                                        callback={setRunwayConditionDescriptionGravel1}
                                        reset={resetListBox}
                                        resetCallback={resetListbox1Handler}

                                    />
                                </div>

                                <div>% Coverage 1:</div>

                                <div className="flex-grow " style={{ minWidth: '100px' , maxWidth: '100px' }}>
                                    <NewChoiceListbox
                                        value={contaminationCoverage1}
                                        choices={contaminationCoverage2List}
                                        callback={(value) => setContaminationCoverage1(Number(value))}
                                        reset={resetListBox}
                                        resetCallback={resetListbox1Handler}
                                    />
                                </div>


                            </div>

                        )}

                        {runwayConditionDescriptionGravel1 !== "SELECT GRAVEL CONTAMINANT" && dropDownPavedOrGravel === "GRAVEL"
                            && (contaminationCoverage1 !== 0 && contaminationCoverage1 !== 100) && (
                                <div className="flex flex-row justify-between items-center p-2">
                                    <div className="style={{ minWidth: '100px' , maxWidth: '100px' }}">Contaminant 2:</div>

                                    <div className="flex-grow " style={{ minWidth: '300px' }}>
                                        <NewChoiceListbox
                                            value={runwayConditionDescriptionGravel3}
                                            choices={contaminantChoices}
                                            callback={setRunwayConditionDescriptionGravel3}
                                            reset={resetListBox}
                                            resetCallback={resetListbox1Handler}

                                        />
                                    </div>

                                    <div className="">% Coverage 2:</div>

                                    <div className="flex-grow" style={{ minWidth: '100px' , maxWidth: '100px' }}    >
                                        <NewChoiceListbox
                                            value={contaminationCoverage3}
                                            choices={contaminationCoverage3List}
                                            callback={(value) => setContaminationCoverage3(Number(value))}
                                            reset={resetListBox}
                                            resetCallback={resetListbox1Handler}
                                        />
                                    </div>

                                </div>
                            )}

                        <div className="p-2">
                            <CustomButton
                                title={"Reset"} onClickCallback={resetButtonHandler} />
                        </div>
                    </div>
                </Card>

                <Card cardTitle={"Results"} status={callDxp} className="w-full sm:w-auto">
                    <div>
                        <div className="flex flex-wrap justify-between p-2">
                            <div className="w-full md:w-1/2 lg:w-1/3">RCC code:</div>
                            <div className={`flex w-full md:w-1/2 lg:w-2/3 ${rcc.result === 0 && SeventyPercentBareAndDryUpgrade === false ? 'text-red-500' : 'text-black dark:text-white'}`}>
                                {runwayConditionDescriptionPaved2.includes("100") && contaminationCoverage2 !== 100 ? (
                                    <div className="flex text-white dark:text-gray-900">
                                        {rcc.result}
                                    </div>
                                ) : (
                                    rcc.result
                                )}
                            </div>
                        </div>

                        <div className="flex flex-wrap justify-between p-2">
                            <div className="w-full md:w-1/2 lg:w-1/3">Max crosswind:</div>
                            <div className={`flex w-full md:w-1/2 lg:w-2/3 ${rcc.result === 0 && SeventyPercentBareAndDryUpgrade === false ? 'text-red-500' : 'text-black dark:text-white'}`}>
                                {runwayConditionDescriptionPaved2.includes("100") && contaminationCoverage2 !== 100 ? (
                                    <div className="text-white dark:text-gray-900">
                                        {selectedRccToMaxXwind} kts
                                    </div>
                                ) : (
                                    rcc.result === 0 ? 'NO GO' : `${selectedRccToMaxXwind} kts`
                                )}
                            </div>
                        </div>

                        <div className="mb-2">
                            {performanceCheck === true && aircraftType === "DHC-8" && rcc.totalPercentage <= 100 && OneHundredPercentCompactedSnow === false && rcc.result !== 0 && (
                                <div className="flex flex-row bg-orange-400 rounded-md p-2 text-white justify-center items-center">
                                    Dispatch may have to verify the takeoff or Landing distances on the DASH8
                                </div>
                            )}
                        </div>

                        <div className="mb-2">
                            {SeventyPercentBareAndDryUpgrade === true && dropDownPavedOrGravel === "PAVED" && (
                                <div className="flex flex-row bg-orange-400 rounded-md p-2 text-white justify-center items-center">
                                    Code 0 does not need to be considered when the runway is 70% bare and dry or 70% bare and wet, in this case upgrade code 0 to 1. Dispatch may have to verify the takeoff or Landing distances on the DASH8
                                </div>
                            )}
                        </div>

                        <div className="mb-2">
                            {SeventyPercentBareAndDryUpgrade === true && dropDownPavedOrGravel === "GRAVEL" && (
                                <div className="flex flex-row bg-orange-400 rounded-md p-2 text-white justify-center items-center">
                                    Code 0 does not need to be considered when the runway is 70% Compacted snow/gravel Mix, in this case upgrade code 0 to 1. Dispatch may have to verify the takeoff or Landing distances on the DASH8
                                </div>
                            )}
                        </div>

                        <div className="mb-2">
                            {(runwayConditionDescriptionPaved2.includes("100") || runwayConditionDescriptionPaved4.includes("100")) && dropDownPavedOrGravel === "PAVED" && rcc.topPercentageSelect !== 100 && (
                                <div className="flex flex-row bg-orange-400 rounded-md p-2 text-white justify-center items-center">
                                    Runway must be completely covered with Compacted Snow to select this contaminant. If that is the case, select 100%
                                </div>
                            )}
                        </div>

                        <div className="mb-2">
                            {rcc.totalPercentage > 100 && (
                                <div className="flex flex-row bg-orange-400 rounded-md p-2 text-white justify-center items-center">
                                    Contaminant(s) over 100%!
                                </div>
                            )}
                        </div>

                        <div className="mb-2">
                            {dropDownPavedOrGravel === "PAVED" && rcc.result !== 0 && allPavedRunwayConditionDescription.includes('Dry Snow more than 1.0 in depth') && (
                                <div className="flex flex-row bg-orange-400 rounded-md p-2 text-white justify-center items-center">
                                    Max Dry Snow Depth = 2.0 in
                                </div>
                            )}
                        </div>

                        <div className="mb-2">
                            {dropDownPavedOrGravel === "GRAVEL" && rcc.result !== 0 && allGravelRunwayConditionDescription.includes('Dry Snow more than 1.0 in depth') && (
                                <div className="flex flex-row bg-orange-400 rounded-md p-2 text-white justify-center items-center">
                                    Max Dry Snow Depth = 2.0 in
                                </div>
                            )}
                        </div>

                        <div className="mb-2">
                            {aircraftType === "DHC-8" && rcc.result !== 0 && rcc.totalPercentage < 40 && dropDownPavedOrGravel === "GRAVEL" &&
                                allGravelRunwayConditionDescription.includes('Wet Snow greater than 0.13 in depth over Compacted snow/gravel mix') && (
                                    <div className="flex flex-row bg-orange-400 rounded-md p-2 text-white justify-center items-center">
                                        Max Wet Snow Depth = 1.0 in
                                    </div>
                                )}
                        </div>

                        <div className="mb-2">
                            {aircraftType === "HS-748" && rcc.result !== 0 && rcc.totalPercentage < 40 && dropDownPavedOrGravel === "GRAVEL" &&
                                allGravelRunwayConditionDescription.includes('Wet Snow greater than 0.13 in depth over Compacted snow/gravel mix') && (
                                    <div className="flex flex-row bg-orange-400 rounded-md p-2 text-white justify-center items-center">
                                        Max Wet Snow Depth = 0.5 in
                                    </div>
                                )}
                        </div>

                        <div className="mb-2">
                            {aircraftType === "DHC-8" && dropDownPavedOrGravel === "PAVED" && rcc.result !== 0 && allRunwayConditionDescription.includes('Wet Snow greater than 0.13 in depth') && (
                                <div className="flex flex-row bg-orange-400 rounded-md p-2 text-white justify-center items-center">
                                    Max Wet Snow Depth = 1.0 in
                                </div>
                            )}
                        </div>

                        <div className="mb-2">
                            {aircraftType === "HS-748" && dropDownPavedOrGravel === "PAVED" && rcc.result !== 0 && allRunwayConditionDescription.includes('Wet Snow greater than 0.13 in depth') && (
                                <div className="flex flex-row bg-orange-400 rounded-md p-2 text-white justify-center items-center">
                                    Max Wet Snow Depth = 0.5 in
                                </div>
                            )}
                        </div>

                        <div className="mb-2">
                            {aircraftType === "DHC-8" && dropDownPavedOrGravel === "PAVED" && rcc.result !== 0 && allRunwayConditionDescription.includes('Water Greater than 0.13 in depth') && (
                                <div className="flex flex-row bg-orange-400 rounded-md p-2 text-white justify-center items-center">
                                    Max Water Depth = 0.5 in
                                </div>
                            )}
                        </div>

                        <div className="mb-2">
                            {aircraftType === "DHC-8" && dropDownPavedOrGravel === "GRAVEL" && rcc.result !== 0 && allRunwayConditionDescription.includes('Water Greater than 0.13 in depth') && (
                                <div className="flex flex-row bg-orange-400 rounded-md p-2 text-white justify-center items-center">
                                    Max Water Depth = 0.5 in
                                </div>
                            )}
                        </div>

                        <div className="mb-2">
                            {aircraftType === "DHC-8" && dropDownPavedOrGravel === "PAVED" && rcc.result !== 0 && allRunwayConditionDescription.includes('Slush Greater than 0.13 in depth') && (
                                <div className="flex flex-row bg-orange-400 rounded-md p-2 text-white justify-center items-center">
                                    Max Slush Depth = 0.5 in
                                </div>
                            )}
                        </div>

                        <div className="mb-2">
                            {aircraftType === "DHC-8" && dropDownPavedOrGravel === "GRAVEL" && allRunwayConditionDescription.includes('Slush Greater than 0.13 in depth') && (
                                <div className="flex flex-row bg-orange-400 rounded-md p-2 text-white justify-center items-center">
                                    Max Slush Depth = 0.5 in
                                </div>
                            )}
                        </div>

                        <div className="mb-2">
                            {aircraftType === "HS-748" && dropDownPavedOrGravel === "PAVED" && rcc.result !== 0 && allRunwayConditionDescription.includes('Slush Greater than 0.13 in depth') && (
                                <div className="flex flex-row bg-orange-400 rounded-md p-2 text-white justify-center items-center">
                                    Max Slush Depth = 0.5 in
                                </div>
                            )}
                        </div>

                        <div className="mb-2">
                            {aircraftType === "HS-748" && dropDownPavedOrGravel === "GRAVEL" && allRunwayConditionDescription.includes('Slush Greater than 0.13 in depth') && (
                                <div className="flex flex-row bg-orange-400 rounded-md p-2 text-white justify-center items-center">
                                    Max Slush Depth = 0.5 in
                                </div>
                            )}
                        </div>

                        <div className="mb-2">
                            {dropDownPavedOrGravel === "GRAVEL" && (
                                (!runwayConditionDescriptionGravel1.includes("SELECT") && !runwayConditionDescriptionGravel3.includes("SELECT") &&
                                    runwayConditionDescriptionGravel1 === runwayConditionDescriptionGravel3)
                            ) && (
                                    <div className="flex flex-row bg-orange-400 rounded-md p-2 text-white justify-center items-center">
                                        Same Contaminant in selection 1 and 2!
                                    </div>
                                )}
                        </div>

                        <div className="mb-2">
                            {dropDownPavedOrGravel === "PAVED" && (
                                (!runwayConditionDescriptionPaved2.includes("SELECT") && !runwayConditionDescriptionPaved4.includes("SELECT") &&
                                    runwayConditionDescriptionPaved2 === runwayConditionDescriptionPaved4)
                            ) && (
                                    <div className="flex flex-row bg-orange-400 rounded-md p-2 text-white justify-center items-center">
                                        Same Contaminant in selection 1 and 2!
                                    </div>
                                )}
                        </div>
                    </div>
                </Card>

            </div>

            <div className="flex-1" name="rccnotprovided_depth">

                <div className="text-center">
                    <button onClick={() => setIsExpanded(!isExpanded)} className="text-blue-500 underline">
                        {isExpanded ? "Hide Depth Info" : "Show Depth Info"}
                    </button>
                    {isExpanded && (
                        <div className="mt-2">
                            <div>1/8&quot; / 0.13in / 3mm</div>
                            <div>COMPACTED SNOW ON A GRAVEL RWY =</div>
                            <div>COMPACTED SNOW/GRAVEL MIX = </div>
                            <div>NOT A CONTAMINANT </div>
                        </div>
                    )}
                </div>

            </div>


        </div>
    );
}

export default FirstPageRccNotProvided;

FirstPageRccNotProvided.propTypes = {
    aircraftType: PropTypes.string,
    setAircraftType: PropTypes.func,
    runwayConditionDescriptionPaved2: PropTypes.string,
    setRunwayConditionDescriptionPaved2: PropTypes.func,
    runwayConditionDescriptionGravel3: PropTypes.string,
    setRunwayConditionDescriptionGravel3: PropTypes.func,
    runwayConditionDescriptionPaved4: PropTypes.string,
    setRunwayConditionDescriptionPaved4: PropTypes.func,
    runwayConditionDescriptionGravel1: PropTypes.string,
    setRunwayConditionDescriptionGravel1: PropTypes.func,
    dropDownPavedOrGravel: PropTypes.string,
    setDropDownPavedOrGravel: PropTypes.func,
    contaminationCoverage1: PropTypes.number,
    setContaminationCoverage1: PropTypes.func,
    contaminationCoverage2: PropTypes.number,
    setContaminationCoverage2: PropTypes.func,
    contaminationCoverage3: PropTypes.number,
    setContaminationCoverage3: PropTypes.func,
    contaminationCoverage4: PropTypes.number,
    setContaminationCoverage4: PropTypes.func,
};
