import React from 'react';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
  cleanup,
} from '@testing-library/react';
import GlobalSettings from '../staff/globalSettings';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

// Sample advisor objects to use in tests
const sampleAdvisors = [
  {
    id: 1,
    userId: 1,
    account: { name: 'Alice Johnson', email: 'alice@example.com' },
    role: 'Coordinator',
    global_settings: true,
    accessible_testing_modules: true,
    accomodation_modules: false,
    assistive_technology_modules: false,
    note_taking_modules: false,
    student_case_information: false,
  },
  {
    id: 2,
    userId: 2,
    account: { name: 'Bob Smith', email: 'bob@example.com' },
    role: 'Advisor',
    global_settings: false,
    accessible_testing_modules: false,
    accomodation_modules: true,
    assistive_technology_modules: true,
    note_taking_modules: true,
    student_case_information: true,
  },
];

describe('GlobalSettings Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  test('renders initial UI and fetches advisors', async () => {
    // Mock the initial fetch call to /api/getAdvisors
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ advisors: sampleAdvisors }),
    });

    const mockDisplayHeaderRef = { current: null };
    const mockLastIntendedFocusRef = { current: null };

    render(
      <GlobalSettings
        displayHeaderRef={mockDisplayHeaderRef}
        lastIntendedFocusRef={mockLastIntendedFocusRef}
        settingsTabOpen={false}
      />
    );

    // Flush the timer (2000ms) so that the API call is executed.
    act(() => {
      jest.advanceTimersByTime(2000);
    });

    // Before fetch resolves, CardView should display a loading message
    expect(screen.getByText(/Loading.../i)).toBeInTheDocument();

    // Wait until the advisors are rendered in the card view
    await waitFor(() => {
      expect(screen.getByText(/Alice Johnson/i)).toBeInTheDocument();
      expect(screen.getByText(/Bob Smith/i)).toBeInTheDocument();
    });

    // Verify that the search input and title are in the document
    expect(
      screen.getByPlaceholderText(/Enter Advisor Name.../i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Search Results:/i)).toBeInTheDocument();
  });

  test('filters advisors based on search query', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ advisors: sampleAdvisors }),
    });

    const mockDisplayHeaderRef = { current: null };
    const mockLastIntendedFocusRef = { current: null };

    render(
      <GlobalSettings
        displayHeaderRef={mockDisplayHeaderRef}
        lastIntendedFocusRef={mockLastIntendedFocusRef}
        settingsTabOpen={false}
      />
    );

    // Flush timers to trigger the delayed API call (2000ms)
    act(() => {
      jest.advanceTimersByTime(2000);
    });

    // Wait for advisors to load
    await waitFor(() => {
      expect(screen.getByText(/Alice Johnson/i)).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText(/Enter Advisor Name.../i);
    // Type a search query that should match only Alice
    fireEvent.change(input, { target: { value: 'Alice' } });

    // Wait for the filtering effect to update the displayed advisors
    await waitFor(() => {
      expect(screen.getByText(/Alice Johnson/i)).toBeInTheDocument();
    });
    // Bob should not be displayed when filtering by "Alice"
    expect(screen.queryByText(/Bob Smith/i)).toBeNull();
  });

  test('selecting an advisor opens the AdvisorCard view', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ advisors: sampleAdvisors }),
    });

    const mockDisplayHeaderRef = { current: null };
    const mockLastIntendedFocusRef = { current: null };

    render(
      <GlobalSettings
        displayHeaderRef={mockDisplayHeaderRef}
        lastIntendedFocusRef={mockLastIntendedFocusRef}
        settingsTabOpen={false}
      />
    );

    // Flush timers (2000ms) so that the API call is executed.
    act(() => {
      jest.advanceTimersByTime(2000);
    });

    // Wait for advisors to load
    await waitFor(() => {
      expect(screen.getByText(/Alice Johnson/i)).toBeInTheDocument();
    });

    // Simulate clicking on the card for "Alice Johnson"
    fireEvent.click(screen.getByText(/Alice Johnson/i));

    // The header should change to indicate the edit view
    await waitFor(() => {
      expect(
        screen.getByText(/Edit Advisor Permissions:/i)
      ).toBeInTheDocument();
    });

    // Verify advisor details in the AdvisorCard view
    expect(screen.getByText(/alice@example.com/i)).toBeInTheDocument();
    expect(screen.getByText(/Coordinator/i)).toBeInTheDocument();
  });

  test('AdvisorCard toggles checkbox and saves changes', async () => {
    // Chain two fetch calls: one for initial data, one for the update
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ advisors: [sampleAdvisors[0]] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

    const mockDisplayHeaderRef = { current: null };
    const mockLastIntendedFocusRef = { current: null };

    render(
      <GlobalSettings
        displayHeaderRef={mockDisplayHeaderRef}
        lastIntendedFocusRef={mockLastIntendedFocusRef}
        settingsTabOpen={false}
      />
    );

    // Flush timers to trigger the initial API call (2000ms)
    act(() => {
      jest.advanceTimersByTime(2000);
    });

    // Wait for the advisor to load
    await waitFor(() => {
      expect(screen.getByText(/Alice Johnson/i)).toBeInTheDocument();
    });

    // Click the card to open the AdvisorCard view
    fireEvent.click(screen.getByText(/Alice Johnson/i));
    await waitFor(() => {
      expect(
        screen.getByText(/Edit Advisor Permissions:/i)
      ).toBeInTheDocument();
    });

    // Get all checkboxes; the first corresponds to "Global Settings"
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes.length).toBeGreaterThan(0);
    const globalSettingsCheckbox = checkboxes[0];

    // Initially, it should be checked because global_settings is true
    expect(globalSettingsCheckbox).toBeChecked();

    // Toggle the checkbox (simulate unchecking)
    fireEvent.click(globalSettingsCheckbox);
    expect(globalSettingsCheckbox).not.toBeChecked();

    // Click the Save button to trigger the update call
    const saveButton = screen.getByText(/^Save$/i);
    fireEvent.click(saveButton);

    // While saving, the button text should change to "Saving..."
    expect(screen.getByText(/Saving.../i)).toBeInTheDocument();

    // Flush timers to simulate the delayed update (2000ms now instead of 3000ms)
    act(() => {
      jest.advanceTimersByTime(2000);
    });

    // Wait for the update fetch call to complete and for the success message to appear
    await waitFor(() => {
      expect(
        screen.getByText(/Settings saved successfully!/i)
      ).toBeInTheDocument();
    });

    // Advance timers to simulate clearing the success message after 2000ms
    act(() => {
      jest.advanceTimersByTime(2000);
    });
    await waitFor(() => {
      expect(
        screen.queryByText(/Settings saved successfully!/i)
      ).toBeNull();
    });

    // Verify that the update API was called with the expected payload.
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/updateAdvisors',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          advisorId: sampleAdvisors[0].userId,
          permissions: [
            false, // global_settings toggled from true to false
            sampleAdvisors[0].accessible_testing_modules,
            sampleAdvisors[0].accomodation_modules,
            sampleAdvisors[0].assistive_technology_modules,
            sampleAdvisors[0].note_taking_modules,
            sampleAdvisors[0].student_case_information,
          ],
        }),
      })
    );
  });

  test('pagination buttons navigate between pages', async () => {
    // Create a list of 15 advisors for testing pagination (9 per page)
    const advisorsForPagination = Array.from({ length: 15 }, (_, i) => ({
      userId: i + 1,
      account: {
        name: `Advisor ${i + 1}`,
        email: `advisor${i + 1}@example.com`,
      },
      role: 'Advisor',
      global_settings: false,
      accessible_testing_modules: false,
      accomodation_modules: false,
      assistive_technology_modules: false,
      note_taking_modules: false,
      student_case_information: false,
    }));

    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ advisors: advisorsForPagination }),
    });

    const mockDisplayHeaderRef = { current: null };
    const mockLastIntendedFocusRef = { current: null };

    render(
      <GlobalSettings
        displayHeaderRef={mockDisplayHeaderRef}
        lastIntendedFocusRef={mockLastIntendedFocusRef}
        settingsTabOpen={false}
      />
    );

    // Flush timers so that the advisors load (2000ms)
    act(() => {
      jest.advanceTimersByTime(2000);
    });

    // Wait for the first page to load (should display advisors 1-9)
    await waitFor(() => {
      expect(screen.getByText(/Advisor 1/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/Advisor 9/i)).toBeInTheDocument();
    // Advisor 10 should not be visible on the first page
    expect(screen.queryByText(/Advisor 10/i)).toBeNull();

    // Click the "Next" button to go to the next page
    const nextButton = screen.getByRole('button', { name: /Next/i });
    fireEvent.click(nextButton);

    // Flush timers if there's any delayed pagination update
    act(() => {
      jest.advanceTimersByTime(2000);
    });

    // Wait until the next page is rendered (advisor 10 should appear)
    await waitFor(() => {
      expect(screen.getByText(/Advisor 10/i)).toBeInTheDocument();
    });
    // Advisor from the first page should no longer be visible
    expect(screen.queryByText(/^Advisor 1$/i)).toBeNull();

    // Click the "Prev" button to go back to page one
    const prevButton = screen.getByRole('button', { name: /Prev/i });
    fireEvent.click(prevButton);

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    await waitFor(() => {
      expect(screen.getByText(/^Advisor 1$/i)).toBeInTheDocument();
    });
    expect(screen.queryByText(/Advisor 10/i)).toBeNull();
  });

  test('logs error if fetching advisors fails', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  
    // Simulate fetch rejecting with an error
    global.fetch = jest.fn().mockRejectedValueOnce(new Error('Network failure'));
  
    const mockDisplayHeaderRef = { current: null };
  
    render(
      <GlobalSettings
        displayHeaderRef={mockDisplayHeaderRef}
        settingsTabOpen={false}
      />
    );
  
    // Advance timers to trigger the delayed fetch
    act(() => {
      jest.advanceTimersByTime(1000);
    });
  
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'error fetching advisors',
        expect.any(Error)
      );
    });
  
    consoleErrorSpy.mockRestore();
  });

  test('pressing Enter on advisor card selects the advisor', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ advisors: sampleAdvisors }),
    });
  
    const mockDisplayHeaderRef = { current: document.createElement('input') };
  
    render(
      <GlobalSettings
        displayHeaderRef={mockDisplayHeaderRef}
        settingsTabOpen={false}
      />
    );
  
    // Advance timer to trigger advisor fetch
    act(() => {
      jest.advanceTimersByTime(1000);
    });
  
    // Wait for advisors to load
    await waitFor(() => {
      expect(screen.getByText(/Alice Johnson/i)).toBeInTheDocument();
    });
  
    // Get the card element (button role via tabIndex + aria-label)
    const advisorCard = screen.getByRole('button', {
      name: /Advisor card for Alice Johnson/i,
    });
  
    // Simulate pressing Enter on the card
    fireEvent.keyDown(advisorCard, { key: 'Enter', code: 'Enter' });
  
    // Check if the AdvisorCard view is shown
    await waitFor(() => {
      expect(screen.getByText(/Edit Advisor Permissions:/i)).toBeInTheDocument();
    });
  });
  
  test('shows error and stops saving if updateAdvisors fails', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ advisors: [sampleAdvisors[0]] }),
      })
      .mockRejectedValueOnce(new Error('Network error'));
  
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  
    const mockDisplayHeaderRef = { current: document.createElement('input') };
  
    render(
      <GlobalSettings
        displayHeaderRef={mockDisplayHeaderRef}
        settingsTabOpen={false}
      />
    );
  
    act(() => {
      jest.advanceTimersByTime(1000);
    });
  
    // Wait for advisors to load
    await waitFor(() => {
      expect(screen.getByText(/Alice Johnson/i)).toBeInTheDocument();
    });
  
    // Open AdvisorCard view
    fireEvent.click(screen.getByText(/Alice Johnson/i));
    await screen.findByText(/Edit Advisor Permissions/);
  
    // Toggle a checkbox to enable save
    const checkbox = screen.getAllByRole('checkbox')[0];
    fireEvent.click(checkbox);
  
    // Click Save button
    fireEvent.click(screen.getByRole('button', { name: /Save permissions/i }));
  
    // Wait for the error handler to run
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error updating permissions:',
        expect.any(Error)
      );
      // Save button should return to normal after error
      expect(screen.getByRole('button', { name: /Save permissions/i })).toBeEnabled();
    });
  
    consoleErrorSpy.mockRestore();
  });
  
  test('clicking "Back to Results" resets selectedAdvisor and sets focusAfterReturn', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ advisors: [sampleAdvisors[0]] }),
    });
  
    const mockDisplayHeaderRef = { current: document.createElement('input') };
  
    render(
      <GlobalSettings
        displayHeaderRef={mockDisplayHeaderRef}
        settingsTabOpen={false}
      />
    );
  
    // Advance timers to trigger fetch
    act(() => {
      jest.advanceTimersByTime(1000);
    });
  
    // Wait for advisor to appear and open AdvisorCard
    await waitFor(() => {
      expect(screen.getByText(/Alice Johnson/i)).toBeInTheDocument();
    });
  
    fireEvent.click(screen.getByText(/Alice Johnson/i));
  
    // Ensure AdvisorCard is shown
    await screen.findByText(/Edit Advisor Permissions/);
    expect(screen.getByText(/alice@example.com/i)).toBeInTheDocument();
  
    // Click "Back to Results"
    fireEvent.click(screen.getByTestId("backToAdvRes"));
  
    // Expect UI to return to card view
    await waitFor(() => {
      expect(screen.getByText(/Search Results:/i)).toBeInTheDocument();
      expect(screen.getByText(/Alice Johnson/i)).toBeInTheDocument();
    });
  });
  
  
});
