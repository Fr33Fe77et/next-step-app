import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { 
  initGmailApi, 
  signInToGmail, 
  fetchEmails, 
  EmailMessage, 
} from '../services/gmailService';


interface EmailState {
  isInitialized: boolean;
  isSignedIn: boolean;
  emails: EmailMessage[];
  selectedEmail: EmailMessage | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: EmailState = {
  isInitialized: false,
  isSignedIn: false,
  emails: [],
  selectedEmail: null,
  isLoading: false,
  error: null,
};

export const initializeGmail = createAsyncThunk(
  'email/initialize',
  async (_, { rejectWithValue }) => {
    try {
      await initGmailApi();
      return true;
    } catch (error) {
      return rejectWithValue('Failed to initialize Gmail API');
    }
  }
);

export const loginToGmail = createAsyncThunk(
  'email/login',
  async (_, { rejectWithValue }) => {
    try {
      await signInToGmail();
      return true;
    } catch (error) {
      return rejectWithValue('Failed to log in to Gmail');
    }
  }
);

export const getEmails = createAsyncThunk(
    'email/getEmails',
    async (maxResults: number = 20, { rejectWithValue }) => {
      try {
        console.log("getEmails thunk called with maxResults:", maxResults);
        const emails = await fetchEmails(maxResults);
        console.log(`Thunk received ${emails.length} emails`);
        return emails;
      } catch (error) {
        console.error("getEmails thunk error:", error);
        return rejectWithValue('Failed to fetch emails');
      }
    }
  );

export const reinitializeGmail = createAsyncThunk(
    'email/reinitialize',
    async (_, { rejectWithValue }) => {
      try {
        // Use the existing functions, don't define new ones
        const gmailService = await import('../services/gmailService');
        gmailService.clearGoogleAuth();
        await gmailService.initGmailApi();
        await gmailService.signInToGmail();
        return true;
      } catch (error) {
        return rejectWithValue('Failed to reinitialize Gmail API');
      }
    }
  );

const emailSlice = createSlice({
  name: 'email',
  initialState,
  reducers: {
    selectEmail: (state, action: PayloadAction<string>) => {
      state.selectedEmail = state.emails.find(email => email.id === action.payload) || null;
    },
    clearSelectedEmail: (state) => {
      state.selectedEmail = null;
    },
    resetEmailState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(initializeGmail.fulfilled, (state) => {
        state.isInitialized = true;
      })
      .addCase(loginToGmail.fulfilled, (state) => {
        state.isSignedIn = true;
      })
      .addCase(getEmails.pending, (state) => {
        state.isLoading = true;
        console.log("getEmails pending");
      })
      .addCase(getEmails.fulfilled, (state, action: PayloadAction<EmailMessage[]>) => {
        console.log(`getEmails fulfilled with ${action.payload.length} emails`);
        state.emails = action.payload;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(getEmails.rejected, (state, action) => {
        console.log("getEmails rejected:", action.payload);
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { selectEmail, clearSelectedEmail, resetEmailState } = emailSlice.actions;
export default emailSlice.reducer;