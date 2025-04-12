// StudentDashboard.test.jsx
import React from 'react';
import { render, screen, waitFor, fireEvent, within, act } from '@testing-library/react';
import StudentDashboard from '../student/studentDashboard.js';
 import { axe, toHaveNoViolations } from 'jest-axe';
 
 expect.extend(toHaveNoViolations);
describe('StudentDashboard', () => {
  const mockUser = { id: 1, name: 'Test Student' };
  const mockCourses = [
    {
      id: 1,
      name: 'Course 1',
      exams: [
        { id: 1, date: new Date('2025-01-01T10:00:00Z').toISOString(), location: 'Room 101' }
      ],
      professor: { account: { name: 'Professor A', email: 'profA@example.com' } }
    },
    {
      id: 2,
      name: 'Course 2',
      exams: [],
      professor: { account: { name: 'Professor B', email: 'profB@example.com' } }
    }
  ];
  const mockAlerts = [
    { id: 1, name: 'Alert 1', date: new Date('2025-01-01T10:00:00Z').toISOString() },
    { id: 2, name: 'Alert 2', date: new Date('2025-02-01T10:00:00Z').toISOString() },
  ];

  beforeEach(() => {
    global.fetch = jest.fn((url) => {
      if (url.includes('getStudentCourses')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockCourses)
        });
      } else if (url.includes('getImportantDates')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockAlerts)
        });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('stu dash should have no accessibility violations', async () => {
    const mockDisplayHeaderRef = { current: null };
    const mockLastIntendedFocusRef = { current: null };
    let container;
    await act(async () => {
            const rendered = render(<StudentDashboard userInfo={mockUser} displayHeaderRef={mockDisplayHeaderRef}
              lastIntendedFocusRef={mockLastIntendedFocusRef}
              settingsTabOpen={false}/>);
            container = rendered.container;
    });

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  test('renders welcome message with user name', async () => {
    const mockDisplayHeaderRef = { current: null };
    const mockLastIntendedFocusRef = { current: null };

    render(<StudentDashboard userInfo={mockUser} displayHeaderRef={mockDisplayHeaderRef}
      lastIntendedFocusRef={mockLastIntendedFocusRef}
      settingsTabOpen={false}/>);
    expect(screen.getByText(/Welcome, Test Student/)).toBeInTheDocument();
    // Expect 2 fetch calls (courses and alerts)
    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(2));
  });

  test('displays courses in card view by default', async () => {
    const mockDisplayHeaderRef = { current: null };
    const mockLastIntendedFocusRef = { current: null };

    render(<StudentDashboard userInfo={mockUser} displayHeaderRef={mockDisplayHeaderRef}
      lastIntendedFocusRef={mockLastIntendedFocusRef}
      settingsTabOpen={false}/>);
    await waitFor(() => {
      expect(screen.getByText('Course 1')).toBeInTheDocument();
      expect(screen.getByText('Course 2')).toBeInTheDocument();
    });
    expect(screen.getByText(/Next Exam:/)).toBeInTheDocument();
  });

  test('toggles view mode to list view', async () => {
    const mockDisplayHeaderRef = { current: null };
    const mockLastIntendedFocusRef = { current: null };

    render(<StudentDashboard userInfo={mockUser} displayHeaderRef={mockDisplayHeaderRef}
      lastIntendedFocusRef={mockLastIntendedFocusRef}
      settingsTabOpen={false}/>);
    await waitFor(() => {
      expect(screen.getByText('Course 1')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('List View'));
    await waitFor(() => {
      expect(screen.getByText('Course 1')).toBeInTheDocument();
    });
  });

  test('opens and closes modal when a course is clicked', async () => {
    const mockDisplayHeaderRef = { current: null };
    const mockLastIntendedFocusRef = { current: null };

    render(<StudentDashboard userInfo={mockUser} displayHeaderRef={mockDisplayHeaderRef}
      lastIntendedFocusRef={mockLastIntendedFocusRef}
      settingsTabOpen={false}/>);
    await waitFor(() => {
      expect(screen.getByText('Course 1')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Course 1'));
    const modal = await screen.findByTestId('course-modal');
    // Now query the modal heading by its test id
    expect(within(modal).getByTestId('course-modal-heading')).toHaveTextContent('Course 1');
    fireEvent.click(screen.getByText('Close'));
    await waitFor(() => {
      expect(screen.queryByTestId('course-modal')).not.toBeInTheDocument();
    });
  });
});
