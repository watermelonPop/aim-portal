// AlertsArea.test.jsx
import React from 'react';
import { render, screen, waitFor, fireEvent, within, act } from '@testing-library/react';
import AlertsArea from '../AlertsArea';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

describe('AlertsArea', () => {
  const mockAlerts = [
    { id: 1, name: 'Alert 1', date: new Date('2025-01-01T10:00:00Z').toISOString() },
    { id: 2, name: 'Alert 2', date: new Date('2025-02-01T10:00:00Z').toISOString() },
    { id: 3, name: 'Alert 3', date: new Date('2025-03-01T10:00:00Z').toISOString() },
    { id: 4, name: 'Alert 4', date: new Date('2025-04-01T10:00:00Z').toISOString() },
    { id: 5, name: 'Alert 5', date: new Date('2025-05-01T10:00:00Z').toISOString() },
    { id: 6, name: 'Alert 6', date: new Date('2025-06-01T10:00:00Z').toISOString() },
  ];
  const displayHeaderRef = {
    current: document.createElement('button') // simulate focusable element
  };

  beforeEach(() => {
    global.fetch = jest.fn((url) => {
      if (url.includes('getImportantDates')) {
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

  test('alerts area should have no accessibility violations', async () => {
      let container;
      await act(async () => {
              const rendered = render(<AlertsArea displayHeaderRef={displayHeaderRef} />);
              container = rendered.container;
      });

      const results = await axe(container);
      expect(results).toHaveNoViolations();
  });

  test('renders alerts area with loading state, then displays next 5 alerts', async () => {

    render(<AlertsArea displayHeaderRef={displayHeaderRef} />);
    expect(screen.getByText('Loading alerts...')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText('Alert 1')).toBeInTheDocument());
    const alertsArea = screen.getByTestId('alerts-area');
    const listItems = within(alertsArea).getAllByRole('listitem');
    expect(listItems.length).toBe(5);
  });

  test('opens modal when "View All" is clicked and displays all alerts', async () => {
    const displayHeaderRef = {
      current: document.createElement('button'),
    };
    document.body.appendChild(displayHeaderRef.current); // optional but realistic
  
    render(<AlertsArea displayHeaderRef={displayHeaderRef} />);
    await waitFor(() => expect(screen.getByText('Alert 1')).toBeInTheDocument());
  
    fireEvent.click(screen.getByText('View All'));
    const modal = await screen.findByRole('dialog', { name: 'All Alerts' });
    const allItems = within(modal).getAllByRole('listitem');
    expect(allItems.length).toBe(6);
  
    fireEvent.click(screen.getByText('Close'));
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'All Alerts' })).not.toBeInTheDocument();
    });
  });

  test('shows error message when fetch response is not ok', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({}), // This won't be called
      })
    );
  
    render(<AlertsArea displayHeaderRef={displayHeaderRef} />);
  
    await waitFor(() => {
      expect(screen.getByText('Failed to fetch important dates')).toBeInTheDocument();
    });
  });
  
  test('pressing Escape closes modal and focuses displayHeaderRef', async () => {
    const focusMock = jest.fn();
    const focusableRef = { current: { focus: focusMock } };
  
    render(<AlertsArea displayHeaderRef={focusableRef} />);
  
    // Wait for alerts to load and open modal
    await waitFor(() => screen.getByText('Alert 1'));
    fireEvent.click(screen.getByText('View All'));
  
    const modal = await screen.findByRole('dialog', { name: /all alerts/i });
  
    // Simulate Escape key press on modal
    fireEvent.keyDown(modal, { key: 'Escape', code: 'Escape' });
  
    // Modal should be removed
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: /all alerts/i })).not.toBeInTheDocument();
    });
  
    // Focus should return to provided ref
    expect(focusMock).toHaveBeenCalled();
  });

  test('clicking the modal overlay closes the modal', async () => {
    render(<AlertsArea displayHeaderRef={{ current: document.createElement('button') }} />);
  
    // Wait for alerts to load and open modal
    await waitFor(() => screen.getByText('Alert 1'));
    fireEvent.click(screen.getByText('View All'));
  
    // Modal should be visible
    const modalOverlay = screen.getByText('All Alerts').closest('.modalOverlay');
    expect(modalOverlay).toBeInTheDocument();
  
    // Click outside the modal content to trigger close
    fireEvent.click(modalOverlay);
  
    // Modal should disappear
    await waitFor(() => {
      expect(screen.queryByText('All Alerts')).not.toBeInTheDocument();
    });
  });
  
  
});
