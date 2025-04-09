// AlertsArea.test.jsx
import React from 'react';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import AlertsArea from '../AlertsArea';

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
});
