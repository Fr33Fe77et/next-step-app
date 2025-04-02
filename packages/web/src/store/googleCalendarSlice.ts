// FULLY CLEANED FILE: packages/web/src/store/googleCalendarSlice.ts

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  initGoogleCalendarApi,
  signInToGoogle,
  fetchGoogleCalendarEvents,
  fetchCalendarList,
  GoogleEvent,
} from '../services/googleCalendarService';
import { AppDispatch, RootState } from './index';
import axios from 'axios';

export interface CalendarSetting {
    id: string;
    summary: string;
    description?: string;
    primary?: boolean;
    backgroundColor?: string;
    visible: boolean;
    considerInConflicts: boolean;
    calendarType:
        | 'work'
        | 'personal'
        | 'household'
        | 'birthdays'
        | 'other_personal'
        | 'other_work'
        | 'personal_primary'
        | 'not_defined';
}

interface GoogleCalendarState {
  isInitialized: boolean;
  isSignedIn: boolean;
  events: GoogleEvent[];
  calendars: CalendarSetting[];
  isLoading: boolean;
  error: string | null;
}

const initialState: GoogleCalendarState = {
  isInitialized: false,
  isSignedIn: false,
  events: [],
  calendars: [],
  isLoading: false,
  error: null,
};

export const initializeGoogleCalendar = createAsyncThunk(
  'googleCalendar/initialize',
  async (_, { rejectWithValue }) => {
    try {
      await initGoogleCalendarApi();
      return true;
    } catch (error) {
      return rejectWithValue('Failed to initialize Google Calendar API');
    }
  }
);

export const loginToGoogleCalendar = createAsyncThunk(
  'googleCalendar/login',
  async (_, { rejectWithValue }) => {
    try {
      await signInToGoogle();
      return true;
    } catch (error) {
      return rejectWithValue('Failed to log in to Google Calendar');
    }
  }
);

export const getCalendarList = createAsyncThunk(
  'googleCalendar/getCalendarList',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchCalendarList();
      return response as CalendarSetting[];
    } catch (error) {
      return rejectWithValue('Failed to fetch calendar list');
    }
  }
);

