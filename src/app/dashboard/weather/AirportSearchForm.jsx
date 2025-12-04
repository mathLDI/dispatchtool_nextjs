import React, { useState, useEffect } from 'react';
import AirportList from '../../lib/component/AirportList';
import { useRccContext } from '../RccCalculatorContext';
import WarningModal from '../../lib/component/WarningModal';
import { SearchIcon } from '@heroicons/react/outline';

const AirportSearchForm = ({ fetchWeather }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [duplicateAirports, setDuplicateAirports] = useState([]);

  const {
    airportValues,
    addAirportValue,
    setWeatherData,
    setSelectedAirport,
    selectedForm,
    flightDetails,
    setAllWeatherData,
  } = useRccContext();

  useEffect(() => {
    if (selectedForm === 'Routing Search' && flightDetails.departure) {
      fetchWeather(flightDetails.departure).then((data) => {
        setWeatherData(data);
        setSelectedAirport({ id: flightDetails.departure, name: `Airport ${flightDetails.departure}`, code: flightDetails.departure });
      });
    }
  }, [selectedForm, flightDetails.departure, fetchWeather, setWeatherData, setSelectedAirport]);

  const handleModalClose = () => {
    setIsModalOpen(false);
    setDuplicateAirports([]);
  };

  const handleAirportClick = async (airportCode) => {
    const data = await fetchWeather(airportCode);
    setWeatherData(data);
    setSelectedAirport({ id: airportCode, name: `Airport ${airportCode}`, code: airportCode });
    
    // Add to allWeatherData so bubbles display
    setAllWeatherData(prevData => ({
      ...prevData,
      [airportCode]: data
    }));
  };

  return (
    <div className="flex flex-grow overflow-auto ">

      <WarningModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        message={`Airport code(s) ${duplicateAirports.join(', ')} already entered.`}
      />

      <div className='flex-1'>
        {/* Filtered AirportList */}
        <div className="flex flex-grow">
          <AirportList
            onAirportClick={handleAirportClick}
          />
        </div>
      </div>
    </div>
  );
};

export default AirportSearchForm;
