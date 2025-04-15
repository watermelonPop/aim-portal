import React from 'react';
import { render, screen, fireEvent, waitFor, act, within } from '@testing-library/react';
import ProfessorTesting from '../professor/professorTesting';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

const mockData = {
  courses: [
    {
      id: 1,
      name: 'CS101',
      department: 'CS',
      exams: [
        {
          id: 101,
          name: 'Midterm',
          date: '2024-04-10T00:00:00Z',
          location: 'Room 101',
          studentIds: [1],
        }
      ]
    }
  ],
  students: [
    {
      userId: 1,
      UIN: '123456789',
      account: { name: 'Jane Doe', email: 'jane@example.com' }
    },
    {
      userId: 2,
      UIN: '987654321',
      account: { name: 'John Smith', email: 'john@example.com' }
    }
  ]
};

describe('ProfessorTesting', () => {
  const props = {
    userInfo: { id: 1, role: 'PROFESSOR' },
    settingsTabOpen: false,
    displayHeaderRef: null
  };

  beforeEach(() => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockData)
      })
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('has no accessibility violations', async () => {
    let container;
    await act(async () => {
      const rendered = render(<ProfessorTesting {...props} />);
      container = rendered.container;
    });

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  test('shows loading spinner initially', async () => {
    render(<ProfessorTesting {...props} />);
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  test('renders course and student info after data load', async () => {
    render(<ProfessorTesting {...props} />);
  
    expect(
      await screen.findByRole('button', { name: /toggle students list for cs101/i })
    ).toBeInTheDocument();
  
    expect(screen.getByRole('button', { name: /create exam for cs101/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /filter/i })).toBeInTheDocument();
  });
  

  test('expands and collapses course dropdown with click', async () => {
    render(<ProfessorTesting {...props} />);
    const toggle = await screen.findByRole('button', { name: /toggle students list for cs101/i });
    fireEvent.click(toggle);
    expect(await screen.findByText(/Jane Doe/i)).toBeInTheDocument();
    fireEvent.click(toggle);
    await waitFor(() => {
      expect(screen.queryByText(/Jane Doe/i)).not.toBeInTheDocument();
    });
  });

  test('filters to only show students with exams', async () => {
    render(<ProfessorTesting {...props} />);
    const filterBtn = await screen.findByRole('button', { name: /filter/i });
    fireEvent.click(filterBtn); // enable filter

    const dropdown = await screen.findByRole('button', { name: /toggle students list for cs101/i });
    fireEvent.click(dropdown);
    
    expect(await screen.findByText(/Jane Doe/i)).toBeInTheDocument();
    expect(screen.queryByText(/John Smith/i)).not.toBeInTheDocument();
  });

  test('shows "no exams assigned" for students without exams', async () => {
    render(<ProfessorTesting {...props} />);
    fireEvent.click(await screen.findByRole('button', { name: /toggle students list for cs101/i }));
    expect(await screen.findByText(/John Smith/i)).toBeInTheDocument();
    expect(await screen.findAllByText(/No exams assigned/i)).toHaveLength(1);
  });

  test('keyboard interaction toggles <details> inside student card', async () => {
    render(<ProfessorTesting {...props} />);
    fireEvent.click(await screen.findByRole('button', { name: /toggle students list for cs101/i }));
  
    const studentCard = await screen.findByRole('region', { name: /jane doe/i });
    const details = studentCard.querySelector('details');
  
    // Ensure it's closed initially
    expect(details.open).toBe(false);
  
    fireEvent.keyDown(studentCard, { key: 'Enter', code: 'Enter' });
  
    await waitFor(() => {
      expect(details.open).toBe(true);
    });
  });
  

  test('deletes an exam after confirmation', async () => {
    global.confirm = jest.fn(() => true); // simulate confirm dialog

    global.fetch
      .mockImplementationOnce(() =>
        Promise.resolve({ ok: true, json: () => Promise.resolve(mockData) })
      )
      .mockImplementationOnce(() =>
        Promise.resolve({ ok: true, json: () => Promise.resolve({ id: 101 }) })
      );

    render(<ProfessorTesting {...props} />);
    fireEvent.click(await screen.findByRole('button', { name: /toggle students list for cs101/i }));

    const deleteBtn = await screen.findByRole('button', { name: /delete exam/i });
    fireEvent.click(deleteBtn);

    await waitFor(() => {
      expect(screen.queryByText(/Midterm/i)).not.toBeInTheDocument();
    });
  });

  test('does not delete exam if user cancels confirmation', async () => {
    global.confirm = jest.fn(() => false); // cancel dialog

    render(<ProfessorTesting {...props} />);
    fireEvent.click(await screen.findByRole('button', { name: /toggle students list for cs101/i }));

    const deleteBtn = await screen.findByRole('button', { name: /delete exam/i });
    fireEvent.click(deleteBtn);

    expect(await screen.findByText(/Midterm/i)).toBeInTheDocument();
  });
});
