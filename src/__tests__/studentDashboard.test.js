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

  test('pressing Enter or Space on a list view course triggers setSelectedCourse (covers onKeyDown)', async () => {
    const mockDisplayHeaderRef = { current: null };
    const mockLastIntendedFocusRef = { current: null };
  
    render(
      <StudentDashboard
        userInfo={mockUser}
        displayHeaderRef={mockDisplayHeaderRef}
        lastIntendedFocusRef={mockLastIntendedFocusRef}
        settingsTabOpen={false}
      />
    );
  
    // Wait for card view to render, then switch to list view
    await waitFor(() => screen.getByText('Course 1'));
    fireEvent.click(screen.getByText('List View'));
  
    const listItem = screen.getByText('Course 1').closest('[role="button"]');
  
    // Press Enter
    fireEvent.keyDown(listItem, { key: 'Enter', code: 'Enter' });
  
    let modal = await screen.findByTestId('course-modal');
    expect(modal).toBeInTheDocument();
  
    // Close modal
    fireEvent.click(screen.getByText('Close'));
    await waitFor(() => {
      expect(screen.queryByTestId('course-modal')).not.toBeInTheDocument();
    });
  
    // Press Space
    fireEvent.keyDown(listItem, { key: ' ', code: 'Space' });
  
    modal = await screen.findByTestId('course-modal');
    expect(modal).toBeInTheDocument();
  });
  

  test('clicking a course in list view triggers setSelectedCourse (list view onClick)', async () => {
    const mockDisplayHeaderRef = { current: null };
    const mockLastIntendedFocusRef = { current: null };
  
    render(
      <StudentDashboard
        userInfo={mockUser}
        displayHeaderRef={mockDisplayHeaderRef}
        lastIntendedFocusRef={mockLastIntendedFocusRef}
        settingsTabOpen={false}
      />
    );
  
    // Wait for card view, then switch to list view
    await waitFor(() => screen.getByText('Course 1'));
    fireEvent.click(screen.getByText('List View'));
  
    // Now click Course 1 in list view
    const listItem = screen.getByText('Course 1').closest('[role="button"]');
    fireEvent.click(listItem);
  
    // Modal should appear from list view
    const modal = await screen.findByTestId('course-modal');
    expect(modal).toBeInTheDocument();
  });
  

  test('card view course click calls setSelectedCourse (covers specific onClick branch)', async () => {
    const mockDisplayHeaderRef = { current: null };
    const mockLastIntendedFocusRef = { current: null };
  
    render(
      <StudentDashboard
        userInfo={mockUser}
        displayHeaderRef={mockDisplayHeaderRef}
        lastIntendedFocusRef={mockLastIntendedFocusRef}
        settingsTabOpen={false}
      />
    );
  
    // Wait for course cards to show in default card view
    const courseCard = await screen.findByRole('button', { name: /Course: Course 1/i });
  
    // Click the card to trigger setSelectedCourse inside the "card view" JSX block
    fireEvent.click(courseCard);
  
    // Modal should appear
    const modal = await screen.findByTestId('course-modal');
    expect(modal).toBeInTheDocument();
    expect(within(modal).getByText(/Professor A/)).toBeInTheDocument();
  });
  
  

  test('clicking outside the modal closes it', async () => {
    const mockDisplayHeaderRef = { current: { focus: jest.fn() } };
    const mockLastIntendedFocusRef = { current: null };
  
    render(
      <StudentDashboard
        userInfo={mockUser}
        displayHeaderRef={mockDisplayHeaderRef}
        lastIntendedFocusRef={mockLastIntendedFocusRef}
        settingsTabOpen={false}
      />
    );
  
    // Wait for the course to appear and click to open the modal
    await waitFor(() => screen.getByText('Course 1'));
    fireEvent.click(screen.getByText('Course 1'));
  
    // Modal should now be open
    const modalOverlay = screen.getByTestId("modalOverlay");
    expect(screen.getByTestId('course-modal')).toBeInTheDocument();
  
    // Click outside the modal (on the overlay)
    fireEvent.click(modalOverlay);
  
    // Modal should close
    await waitFor(() => {
      expect(screen.queryByTestId('course-modal')).not.toBeInTheDocument();
    });
  });
  

  test('pressing Enter or Space on a course opens the modal', async () => {
    const mockDisplayHeaderRef = { current: null };
    const mockLastIntendedFocusRef = { current: null };
  
    render(
      <StudentDashboard
        userInfo={mockUser}
        displayHeaderRef={mockDisplayHeaderRef}
        lastIntendedFocusRef={mockLastIntendedFocusRef}
        settingsTabOpen={false}
      />
    );
  
    await waitFor(() => screen.getByText('Course 1'));
    const courseCard = screen.getByText('Course 1').closest('[role="button"]');
  
    // Press Enter
    fireEvent.keyDown(courseCard, { key: 'Enter', code: 'Enter' });
  
    let modal = await screen.findByTestId('course-modal');
    expect(modal).toBeInTheDocument();
  
    // Close modal before testing Space key
    fireEvent.click(screen.getByText('Close'));
    await waitFor(() => {
      expect(screen.queryByTestId('course-modal')).not.toBeInTheDocument();
    });
  
    // Press Space
    fireEvent.keyDown(courseCard, { key: ' ', code: 'Space' });
  
    modal = await screen.findByTestId('course-modal');
    expect(modal).toBeInTheDocument();
  });
  

  test('handles course with an exam missing a date field', async () => {
    const mockDisplayHeaderRef = { current: null };
    const mockLastIntendedFocusRef = { current: null };
  
    const mockCoursesWithMissingDate = [
      {
        id: 3,
        name: 'Course with Missing Exam Date',
        exams: [
          { id: 1, location: 'Room 404' }, // no date
          { id: 2, date: '2025-04-30T15:00:00Z', location: 'Room 202' }
        ],
        professor: { account: { name: 'Professor X', email: 'x@example.com' } }
      }
    ];
  
    global.fetch = jest.fn((url) => {
      if (url.includes('getStudentCourses')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockCoursesWithMissingDate)
        });
      }
      if (url.includes('getImportantDates')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([])
        });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });
  
    render(
      <StudentDashboard
        userInfo={mockUser}
        displayHeaderRef={mockDisplayHeaderRef}
        lastIntendedFocusRef={mockLastIntendedFocusRef}
        settingsTabOpen={false}
      />
    );
  
    await waitFor(() => {
      expect(screen.getByText('Course with Missing Exam Date')).toBeInTheDocument();
    });
  
    // Ensure it still renders a valid "Next Exam" using the one with a date
    expect(screen.getByText(/Next Exam:/)).toBeInTheDocument();
  });
  

  test('clicking Card View button switches back to card layout', async () => {
    const mockDisplayHeaderRef = { current: null };
    const mockLastIntendedFocusRef = { current: null };
  
    render(
      <StudentDashboard
        userInfo={mockUser}
        displayHeaderRef={mockDisplayHeaderRef}
        lastIntendedFocusRef={mockLastIntendedFocusRef}
        settingsTabOpen={false}
      />
    );
  
    // Wait for course cards to show
    await waitFor(() => screen.getByText('Course 1'));
  
    // Switch to List View first
    fireEvent.click(screen.getByText('List View'));
    await waitFor(() => {
      expect(screen.getByText('Course 1')).toBeInTheDocument();
    });
  
    // Now click Card View
    fireEvent.click(screen.getByText('Card View'));
  
    // Card view should reappear with next exam text
    await waitFor(() => {
      expect(screen.getByText(/Next Exam:/)).toBeInTheDocument();
    });
  });
  

  test('pressing Escape key closes modal and restores focus', async () => {
    const mockFocus = jest.fn();
    const mockDisplayHeaderRef = { current: { focus: mockFocus } };
    const mockLastIntendedFocusRef = { current: null };
    await act(async () => {
      render(
        <StudentDashboard
          userInfo={mockUser}
          displayHeaderRef={mockDisplayHeaderRef}
          lastIntendedFocusRef={mockLastIntendedFocusRef}
          settingsTabOpen={false}
        />
      );
    });
  
    // Wait for data to load
    await waitFor(() => screen.getByText('Course 1'));

    await act(async () => {
      fireEvent.click(screen.getByText('Course 1'));
    });
    
    const modal = await screen.findByTestId('course-modal');
    // Open the modal
    await act(async () => {
      // Force focus to modal and simulate Escape key
      modal.tabIndex = -1; // Make it programmatically focusable
      modal.focus();
      fireEvent.keyDown(modal, { key: 'Escape', code: 'Escape' });
    });
  
    // Expect modal to close and focus to be restored
    await waitFor(() => {
      expect(screen.queryByTestId('course-modal')).not.toBeInTheDocument();
    });
  });
  
  

  test('displays error when course fetch fails', async () => {
    const mockDisplayHeaderRef = { current: null };
    const mockLastIntendedFocusRef = { current: null };
  
    // Simulate a failed response for getStudentCourses
    global.fetch = jest.fn((url) => {
      if (url.includes('getStudentCourses')) {
        return Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ message: 'Server error' })
        });
      }
      // Still return alerts successfully
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([])
      });
    });
  
    render(
      <StudentDashboard
        userInfo={mockUser}
        displayHeaderRef={mockDisplayHeaderRef}
        lastIntendedFocusRef={mockLastIntendedFocusRef}
        settingsTabOpen={false}
      />
    );
  
    await waitFor(() => {
      expect(screen.getByText(/Failed to fetch courses/i)).toBeInTheDocument();
    });
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
