'use client';

import { useState, useEffect } from "react";
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
        runwayLength, setRunwayLength,
        selectedAirport,
        allWeatherData,
    } = useRccContext();

    // Local airport input state (independent of x-wind calculator)
    const [airportInput, setAirportInput] = useState('');
    const [showRwyccModal, setShowRwyccModal] = useState(false);
    const [rwyccNotamData, setRwyccNotamData] = useState([]);
    const [modalPosition, setModalPosition] = useState({ x: 500, y: 100 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    
    // Use local airport input if provided, otherwise use selected airport from context
    const currentAirport = airportInput || selectedAirport?.code;

    // Close modal and clear data when airport changes
    useEffect(() => {
        setShowRwyccModal(false);
        setRwyccNotamData([]);
    }, [currentAirport]);

    const rwyccChoices = [6, 5, 4, 3, 2, 1, 0];
    const buttonAircraftType = ["DHC-8", "HS-748", "ATR-72"];
    const [callDxp] = useState(null);
    const [resetListBox, setResetListBox] = useState(false);
    const integerRunwayLength = parseInt(runwayLength, 10);
    const integerCorrectedLandingDistance = parseInt(correctedLandingDistance, 10);
    const [isExpanded, setIsExpanded] = useState(false);

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

    // Reset RWYCC values when airport changes
    useEffect(() => {
        setRwycc1(6);
        setRwycc2(6);
        setRwycc3(6);
        // Force listbox reset to reflect the 6/6/6 defaults
        setResetListBox(true);
        setTimeout(() => {
            setResetListBox(false);
        }, 0);
    }, [currentAirport, setRwycc1, setRwycc2, setRwycc3]);

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
        setAirportInput('');
    };

    // Extract RWYCC from NOTAMs and show modal
    const handleShowRwyccModal = () => {
        if (!currentAirport || !allWeatherData?.[currentAirport]) {
            alert('No data available for this airport');
            return;
        }

        const notams = allWeatherData[currentAirport].data.filter(item => item.type === 'notam');
        const rwyccMatches = [];

        notams.forEach(notam => {
            // Get the raw notam text (handle both string and object)
            let notamTextContent = typeof notam.text === 'string' ? notam.text : JSON.stringify(notam.text);
            
            // Parse if it's JSON
            try {
                const parsed = JSON.parse(notamTextContent);
                notamTextContent = parsed.raw || notamTextContent;
            } catch (e) {
                // Already a string, continue
            }

            // Match pattern: RSC + runway + space + digit/digit/digit followed by description until next RSC or ADDN
            const rscPattern = /RSC\s+(\d{1,2}[LRC]?)\s+(\d)\/(\d)\/(\d)[^\n]*(?:\n(?!RSC|ADDN)[^\n]*)*(?:\n(?!RSC|ADDN)[^\n]*)*/gi;
            let match;

            while ((match = rscPattern.exec(notamTextContent)) !== null) {
                const runway = match[1];
                const rwycc1 = match[2];
                const rwycc2 = match[3];
                const rwycc3 = match[4];
                
                // Get the full RSC entry including description (up to next RSC or ADDN)
                const rscStart = match.index;
                const nextRscIndex = notamTextContent.indexOf('RSC', rscStart + 3);
                const addnIndex = notamTextContent.indexOf('ADDN', rscStart);
                
                let rscEndIndex = notamTextContent.length;
                if (nextRscIndex !== -1 && nextRscIndex > rscStart) {
                    rscEndIndex = nextRscIndex;
                }
                if (addnIndex !== -1 && addnIndex < rscEndIndex) {
                    rscEndIndex = addnIndex;
                }
                
                const fullRscEntry = notamTextContent.substring(rscStart, rscEndIndex).trim();

                // Filter out French language entries (contain words like NEIGE, DURCIE, SECHE, MELANGE, GRAVIER, VALIDE)
                const frenchKeywords = /\b(NEIGE|DURCIE|SECHE|MELANGE|GRAVIER|VALIDE|SUR|DE|ET)\b/i;
                const isFrench = frenchKeywords.test(fullRscEntry);

                // Only add if it's in English
                if (!isFrench) {
                    rwyccMatches.push({
                        runway,
                        rwycc1,
                        rwycc2,
                        rwycc3,
                        description: fullRscEntry,
                    });
                }
            }
        });

        setRwyccNotamData(rwyccMatches);
        setShowRwyccModal(true);
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
                            <div className="dark:text-white font-medium">Airport Code:</div>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    maxLength={4}
                                    value={airportInput}
                                    onChange={(e) => setAirportInput(e.target.value.toUpperCase())}
                                    placeholder={selectedAirport?.code || "Enter ICAO"}
                                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm hover:border-gray-400 dark:hover:border-gray-500"
                                />
                                {currentAirport && (
                                    <button
                                        onClick={handleShowRwyccModal}
                                        className="px-3 py-2 bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-all duration-200 ease-in-out shadow-sm hover:shadow-md active:scale-95"
                                    >
                                        View RWYCC
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-row justify-between items-center p-2">
                            <div className="dark:text-white font-medium">Aircraft type:</div>
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
                            <div className="dark:text-white font-medium">RWYCC: </div>
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
                            <div className="dark:text-white font-medium pr-2">Corrected TLR Landing Distance:</div>
                            <input
                                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm hover:border-gray-400 dark:hover:border-gray-500"
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
                            <div className="dark:text-white font-medium">Landing Runway Length:</div>
                            <input
                                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm hover:border-gray-400 dark:hover:border-gray-500"
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

            {/* RWYCC Modal */}
            {showRwyccModal && (
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
                            <h2 className="text-lg font-semibold dark:text-white">RWYCC from NOTAMs - {currentAirport}</h2>
                            <button
                                onClick={() => setShowRwyccModal(false)}
                                className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 text-2xl transition-colors duration-150 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                            >
                                ×
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 140px)' }}>

                        {rwyccNotamData.length > 0 ? (
                            <div className="space-y-4">
                                {rwyccNotamData.map((item, idx) => (
                                    <div key={idx} className="border border-gray-200 dark:border-gray-700 p-4 rounded-lg bg-gray-50 dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 transition-colors duration-150">
                                        <div className="font-semibold dark:text-white mb-2">
                                            RWY {item.runway}: 
                                            <button
                                                onClick={() => {
                                                    setRwycc1(parseInt(item.rwycc1));
                                                    setRwycc2(parseInt(item.rwycc2));
                                                    setRwycc3(parseInt(item.rwycc3));
                                                    setResetListBox(true);
                                                    setTimeout(() => setResetListBox(false), 0);
                                                    setShowRwyccModal(false);
                                                }}
                                                className="ml-2 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white text-sm rounded-lg cursor-pointer inline-block transition-all duration-200 shadow-sm hover:shadow-md active:scale-95"
                                            >
                                                <span className="text-base font-bold">{item.rwycc1}/{item.rwycc2}/{item.rwycc3}</span>
                                            </button>
                                        </div>
                                        <p className="text-xs dark:text-gray-300 text-gray-700 break-words whitespace-pre-wrap font-mono">
                                            {item.description}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="dark:text-gray-300 text-gray-600">No RWYCC codes found in NOTAMs for this airport.</p>
                        )}

                        <button
                            onClick={() => setShowRwyccModal(false)}
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