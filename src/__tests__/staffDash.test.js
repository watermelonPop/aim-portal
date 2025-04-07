import React from 'react';
import { render, screen, fireEvent, waitFor, act, cleanup } from '@testing-library/react';
import StaffDashboard from '../staff/staffDashboard'; // Adjust path if needed

// Mocked student data for tests
const mockStudents = [
  {
    userId: 1,
    UIN: 123456789,
    student_name: 'John Doe',
    email: 'john.doe@tamu.edu',
    phone_number: '(123) 456-7890',
    dob: '2001-05-10T00:00:00.000Z',
    accommodations: [],
    assistive_technologies: []
  }
];

describe('StaffDash Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    global.fetch = jest.fn((url) => {
      if (url === '/api/getStudents') {
        return Promise.resolve({
          ok: true,
          json: async () => ({ students: mockStudents }),
        });
      }

      if (url.startsWith('/api/checkAccount')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            user: mockStudents[0],
            accommodations: [],
            technologies: [],
          }),
        });
      }

      if (url === '/api/getImportantDates') {
        return Promise.resolve({
          ok: true,
          json: async () => ({ dates: [] }),
        });
      }

      if (url === '/api/getRequests') {
        return Promise.resolve({
          ok: true,
          json: async () => ({ requests: [] }),
        });
      }

      return Promise.reject(new Error('Unhandled fetch URL: ' + url));
    });
  });

  afterEach(() => {
    cleanup();
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  test('renders default dashboard menu', () => {
    render(<StaffDash />);
    expect(screen.getByText(/Select an action:/i)).toBeInTheDocument();
    expect(screen.getByText(/Student Profiles/i)).toBeInTheDocument();
    expect(screen.getByText(/Manage Requests/i)).toBeInTheDocument();
    expect(screen.getByText(/Review Submitted Forms/i)).toBeInTheDocument();
  });

  test('loads and displays student search view', async () => {
    render(<StaffDash />);
    
    fireEvent.click(screen.getByText(/Student Profiles/i));
  
    await waitFor(() =>
      expect(screen.getByPlaceholderText(/Enter student name or UIN/i)).toBeInTheDocument()
    );
  });
  test('clicking the forms button opens the forms view', async () => {
    render(<StaffDash />);
    
    // Click the "Review Submitted Forms" button
    fireEvent.click(screen.getByText(/Review Submitted Forms/i));
  
    // Wait for the forms section heading to appear
    await waitFor(() => {
      expect(screen.getByText(/Submitted Forms/i)).toBeInTheDocument();
    });
  });
  



  
  
  
  
   
});
