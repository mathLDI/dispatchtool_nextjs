"use client"

import { useState } from "react";
import { ChoiceListbox } from '../../lib/component/ListBox';
import Card from '../../lib/component/Card';  
import { CustomButton } from '../../lib/component/Button';
import PropTypes from "prop-types";
import { contaminent } from '../../lib/component/functions/runwayType';
import { RccToUse } from '../../lib/component/functions/finalRcc';

import { useRccContext } from '../RccCalculatorContext'; // Use relative path


const FirstPageRccNotProvided = (props) => {

    const {
        initialRunwayConditionDescriptionGravel1, runwayConditionDescriptionGravel1Handler,
        initialContaminationCoverage2, setContaminationCoverage2Handler,
        initialContaminationCoverage3, setContaminationCoverage3Handler,
        initialContaminationCoverage1, setContaminationCoverage1Handler,
        initialContaminationCoverage4, setContaminationCoverage4Handler,
        initialRunwayConditionDescriptionPaved2, setRunwayConditionDescriptionPaved2Handler,
        initialDropDownPavedOrGravel, setDropDownPavedOrGravelHandler,
        initialRunwayConditionDescriptionGravel3, setRunwayConditionDescriptionGravel3Handler,
        initialRunwayConditionDescriptionPaved4, setRunwayConditionDescriptionPaved4Handler,
      } = props;


    const allRunwayConditionDescription = [
        initialRunwayConditionDescriptionGravel1,
        initialRunwayConditionDescriptionPaved2,
        initialRunwayConditionDescriptionGravel3,
        initialRunwayConditionDescriptionPaved4
    ];

    const { aircraftType, setAircraftType } = useRccContext();


    const allGravelRunwayConditionDescription = [initialRunwayConditionDescriptionGravel1, initialRunwayConditionDescriptionGravel3]
    const allPavedRunwayConditionDescription = [initialRunwayConditionDescriptionPaved2, initialRunwayConditionDescriptionPaved4]
    const buttonAircraftType = ["DHC-8", "HS-748"];
    const contaminationCoverage2List = [0, 10, 20, 25, 30, 40, 50, 60, 70, 75, 80, 90, 100,];
    const contaminationCoverage3List = [0, 10, 20, 25, 30, 40, 50, 60, 70, 75, 80, 90, 100,];
    const [callDxp] = useState(null);
    const [resetListBox, setResetListBox] = useState(false);

    const resetButtonHandler = () => {
        setResetListBox(true);
        setContaminationCoverage1Handler(0);
        setContaminationCoverage2Handler(0);
        setContaminationCoverage3Handler(0);
        setContaminationCoverage4Handler(0);
        runwayConditionDescriptionGravel1Handler("SELECT GRAVEL CONTAMINANT");
        setRunwayConditionDescriptionPaved2Handler("SELECT PAVED CONTAMINANT");
        setRunwayConditionDescriptionGravel3Handler("SELECT GRAVEL CONTAMINANT");
        setRunwayConditionDescriptionPaved4Handler("SELECT PAVED CONTAMINANT");
        setAircraftTypeHandler("DHC-8");
        setDropDownPavedOrGravelHandler("GRAVEL")
    };

    const resetListbox1Handler = () => {
        setResetListBox(false);
    };

    // const filteredDescriptions filters the correct contaminant to use..  
    //First it finds if  "GRAVEL" or "PAVED" is selected then shows all the contaminant descriptions associated.

    const filteredDescriptions = contaminent
        .filter(item => {
            if (initialDropDownPavedOrGravel === "GRAVEL") {
                return item.PavedOrGravel.includes("GRAVEL");
            } else if (initialDropDownPavedOrGravel === "PAVED") {
                return item.PavedOrGravel.includes("PAVED");
            }
            return false; // Default case if initialDropDownPavedOrGravel is neither "GRAVEL" nor "PAVED"
        })
        .map(item => item.description);

    const contaminantChoices = filteredDescriptions;

    ////constam list below is for the Paved lower drop down, it removed all description that
    //includes 100%, since 100% need to be selected in the first dropdown.

    const contaminantChoicesExclude100 = filteredDescriptions.filter(item => !item.includes("100"));


    //const rcc return the final rcc to use//
    const rcc = RccToUse(initialRunwayConditionDescriptionGravel1,
        initialRunwayConditionDescriptionPaved2,
        initialRunwayConditionDescriptionGravel3,
        initialRunwayConditionDescriptionPaved4,
        initialDropDownPavedOrGravel,
        initialContaminationCoverage1,
        initialContaminationCoverage3,
        initialContaminationCoverage2,
        initialContaminationCoverage4);

    // const performanceCheck find the bool of the selected description in the const contaminent
    const contam = contaminent;

    const performanceCheck =
        rcc.totalPercentage > 25 &&
        rcc.result <= 3 &&
        (contam.some(item => item.callDxp && item.description === initialRunwayConditionDescriptionPaved2) ||
            contam.some(item => item.callDxp && item.description === initialRunwayConditionDescriptionGravel1) ||
            contam.some(item => item.callDxp && item.description === initialRunwayConditionDescriptionPaved4) ||
            contam.some(item => item.callDxp && item.description === initialRunwayConditionDescriptionGravel3)
        );

    const OneHundredPercentCompactedSnow = initialRunwayConditionDescriptionPaved2 !== "SELECT PAVED CONTAMINANT" &&
        initialDropDownPavedOrGravel === "PAVED" && initialRunwayConditionDescriptionPaved2.includes("100%") ? true : false;

    const SeventyPercentBareAndDryUpgrade = rcc.singleOrMultiContam === 1 && rcc.result === 0 && rcc.totalPercentage === 30;

    const rccX = rcc.result;

    const selectedRccToMaxXwind = initialAircraftType === "HS-748" && rccX === 6 ? 30 : contam.find(item => item.code === rccX)?.maxCrosswind;

 

    return (

        <div>
            <>{aircraftType}</>
            <button onClick={() => setAircraftType("Boeing 989")}>Change Aircraft Type</button>

            <Card cardTitle={"RWYCC Not Provided"} status={null}>
                {/**delete function below!!!!!! */}
                { }
                <div>
                    <div className="flex flex-row justify-between items-center p-2">
                        <div>Aircraft type:</div>
                        <ChoiceListbox
                            value={aircraftType}
                            choices={buttonAircraftType}
                            callback={setAircraftType}
                            reset={resetListBox}
                            resetCallback={resetListbox1Handler}
                        />
                    </div>

                    <div className="flex flex-row justify-between items-center p-2">
                        <div>Runway type: </div>
                        <ChoiceListbox
                            value={initialDropDownPavedOrGravel}
                            choices={["GRAVEL", "PAVED"]}
                            callback={setDropDownPavedOrGravelHandler}
                            reset={resetListBox}
                            resetCallback={resetListbox1Handler}
                        />
                    </div>

                    {initialDropDownPavedOrGravel === "PAVED" && (
                        <div className="flex flex-row justify-between items-center p-2">
                            <div>Contaminant 1: </div>
                            <div className="flex flex-row gap-4">
                                <ChoiceListbox
                                    value={initialRunwayConditionDescriptionPaved2}
                                    choices={contaminantChoices}
                                    callback={setRunwayConditionDescriptionPaved2Handler}
                                    reset={resetListBox}
                                    resetCallback={resetListbox1Handler}
                                    width={"w-96"} />
                            </div>
                            <div>Percent Coverage 1: </div>

                            <div className="flex flex-row gap-4">
                                <ChoiceListbox
                                    value={initialContaminationCoverage2}
                                    choices={contaminationCoverage2List}
                                    callback={setContaminationCoverage2Handler}
                                    reset={resetListBox}
                                    resetCallback={resetListbox1Handler}
                                    width={"w-28"} />
                            </div>
                        </div>
                    )}

                    {initialRunwayConditionDescriptionPaved2 !== "SELECT PAVED CONTAMINANT" && initialDropDownPavedOrGravel === "PAVED"
                        && initialRunwayConditionDescriptionPaved2 !== 'Dry Snow or Wet Snow (Any depth) over 100% Compacted Snow' &&
                        initialRunwayConditionDescriptionPaved2 !== '100% Compacted Snow: -15ºC and Colder OAT' &&
                        initialRunwayConditionDescriptionPaved2 !== '100% Compact Snow: Warmer than -15ºC OAT' &&
                        initialRunwayConditionDescriptionPaved2 !== 'Water on top of 100% Compacted Snow'
                        && rcc.topPercentageSelect !== 0 && (initialContaminationCoverage2 !== 0 && initialContaminationCoverage2 !== 100) && (
                            <div className="flex flex-row justify-between items-center p-2 mb-2">
                                <div>Contaminant 2: </div>
                                <div className="flex flex-row gap-4">
                                    <ChoiceListbox
                                        value={initialRunwayConditionDescriptionPaved4}
                                        choices={contaminantChoicesExclude100}
                                        callback={setRunwayConditionDescriptionPaved4Handler}
                                        reset={resetListBox}
                                        resetCallback={resetListbox1Handler}
                                        width={"w-96"} />

                                </div>
                                <div>Percent Coverage 2: </div>
                                <div className="flex flex-row gap-4">

                                    <ChoiceListbox
                                        value={initialContaminationCoverage4}
                                        choices={contaminationCoverage3List}
                                        callback={setContaminationCoverage4Handler}
                                        reset={resetListBox}
                                        resetCallback={resetListbox1Handler}
                                        width={"w-28"} />
                                </div>
                            </div>
                        )}

                    {initialDropDownPavedOrGravel === "GRAVEL" && (
                        <div className="flex flex-row justify-between items-center p-2">
                            <div>Contaminant 1: </div>
                            <div className="flex flex-row gap-4">
                                <ChoiceListbox
                                    value={initialRunwayConditionDescriptionGravel1}
                                    choices={contaminantChoices}
                                    callback={runwayConditionDescriptionGravel1Handler}
                                    reset={resetListBox}
                                    resetCallback={resetListbox1Handler}
                                    width={"w-96"}
                                />
                            </div>

                            <div >Percent Coverage 1: </div>
                            <div className="flex flex-row gap-4">
                                <ChoiceListbox
                                    value={initialContaminationCoverage1}
                                    choices={contaminationCoverage2List}
                                    callback={setContaminationCoverage1Handler}
                                    reset={resetListBox}
                                    resetCallback={resetListbox1Handler}
                                    width={"w-28"} />
                            </div>
                        </div>
                    )}

                    {initialRunwayConditionDescriptionGravel1 !== "SELECT GRAVEL CONTAMINANT" && initialDropDownPavedOrGravel === "GRAVEL"
                        && (initialContaminationCoverage1 !== 0 && initialContaminationCoverage1 !== 100) && (
                            <div className="flex flex-row justify-between items-center p-2 mb-2">
                                <div className="flex px-0">Contaminant 2: </div>
                                <div className="flex flex-row gap-4">
                                    <ChoiceListbox
                                        value={initialRunwayConditionDescriptionGravel3}
                                        choices={contaminantChoices}
                                        callback={setRunwayConditionDescriptionGravel3Handler}
                                        reset={resetListBox}
                                        resetCallback={resetListbox1Handler}
                                        width={"w-96"} />
                                </div>
                                <div>Percent Coverage 2: </div>
                                <div className="flex flex-row gap-4">
                                    <ChoiceListbox
                                        value={initialContaminationCoverage3}
                                        choices={contaminationCoverage3List}
                                        callback={setContaminationCoverage3Handler}
                                        reset={resetListBox}
                                        resetCallback={resetListbox1Handler}
                                        width={"w-28"} />
                                </div>
                            </div>
                        )}

                    <div className="p-2">
                        <CustomButton
                            title={"Reset"} onClickCallback={resetButtonHandler} />
                    </div>

                </div>

            </Card>

            <Card cardTitle={"Results"} status={callDxp}>
    <div>
        <div className="flex flex-row justify-between p-2">
            <div>RCC code:</div>
            {initialRunwayConditionDescriptionPaved2?.includes("100") && initialContaminationCoverage2 !== 100 ? (
                <div className="flex text-white dark:text-gray-900">
                    {rcc.result}
                </div>
            ) : (
                <div className={`flex ${rcc.result === 0 && SeventyPercentBareAndDryUpgrade === false ? 'text-red-500' : 'text-black dark:text-white'}`}>
                    {rcc.result}
                </div>
            )}
        </div>

        <div className="flex flex-row justify-between p-2">
            <div>Max crosswind:</div>
            {initialRunwayConditionDescriptionPaved2?.includes("100") && initialContaminationCoverage2 !== 100 ? (
                <div className="text-white dark:text-gray-900">
                    {selectedRccToMaxXwind} kts
                </div>
            ) : (
                <div className={`flex ${rcc.result === 0 && SeventyPercentBareAndDryUpgrade === false ? 'text-red-500' : 'text-black dark:text-white'}`}>
                    {rcc.result === 0 ? 'NO GO' : `${selectedRccToMaxXwind} kts`}
                </div>
            )}
        </div>

        {/* All alerts below */}
        <div style={{ marginBottom: '10px' }}>
            {performanceCheck === true && initialAircraftType === "DHC-8" && rcc.totalPercentage <= 100 && OneHundredPercentCompactedSnow === false && rcc.result != 0 && (
                <div className="flex flex-row bg-orange-400 rounded-md p-2 text-white justify-center items-center">
                    Dispatch may have to verify the takeoff or Landing distances on the DASH8
                </div>
            )}
        </div>

        <div style={{ marginBottom: '10px' }}>
            {SeventyPercentBareAndDryUpgrade === true && initialDropDownPavedOrGravel === "PAVED" && (
                <div className="flex flex-row bg-orange-400 rounded-md p-2 text-white justify-center items-center">
                    Code 0 does not need to be considered when the runway is 70% bare and dry or 70% bare and wet, in this case upgrade code 0 to 1. Dispatch may have to verify the takeoff or Landing distances on the DASH8
                </div>
            )}
        </div>

        <div style={{ marginBottom: '10px' }}>
            {SeventyPercentBareAndDryUpgrade === true && initialDropDownPavedOrGravel === "GRAVEL" && (
                <div className="flex flex-row bg-orange-400 rounded-md p-2 text-white justify-center items-center">
                    Code 0 does not need to be considered when the runway is 70% Compacted snow/gravel Mix, in this case upgrade code 0 to 1. Dispatch may have to verify the takeoff or Landing distances on the DASH8
                </div>
            )}
        </div>

        {/* Other alerts... */}

        {/* CONTAMINATION DEPTH WARNING */}
        <div style={{ marginBottom: '10px' }}>
            {(initialRunwayConditionDescriptionPaved2?.includes("100") || initialRunwayConditionDescriptionPaved4?.includes("100")) && initialDropDownPavedOrGravel === "PAVED" && rcc.topPercentageSelect !== 100 && (
                <div className="flex flex-row bg-orange-400 rounded-md p-2 text-white justify-center items-center">
                    Runway must be completely covered with Compacted Snow to select this contaminant. If that is the case, select 100%
                </div>
            )}
        </div>

        {/* Other warnings... */}

        {/* Same Contaminant in selection 1 and 2 */}
        <div style={{ marginBottom: '10px' }}>
            {initialDropDownPavedOrGravel === "GRAVEL" && (
                (!initialRunwayConditionDescriptionGravel1.includes("SELECT") && !initialRunwayConditionDescriptionGravel3.includes("SELECT") &&
                    initialRunwayConditionDescriptionGravel1 === initialRunwayConditionDescriptionGravel3)
            ) && (
                <div className="flex flex-row bg-orange-400 rounded-md p-2 text-white justify-center items-center">
                    Same Contaminant in selection 1 and 2!
                </div>
            )}
        </div>

        <div style={{ marginBottom: '10px' }}>
            {initialDropDownPavedOrGravel === "PAVED" && (
                (!initialRunwayConditionDescriptionPaved2.includes("SELECT") && !initialRunwayConditionDescriptionPaved4.includes("SELECT") &&
                    initialRunwayConditionDescriptionPaved2 === initialRunwayConditionDescriptionPaved4)
            ) && (
                <div className="flex flex-row bg-orange-400 rounded-md p-2 text-white justify-center items-center">
                    Same Contaminant in selection 1 and 2!
                </div>
            )}
        </div>

    </div>
</Card>

            {/****RWYCCC NOT PROVIDED CARS ABOVE****/}

            <div className="text-center"> 1/8&quot; / 0.13in / 3mm</div>
            <div className="text-center">COMPACTED SNOW ON A GRAVEL RWY = COMPACTED SNOW/GRAVEL MIX = NOT A CONTAMINANT</div>

        </div >

    );


}

