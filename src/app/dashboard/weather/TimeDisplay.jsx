'use client';
import React, { useState, useEffect } from 'react';
import { useRccContext } from '@/app/dashboard/RccCalculatorContext';

export default function TimeDisplay() {
  const [utcTime, setUtcTime] = useState('');
  const [localTime, setLocalTime] = useState('');
  const { lastUpdated, darkMode } = useRccContext();

  // Function to get UTC time
  const getUtcTime = () => {
    const now = new Date();
    // Show UTC in 24-hour HH:MM format
    return now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'UTC' });
  };

  // Function to get Local time in 24-hour format
  const getLocalTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false }); // 24-hour HH:MM
  };

  // Function to format the last refresh time
  const formatRefreshTime = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false }); // 24-hour HH:MM
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
      color: darkMode ? '#fff' : '#111',
      gap: 2
    }}>
      <div>UTC Time: {utcTime}</div>
      <div>Local Time: {localTime}</div>
      <div>Last Weather Refresh: {formatRefreshTime(lastUpdated)}</div>
    </div>
  );
}
