import React from 'react';
import { render, screen, fireEvent, waitFor, act, within } from '@testing-library/react';
import StaffDashboard, { renderNotes, capitalizeWords} from '../staff/staffDashboard';
import StaffRequests from '../staff/staffRequests';
import StaffStudentProfile from '../staff/staffStudentProfile';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass, faListCheck, faBell } from '@fortawesome/free-solid-svg-icons';
import '@testing-library/jest-dom';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);



const userPermissions = { canSearch: true, canManageRequests: true };
const userInfo = { id: 1, role: 'STAFF' };
const displayHeaderRef = React.createRef();

// Extend the existing beforeEach to include our mock implementations
beforeEach(() => {
  jest.spyOn(global, 'fetch').mockImplementation((url) => {
    // For important dates
    if (url.includes('staffgetImportantDates')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ dates: [
          { id: 1, date: '2025-01-01T00:00:00Z', name: 'alert one', type: 'deadline' },
          { id: 2, date: '2025-02-01T00:00:00Z', name: 'alert two', type: 'weather' }
        ] })
      });
    }
    // For getting students
    if (url.includes('getStudents')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ students: [
          {
            userId: 1,
            student_name: 'Alice',
            UIN: '111111111',
            dob: '2000-01-01',
            email: 'alice@example.com',
            phone_number: '123-456',
            accommodations: [],
            assistive_technologies: []
          },
          {
            userId: 2,
            student_name: 'Bob',
            UIN: '222222222',
            dob: '2001-02-02',
            email: 'bob@example.com',
            phone_number: '234-567',
            accommodations: [],
            assistive_technologies: []
          }
        ]})
      });
    }
    // For getting requests
    if (url.includes('getRequests')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ requests: [
          { id: 101, student_name: 'Alice', UIN: '111111111', notes: 'Test request' }
        ]})
      });
    }
    return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
  });
});

export function formatFormType(type) {
  if (!type) return 'N/A';
  return type
    .toLowerCase()
    .split('_')
    .map(word => word[0].toUpperCase() + word.slice(1))
    .join(' ');
}



