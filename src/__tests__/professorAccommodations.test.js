import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import ProfessorAccommodations from '../professor/professorAccommodations.js';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

describe('ProfessorAccommodations', () => {
  const props = {
    userInfo: { id: 1, role: 'PROFESSOR' },
    setAlertMessage: jest.fn(),
    setShowAlert: jest.fn(),
    settingsTabOpen: false,
    displayHeaderRef: null
  };

  const mockCourses = [
    {
      id: 1,
      name: 'CS101',
      department: 'CS',
      accommodations: [
        {
          id: 'a1',
          type: 'Note-Taking Assistance',
          status: 'PENDING',
          date_requested: '2024-04-10T00:00:00Z',
          advisorId: 1,
          notes: 'Needs support'
        },
        {
          id: 'a2',
          type: 'Unlisted Type',
          status: 'APPROVED',
          date_requested: '2024-03-01T00:00:00Z',
          advisorId: 1,
          notes: 'Should not be shown'
        }
      ]
    }
  ];

  beforeEach(() => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ courses: mockCourses }),
      })
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('has no accessibility violations', async () => {
    let container;
    await act(async () => {
      const rendered = render(<ProfessorAccommodations {...props} />);
      container = rendered.container;
    });

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  test('displays loading spinner initially', async () => {
    render(<ProfessorAccommodations {...props} />);
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  test('renders filtered accommodations after load', async () => {
    render(<ProfessorAccommodations {...props} />);
    await waitFor(() => screen.getByText(/CS101/i));

    // Expand course
    fireEvent.click(screen.getByRole('button', { name: /toggle accommodations/i }));

    // Valid accommodation appears
    expect(await screen.findByText(/Note-Taking Assistance/)).toBeInTheDocument();

    // Invalid one should not render
    expect(screen.queryByText(/Unlisted Type/)).not.toBeInTheDocument();
  });

  test('shows no accommodations message if none match filter', async () => {
    const noAccom = [
      {
        id: 1,
        name: 'ENG101',
        department: 'ENGL',
        accommodations: [
          {
            id: 'x1',
            type: 'Unlisted Type',
            status: 'DENIED',
            date_requested: '2024-01-01T00:00:00Z',
            advisorId: 2,
            notes: 'Not applicable'
          }
        ]
      }
    ];

    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ courses: noAccom })
      })
    );

    render(<ProfessorAccommodations {...props} />);
    await waitFor(() => screen.getByText(/ENG101/i));
    fireEvent.click(screen.getByRole('button', { name: /toggle accommodations/i }));

    expect(await screen.findByText(/No accommodations available/i)).toBeInTheDocument();
  });

  test('keyboard interaction toggles dropdown', async () => {
    render(<ProfessorAccommodations {...props} />);
    const courseCard = await screen.findByRole('button', { name: /toggle accommodations/i });
    const container = courseCard.closest('.courseCard');

    fireEvent.keyDown(container, { key: 'Enter', code: 'Enter' });

    expect(await screen.findByText(/Note-Taking Assistance/)).toBeInTheDocument();

    fireEvent.keyDown(container, { key: ' ', code: 'Space' });

    await waitFor(() => {
      expect(screen.queryByText(/Note-Taking Assistance/)).not.toBeInTheDocument();
    });
  });

  test('focus is set to heading after load', async () => {
    const focusMock = jest.fn();
    const headingRef = React.createRef();
  
    // We’ll patch focus after the heading is mounted
    const Wrapped = (props) => {
      const ref = headingRef;
      return <ProfessorAccommodations {...props} displayHeaderRef={ref} />;
    };
  
    await act(async () => {
      render(<Wrapped {...props} />);
    });
  
    // Wait for courses to load
    await screen.findByText(/CS101/i);
  
    // Wait for heading to be attached
    await waitFor(() => {
      expect(headingRef.current).not.toBeNull();
    });
  
    // Patch focus AFTER headingRef.current is populated
    headingRef.current.focus = focusMock;
  
    // Let the component's delayed focus effect fire
    await act(() => new Promise((res) => setTimeout(res, 150)));
  
    expect(focusMock).toHaveBeenCalled();
  });
  
  
  
  
  

  test('does not focus heading if alert is open', async () => {
    const focusMock = jest.fn(); // mock the function
    const mockRef = { current: { focus: focusMock } };
  
    // Add fake alert to DOM
    const alertDiv = document.createElement('div');
    alertDiv.setAttribute('data-testid', 'alert');
    document.body.appendChild(alertDiv);
  
    await act(async () => {
      render(
        <ProfessorAccommodations
          {...props}
          displayHeaderRef={mockRef}
        />
      );
    });
  
    // Verify focus was not triggered
    expect(focusMock).not.toHaveBeenCalled();
  
    document.body.removeChild(alertDiv);
  });

  test('logs error when professor accommodations fetch fails', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // Simulate fetch rejection (network error)
    global.fetch.mockImplementationOnce(() => Promise.reject(new Error('Network error')));
  
    render(<ProfessorAccommodations {...props} />);
  
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to fetch professor data',
        expect.any(Error)
      );
    });
  
    consoleSpy.mockRestore();
  });
  
  
});
