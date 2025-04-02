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
  async (_, { rejectWithValue }) => {
    try {
      const events = await fetchGoogleCalendarEvents();
      return events;
    } catch (error) {
      return rejectWithValue('Failed to fetch calendar events');
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
      });
  },
});

export const { updateCalendarSetting, resetState } = googleCalendarSlice.actions;
export default googleCalendarSlice.reducer;

export {
  toggleCalendarVisibility,
  toggleCalendarConflictConsideration,
  updateCalendarType,
  getCalendarList,
  getGoogleCalendarEvents,
  initializeGoogleCalendar,
  loginToGoogleCalendar,
  resetState,
};
