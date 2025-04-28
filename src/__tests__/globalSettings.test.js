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
const sampleAdmin = {
  id: 3,
  userId: 3,
  account: { name: 'Admin User', email: 'admin@example.com' },
  role: 'Admin',
  global_settings: true,
  accessible_testing_modules: true,
  accomodation_modules: true,
  assistive_technology_modules: true,
  note_taking_modules: true,
  student_case_information: true,
};

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

// Combine admin + other advisors; the component should filter out the logged-in admin
const allAdvisors = [sampleAdmin, ...sampleAdvisors];

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
      json: async () => ({ advisors: allAdvisors }),
    });

    const mockDisplayHeaderRef = { current: null };
    // Pass in the admin as the logged-in user
    render(
      <GlobalSettings
        userInfo={{ id: sampleAdmin.userId }}
        displayHeaderRef={mockDisplayHeaderRef}
        settingsTabOpen={false}
      />
    );

    // Advance timers to trigger the API call (1000ms)
    act(() => jest.advanceTimersByTime(2000));

    // Before fetch resolves, should show loading
    expect(screen.getByText(/Loading.../i)).toBeInTheDocument();

    // Wait for the two non-admin advisors to be rendered
    await waitFor(() => {
      expect(screen.getByText(/Alice Johnson/i)).toBeInTheDocument();
      expect(screen.getByText(/Bob Smith/i)).toBeInTheDocument();
    });

    // Verify search input and header
    expect(screen.getByPlaceholderText(/Enter Advisor Name.../i)).toBeInTheDocument();
    expect(screen.getByText(/Search Results:/i)).toBeInTheDocument();
  });

  test('filters advisors based on search query', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ advisors: allAdvisors }),
    });

    const mockDisplayHeaderRef = { current: null };
    render(
      <GlobalSettings
        userInfo={{ id: sampleAdmin.userId }}
        displayHeaderRef={mockDisplayHeaderRef}
        settingsTabOpen={false}
      />
    );

    act(() => jest.advanceTimersByTime(2000));
    await waitFor(() => expect(screen.getByText(/Alice Johnson/i)).toBeInTheDocument());

    const input = screen.getByPlaceholderText(/Enter Advisor Name.../i);
    fireEvent.change(input, { target: { value: 'Alice' } });

    await waitFor(() => expect(screen.getByText(/Alice Johnson/i)).toBeInTheDocument());
    expect(screen.queryByText(/Bob Smith/i)).toBeNull();
  });

  test('selecting an advisor opens the AdvisorCard view', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ advisors: allAdvisors }),
    });

    const mockDisplayHeaderRef = { current: null };
    render(
      <GlobalSettings
        userInfo={{ id: sampleAdmin.userId }}
        displayHeaderRef={mockDisplayHeaderRef}
        settingsTabOpen={false}
      />
    );

    act(() => jest.advanceTimersByTime(2000));
    await waitFor(() => expect(screen.getByText(/Alice Johnson/i)).toBeInTheDocument());

    fireEvent.click(screen.getByText(/Alice Johnson/i));

    await waitFor(() => expect(screen.getByText(/Edit Advisor Permissions:/i)).toBeInTheDocument());
    expect(screen.getByText(/alice@example.com/i)).toBeInTheDocument();
    expect(screen.getByText(/Coordinator/i)).toBeInTheDocument();
  });

  test('AdvisorCard toggles checkbox and saves changes', async () => {
    // Mock initial and update fetch
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ advisors: [sampleAdmin, sampleAdvisors[0]] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

    const mockDisplayHeaderRef = { current: null };
    render(
      <GlobalSettings
        userInfo={{ id: sampleAdmin.userId }}
        displayHeaderRef={mockDisplayHeaderRef}
        settingsTabOpen={false}
      />
    );

    act(() => jest.advanceTimersByTime(2000));
    await waitFor(() => expect(screen.getByText(/Alice Johnson/i)).toBeInTheDocument());

    fireEvent.click(screen.getByText(/Alice Johnson/i));
    await waitFor(() => expect(screen.getByText(/Edit Advisor Permissions:/i)).toBeInTheDocument());

    const checkboxes = screen.getAllByRole('checkbox');
    const globalSettingsCheckbox = checkboxes[0];
    expect(globalSettingsCheckbox).toBeChecked();
    fireEvent.click(globalSettingsCheckbox);
    expect(globalSettingsCheckbox).not.toBeChecked();

    fireEvent.click(screen.getByText(/^Save$/i));
    expect(screen.getByText(/Saving.../i)).toBeInTheDocument();

    act(() => jest.advanceTimersByTime(2000));
    await waitFor(() => expect(screen.getByText(/Settings saved successfully!/i)).toBeInTheDocument());

    act(() => jest.advanceTimersByTime(2000));
    await waitFor(() => expect(screen.queryByText(/Settings saved successfully!/i)).toBeNull());

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/updateAdvisors',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          advisorId: sampleAdvisors[0].userId,
          permissions: [
            false,
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
    const advisorsForPagination = Array.from({ length: 15 }, (_, i) => ({
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
    // Use a userId that doesn't match any in advisorsForPagination so none are filtered
    render(
      <GlobalSettings
        userInfo={{ id: 999 }}
        displayHeaderRef={mockDisplayHeaderRef}
        settingsTabOpen={false}
      />
    );

    act(() => jest.advanceTimersByTime(2000));
    await waitFor(() => expect(screen.getByText(/Advisor 1/i)).toBeInTheDocument());
    expect(screen.getByText(/Advisor 9/i)).toBeInTheDocument();
    expect(screen.queryByText(/Advisor 10/i)).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: /Next/i }));
    act(() => jest.advanceTimersByTime(2000));
    await waitFor(() => expect(screen.getByText(/Advisor 10/i)).toBeInTheDocument());
    expect(screen.queryByText(/^Advisor 1$/i)).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: /Prev/i }));
    act(() => jest.advanceTimersByTime(2000));
    await waitFor(() => expect(screen.getByText(/^Advisor 1$/i)).toBeInTheDocument());
    expect(screen.queryByText(/Advisor 10/i)).toBeNull();
  });

  test('logs error if fetching advisors fails', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    global.fetch = jest.fn().mockRejectedValueOnce(new Error('Network failure'));

    const mockDisplayHeaderRef = { current: null };
    render(
      <GlobalSettings
        userInfo={{ id: 999 }}
        displayHeaderRef={mockDisplayHeaderRef}
        settingsTabOpen={false}
      />
    );

    act(() => jest.advanceTimersByTime(1000));
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
      json: async () => ({ advisors: allAdvisors }),
    });

    const mockDisplayHeaderRef = { current: document.createElement('input') };
    render(
      <GlobalSettings
        userInfo={{ id: sampleAdmin.userId }}
        displayHeaderRef={mockDisplayHeaderRef}
        settingsTabOpen={false}
      />
    );

    act(() => jest.advanceTimersByTime(1000));
    await waitFor(() => expect(screen.getByText(/Alice Johnson/i)).toBeInTheDocument());

    const advisorCard = screen.getByRole('button', {
      name: /Advisor card for Alice Johnson/i,
    });
    fireEvent.keyDown(advisorCard, { key: 'Enter', code: 'Enter' });

    await waitFor(() => expect(screen.getByText(/Edit Advisor Permissions:/i)).toBeInTheDocument());
  });

  test('shows error and stops saving if updateAdvisors fails', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ advisors: [sampleAdmin, sampleAdvisors[0]] }),
      })
      .mockRejectedValueOnce(new Error('Network error'));

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const mockDisplayHeaderRef = { current: document.createElement('input') };
    render(
      <GlobalSettings
        userInfo={{ id: sampleAdmin.userId }}
        displayHeaderRef={mockDisplayHeaderRef}
        settingsTabOpen={false}
      />
    );

    act(() => jest.advanceTimersByTime(1000));
    await waitFor(() => expect(screen.getByText(/Alice Johnson/i)).toBeInTheDocument());

    fireEvent.click(screen.getByText(/Alice Johnson/i));
    await screen.findByText(/Edit Advisor Permissions/);

    const checkbox = screen.getAllByRole('checkbox')[0];
    fireEvent.click(checkbox);
    fireEvent.click(screen.getByRole('button', { name: /Save permissions/i }));

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error updating permissions:',
        expect.any(Error)
      );
      expect(screen.getByRole('button', { name: /Save permissions/i })).toBeEnabled();
    });

    consoleErrorSpy.mockRestore();
  });

  test('clicking "Back to Results" resets selectedAdvisor and sets focusAfterReturn', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ advisors: [sampleAdmin, sampleAdvisors[0]] }),
    });

    const mockDisplayHeaderRef = { current: document.createElement('input') };
    render(
      <GlobalSettings
        userInfo={{ id: sampleAdmin.userId }}
        displayHeaderRef={mockDisplayHeaderRef}
        settingsTabOpen={false}
      />
    );

    act(() => jest.advanceTimersByTime(1000));
    await waitFor(() => expect(screen.getByText(/Alice Johnson/i)).toBeInTheDocument());

    fireEvent.click(screen.getByText(/Alice Johnson/i));
    await screen.findByText(/Edit Advisor Permissions/);

    fireEvent.click(screen.getByTestId("backToAdvRes"));

    await waitFor(() => {
      expect(screen.getByText(/Search Results:/i)).toBeInTheDocument();
      expect(screen.getByText(/Alice Johnson/i)).toBeInTheDocument();
    });
  });
});