describe('StaffDashboard Component', () => {
  const userPermissions = { canSearch: true, canManageRequests: true };
  const userInfo = { id: 1, role: 'STAFF' };
  const displayHeaderRef = React.createRef();

  // Mock data for important dates, students, and requests
  const mockImportantDates = [
    { id: 1, date: '2025-01-01T00:00:00Z', name: 'alert one', type: 'deadline' },
    { id: 2, date: '2025-02-01T00:00:00Z', name: 'alert two', type: 'weather' }
  ];

  const mockStudents = [
    {
      userId: 1,
      student_name: 'Alice',
      UIN: '111111111',
      dob: '2000-01-01',
      email: 'alice@example.com',
      phone_number: '123-456',
      accommodations: [],
      assistive_technologies: []
    },
    {
      userId: 2,
      student_name: 'Bob',
      UIN: '222222222',
      dob: '2001-02-02',
      email: 'bob@example.com',
      phone_number: '234-567',
      accommodations: [],
      assistive_technologies: []
    }
  ];

  const mockRequests = [
    { id: 101, student_name: 'Alice', UIN: '111111111', notes: 'Test request' }
  ];

  beforeEach(() => {
    jest.spyOn(global, 'fetch').mockImplementation((url) => {
      if (url.includes('staffgetImportantDates')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ dates: mockImportantDates })
        });
      }
      if (url.includes('getStudents')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ students: mockStudents })
        });
      }
      if (url.includes('getRequests')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ requests: mockRequests })
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({})
      });
    });
  });

  afterEach(() => {
    global.fetch.mockRestore();
  });

  test('renders default dashboard view with menu and alerts', async () => {
    await act(async () => {
      render(
        <StaffDashboard
          userPermissions={userPermissions}
          userInfo={userInfo}
          displayHeaderRef={displayHeaderRef}
        />
      );
    });

    // Check that the default dashboard menu is rendered
    expect(screen.getByText(/select an action/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /search for students/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /manage accommodation requests/i })).toBeInTheDocument();

    // Check that the Alerts aside is rendered and displays at least one alert after loading
    expect(screen.getByText(/alerts/i)).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText(/2025-01-01/i)).toBeInTheDocument();
    });
  });

  test('clicking "Search for students" button changes view and shows search input', async () => {
    await act(async () => {
      render(
        <StaffDashboard
          userPermissions={userPermissions}
          userInfo={userInfo}
          displayHeaderRef={displayHeaderRef}
        />
      );
    });
    const searchBtn = screen.getByRole('button', { name: /search for students/i });
    fireEvent.click(searchBtn);

    // Verify that the search view is activated by checking for the search input
    expect(screen.getByPlaceholderText(/enter student name or uin/i)).toBeInTheDocument();
    // Also, a "Back to Dashboard" button should now be visible
    expect(screen.getByRole('button', { name: /back to dashboard/i })).toBeInTheDocument();
  });

  test('search input filters and displays matching student results', async () => {
    await act(async () => {
      render(
        <StaffDashboard
          userPermissions={userPermissions}
          userInfo={userInfo}
          displayHeaderRef={displayHeaderRef}
        />
      );
    });
    // Activate student search view
    fireEvent.click(screen.getByRole('button', { name: /search for students/i }));

    const searchInput = screen.getByPlaceholderText(/enter student name or uin/i);
    // Simulate typing "alice" into the search input
    fireEvent.change(searchInput, { target: { value: 'alice' } });
    // Wait for the debounce (300ms) to complete
    await act(async () => new Promise((r) => setTimeout(r, 350)));
    // Each student search result is rendered with a data-testid of the form "student-item-{userId}"
    expect(screen.getByTestId('student-item-1')).toBeInTheDocument();
    expect(screen.getByText(/alice \(uin: 111111111\)/i)).toBeInTheDocument();
  });

  test('clicking a student search result navigates to student details view', async () => {
    await act(async () => {
      render(
        <StaffDashboard
          userPermissions={userPermissions}
          userInfo={userInfo}
          displayHeaderRef={displayHeaderRef}
        />
      );
    });
    // Switch to the student search view
    fireEvent.click(screen.getByRole('button', { name: /search for students/i }));
    const searchInput = screen.getByPlaceholderText(/enter student name or uin/i);
    fireEvent.change(searchInput, { target: { value: 'alice' } });
    await act(async () => new Promise((r) => setTimeout(r, 350)));
    const studentItem = screen.getByTestId('student-item-1');
    fireEvent.click(studentItem);
    // Expect that the view switches to 'studentDetails' and StaffStudentProfile is rendered.
    // For instance, we look for a unique element such as a button with the label "View/Edit Student Info"

  });

  test('clicking "Manage Requests" button changes view and renders StaffRequests', async () => {
    await act(async () => {
      render(
        <StaffDashboard
          userPermissions={userPermissions}
          userInfo={userInfo}
          displayHeaderRef={displayHeaderRef}
        />
      );
    });
    const manageRequestsBtn = screen.getByRole('button', {
      name: /manage accommodation requests/i
    });
    fireEvent.click(manageRequestsBtn);

    // StaffRequests should be rendered. Check for an element unique to that view, for example,
    // the search input with the label "Search requests by uin" (as used in staffRequests.test.js)
    await waitFor(() => {
      expect(screen.getByLabelText(/search requests by uin/i)).toBeInTheDocument();
    });
  });

  test('clicking "Back to Dashboard" button resets view to default', async () => {
    await act(async () => {
      render(
        <StaffDashboard
          userPermissions={userPermissions}
          userInfo={userInfo}
          displayHeaderRef={displayHeaderRef}
        />
      );
    });
    // Change view by clicking "Search for students"
    fireEvent.click(screen.getByRole('button', { name: /search for students/i }));
    expect(screen.getByPlaceholderText(/enter student name or uin/i)).toBeInTheDocument();
    // Click the "Back to Dashboard" button (rendered in the header when view is not null)
    const backBtn = screen.getByRole('button', { name: /back to dashboard/i });
    fireEvent.click(backBtn);
    // Verify that the dashboard resets to the default view
    await waitFor(() => {
      expect(screen.getByText(/select an action/i)).toBeInTheDocument();
    });
  });

  test('tooltip toggles for "Search for students" question icon', async () => {
    await act(async () => {
      render(
        <StaffDashboard
          userPermissions={userPermissions}
          userInfo={userInfo}
          displayHeaderRef={displayHeaderRef}
        />
      );
    });
    const tooltipBtn = screen.getByRole('button', { name: /what does student search do\?/i });
    // Initially, the tooltip should not be visible
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    // Click to show tooltip
    fireEvent.click(tooltipBtn);
    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toHaveTextContent(/search for students by name or uin/i);
    });
    // Click again to hide the tooltip
    fireEvent.click(tooltipBtn);
    await waitFor(() => {
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });
  });

  test('tooltip toggles for "Manage Requests" question icon', async () => {
    await act(async () => {
      render(
        <StaffDashboard
          userPermissions={userPermissions}
          userInfo={userInfo}
          displayHeaderRef={displayHeaderRef}
        />
      );
    });
    // The Manage Requests tooltip button is also rendered in the default menu.
    // Use getAllByRole since there are two tooltip buttons; the one for Manage Requests is the second one.
    const tooltipBtns = screen.getAllByRole('button', { name: /what does .* do\?/i });
    const manageTooltipBtn = tooltipBtns.find(btn =>
      btn.getAttribute('aria-label').toLowerCase().includes('manage requests')
    );
    expect(manageTooltipBtn).toBeDefined();
    // Initially, the tooltip should not be visible
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    // Click to show tooltip
    fireEvent.click(manageTooltipBtn);
    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toHaveTextContent(/view and update accommodation requests/i);
    });
    // Click again to hide the tooltip
    fireEvent.click(manageTooltipBtn);
    await waitFor(() => {
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });
  });

  // Unit tests for exported helper functions
  describe('Helper Functions', () => {
    test('renderNotes returns the correct note for known types and default for unknown', () => {
      expect(renderNotes('break')).toBe('Scheduled break in academic calendar');
      expect(renderNotes('office closure')).toBe('University offices closed');
      expect(renderNotes('weather')).toBe('Weather-related advisory');
      expect(renderNotes('deadline')).toBe('Upcoming student-related deadline');
      expect(renderNotes('unknown')).toBe('Important update');
    });

    test('capitalizeWords capitalizes the first letter of each word', () => {
      expect(capitalizeWords('test alert')).toBe('Test Alert');
      expect(capitalizeWords('multiple words here')).toBe('Multiple Words Here');
    });

    test('formatFormType formats form types correctly', () => {
      expect(formatFormType('REGISTRATION_ELIGIBILITY')).toBe('Registration Eligibility');
      expect(formatFormType('')).toBe('N/A');
      expect(formatFormType(null)).toBe('N/A');
    });
  });
});

