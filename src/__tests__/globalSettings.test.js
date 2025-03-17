// globalSettings.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import GlobalSettings from '../globalSettings'; // adjust the import as needed
import { cleanup } from '@testing-library/react';

describe('GlobalSettings component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });




  test('renders initial message when search query is empty', () => {
    render(<GlobalSettings />);
    expect(
      screen.getByText(/please enter a search query to find advisors/i)
    ).toBeInTheDocument();
  });

  test('shows search results after successful API call', async () => {
    const mockAdvisors = [
      {
        user_id: 1,
        name: 'Alice Johnson',
        email: 'alice@example.com',
        role: 'Coordinator',
        global_settings: true,
        accommodation_modules: false,
        note_taking_modules: true,
        assistive_tech_modules: false,
        accessible_testing_modules: true,
        student_case_information: false,
      },
    ];
    // Mock fetch to return advisor data
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ advisors: mockAdvisors }),
    });

    render(<GlobalSettings />);
    const input = screen.getByPlaceholderText(/search advisors/i);
    fireEvent.change(input, { target: { value: 'Alice' } });

    // Advance timers to trigger debounce
    act(() => {
      jest.advanceTimersByTime(300);
    });

    // Ensure the correct API endpoint is called
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/findAdvisor?query=' + encodeURIComponent('Alice')
      );
    });

    // Check that the advisor's name appears in the table
    expect(await screen.findByText(/alice johnson/i)).toBeInTheDocument();
    // Check that at least one checkbox is rendered
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes.length).toBeGreaterThan(0);
  });

  test('shows "Loading..." message while fetching data', async () => {
    let resolveFetch;
    global.fetch = jest.fn().mockReturnValue(
      new Promise((resolve) => {
        resolveFetch = resolve;
      })
    );

    render(<GlobalSettings />);
    const input = screen.getByPlaceholderText(/search advisors/i);
    fireEvent.change(input, { target: { value: 'Test' } });

    act(() => {
      jest.advanceTimersByTime(300);
    });

    // Immediately after advancing timers, "Loading..." should be displayed
    expect(screen.getByText(/loading.../i)).toBeInTheDocument();

    // Now resolve the fetch promise with empty results
    act(() => {
      resolveFetch({
        ok: true,
        json: () => Promise.resolve({ advisors: [] }),
      });
    });

    await waitFor(() => {
      expect(screen.getByText(/no matching advisors found/i)).toBeInTheDocument();
    });
  });

  test('displays "No matching advisors found" when API returns empty array', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ advisors: [] }),
    });

    render(<GlobalSettings />);
    const input = screen.getByPlaceholderText(/search advisors/i);
    fireEvent.change(input, { target: { value: 'Nonexistent' } });

    act(() => {
      jest.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/findAdvisor?query=' + encodeURIComponent('Nonexistent')
      );
    });

    expect(await screen.findByText(/no matching advisors found/i)).toBeInTheDocument();
  });

  test('handles API fetch error gracefully', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    global.fetch = jest.fn().mockRejectedValueOnce(new Error('API error'));

    render(<GlobalSettings />);
    const input = screen.getByPlaceholderText(/search advisors/i);
    fireEvent.change(input, { target: { value: 'ErrorTest' } });

    act(() => {
      jest.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching advisors:', expect.any(Error));
    });

    expect(await screen.findByText(/no matching advisors found/i)).toBeInTheDocument();
    consoleErrorSpy.mockRestore();
  });

  test('checkbox change triggers update API call', async () => {
    const mockAdvisors = [
      {
        user_id: 1,
        name: 'Alice Johnson',
        email: 'alice@example.com',
        role: 'Coordinator',
        global_settings: false,
        accommodation_modules: false,
        note_taking_modules: false,
        assistive_tech_modules: false,
        accessible_testing_modules: false,
        student_case_information: false,
      },
    ];
    // First fetch call returns the advisor list
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ advisors: mockAdvisors }),
      })
      // Second fetch call simulates the update API call
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

    render(<GlobalSettings />);
    const input = screen.getByPlaceholderText(/search advisors/i);
    fireEvent.change(input, { target: { value: 'Alice' } });

    act(() => {
      jest.advanceTimersByTime(300);
    });

    // Wait for the advisor to be rendered
    await waitFor(() => {
      expect(screen.getByText(/alice johnson/i)).toBeInTheDocument();
    });

    // Get the checkbox for global_settings (assumed to be the first checkbox)
    const checkboxes = screen.getAllByRole('checkbox');
    const checkbox = checkboxes[0];
    expect(checkbox).not.toBeChecked();

    // Simulate checking the checkbox
    fireEvent.click(checkbox);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/updateAdvisors',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            advisor_id: 1,
            field: 'global_settings',
            value: true,
          }),
        })
      );
    });
  });

  test('pagination works correctly', async () => {

    const advisorsList = Array.from({ length: 15 }, (_, i) => ({
      user_id: i + 1,
      name: `Advisor ${i + 1}`,
      email: `advisor${i + 1}@example.com`,
      role: 'Coordinator',
      global_settings: false,
      accommodation_modules: false,
      note_taking_modules: false,
      assistive_tech_modules: false,
      accessible_testing_modules: false,
      student_case_information: false,
    }));

    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ advisors: advisorsList }),
    });

    render(<GlobalSettings />);
    const input = screen.getByPlaceholderText(/search advisors/i);
    fireEvent.change(input, { target: { value: 'Advisor' } });

    act(() => {
      jest.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(screen.getByText(/advisor 1/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/page 1 of 2/i)).toBeInTheDocument();

    const nextButton = screen.getByText(/next 10/i);
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(screen.getByText(/page 2 of 2/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/advisor 11/i)).toBeInTheDocument();

    const prevButton = screen.getByText(/previous 10/i);
    fireEvent.click(prevButton);

    await waitFor(() => {
      expect(screen.getByText(/page 1 of 2/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/advisor 1/i)).toBeInTheDocument();
  });
});

