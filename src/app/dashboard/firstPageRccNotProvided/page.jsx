'use client';

import { useState, useEffect } from "react";
import NewChoiceListbox from '../../lib/component/NewChoiceListbox'; // Use the correct casing
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
    const { selectedAirport, allWeatherData } = useRccContext("");

    const allGravelRunwayConditionDescription = [runwayConditionDescriptionGravel1, runwayConditionDescriptionGravel3];
    const allPavedRunwayConditionDescription = [runwayConditionDescriptionPaved2, runwayConditionDescriptionPaved4];
    const buttonAircraftType = ["DHC-8", "HS-748"];
    const contaminationCoverage2List = [0, 10, 20, 25, 30, 40, 50, 60, 70, 75, 80, 90, 100];
    const contaminationCoverage3List = [0, 10, 20, 25, 30, 40, 50, 60, 70, 75, 80, 90, 100];
    const [callDxp] = useState(null);
    const [resetListBox, setResetListBox] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    
    // Local airport input state and modal state
    const [airportInput, setAirportInput] = useState('');
    const [showNotamModal, setShowNotamModal] = useState(false);
    const [notamConditionData, setNotamConditionData] = useState([]);
    const [modalPosition, setModalPosition] = useState({ x: 500, y: 100 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    
    // Use local airport input if provided, otherwise use selected airport from context
    const currentAirport = airportInput || selectedAirport?.code;

    // Close modal and clear data when airport changes
    useEffect(() => {
        setShowNotamModal(false);
        setNotamConditionData([]);
    }, [currentAirport]);

    // Drag handlers for modal
    const handleMouseDown = (e) => {
        setIsDragging(true);
        setDragOffset({
            x: e.clientX - modalPosition.x,
            y: e.clientY - modalPosition.y
        });
    };

    const handleMouseMove = (e) => {
        if (isDragging) {
            setModalPosition({
                x: e.clientX - dragOffset.x,
                y: e.clientY - dragOffset.y
            });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        } else {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, dragOffset]);

    // Show NOTAM modal with runway condition descriptions (for airports without RSC codes)
    const handleShowNotamModal = () => {
        if (!currentAirport || !allWeatherData?.[currentAirport]) {
            alert('No data available for this airport');
            return;
        }

        const notams = allWeatherData[currentAirport].data.filter(item => item.type === 'notam');
        const conditionMatches = [];

        // Check if airport has RSC codes - if yes, don't show modal
        const hasRSC = notams.some(notam => {
            let notamTextContent = typeof notam.text === 'string' ? notam.text : JSON.stringify(notam.text);
            try {
                const parsed = JSON.parse(notamTextContent);
                notamTextContent = parsed.raw || notamTextContent;
            } catch (e) {
                // Already a string
            }
            return /RSC\s+\d{1,2}[LRC]?\s+\d\/\d\/\d/i.test(notamTextContent);
        });

        if (hasRSC) {
            alert('This airport has RSC codes. Please use RWYCC Provided calculator.');
            return;
        }

        // Extract runway condition descriptions
        notams.forEach(notam => {
            let notamTextContent = typeof notam.text === 'string' ? notam.text : JSON.stringify(notam.text);
            
            try {
                const parsed = JSON.parse(notamTextContent);
                notamTextContent = parsed.raw || notamTextContent;
            } catch (e) {
                // Already a string
            }

            // Look for RSC patterns with runway designations (e.g., "RSC 06/24" or "RSC 17L")
            // This captures runway conditions WITHOUT RWYCC codes
            const rscRunwayPattern = /RSC\s+(\d{1,2}[LRC]?(?:\/\d{1,2})?)\s+([^\n]+(?:\n(?!RSC|RWY|RUNWAY|ADDN)[^\n]*)*)/gi;
            let match;

            while ((match = rscRunwayPattern.exec(notamTextContent)) !== null) {
                const runway = match[1];
                const conditionStart = match.index;
                
                // Get the full condition description (up to next RSC, RWY or ADDN)
                const nextRscIndex = notamTextContent.indexOf('RSC', conditionStart + 3);
                const nextRwyIndex = notamTextContent.indexOf('RWY', conditionStart + 3);
                const addnIndex = notamTextContent.indexOf('ADDN', conditionStart);
                
                let conditionEndIndex = notamTextContent.length;
                if (nextRscIndex !== -1 && nextRscIndex > conditionStart && nextRscIndex < conditionEndIndex) {
                    conditionEndIndex = nextRscIndex;
                }
                if (nextRwyIndex !== -1 && nextRwyIndex > conditionStart && nextRwyIndex < conditionEndIndex) {
                    conditionEndIndex = nextRwyIndex;
                }
                if (addnIndex !== -1 && addnIndex > conditionStart && addnIndex < conditionEndIndex) {
                    conditionEndIndex = addnIndex;
                }
                
                const fullConditionEntry = notamTextContent.substring(conditionStart, conditionEndIndex).trim();

                // Filter out French language entries (contain words like NEIGE, DURCIE, SECHE, MELANGE, GRAVIER, VALIDE)
                const frenchKeywords = /\b(NEIGE|DURCIE|SECHE|MELANGE|GRAVIER|VALIDE|SUR|DE|ET)\b/i;
                const isFrench = frenchKeywords.test(fullConditionEntry);

                // Only add if there's meaningful content and it's in English
                if (fullConditionEntry.length > 10 && !isFrench) {
                    conditionMatches.push({
                        runway,
                        description: fullConditionEntry,
                    });
                }
            }

            // Also look for RWY/RUNWAY patterns (fallback for other formats)
            const runwayPattern = /(?:RWY|RUNWAY)\s+(\d{1,2}[LRC]?)(?!\s*\d\/\d\/\d)([^\n]*(?:\n(?!RWY|RUNWAY|RSC|ADDN)[^\n]*)*)/gi;
            
            while ((match = runwayPattern.exec(notamTextContent)) !== null) {
                const runway = match[1];
                const conditionStart = match.index;
                
                // Get the full condition description (up to next RWY, RSC or ADDN)
                const nextRwyIndex = notamTextContent.indexOf('RWY', conditionStart + 3);
                const nextRscIndex = notamTextContent.indexOf('RSC', conditionStart + 3);
                const addnIndex = notamTextContent.indexOf('ADDN', conditionStart);
                
                let conditionEndIndex = notamTextContent.length;
                if (nextRwyIndex !== -1 && nextRwyIndex > conditionStart && nextRwyIndex < conditionEndIndex) {
                    conditionEndIndex = nextRwyIndex;
                }
                if (nextRscIndex !== -1 && nextRscIndex > conditionStart && nextRscIndex < conditionEndIndex) {
                    conditionEndIndex = nextRscIndex;
                }
                if (addnIndex !== -1 && addnIndex > conditionStart && addnIndex < conditionEndIndex) {
                    conditionEndIndex = addnIndex;
                }
                
                const fullConditionEntry = notamTextContent.substring(conditionStart, conditionEndIndex).trim();

                // Filter out French language entries
                const frenchKeywords = /\b(NEIGE|DURCIE|SECHE|MELANGE|GRAVIER|VALIDE|SUR|DE|ET)\b/i;
                const isFrench = frenchKeywords.test(fullConditionEntry);

                // Only add if there's meaningful content and it's in English
                if (fullConditionEntry.length > 10 && !isFrench) {
                    conditionMatches.push({
                        runway,
                        description: fullConditionEntry,
                    });
                }
            }
        });

        setNotamConditionData(conditionMatches);
        setShowNotamModal(true);
    };



    const resetButtonHandler = () => {
        setResetListBox(true);
        setTimeout(() => {
            setResetListBox(false);
        }, 0);
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
        setAirportInput('');
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

        <div className="flex flex-col flex-wrap p-4 space-x-4 text-black dark:text-white" style={{ fontFamily: 'Roboto, sans-serif', fontSize: '12px', lineHeight: '1.25' }}>

            <div className="flex-1" name="rwyccNotProvided"  >

                <Card cardTitle={"RWYCC Not Provided"} status={null} className="w-full sm:w-auto">
                    <div>
                        {/* Airport Input and View Conditions Button */}
                        <div className="flex flex-row justify-between items-center p-2 border-b border-gray-200 dark:border-gray-700 mb-2">
                            <div className="dark:text-white font-medium">Airport Code:</div>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={airportInput}
                                    onChange={(e) => setAirportInput(e.target.value.toUpperCase().slice(0, 4))}
                                    placeholder="ICAO code"
                                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm hover:border-gray-400 dark:hover:border-gray-500"
                                    maxLength={4}
                                />
                                {currentAirport && (
                                    <button
                                        onClick={handleShowNotamModal}
                                        className="px-3 py-2 bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-all duration-200 ease-in-out shadow-sm hover:shadow-md active:scale-95"
                                    >
                                        View Conditions
                                    </button>
                                )}
                            </div>
                        </div>

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
                            <div className="dark:text-white">Runway type:</div>
                            <NewChoiceListbox
                                key={resetListBox ? 'reset-runway-type' : 'runway-type'}
                                value={dropDownPavedOrGravel}
                                choices={["GRAVEL", "PAVED"]}
                                callback={setDropDownPavedOrGravel}
                                reset={resetListBox}
                                resetCallback={resetListbox1Handler}
                            />

                        </div>

                        {dropDownPavedOrGravel === "PAVED" && (

                            <div className="flex flex-row justify-between items-center p-2">


                                <div className="dark:text-white">Contaminant 1:</div>

                                <div className="flex-grow  " style={{ minWidth: '300px' }}>
                                    <NewChoiceListbox
                                        key={resetListBox ? 'reset-paved-contaminant1' : 'paved-contaminant1'}
                                        value={runwayConditionDescriptionPaved2}
                                        choices={contaminantChoices}
                                        callback={setRunwayConditionDescriptionPaved2}
                                        reset={resetListBox}
                                        resetCallback={resetListbox1Handler}
                                    />
                                </div>

                                <div className="dark:text-white">% Coverage 1:</div>
                                <div className="flex-grow" style={{ minWidth: '100px', maxWidth: '100px' }}>
                                    <NewChoiceListbox
                                        key={resetListBox ? 'reset-paved-coverage1' : 'paved-coverage1'}

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
                                    <div className="dark:text-white">Contaminant 2:</div>
                                    <div className="flex-grow" style={{ minWidth: '300px' }}>

                                        <NewChoiceListbox
                                            key={resetListBox ? 'reset-paved-contaminant2' : 'paved-contaminant2'}

                                            value={runwayConditionDescriptionPaved4}
                                            choices={contaminantChoicesExclude100}
                                            callback={setRunwayConditionDescriptionPaved4}
                                            reset={resetListBox}
                                            resetCallback={resetListbox1Handler}

                                        />
                                    </div>

                                    <div className="dark:text-white">% Coverage 2:</div>
                                    <div className="flex-grow" style={{ minWidth: '100px', maxWidth: '100px' }}>
                                        <NewChoiceListbox
                                            key={resetListBox ? 'reset-paved-coverage2' : 'paved-coverage2'}

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
                                <div className="dark:text-white">Contaminant 1:</div>

                                <div className="flex-grow" style={{ minWidth: '300px' }}>
                                    <NewChoiceListbox
                                        key={resetListBox ? 'reset-gravel-contaminant1' : 'gravel-contaminant1'}

                                        value={runwayConditionDescriptionGravel1}
                                        choices={contaminantChoices}
                                        callback={setRunwayConditionDescriptionGravel1}
                                        reset={resetListBox}
                                        resetCallback={resetListbox1Handler}

                                    />
                                </div>

                                <div className="dark:text-white">% Coverage 1:</div>

                                <div className="flex-grow " style={{ minWidth: '100px', maxWidth: '100px' }}>
                                    <NewChoiceListbox
                                        key={resetListBox ? 'reset-gravel-coverage1' : 'gravel-coverage1'}

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
                                            key={resetListBox ? 'reset-gravel-contaminant2' : 'gravel-contaminant2'}

                                            value={runwayConditionDescriptionGravel3}
                                            choices={contaminantChoices}
                                            callback={setRunwayConditionDescriptionGravel3}
                                            reset={resetListBox}
                                            resetCallback={resetListbox1Handler}

                                        />
                                    </div>

                                    <div className="dark:text-white">% Coverage 2:</div>

                                    <div className="flex-grow" style={{ minWidth: '100px', maxWidth: '100px' }}    >
                                        <NewChoiceListbox
                                            key={resetListBox ? 'reset-gravel-coverage2' : 'gravel-coverage2'}

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
                            <div className="w-full md:w-1/2 lg:w-1/3 dark:text-white">RCC code:</div>
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
                            <div className="w-full md:w-1/2 lg:w-1/3 dark:text-white">Max crosswind:</div>
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

            {/* Runway Conditions NOTAM Modal */}
            {showNotamModal && (
                <div 
                    className="fixed w-96 bg-white dark:bg-gray-800 shadow-2xl rounded-xl overflow-hidden z-50 border border-gray-200 dark:border-gray-700 backdrop-blur-sm"
                    style={{ 
                        left: `${modalPosition.x}px`, 
                        top: `${modalPosition.y}px`,
                        maxHeight: 'calc(100vh - 20px)'
                    }}
                >
                        <div 
                            className="flex justify-between items-center px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 cursor-move border-b border-gray-200 dark:border-gray-700"
                            onMouseDown={handleMouseDown}
                        >
                            <h2 className="text-lg font-semibold dark:text-white">Runway Conditions - {currentAirport}</h2>
                            <button
                                onClick={() => setShowNotamModal(false)}
                                className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 text-2xl transition-colors duration-150 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                            >
                                ×
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 140px)' }}>

                        {notamConditionData.length > 0 ? (
                            <div className="space-y-4">
                                {notamConditionData.map((item, idx) => (
                                    <div key={idx} className="border border-gray-200 dark:border-gray-700 p-4 rounded-lg bg-gray-50 dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 transition-colors duration-150">
                                        <div className="font-semibold dark:text-white mb-2">
                                            RWY {item.runway}
                                        </div>
                                        <p className="text-xs dark:text-gray-300 text-gray-700 break-words whitespace-pre-wrap font-mono">
                                            {item.description}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="dark:text-gray-300 text-gray-600">No runway condition descriptions found in NOTAMs for this airport.</p>
                        )}

                        <button
                            onClick={() => setShowNotamModal(false)}
                            className="mt-6 w-full px-4 py-2.5 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md active:scale-95"
                        >
                            Close
                        </button>
                        </div>
                </div>
            )}

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
