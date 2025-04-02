import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/reduxHooks';
import {
  getCalendarList,
  toggleCalendarVisibility,
  toggleCalendarConflictConsideration,
  updateCalendarType,
  CalendarSetting,
  saveCalendarSettings,
  loadCalendarSettings
} from '../store/googleCalendarSlice';
import { RootState } from '../store';

const calendarTypeOptions = [
  'work',
  'personal',
  'household',
  'birthdays',
  'other_personal',
  'other_work',
  'personal_primary',
  'not_defined',
];

const CalendarSettingsPage = () => {
  const dispatch = useAppDispatch();
  const { calendars, isLoading } = useAppSelector(
  (state: RootState) => state.googleCalendar
);

useEffect(() => {
  dispatch(getCalendarList())
    .then(() => {
      dispatch(loadCalendarSettings());
    });
}, [dispatch]);

  const handleToggleVisible = (id: string) => {
    dispatch(toggleCalendarVisibility(id));
  // Get the updated calendar and save it
  const calendar = calendars.find(cal => cal.id === id);
  if (calendar) {
    const updatedCalendar = {
      ...calendar,
      visible: !calendar.visible
    };
    dispatch(saveCalendarSettings(updatedCalendar));
  }
};

  const handleToggleConflict = (id: string) => {
    dispatch(toggleCalendarConflictConsideration(id));
    const calendar = calendars.find(cal => cal.id === id);
    if (calendar) {
      const updatedCalendar = {
        ...calendar,
        considerInConflicts: !calendar.considerInConflicts
      };
      dispatch(saveCalendarSettings(updatedCalendar));
    }
  };

  const handleTypeChange = (id: string, newType: string) => {
    // Cast the newType to the expected type
    dispatch(updateCalendarType(id, newType as CalendarSetting['calendarType']));
    const calendar = calendars.find(cal => cal.id === id);
    if (calendar) {
      const updatedCalendar = {
        ...calendar,
        calendarType: newType as CalendarSetting['calendarType']
      };
      dispatch(saveCalendarSettings(updatedCalendar));
    }
  };

  if (isLoading) return <p>Loading...</p>;

  return (
    <div>
      <h2>Calendar Settings</h2>
      <table>
        <thead>
          <tr>
            <th>Calendar</th>
            <th>Visible</th>
            <th>Consider for Conflicts</th>
            <th>Type</th>
          </tr>
        </thead>
        <tbody>
          {calendars.map((calendar) => (
            <tr key={calendar.id}>
              <td>
                <span
                  style={{
                    display: 'inline-block',
                    width: 12,
                    height: 12,
                    backgroundColor: calendar.backgroundColor || '#ccc',
                    marginRight: 8,
                  }}
                ></span>
                {calendar.summary}
              </td>
              <td>
                <input
                  type="checkbox"
                  checked={calendar.visible}
                  onChange={() => handleToggleVisible(calendar.id)}
                />
              </td>
              <td>
                <input
                  type="checkbox"
                  checked={calendar.considerInConflicts}
                  onChange={() => handleToggleConflict(calendar.id)}
                />
              </td>
              <td>
                <select
                  value={calendar.calendarType}
                  onChange={(e) =>
                    handleTypeChange(calendar.id, e.target.value)
                  }
                >
                  {calendarTypeOptions.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CalendarSettingsPage;
