import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { 
  initGoogleCalendarApi, 
  signInToGoogle, 
  fetchGoogleCalendarEvents,
  GoogleEvent,
  fetchCalendarList
} from '../services/googleCalendarService';

interface CalendarSetting {
  id: string;
  summary: string;
  description?: string;
  primary?: boolean;
  backgroundColor?: string;
  visible: boolean;
  considerInConflicts: boolean;
  calendarType: 'work' | 'personal' | 'household' | 'birthdays' | 'other_personal' | 'other_work';
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
      const calendars = await fetchCalendarList();
      // Set default settings for each calendar
      return calendars.map(calendar => ({
        ...calendar,
        visible: true,
        considerInConflicts: true,
        calendarType: calendar.primary ? 'work' as const : 'other_personal' as const,
      }));
    } catch (error) {
      return rejectWithValue('Failed to fetch calendar list');
    }
  }
);

export const updateCalendarSetting = createAsyncThunk(
  'googleCalendar/updateCalendarSetting',
  async (setting: Partial<CalendarSetting> & { id: string }, { getState }) => {
    return setting;
  }
);

export const getGoogleCalendarEvents = createAsyncThunk(
  'googleCalendar/getEvents',
  async (
    { startDate, endDate, calendarIds }: { startDate: Date; endDate: Date; calendarIds?: string[] },
    { rejectWithValue }
  ) => {
    try {
      const events = await fetchGoogleCalendarEvents(startDate, endDate, calendarIds);
      return events;
    } catch (error) {
      return rejectWithValue('Failed to fetch Google Calendar events');
    }
  }
);

export interface GoogleCalendarList {
  id: string;
  summary: string;
  description?: string;
  primary?: boolean;
  backgroundColor?: string;
}


const googleCalendarSlice = createSlice({
  name: 'googleCalendar',
  initialState,
  reducers: {
    resetState: (state) => {
      state.isSignedIn = false;
      state.events = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Initialize
      .addCase(initializeGoogleCalendar.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(initializeGoogleCalendar.fulfilled, (state) => {
        state.isInitialized = true;
        state.isLoading = false;
      })
      .addCase(initializeGoogleCalendar.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Login
      .addCase(loginToGoogleCalendar.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginToGoogleCalendar.fulfilled, (state) => {
        state.isSignedIn = true;
        state.isLoading = false;
      })
      .addCase(loginToGoogleCalendar.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Get Events
      .addCase(getGoogleCalendarEvents.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getGoogleCalendarEvents.fulfilled, (state, action) => {
        state.events = action.payload;
        state.isLoading = false;
      })
      .addCase(getGoogleCalendarEvents.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Calendar List
      .addCase(getCalendarList.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCalendarList.fulfilled, (state, action) => {
        state.calendars = action.payload;
        state.isLoading = false;
      })
      .addCase(getCalendarList.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Update Calendar Setting
      .addCase(updateCalendarSetting.fulfilled, (state, action) => {
        const index = state.calendars.findIndex(cal => cal.id === action.payload.id);
        if (index !== -1) {
          state.calendars[index] = {
            ...state.calendars[index],
            ...action.payload,
          };
        }
      });
  },
});

export const { resetState } = googleCalendarSlice.actions;
export default googleCalendarSlice.reducer;