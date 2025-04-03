import { gapi } from 'gapi-script';

// Gmail API configuration
const API_KEY = 'AIzaSyAR_X2Q3zDeWyTOsP0ytPZgDBbpe2-CRfs';
const CLIENT_ID = '72164821896-99aipn2s96hto85irm85f3003fsrne6s.apps.googleusercontent.com';
const DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest'];
const SCOPES = 'https://www.googleapis.com/auth/gmail.readonly';

export interface MessageHeader {
    name: string;
    value: string;
  }
  
  export interface GmailMessagePart {
    mimeType: string;
    filename?: string;
    body?: {
      data?: string;
      size?: number;
    };
    parts?: GmailMessagePart[];
  }
  
  export interface GmailMessage {
    id: string;
    threadId: string;
    snippet: string;
    labelIds: string[];
    payload: {
      headers: MessageHeader[];
      parts?: GmailMessagePart[];
      body?: {
        data?: string;
        size?: number;
      };
      mimeType?: string;
      filename?: string;
    };
  }

export interface EmailMessage {
  id: string;
  threadId: string;
  subject: string;
  snippet: string;
  from: string;
  to: string[];
  date: Date;
  body?: string;
  hasAttachments: boolean;
  labels: string[];
  isRead: boolean;
}

export const initGmailApi = (): Promise<void> => {
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

export const signInToGmail = (): Promise<void> => {
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

export const fetchEmails = async (maxResults: number = 20): Promise<EmailMessage[]> => {
    try {
      console.log("Starting to fetch emails, max:", maxResults);
      
      // Check if user is authenticated
      const isSignedIn = gapi.auth2.getAuthInstance().isSignedIn.get();
      console.log("User is signed in:", isSignedIn);
      
      if (!isSignedIn) {
        console.log("User not signed in, attempting sign in");
        await signInToGmail();
        
        // Check if we have the Gmail scope
        const currentUser = gapi.auth2.getAuthInstance().currentUser.get();
        const hasGmailScope = currentUser.hasGrantedScopes(SCOPES);
        
        if (!hasGmailScope) {
          console.log("Need to request Gmail scope");
          await currentUser.grant({ scope: SCOPES });
        }
      }
      
      // Check if Gmail API is available
      if (!gapi.client.gmail) {
        console.log("Gmail API not loaded, loading now");
        await gapi.client.load('gmail', 'v1');
      }
      
      console.log("Calling Gmail API to list messages");
      const response = await gapi.client.gmail.users.messages.list({
        userId: 'me',
        maxResults,
        q: 'in:inbox',
      });
      
      console.log("API response received:", response.status);
      console.log("Result:", response.result);
      
      if (!response.result.messages || response.result.messages.length === 0) {
        console.log("No messages found in the response");
        return [];
      }
      
      const messages = response.result.messages;
      console.log(`Found ${messages.length} messages, fetching details`);
      
      // For debugging, limit to just a few emails at first
      const messagesToProcess = messages.slice(0, 5);
      console.log(`Processing ${messagesToProcess.length} messages`);
      
      const emails: EmailMessage[] = [];
      
      for (const message of messagesToProcess) {
        console.log(`Fetching details for message ${message.id}`);
        try {
          const emailData = await fetchEmailData(message.id);
          if (emailData) {
            emails.push(emailData);
            console.log(`Successfully processed email: ${emailData.subject}`);
          } else {
            console.log(`Failed to process email ${message.id}`);
          }
        } catch (detailError) {
          console.error(`Error fetching details for message ${message.id}:`, detailError);
        }
      }
      
      console.log(`Successfully processed ${emails.length} out of ${messagesToProcess.length} emails`);
      return emails;
    } catch (error) {
      console.error("Error in fetchEmails:", error);
      throw error;
    }
  };

export const fetchEmailData = async (messageId: string): Promise<EmailMessage | null> => {
    try {
      const response = await gapi.client.gmail.users.messages.get({
        userId: 'me',
        id: messageId,
        format: 'full',
      });
  
      const message: GmailMessage = response.result;
      if (!message) return null;
  
      const headers = message.payload.headers;
      const subject = headers.find((h: MessageHeader) => h.name === 'Subject')?.value || '(No Subject)';
      const from = headers.find((h: MessageHeader) => h.name === 'From')?.value || '';
      const to = headers.find((h: MessageHeader) => h.name === 'To')?.value?.split(',').map((e: string) => e.trim()) || [];
      const date = new Date(headers.find((h: MessageHeader) => h.name === 'Date')?.value || Date.now());
      
      const hasAttachments = message.payload.parts?.some(part => part.filename && part.filename.length > 0) || false;
      const isRead = !message.labelIds.includes('UNREAD');

      // Extract the body in plain text format if available
      const body = extractBody(message);

    return {
      id: message.id,
      threadId: message.threadId,
      subject,
      snippet: message.snippet || '',
      from,
      to,
      date,
      body,
      hasAttachments,
      labels: message.labelIds || [],
      isRead,
    };
  } catch (error) {
    console.error('Error fetching email data:', error);
    return null;
  }
};

export const reinitializeGoogleApis = async () => {
    clearGoogleAuth();
    await initGmailApi(); // or initGmailApi()
    return signInToGmail(); // or signInToGmail()
  };
export const clearGoogleAuth = () => {
    // Clear any stored tokens
    localStorage.removeItem('googleAuth');
    
    // If gapi is loaded, clear its auth state too
    if (window.gapi && window.gapi.auth2) {
      const auth2 = window.gapi.auth2.getAuthInstance();
      if (auth2) {
        auth2.signOut().then(() => {
          console.log('User signed out.');
        });
      }
    }
  };

// Helper function to extract the body from a Gmail message
const extractBody = (message: GmailMessage): string => {
    // First, try to find the plain text part
    const findPlainTextPart = (parts: GmailMessagePart[] | undefined): GmailMessagePart | null => {
      if (!parts) return null;
      
      for (const part of parts) {
        if (part.mimeType === 'text/plain') {
          return part;
        }
        if (part.parts) {
          const plainPart = findPlainTextPart(part.parts);
          if (plainPart) return plainPart;
        }
      }
      return null;
    };
  
    // If no parts, try to get data from the body directly
    if (!message.payload.parts && message.payload.body && message.payload.body.data) {
      return decodeBase64(message.payload.body.data);
    }
  
    // Try to find a plain text part
    const plainTextPart = findPlainTextPart(message.payload.parts);
    if (plainTextPart && plainTextPart.body && plainTextPart.body.data) {
      return decodeBase64(plainTextPart.body.data);
    }
  
    // Fall back to an HTML part if no plain text is available
    const findHtmlPart = (parts: GmailMessagePart[] | undefined): GmailMessagePart | null => {
      if (!parts) return null;
      
      for (const part of parts) {
        if (part.mimeType === 'text/html') {
          return part;
        }
        if (part.parts) {
          const htmlPart = findHtmlPart(part.parts);
          if (htmlPart) return htmlPart;
        }
      }
      return null;
    };
  
    const htmlPart = findHtmlPart(message.payload.parts);
    if (htmlPart && htmlPart.body && htmlPart.body.data) {
      // Strip HTML tags for a simple text representation
      const html = decodeBase64(htmlPart.body.data);
      return html.replace(/<[^>]*>?/gm, '');
    }
  
    return '(No body content available)';
  };

// Helper function to decode base64 content
const decodeBase64 = (data: string): string => {
  return atob(data.replace(/-/g, '+').replace(/_/g, '/'));
};

export const reinitializeGmailApi = async (): Promise<void> => {
    clearGoogleAuth();
    await initGmailApi();
    return signInToGmail();
};