export const getGoogleCalendarEvents = createAsyncThunk(
    'googleCalendar/getEvents',
    async (params: { 
      startDate?: Date; 
      endDate?: Date; 
      calendarIds?: string[] 
    } = {}, { rejectWithValue }) => {
      try {
        // Create default dates if not provided
        const now = new Date();
        const startDate = params.startDate || now;
        const endDate = params.endDate || new Date(now.getFullYear(), now.getMonth() + 1, 0); // Default to end of current month
        
        const events = await fetchGoogleCalendarEvents(
          startDate,
          endDate,
          params.calendarIds
        );
        return events;
      } catch (error) {
        return rejectWithValue('Failed to fetch calendar events');
      }
    }
  );

  export const saveCalendarSettings = createAsyncThunk(
    'googleCalendar/saveSettings',
    async (calendar: CalendarSetting, { getState, rejectWithValue }) => {
      try {
        // Get token from user in state
        const state = getState() as RootState;
        const token = state.auth.user?.token;
  
        // First try to save to backend
        const response = await axios.post('http://localhost:5000/api/calendar-settings', calendar, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        // Also save to localStorage as backup
        const savedSettings = localStorage.getItem('calendarSettings');
        let settings = savedSettings ? JSON.parse(savedSettings) : {};
        settings[calendar.id] = calendar;
        localStorage.setItem('calendarSettings', JSON.stringify(settings));
        
        return response.data;
      } catch (error) {
        // If backend save fails, at least save to localStorage
        try {
          const savedSettings = localStorage.getItem('calendarSettings');
          let settings = savedSettings ? JSON.parse(savedSettings) : {};
          settings[calendar.id] = calendar;
          localStorage.setItem('calendarSettings', JSON.stringify(settings));
          return calendar; // Return the calendar object even if backend save failed
        } catch (localError) {
          console.error("Failed to save settings to localStorage", localError);
        }
        
        return rejectWithValue('Failed to save calendar settings');
      }
    }
  );

  export const loadCalendarSettings = createAsyncThunk(
    'googleCalendar/loadSettings',
    async (_, { dispatch, getState, rejectWithValue }) => {
      try {
        // Get token from user in state
        const state = getState() as RootState;
        const token = state.auth.user?.token;
  
        // First try to load from backend
        const response = await axios.get('http://localhost:5000/api/calendar-settings', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (response.data && response.data.length > 0) {
          return response.data;
        }
        
        // If no data from backend, try localStorage
        const savedSettings = localStorage.getItem('calendarSettings');
        if (savedSettings) {
          const settings = JSON.parse(savedSettings);
          return Object.values(settings);
        }
        
        return [];
      } catch (error) {
        // If backend load fails, try localStorage
        try {
          const savedSettings = localStorage.getItem('calendarSettings');
          if (savedSettings) {
            const settings = JSON.parse(savedSettings);
            return Object.values(settings);
          }
        } catch (localError) {
          console.error("Failed to load settings from localStorage", localError);
        }
        
        return rejectWithValue('Failed to load calendar settings');
      }
    }
  );

export const toggleCalendarVisibility =
  (id: string) => (dispatch: AppDispatch, getState: () => RootState) => {
    const calendar = getState().googleCalendar.calendars.find((c) => c.id === id);
    if (!calendar) return;
    const updated = { ...calendar, visible: !calendar.visible };
    dispatch(updateCalendarSetting(updated));
  };

export const toggleCalendarConflictConsideration =
  (id: string) => (dispatch: AppDispatch, getState: () => RootState) => {
    const calendar = getState().googleCalendar.calendars.find((c) => c.id === id);
    if (!calendar) return;
    const updated = { ...calendar, considerInConflicts: !calendar.considerInConflicts };
    dispatch(updateCalendarSetting(updated));
  };

export const updateCalendarType =
  (id: string, calendarType: CalendarSetting['calendarType']) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const calendar = getState().googleCalendar.calendars.find((c) => c.id === id);
    if (!calendar) return;
    const updated = { ...calendar, calendarType };
    dispatch(updateCalendarSetting(updated));
  };

  const googleCalendarSlice = createSlice({
    name: 'googleCalendar',
    initialState,
    reducers: {
      updateCalendarSetting: (state, action: PayloadAction<CalendarSetting>) => {
        const idx = state.calendars.findIndex((c) => c.id === action.payload.id);
        if (idx !== -1) {
          state.calendars[idx] = action.payload;
        }
      },
      resetState: () => initialState,
    },
    extraReducers: (builder) => {
      builder
        .addCase(initializeGoogleCalendar.fulfilled, (state) => {
          state.isInitialized = true;
        })
        .addCase(loginToGoogleCalendar.fulfilled, (state) => {
          state.isSignedIn = true;
        })
        .addCase(getCalendarList.pending, (state) => {
          state.isLoading = true;
        })
        .addCase(getCalendarList.fulfilled, (state, action: PayloadAction<CalendarSetting[]>) => {
          state.calendars = action.payload;
          state.isLoading = false;
          state.error = null;
        })
        .addCase(getCalendarList.rejected, (state, action) => {
          state.isLoading = false;
          state.error = action.payload as string;
        })
        .addCase(getGoogleCalendarEvents.pending, (state) => {
          state.isLoading = true;
        })
        .addCase(getGoogleCalendarEvents.fulfilled, (state, action: PayloadAction<GoogleEvent[]>) => {
          state.events = action.payload;
          state.isLoading = false;
          state.error = null;
        })
        .addCase(getGoogleCalendarEvents.rejected, (state, action) => {
          state.isLoading = false;
          state.error = action.payload as string;
        })
        .addCase(loadCalendarSettings.fulfilled, (state, action) => {
            // If we have settings saved, update our calendars array
            if (action.payload && action.payload.length > 0) {
              // For each saved setting, update the corresponding calendar
              action.payload.forEach((savedSetting: CalendarSetting) => {
                const idx = state.calendars.findIndex(cal => cal.id === savedSetting.id);
                if (idx !== -1) {
                  state.calendars[idx] = {
                    ...state.calendars[idx],
                    ...savedSetting
                  };
                }
              });
            }
          })
        .addCase(saveCalendarSettings.fulfilled, (state, action) => {
          if (action.payload) {
            const idx = state.calendars.findIndex(cal => cal.id === action.payload.id);
            if (idx !== -1) {
              state.calendars[idx] = action.payload;
            }
          }
        });
    }
  });
  
  export const { updateCalendarSetting, resetState } = googleCalendarSlice.actions;
  export default googleCalendarSlice.reducer;

// export {
//    toggleCalendarVisibility,
//    toggleCalendarConflictConsideration,
//    updateCalendarType,
//    getCalendarList,
//    getGoogleCalendarEvents,
//    initializeGoogleCalendar,
//    loginToGoogleCalendar,
//    resetState,
//  };