export default FirstPageRccNotProvided;

FirstPageRccNotProvided.propTypes = {
    initialRunwayConditionDescriptionPaved2: PropTypes.array,
    initialContaminationCoverage2: PropTypes.number,
    initialRunwayConditionDescriptionGravel3: PropTypes.array,
    initialRunwayConditionDescriptionPaved4: PropTypes.array,
    initialRunwayConditionDescriptionGravel1: PropTypes.array,
    runwayConditionDescriptionGravel1Handler: PropTypes.array,
    setRunwayConditionDescriptionPaved2Handler: PropTypes.array,
    setRunwayConditionDescriptionGravel3Handler: PropTypes.array,
    setRunwayConditionDescriptionPaved4Handler: PropTypes.array,
    initialAircraftType: PropTypes.string,
    setAircraftTypeHandler: PropTypes.string,
    setContaminationCoverage2Handler: PropTypes.number,
    initialContaminationCoverage3: PropTypes.number,
    setContaminationCoverage3Handler: PropTypes.number,
    initialDropDownPavedOrGravel: PropTypes.string,
    setDropDownPavedOrGravelHandler: PropTypes.string,
    initialContaminationCoverage1: PropTypes.number,
    setContaminationCoverage1Handler: PropTypes.array,
    initialContaminationCoverage4: PropTypes.number,
    setContaminationCoverage4Handler: PropTypes.array,

};
