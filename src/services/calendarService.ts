import axios from 'axios';
import { API_URL } from '../config';

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  location?: string;
  description?: string;
  type: string;
  attendees?: string[];
}

// Mock events to use as fallback
const mockEvents = [
  {
    id: "1",
    title: "Team Weekly Sync",
    start: new Date(new Date().setHours(10, 0, 0, 0)),
    end: new Date(new Date().setHours(11, 0, 0, 0)),
    type: "meeting",
    location: "Zoom",
    attendees: ["Alex", "Sarah", "Michael", "Jessica"]
  },
  {
    id: "2",
    title: "Project Review",
    start: new Date(new Date().setHours(14, 0, 0, 0)),
    end: new Date(new Date().setHours(15, 30, 0, 0)),
    type: "meeting",
    location: "Conference Room A",
    attendees: ["Alex", "David", "Lisa"]
  },
  {
    id: "3",
    title: "Lunch with David",
    start: new Date(new Date().setHours(12, 30, 0, 0)),
    end: new Date(new Date().setHours(13, 30, 0, 0)),
    type: "personal",
    location: "Bistro Cafe",
    attendees: ["David"]
  }
];

// Flag to control whether to use test data or real API
const USE_TEST_DATA = true;

export const calendarService = {
  // Get calendar events for today
  getTodayEvents: async (): Promise<CalendarEvent[]> => {
    if (USE_TEST_DATA) {
      try {
        // Try to get test data from backend first
        const response = await fetch(`${API_URL}/api/test/calendar/events`);
        
        if (response.ok) {
          const data = await response.json();
          // Convert string dates to Date objects
          return data.map((event: any) => ({
            ...event,
            start: new Date(event.start),
            end: new Date(event.end),
            type: event.type || determineEventType(event.title), // Fallback if type not provided
            attendees: event.attendees || [] // Ensure attendees is always an array
          }));
        } else {
          console.warn("Failed to fetch test calendar events from API, using mock data");
          return mockEvents;
        }
      } catch (error) {
        console.error("Error fetching test calendar events:", error);
        return mockEvents;
      }
    } else {
      try {
        const token = localStorage.getItem('access_token');
        const response = await axios.get(`${API_URL}/api/calendar/events/today`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        // Convert string dates to Date objects
        return response.data.map((event: any) => ({
          ...event,
          start: new Date(event.start),
          end: new Date(event.end),
          type: event.type || determineEventType(event.title) // Fallback if type not provided
        }));
      } catch (error) {
        console.error("Error fetching calendar events:", error);
        // Fallback to mock data
        return mockEvents;
      }
    }
  },
  
  // Get upcoming events (next 7 days)
  getUpcomingEvents: async (): Promise<CalendarEvent[]> => {
    if (USE_TEST_DATA) {
      return mockEvents;
    } else {
      try {
        const token = localStorage.getItem('access_token');
        const response = await axios.get(`${API_URL}/api/calendar/events/upcoming`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        // Convert string dates to Date objects
        return response.data.map((event: any) => ({
          ...event,
          start: new Date(event.start),
          end: new Date(event.end),
          type: event.type || determineEventType(event.title) // Fallback if type not provided
        }));
      } catch (error) {
        console.error("Error fetching upcoming events:", error);
        // Fallback to mock data
        return mockEvents;
      }
    }
  },
  
  // Create a new calendar event
  createEvent: async (event: Omit<CalendarEvent, 'id'>): Promise<CalendarEvent> => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.post(`${API_URL}/api/calendar/events`, event, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      return {
        ...response.data,
        start: new Date(response.data.start),
        end: new Date(response.data.end)
      };
    } catch (error) {
      console.error("Error creating calendar event:", error);
      throw error;
    }
  },
  
  // Update an existing calendar event
  updateEvent: async (event: CalendarEvent): Promise<CalendarEvent> => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.put(`${API_URL}/api/calendar/events/${event.id}`, event, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      return {
        ...response.data,
        start: new Date(response.data.start),
        end: new Date(response.data.end)
      };
    } catch (error) {
      console.error("Error updating calendar event:", error);
      throw error;
    }
  },
  
  // Delete a calendar event
  deleteEvent: async (eventId: string): Promise<boolean> => {
    try {
      const token = localStorage.getItem('access_token');
      await axios.delete(`${API_URL}/api/calendar/events/${eventId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      return true;
    } catch (error) {
      console.error("Error deleting calendar event:", error);
      return false;
    }
  }
};

// Helper function to determine event type based on title keywords
function determineEventType(title: string): string {
  const lowerTitle = title.toLowerCase();
  
  if (lowerTitle.includes('meeting') || lowerTitle.includes('sync') || lowerTitle.includes('call') || lowerTitle.includes('discussion')) {
    return 'meeting';
  } else if (lowerTitle.includes('lunch') || lowerTitle.includes('coffee') || lowerTitle.includes('breakfast') || lowerTitle.includes('dinner')) {
    return 'personal';
  } else if (lowerTitle.includes('deadline') || lowerTitle.includes('due') || lowerTitle.includes('deliverable')) {
    return 'deadline';
  } else {
    return 'other';
  }
} 