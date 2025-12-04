'use client';
import React, { useState, useEffect } from 'react';
import { useRccContext } from '@/app/dashboard/RccCalculatorContext';

export default function TimeDisplay() {
  const [utcTime, setUtcTime] = useState('');
  const [localTime, setLocalTime] = useState('');
  const { lastUpdated } = useRccContext();

  // Function to get UTC time
  const getUtcTime = () => {
    const now = new Date();
    return now.toUTCString().split(' ')[4]; // Extract just the time part
  };

  // Function to get Local time in 24-hour format
  const getLocalTime = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour12: false }); // 24-hour format
  };

  // Function to format the last refresh time
  const formatRefreshTime = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour12: false }); // 24-hour format
  };

  // Update the UTC and local time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setUtcTime(getUtcTime());
      setLocalTime(getLocalTime());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'flex-end',
      fontSize: 12,
      color: '#fff',
      gap: 2
    }}>
      <div>UTC Time: {utcTime}</div>
      <div>Local Time: {localTime}</div>
      <div>Last Weather Refresh: {formatRefreshTime(lastUpdated)}</div>
    </div>
  );
}
