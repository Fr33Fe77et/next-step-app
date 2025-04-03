import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, dateFnsLocalizer, View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, addMonths } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import styled from 'styled-components';
import { 
  initializeGoogleCalendar, 
  loginToGoogleCalendar, 
  getGoogleCalendarEvents,
  getCalendarList,
  loadCalendarSettings 
} from '../store/googleCalendarSlice';
import { useAppDispatch, useAppSelector } from '../hooks/reduxHooks';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import Button from '../components/common/Button';
import { RootState } from '../store';
import { reinitializeGoogleCalendar,
         toggleCalendarVisibility, } from '../store/googleCalendarSlice';

const CalendarContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const CalendarHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  color: #2d4b6e;
`;

const FilterContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const FilterButton = styled(Button)<{ active?: boolean }>`
  opacity: ${({ active }) => (active ? 1 : 0.6)};
  background-color: ${({ active }) => (active ? '#4a6fa5' : 'white')};
  color: ${({ active }) => (active ? 'white' : '#4a6fa5')};
`;

const StyledCalendar = styled.div`
  height: 700px;
  background-color: white;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  .rbc-event {
    background-color: #4a6fa5;
  }

  .rbc-today {
    background-color: #f0f7ff;
  }
`;

// Calendar localizer setup
const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

// Define event types for the filter
type EventSource = 'nextStep' | 'external' | 'all';
type EventType = 'task' | 'meeting' | 'all';

// Define resource type for next step events
interface NextStepResource {
  description?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed';
  source: 'nextStep';
  type: 'task';
}

// Define resource type for external events
interface ExternalResource {
  description?: string;
  location?: string;
  backgroundColor?: string; // Add this field
  calendarId?: string;
  source: 'external';
  type: 'meeting';
}

type EventResource = NextStepResource | ExternalResource;

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: EventResource;
}

const CalendarPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { user } = useAppSelector((state) => state.auth);
  const { tasks, isLoading: tasksLoading } = useAppSelector((state) => state.tasks);
  const { 
    isInitialized,
    isSignedIn,
    events: googleEvents, 
    calendars,
    isLoading: googleLoading 
  } = useAppSelector((state: RootState) => state.googleCalendar);

  // State for view controls
  const [date, setDate] = useState(new Date());
  const [view, setView] = useState<View>('month');
  const [sourceFilter, setSourceFilter] = useState<EventSource>('all');
  const [typeFilter, setTypeFilter] = useState<EventType>('all');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
  
    // Initialize Google Calendar API if not already done
    if (!isInitialized) {
      dispatch(initializeGoogleCalendar())
        .then(() => {
          // After initialization, try to login
          return dispatch(loginToGoogleCalendar());
        })
        .then(() => {
          // After login, fetch calendars and settings
          return dispatch(getCalendarList());
        })
        .then(() => {
          // After getting calendars, load saved settings
          return dispatch(loadCalendarSettings())
            .catch(err => {
              console.log('Failed to load calendar settings, using defaults');
              // Set default visibility for primary calendar
              if (calendars.length > 0) {
                const primaryCalendar = calendars.find(calendar => calendar.primary);
                if (primaryCalendar && !primaryCalendar.visible) {
                  // Use the existing toggle function
                  dispatch(toggleCalendarVisibility(primaryCalendar.id));
                }
              }
            });
        })
        .catch(error => {
          console.error('Error initializing calendar', error);
        });
    } else if (isSignedIn) {
      // If already initialized and signed in, just get calendars and settings
      dispatch(getCalendarList())
        .then(() => {
          return dispatch(loadCalendarSettings())
            .catch(err => {
              console.log('Failed to load calendar settings, using defaults');
              // Set default visibility for primary calendar
              if (calendars.length > 0) {
                const primaryCalendar = calendars.find(calendar => calendar.primary);
                if (primaryCalendar && !primaryCalendar.visible) {
                  // Use the existing toggle function
                  dispatch(toggleCalendarVisibility(primaryCalendar.id));
                }
              }
            });
        });
    }
  // No need for the delayed refresh in a separate useEffect
  // Only create the timeout if needed
  let timer: NodeJS.Timeout | null = null;
  
  if (isInitialized && isSignedIn && calendars.length === 0) {
    timer = setTimeout(() => {
      dispatch(getCalendarList())
        .then(() => {
          return dispatch(loadCalendarSettings())
            .catch(err => {
              console.log('Failed to load calendar settings, using defaults');
              // Set default visibility code would go here, but will likely
              // not be needed since calendars.length === 0 in this condition
            });
        });
    }, 500);
  }

  // Cleanup function to clear the timeout if component unmounts
  return () => {
    if (timer) clearTimeout(timer);
  };
}, [user, dispatch, navigate, isInitialized, isSignedIn, calendars]);
 
// Fetch Google Calendar events when date changes or when signed in
useEffect(() => {
  if (isInitialized && isSignedIn) {
    // Get visible calendars
    const visibleCalendarIds = calendars
      .filter(cal => cal.visible)
      .map(cal => cal.id);
      
    // Calculate date range based on the current view
    let startDate: Date;
    let endDate: Date;
    
    switch (view) {
      case 'month':
        startDate = new Date(date.getFullYear(), date.getMonth(), 1);
        endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        break;
      case 'week':
        const weekStart = startOfWeek(date);
        startDate = weekStart;
        endDate = new Date(weekStart);
        endDate.setDate(endDate.getDate() + 7);
        break;
      case 'day':
        startDate = new Date(date);
        endDate = new Date(date);
        endDate.setHours(23, 59, 59);
        break;
      default:
        startDate = new Date(date.getFullYear(), date.getMonth(), 1);
        endDate = addMonths(startDate, 1);
    }
    
    dispatch(getGoogleCalendarEvents({ startDate, endDate, calendarIds: visibleCalendarIds }));
  }
}, [date, view, isInitialized, isSignedIn, calendars, dispatch]);

  // Format Next Step tasks as calendar events
  const nextStepEvents = useMemo(() => {
    return tasks.map((task) => {
      // Calculate end time (default to 1 hour if estimatedTime is not set)
      const startDate = task.dueDate ? new Date(task.dueDate) : new Date();
      const endDate = new Date(startDate);
      
      // If estimatedTime is set (in minutes), use it for end time calculation
      if (task.estimatedTime) {
        endDate.setMinutes(startDate.getMinutes() + task.estimatedTime);
      } else {
        endDate.setHours(startDate.getHours() + 1);
      }

      return {
        id: task.id || task._id || '',
        title: task.title,
        start: startDate,
        end: endDate,
        resource: {
          description: task.description,
          priority: task.priority,
          status: task.status,
          source: 'nextStep' as const,
          type: 'task' as const,
        },
      };
    });
  }, [tasks]);

  // Format Google Calendar events
  const formattedGoogleEvents = useMemo(() => {
    return googleEvents.map((event) => ({
      id: `google_${event.id}`,
      title: event.title,
      start: event.start,
      end: event.end,
      resource: {
        description: event.description,
        location: event.location,
        calendarId: event.calendarId,
        backgroundColor: event.backgroundColor,
        source: 'external' as const,
        type: 'meeting' as const,
      },
    }));
  }, [googleEvents]);

  // Combine all events
  const allEvents = useMemo(() => {
    return [...nextStepEvents, ...formattedGoogleEvents];
  }, [nextStepEvents, formattedGoogleEvents]);

  // Filter events based on selected filters
  const filteredEvents = useMemo(() => {
    return allEvents.filter((event) => {
      const sourceMatch = sourceFilter === 'all' || event.resource.source === sourceFilter;
      const typeMatch = typeFilter === 'all' || event.resource.type === typeFilter;
      return sourceMatch && typeMatch;
    });
  }, [allEvents, sourceFilter, typeFilter]);

  const handleEventClick = (event: CalendarEvent) => {
    // For Next Step tasks, navigate to the task edit page
    if (event.resource.source === 'nextStep') {
      navigate(`/tasks/${event.id}`);
    }
    // For Google Calendar events, we could show details in a modal
  };

  const handleConnectGoogleCalendar = () => {
    dispatch(loginToGoogleCalendar());
  };

  const isLoading = tasksLoading || googleLoading;

  if (isLoading) {
    return (
      <CalendarContainer>
        <p>Loading calendar...</p>
      </CalendarContainer>
    );
  }

  return (
    <CalendarContainer>
      <CalendarHeader>
        <Title>Calendar</Title>
        <div>
          {!isSignedIn && (
            <Button onClick={handleConnectGoogleCalendar} style={{ marginRight: '1rem' }}>
              Connect Google Calendar
            </Button>
          )}
          <Button onClick={() => navigate('/calendar/settings')} style={{ marginRight: '1rem' }}>
            Calendar Settings
          </Button>
          <Button onClick={() => dispatch(reinitializeGoogleCalendar())} style={{ marginRight: '1rem' }}>
            Reset Calendar Connection
          </Button>
          <Button primary onClick={() => navigate('/tasks/new')}>
            Create New Task
          </Button>
        </div>
      </CalendarHeader>
  
      <FilterContainer>
        <FilterButton
          active={sourceFilter === 'all'}
          onClick={() => setSourceFilter('all')}
        >
          All Sources
        </FilterButton>
        <FilterButton
          active={sourceFilter === 'nextStep'}
          onClick={() => setSourceFilter('nextStep')}
        >
          Next Step Only
        </FilterButton>
        <FilterButton
          active={sourceFilter === 'external'}
          onClick={() => setSourceFilter('external')}
        >
          External Only
        </FilterButton>
      </FilterContainer>
  
      <FilterContainer>
        <FilterButton
          active={typeFilter === 'all'}
          onClick={() => setTypeFilter('all')}
        >
          All Types
        </FilterButton>
        <FilterButton
          active={typeFilter === 'task'}
          onClick={() => setTypeFilter('task')}
        >
          Tasks
        </FilterButton>
        <FilterButton
          active={typeFilter === 'meeting'}
          onClick={() => setTypeFilter('meeting')}
        >
          Meetings
        </FilterButton>
      </FilterContainer>
  
      {(tasksLoading || googleLoading) ? (
        <StyledCalendar style={{ position: 'relative' }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 5,
            borderRadius: '8px'
          }}>
            <p>Loading calendar data...</p>
          </div>
        </StyledCalendar>
      ) : (
        <StyledCalendar>
          <Calendar
            localizer={localizer}
            events={filteredEvents}
            startAccessor="start"
            endAccessor="end"
            onSelectEvent={handleEventClick}
            style={{ height: 650 }}
            date={date}
            onNavigate={setDate}
            view={view}
            onView={(newView: View) => setView(newView)}
            views={['month', 'week', 'day', 'agenda']}
            eventPropGetter={(event) => {
              // Color based on source and priority
              let backgroundColor = '#4a6fa5'; // Default blue
              
              if (event.resource.source === 'nextStep') {
                const resource = event.resource as NextStepResource;
                backgroundColor = 
                  resource.priority === 'high' ? '#ef4444' :
                  resource.priority === 'medium' ? '#f59e0b' :
                  '#3b82f6';
              } else if (event.resource.source === 'external') {
                // Use the calendar color if available
                const resource = event.resource as ExternalResource;
                backgroundColor = resource.backgroundColor || '#10b981'; // Fall back to green
              }
              
              return {
                style: {
                  backgroundColor,
                  borderRadius: '4px',
                }
              };
            }}
          />
        </StyledCalendar>
      )}
    </CalendarContainer>
  );
}
export default CalendarPage;