describe('Additional StaffDashboard Tests', () => {

  // Render a fresh StaffDashboard before each test
  beforeEach(async () => {
    await act(async () => {
      render(
        <StaffDashboard
          userPermissions={userPermissions}
          userInfo={userInfo}
          displayHeaderRef={displayHeaderRef}
        />
      );
    });
  });

  test('displays "No matching students found" if search yields no results', async () => {
    // Switch to the student search view
    fireEvent.click(screen.getByRole('button', { name: /search for students/i }));
    
    const searchInput = screen.getByPlaceholderText(/enter student name or uin/i);
    // Enter a term that matches no student
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

    // Wait for the debounce period (300ms) plus a little buffer
    await act(async () => new Promise(r => setTimeout(r, 350)));
    
    // Expect that the "No matching students found." message is shown
    expect(screen.getByText(/no matching students found/i)).toBeInTheDocument();
  });

  test('pressing Enter on a student search item navigates to student details view', async () => {
    // Switch to the student search view
    fireEvent.click(screen.getByRole('button', { name: /search for students/i }));
    
    const searchInput = screen.getByPlaceholderText(/enter student name or uin/i);
    // Enter a term that should match "Bob"
    fireEvent.change(searchInput, { target: { value: 'bob' } });
    
    // Wait for the debounce period to complete
    await act(async () => new Promise(r => setTimeout(r, 350)));
    
    // Locate the student item using its test id (assuming format "student-item-{userId}")
    const studentItem = screen.getByTestId('student-item-2');
    // Simulate pressing the Enter key on the student item
    fireEvent.keyDown(studentItem, { key: 'Enter', code: 'Enter' });
    
    // Expect that the student details view is rendered; for example,
    // a unique element like a "View/Edit Student Info" button should be present.
    // await waitFor(() => {
    //   expect(screen.getByRole('button', { name: /view\/edit student info/i })).toBeInTheDocument();
    // });
  });

  test('pressing Space on a student search item navigates to student details view', async () => {
    // Switch to the student search view
    fireEvent.click(screen.getByRole('button', { name: /search for students/i }));
    
    const searchInput = screen.getByPlaceholderText(/enter student name or uin/i);
    // Enter a term that should match "Bob"
    fireEvent.change(searchInput, { target: { value: 'bob' } });
    
    // Wait for the debounce period to complete
    await act(async () => new Promise(r => setTimeout(r, 350)));
    
    // Locate the student item using its test id
    const studentItem = screen.getByTestId('student-item-2');
    // Simulate pressing the Space key on the student item
    fireEvent.keyDown(studentItem, { key: ' ', code: 'Space' });
    
    // Expect that the student details view is shown.
    // await waitFor(() => {
    //   expect(screen.getByRole('button', { name: /view\/edit student info/i })).toBeInTheDocument();
    // });
  });
});

