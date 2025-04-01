// src/pages/CalendarSettingsPage.tsx

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { 
  initializeGoogleCalendar, 
  loginToGoogleCalendar, 
  getCalendarList,
  updateCalendarSetting
} from '../store/googleCalendarSlice';
import { useAppDispatch, useAppSelector } from '../hooks/reduxHooks';
import Button from '../components/common/Button';

const SettingsContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
`;

const SettingsHeader = styled.div`
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  color: #2d4b6e;
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  color: #637b96;
`;

const ConnectionStatus = styled.div`
  display: flex;
  align-items: center;
  margin: 1rem 0;
  padding: 1rem;
  background-color: #f0f7ff;
  border-radius: 8px;
`;

const StatusIndicator = styled.div<{ connected: boolean }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: ${props => props.connected ? '#10b981' : '#ef4444'};
  margin-right: 1rem;
`;

const CalendarList = styled.div`
  margin-top: 2rem;
`;

const CalendarItem = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
  gap: 1rem;
`;

const CalendarColor = styled.div<{ color?: string }>`
  width: 16px;
  height: 16px;
  background-color: ${props => props.color || '#4a6fa5'};
  border-radius: 50%;
  margin-right: 0.5rem;
`;

const CalendarTitle = styled.div`
  flex: 1;
  min-width: 200px;
`;

const CalendarName = styled.div`
  font-weight: 600;
  color: #2d4b6e;
`;

const CalendarDescription = styled.div`
  font-size: 0.9rem;
  color: #637b96;
`;

const CalendarControls = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  cursor: pointer;
`;

const CalendarTypeSelect = styled.select`
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  background-color: white;
`;

const NoCalendarsMessage = styled.div`
  text-align: center;
  padding: 2rem;
  background-color: #f5f7fa;
  border-radius: 8px;
  margin-top: 1rem;
`;

const calendarTypes = [
  { value: 'work', label: 'Work' },
  { value: 'personal', label: 'Personal Appointments' },
  { value: 'household', label: 'Household' },
  { value: 'birthdays', label: 'Birthdays' },
  { value: 'other_personal', label: 'Other Personal' },
  { value: 'other_work', label: 'Other Work' },
];

const CalendarSettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const { user } = useAppSelector((state) => state.auth);
  const { 
    isInitialized,
    isSignedIn,
    calendars,
    isLoading
  } = useAppSelector((state) => state.googleCalendar);
  
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    // Initialize Google Calendar API if not already done
    if (!isInitialized) {
      dispatch(initializeGoogleCalendar());
    }
    
    // Fetch calendars if signed in
    if (isInitialized && isSignedIn) {
      dispatch(getCalendarList());
    }
  }, [user, dispatch, navigate, isInitialized, isSignedIn]);
  
  const handleConnectGoogleCalendar = () => {
    dispatch(loginToGoogleCalendar());
  };
  
  const handleVisibilityChange = (calendarId: string, visible: boolean) => {
    dispatch(updateCalendarSetting({ id: calendarId, visible }));
  };
  
  const handleConflictChange = (calendarId: string, considerInConflicts: boolean) => {
    dispatch(updateCalendarSetting({ id: calendarId, considerInConflicts }));
  };
  
  const handleTypeChange = (calendarId: string, calendarType: 'work' | 'personal' | 'household' | 'birthdays' | 'other_personal' | 'other_work') => {
    dispatch(updateCalendarSetting({ id: calendarId, calendarType }));
  };
  
  return (
    <SettingsContainer>
      <SettingsHeader>
        <Title>Calendar Settings</Title>
        <Subtitle>Configure how your calendars are displayed and used for scheduling</Subtitle>
      </SettingsHeader>
      
      <ConnectionStatus>
        <StatusIndicator connected={isSignedIn} />
        <div>
          <strong>Google Calendar: </strong>
          {isSignedIn ? 'Connected' : 'Not connected'}
        </div>
        {!isSignedIn && (
          <Button 
            primary 
            onClick={handleConnectGoogleCalendar}
            style={{ marginLeft: 'auto' }}
          >
            Connect Google Calendar
          </Button>
        )}
      </ConnectionStatus>
      
      {isSignedIn && (
        <CalendarList>
          <h2>Your Calendars</h2>
          {isLoading ? (
            <p>Loading calendars...</p>
          ) : calendars.length === 0 ? (
            <NoCalendarsMessage>
              <p>No calendars found in your Google account.</p>
            </NoCalendarsMessage>
          ) : (
            calendars.map((calendar) => (
              <CalendarItem key={calendar.id}>
                <CalendarTitle>
                  <CalendarName>
                    <CalendarColor color={calendar.backgroundColor} />
                    {calendar.summary} {calendar.primary && "(Primary)"}
                  </CalendarName>
                  <CalendarDescription>{calendar.description}</CalendarDescription>
                </CalendarTitle>
                
                <CalendarControls>
                  <CheckboxLabel>
                    <input
                      type="checkbox"
                      checked={calendar.visible}
                      onChange={(e) => handleVisibilityChange(calendar.id, e.target.checked)}
                      style={{ marginRight: '0.5rem' }}
                    />
                    Display
                  </CheckboxLabel>
                  
                  <CheckboxLabel>
                    <input
                      type="checkbox"
                      checked={calendar.considerInConflicts}
                      onChange={(e) => handleConflictChange(calendar.id, e.target.checked)}
                      style={{ marginRight: '0.5rem' }}
                    />
                    Consider in conflicts
                  </CheckboxLabel>
                  
                  <div>
                    <label htmlFor={`type-${calendar.id}`} style={{ marginRight: '0.5rem' }}>
                      Calendar Type:
                    </label>
                    <CalendarTypeSelect
                      id={`type-${calendar.id}`}
                      value={calendar.calendarType}
                      onChange={(e) => handleTypeChange(
                        calendar.id, 
                        e.target.value as 'work' | 'personal' | 'household' | 'birthdays' | 'other_personal' | 'other_work'
                      )}
                    >
                      {calendarTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </CalendarTypeSelect>
                  </div>
                </CalendarControls>
              </CalendarItem>
            ))
          )}
        </CalendarList>
      )}
    </SettingsContainer>
  );
};

export default CalendarSettingsPage;