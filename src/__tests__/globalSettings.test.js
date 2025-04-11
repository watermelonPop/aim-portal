import React from 'react';
import { render, screen, fireEvent, waitFor, act, cleanup } from '@testing-library/react';
import GlobalSettings from '../staff/globalSettings';

// Sample advisor objects to use in tests
const sampleAdvisors = [
  {
    id: 1,
    userId: 1,
    account: { name: "Alice Johnson", email: "alice@example.com" },
    role: "Coordinator",
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
    account: { name: "Bob Smith", email: "bob@example.com" },
    role: "Advisor",
    global_settings: false,
    accessible_testing_modules: false,
    accomodation_modules: true,
    assistive_technology_modules: true,
    note_taking_modules: true,
    student_case_information: true,
  }
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
    //displayHeaderRef, settingsTabOpen, lastIntendedFocusRef
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ advisors: sampleAdvisors }),
    });

    const mockDisplayHeaderRef = { current: null };
    const mockLastIntendedFocusRef = { current: null };
    
    render(<GlobalSettings displayHeaderRef={mockDisplayHeaderRef}
      lastIntendedFocusRef={mockLastIntendedFocusRef}
      settingsTabOpen={false}/>);
    
    // Before fetch resolves, CardView should display a loading message
    expect(screen.getByText(/Loading.../i)).toBeInTheDocument();
    
    // Wait until the advisors are rendered in the card view
    await waitFor(() => {
      expect(screen.getByText(/Alice Johnson/i)).toBeInTheDocument();
      expect(screen.getByText(/Bob Smith/i)).toBeInTheDocument();
    });
    
    // Verify that the search input and title are in the document
    expect(screen.getByPlaceholderText(/Enter Advisor Name.../i)).toBeInTheDocument();
    expect(screen.getByText(/Search Results:/i)).toBeInTheDocument();
  });

  test('filters advisors based on search query', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ advisors: sampleAdvisors }),
    });
    
    const mockDisplayHeaderRef = { current: null };
    const mockLastIntendedFocusRef = { current: null };
    
    render(<GlobalSettings displayHeaderRef={mockDisplayHeaderRef}
      lastIntendedFocusRef={mockLastIntendedFocusRef}
      settingsTabOpen={false}/>);
    
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
    
    render(<GlobalSettings displayHeaderRef={mockDisplayHeaderRef}
      lastIntendedFocusRef={mockLastIntendedFocusRef}
      settingsTabOpen={false}/>);
    
    // Wait for advisors to load
    await waitFor(() => {
      expect(screen.getByText(/Alice Johnson/i)).toBeInTheDocument();
    });
    
    // Simulate clicking on the card for "Alice Johnson"
    fireEvent.click(screen.getByText(/Alice Johnson/i));
    
    // The header should change to indicate the edit view
    await waitFor(() => {
      expect(screen.getByText(/Edit Advisor Permissions:/i)).toBeInTheDocument();
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
      
      render(<GlobalSettings displayHeaderRef={mockDisplayHeaderRef}
        lastIntendedFocusRef={mockLastIntendedFocusRef}
        settingsTabOpen={false}/>);
    
    // Wait for the advisor to load
    await waitFor(() => {
      expect(screen.getByText(/Alice Johnson/i)).toBeInTheDocument();
    });
    
    // Click the card to open the AdvisorCard view
    fireEvent.click(screen.getByText(/Alice Johnson/i));
    await waitFor(() => {
      expect(screen.getByText(/Edit Advisor Permissions:/i)).toBeInTheDocument();
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
    
    // Wait for the update fetch call to complete and for the success message to appear
    await waitFor(() => {
      expect(screen.getByText(/Settings saved successfully!/i)).toBeInTheDocument();
    });
    
    // Advance timers to simulate the 3000ms timeout for clearing the success message
    act(() => {
      jest.advanceTimersByTime(3000);
    });
    await waitFor(() => {
      expect(screen.queryByText(/Settings saved successfully!/i)).toBeNull();
    });
    
    // Verify that the update API was called with the expected payload.
    // The payload should include the toggled permission for global_settings.
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
      //id: i + 1,
      userId: i + 1,
      account: { name: `Advisor ${i + 1}`, email: `advisor${i + 1}@example.com` },
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
    
    render(<GlobalSettings displayHeaderRef={mockDisplayHeaderRef}
      lastIntendedFocusRef={mockLastIntendedFocusRef}
      settingsTabOpen={false}/>);
    
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
    
    // Wait until the next page is rendered (advisor 10 should appear)
    await waitFor(() => {
      expect(screen.getByText(/Advisor 10/i)).toBeInTheDocument();
    });
    // Advisor from the first page should no longer be visible
    expect(screen.queryByText(/^Advisor 1$/i)).toBeNull();
    
    // Click the "Prev" button to go back to page one
    const prevButton = screen.getByRole('button', { name: /Prev/i });
    fireEvent.click(prevButton);
    await waitFor(() => {
      expect(screen.getByText(/^Advisor 1$/i)).toBeInTheDocument();
    });
    expect(screen.queryByText(/Advisor 10/i)).toBeNull();
  });
});