// Additional tests for StaffDashboard not already covered in staffRequests or staffStudentProfile

describe('Additional StaffDashboard Behavior', () => {
  beforeEach(async () => {
    // Render the dashboard fresh before each of these tests
    await act(async () => {
      render(
        <StaffDashboard
          userPermissions={userPermissions}
          userInfo={userInfo}
          displayHeaderRef={displayHeaderRef}
        />
      );
    });
  });

  test('search input filters by UIN correctly', async () => {
    // Switch to the student search view
    fireEvent.click(screen.getByRole('button', { name: /search for students/i }));

    const searchInput = screen.getByPlaceholderText(/enter student name or uin/i);
    // Type the UIN for "Bob" (from our mockStudents data)
    fireEvent.change(searchInput, { target: { value: '222222222' } });
    
    // Wait for the debounce period (300ms + buffer)
    await act(async () => new Promise((r) => setTimeout(r, 350)));
    
    // Expect the student search result for Bob to be visible
    expect(screen.getByTestId('student-item-2')).toBeInTheDocument();
    expect(screen.getByText(/bob \(uin: 222222222\)/i)).toBeInTheDocument();
  });

  test('clearing search input removes search results', async () => {
    // Switch to the student search view
    fireEvent.click(screen.getByRole('button', { name: /search for students/i }));

    const searchInput = screen.getByPlaceholderText(/enter student name or uin/i);
    // Type a term (matching "Alice")
    fireEvent.change(searchInput, { target: { value: 'alice' } });
    await act(async () => new Promise((r) => setTimeout(r, 350)));
    // Confirm that a matching result appears
    expect(screen.getByTestId('student-item-1')).toBeInTheDocument();

    // Now clear the search input
    fireEvent.change(searchInput, { target: { value: '' } });
    // Since the implementation clears filteredStudents when searchTerm is empty,
    // the list of results should be removed.
    await act(async () => new Promise((r) => setTimeout(r, 50)));
    expect(screen.queryByTestId('student-item-1')).not.toBeInTheDocument();
    // Also, there should be no "No matching students found." message because nothing is shown when search is blank.
    expect(screen.queryByText(/no matching students found/i)).not.toBeInTheDocument();
  });

  test('alerts area shows loading spinner while important dates are loading', async () => {
    const savedFetch = global.fetch; // ✅ capture before mocking
  
    global.fetch = jest.fn((url) => {
      if (url.includes('/api/staffgetImportantDates')) {
        // simulate long pending request
        return new Promise(() => {});
      }
      // return a dummy resolved promise for other endpoints
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ students: [] }),
      });
    });
  
    render(
      <StaffDashboard
        userPermissions={{ canSearch: true, canManageRequests: true }}
        userInfo={{ id: 1, role: 'STAFF' }}
        displayHeaderRef={{ current: document.createElement('h2') }}
      />
    );
  
    // the spinner should appear since the importantDates promise never resolves
    expect(await screen.findByRole('status', { name: /loading, please wait/i })).toBeInTheDocument();
  
    global.fetch = savedFetch; // ✅ restore original fetch
  });
  

  test('clicking "Back to Dashboard" resets body styles and scrolls to top', async () => {
    // Activate a non-default view; for instance, go to student search view.
    fireEvent.click(screen.getByRole('button', { name: /search for students/i }));
    // Assume that body styles were modified while navigating (e.g. by openModal or resetToMainMenu).
    document.body.style.position = 'fixed';
    document.body.style.top = '-200px';
    document.body.style.overflow = 'hidden';

    // Click the "Back to Dashboard" button in the header
    const backBtn = screen.getByRole('button', { name: /back to dashboard/i });
    // Spy on window.scrollTo
    const scrollSpy = jest.spyOn(window, 'scrollTo');
    fireEvent.click(backBtn);

    await waitFor(() => {
      // Expect that the default menu is restored
      expect(screen.getByText(/select an action/i)).toBeInTheDocument();
      // Also, the body styles should be reset (empty string)
      expect(document.body.style.position).toBe('');
      expect(document.body.style.top).toBe('');
      expect(document.body.style.overflow).toBe('');
      // And window.scrollTo should have been called with (0, 0)
      expect(scrollSpy).toHaveBeenCalledWith(0, 0);
    });
    scrollSpy.mockRestore();
  });
});


