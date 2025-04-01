import { gapi } from 'gapi-script';

// Google API configuration
const API_KEY = 'AIzaSyAR_X2Q3zDeWyTOsP0ytPZgDBbpe2-CRfs';
const CLIENT_ID = '72164821896-99aipn2s96hto85irm85f3003fsrne6s.apps.googleusercontent.com';
const DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'];
const SCOPES = 'https://www.googleapis.com/auth/calendar.readonly';

// In src/services/googleCalendarService.ts

export interface GoogleCalendarList {
  id: string;
  summary: string;
  description?: string;
  primary?: boolean;
  backgroundColor?: string;
}

export const fetchCalendarList = async (): Promise<GoogleCalendarList[]> => {
  try {
    const response = await gapi.client.calendar.calendarList.list();
    return response.result.items.map((calendar: any) => ({
      id: calendar.id,
      summary: calendar.summary,
      description: calendar.description || '',
      primary: calendar.primary || false,
      backgroundColor: calendar.backgroundColor,
    }));
  } catch (error) {
    console.error('Error fetching calendar list:', error);
    throw error;
  }
};

export interface GoogleEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  description?: string;
  location?: string;
  calendarId?: string;
  backgroundColor?: string;
}

export const initGoogleCalendarApi = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    gapi.load('client:auth2', () => {
      gapi.client
        .init({
          apiKey: API_KEY,
          clientId: CLIENT_ID,
          discoveryDocs: DISCOVERY_DOCS,
          scope: SCOPES,
        })
        .then(() => {
          resolve();
        })
        .catch((error: Error) => {
          reject(error);
        });
    });
  });
};

export const signInToGoogle = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    const auth = gapi.auth2.getAuthInstance();
    
    if (auth.isSignedIn.get()) {
      resolve();
    } else {
      auth.signIn()
        .then(() => {
          resolve();
        })
        .catch((error: Error) => {
          reject(error);
        });
    }
  });
};

export const fetchGoogleCalendarEvents = async (
  timeMin: Date, 
  timeMax: Date,
  calendarIds?: string[]
): Promise<GoogleEvent[]> => {
  try {
    if (!calendarIds || calendarIds.length === 0) {
      // If no calendars specified, just fetch from primary
      const response = await gapi.client.calendar.events.list({
        'calendarId': 'primary',
        'timeMin': timeMin.toISOString(),
        'timeMax': timeMax.toISOString(),
        'showDeleted': false,
        'singleEvents': true,
        'orderBy': 'startTime'
      });
      
      return formatGoogleEvents(response.result.items);
    }
    
    // Fetch events from multiple calendars
    const allEvents: GoogleEvent[] = [];
    
    // First, get calendar list to have access to colors
    const calendarList = await fetchCalendarList();
    
    for (const calendarId of calendarIds) {
      try {
        // Find the calendar info to get color
        const calendarInfo = calendarList.find(cal => cal.id === calendarId);
        
        const response = await gapi.client.calendar.events.list({
          'calendarId': calendarId,
          'timeMin': timeMin.toISOString(),
          'timeMax': timeMax.toISOString(),
          'showDeleted': false,
          'singleEvents': true,
          'orderBy': 'startTime'
        });
        
        const formattedEvents = formatGoogleEvents(
          response.result.items, 
          calendarInfo
        );
        allEvents.push(...formattedEvents);
      } catch (error) {
        console.error(`Error fetching events for calendar ${calendarId}:`, error);
        // Continue with other calendars even if one fails
      }
    }
    
    return allEvents;
  } catch (error) {
    console.error('Error fetching Google Calendar events:', error);
    throw error;
  }
};

// Helper function to format events consistently
const formatGoogleEvents = (events: any[], calendarInfo?: {id: string, backgroundColor?: string}): GoogleEvent[] => {
  return events.map((event: any) => {
    const start = event.start.dateTime 
      ? new Date(event.start.dateTime) 
      : new Date(event.start.date);
    
    const end = event.end.dateTime 
      ? new Date(event.end.dateTime) 
      : new Date(event.end.date);
    
    return {
      id: event.id,
      title: event.summary,
      start,
      end,
      description: event.description,
      location: event.location,
      calendarId: calendarInfo?.id,
      backgroundColor: calendarInfo?.backgroundColor
    };
  });
};