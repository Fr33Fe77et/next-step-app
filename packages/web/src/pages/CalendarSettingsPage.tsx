import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  getCalendarList,
  toggleCalendarVisibility,
  toggleCalendarConflictConsideration,
  updateCalendarType,
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
  const dispatch = useDispatch();
  const { calendars, isLoading } = useSelector(
    (state: RootState) => state.googleCalendar
  );

  useEffect(() => {
    dispatch(getCalendarList());
  }, [dispatch]);

  const handleToggleVisible = (id: string) => {
    dispatch(toggleCalendarVisibility(id));
  };

  const handleToggleConflict = (id: string) => {
    dispatch(toggleCalendarConflictConsideration(id));
  };

  const handleTypeChange = (id: string, newType: string) => {
    dispatch(updateCalendarType(id, newType))
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