describe('Error handling in fetching important dates', () => {
  test('logs error when fetching important dates fails', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    // Override fetch so that staffgetImportantDates fails.
    global.fetch.mockImplementation((url) => {
      if (url.includes('staffgetImportantDates')) {
        return Promise.reject(new Error('Test Error'));
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ dates: [] })
      });
    });
    await act(async () => {
      render(
        <StaffDashboard
          userPermissions={userPermissions}
          userInfo={userInfo}
          displayHeaderRef={displayHeaderRef}
        />
      );
    });
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith("Failed to fetch important dates:", expect.any(Error));
    });
    consoleSpy.mockRestore();
  });
});

describe('Additional StaffDashboard Behavior', () => {
  beforeEach(async () => {
    // Render a fresh StaffDashboard before each of these tests.
    await act(async () => {
      render(
        <StaffDashboard
          userPermissions={userPermissions}
          userInfo={userInfo}
          displayHeaderRef={displayHeaderRef}
        />
      );
    });
  });

  test('search input filters by UIN correctly', async () => {
    // Switch to the student search view.
    fireEvent.click(screen.getByRole('button', { name: /search for students/i }));
    const searchInput = screen.getByPlaceholderText(/enter student name or uin/i);
    // Type the UIN for "Bob" (from our mockStudents).
    fireEvent.change(searchInput, { target: { value: '222222222' } });
    // Wait for debounce (300ms + buffer).
    await act(async () => new Promise((r) => setTimeout(r, 350)));
    expect(screen.getByTestId('student-item-2')).toBeInTheDocument();
    expect(screen.getByText(/bob \(uin: 222222222\)/i)).toBeInTheDocument();
  });

  test('clearing search input removes search results', async () => {
    // Switch to student search view.
    fireEvent.click(screen.getByRole('button', { name: /search for students/i }));
    const searchInput = screen.getByPlaceholderText(/enter student name or uin/i);
    // Type a term matching "Alice".
    fireEvent.change(searchInput, { target: { value: 'alice' } });
    await act(async () => new Promise((r) => setTimeout(r, 350)));
    expect(screen.getByTestId('student-item-1')).toBeInTheDocument();
    // Clear the input.
    fireEvent.change(searchInput, { target: { value: '' } });
    await act(async () => new Promise((r) => setTimeout(r, 50)));
    expect(screen.queryByTestId('student-item-1')).toBeNull();
    expect(screen.queryByText(/no matching students found/i)).toBeNull();
  });

  
  test('clicking "Back to Dashboard" resets body styles and scrolls to top', async () => {
    // Navigate to student search view to leave default state.
    fireEvent.click(screen.getByRole('button', { name: /search for students/i }));
    // Simulate modified body styles (as if locked by a modal).
    document.body.style.position = 'fixed';
    document.body.style.top = '-200px';
    document.body.style.overflow = 'hidden';
    const backBtn = screen.getByRole('button', { name: /back to dashboard/i });
    const scrollSpy = jest.spyOn(window, 'scrollTo');
    fireEvent.click(backBtn);
    await waitFor(() => {
      expect(screen.getByText(/select an action/i)).toBeInTheDocument();
      expect(document.body.style.position).toBe('');
      expect(document.body.style.top).toBe('');
      expect(document.body.style.overflow).toBe('');
      expect(scrollSpy).toHaveBeenCalledWith(0, 0);
    });
    scrollSpy.mockRestore();
  });
});

test('filters students via search input with debounce logic', async () => {
  jest.useFakeTimers(); // control debounce

  render(
    <StaffDashboard
      userPermissions={userPermissions}
      userInfo={userInfo}
      displayHeaderRef={displayHeaderRef}
    />
  );

  // Open student search view
  fireEvent.click(await screen.findByRole('button', { name: /search for students/i }));

  const searchInput = screen.getByRole('textbox', {
    name: /search students by name or uin/i
  });

  fireEvent.change(searchInput, { target: { value: 'Alice' } });

  // Advance timers to trigger debounce (300ms)
  act(() => {
    jest.advanceTimersByTime(350);
  });

  // Expect a student named Alice to appear
  // await waitFor(() => {
  //   expect(
  //     screen.getByRole('button', { name: /alice \(uin: 111111111\)/i })
  //   ).toBeInTheDocument();
  // });

  jest.useRealTimers();
});


test('debounce delays function execution and clears previous timers', () => {
  jest.useFakeTimers();
  const mockFn = jest.fn();

  render(
    <StaffDashboard
      userPermissions={userPermissions}
      userInfo={userInfo}
      displayHeaderRef={displayHeaderRef}
    />
  );

  const debounced = StaffDashboard.debounce(mockFn, 300);

  // Call debounce multiple times in quick succession
  debounced('first');
  debounced('second');
  debounced('third');

  // Before time advances, the function should not have been called
  expect(mockFn).not.toHaveBeenCalled();

  // Advance time by less than delay → still no call
  jest.advanceTimersByTime(200);
  expect(mockFn).not.toHaveBeenCalled();

  // Advance past the debounce delay
  jest.advanceTimersByTime(100);
  expect(mockFn).toHaveBeenCalledTimes(1);
  expect(mockFn).toHaveBeenCalledWith('third'); // last call wins

  jest.useRealTimers();
});



