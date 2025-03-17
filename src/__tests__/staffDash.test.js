import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import StaffDash from '../staff/staffDash';

// Mock the global fetch API
global.fetch = jest.fn();

describe('StaffDash Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders StaffDash correctly', async () => {
    render(<StaffDash />);
    expect(screen.getByText(/Select an action/i)).toBeInTheDocument();
  });

  test('fetches and displays students correctly', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        students: [{ student_id: 1, name: 'John Doe', uin: 123456789 }]
      })
    });

    render(<StaffDash />);

    fireEvent.click(screen.getByText(/Student Search/i));

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText(/UIN: 123456789/i)).toBeInTheDocument();
    });
  });

  test('handles API failure gracefully when fetching students', async () => {
    global.fetch.mockRejectedValueOnce(new Error('API error'));

    render(<StaffDash />);

    fireEvent.click(screen.getByText(/Student Search/i));

    await waitFor(() => {
      expect(screen.getByText(/No matching students found/i)).toBeInTheDocument();
    });
  });

  test('search functionality filters students correctly', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        students: [
          { student_id: 1, name: 'Alice Doe', uin: 111111111 },
          { student_id: 2, name: 'Bob Smith', uin: 222222222 }
        ]
      })
    });

    render(<StaffDash />);
    fireEvent.click(screen.getByText(/Student Search/i));

    await waitFor(() => {
      expect(screen.getByText('Alice Doe')).toBeInTheDocument();
      expect(screen.getByText('Bob Smith')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText(/Enter student name or UIN/i), { target: { value: 'Alice' } });

    await waitFor(() => {
      expect(screen.getByText('Alice Doe')).toBeInTheDocument();
      expect(screen.queryByText('Bob Smith')).not.toBeInTheDocument();
    });
  });

  test('renders request view correctly and paginates', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        requests: [
          { user_id: 1, user_email: 'user1@example.com', uin: 111111111, notes: 'Request 1' },
          { user_id: 2, user_email: 'user2@example.com', uin: 222222222, notes: 'Request 2' }
        ]
      })
    });

    render(<StaffDash />);
    fireEvent.click(screen.getByText(/Manage Requests/i));

    await waitFor(() => {
      expect(screen.getByText(/user1@example.com/i)).toBeInTheDocument();
      expect(screen.getByText(/user2@example.com/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(/Next →/i));
    expect(screen.getByText(/Page 1 of 1/i)).toBeInTheDocument();
  });

  test('displays student details when clicking on a student', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        students: [{ student_id: 1, name: 'John Doe', uin: 123456789, dob: '2000-01-01', email: 'john@example.com', phone_number: '123-456-7890' }]
      })
    });

    render(<StaffDash />);
    fireEvent.click(screen.getByText(/Student Search/i));

    await waitFor(() => {
      fireEvent.click(screen.getByText('John Doe'));
    });

    await waitFor(() => {
      expect(screen.getByText(/Student Profile/i)).toBeInTheDocument();
      expect(screen.getByText(/Name: John Doe/i)).toBeInTheDocument();
      expect(screen.getByText(/UIN: 123456789/i)).toBeInTheDocument();
      expect(screen.getByText(/Email: john@example.com/i)).toBeInTheDocument();
      expect(screen.getByText(/Phone Number: 123-456-7890/i)).toBeInTheDocument();
    });
  });

  test('allows editing and saving student details', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        students: [{ student_id: 1, name: 'John Doe', uin: 123456789, dob: '2000-01-01', email: 'john@example.com', phone_number: '123-456-7890' }]
      })
    });

    render(<StaffDash />);
    fireEvent.click(screen.getByText(/Student Search/i));

    await waitFor(() => {
      fireEvent.click(screen.getByText('John Doe'));
    });

    await waitFor(() => {
      fireEvent.click(screen.getByText(/Edit/i));
    });

    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'John Doe Jr.' } });
    fireEvent.click(screen.getByText(/Save Changes/i));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/updateStudent', expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expect.objectContaining({ name: 'John Doe Jr.' }))
      }));

      expect(screen.getByText(/Changes saved successfully/i)).toBeInTheDocument();
    });
  });

  test('handles API failure when updating student data', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        students: [{ student_id: 1, name: 'John Doe', uin: 123456789, dob: '2000-01-01', email: 'john@example.com', phone_number: '123-456-7890' }]
      })
    });

    global.fetch.mockRejectedValueOnce(new Error('Failed to update student'));

    render(<StaffDash />);
    fireEvent.click(screen.getByText(/Student Search/i));

    await waitFor(() => {
      fireEvent.click(screen.getByText('John Doe'));    
    });

    await waitFor(() => {
      fireEvent.click(screen.getByText(/Edit/i));
    });

    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'John Doe Jr.' } });
    fireEvent.click(screen.getByText(/Save Changes/i));

    await waitFor(() => {
      expect(screen.getByText(/❌ Failed to update student/i)).toBeInTheDocument();
    });
  });

  test('navigates back to dashboard from views', async () => {
    render(<StaffDash />);
    fireEvent.click(screen.getByText(/Student Search/i));

    await waitFor(() => {
      fireEvent.click(screen.getByText(/← Back to Dashboard/i));
    });

    await waitFor(() => {
      expect(screen.getByText(/Select an action/i)).toBeInTheDocument();
    });
  });

  test('renders alerts on dashboard', () => {
    render(<StaffDash />);

    expect(screen.getByText(/📢 Alerts/i)).toBeInTheDocument();
    expect(screen.getByText(/New accommodation request from John Doe/i)).toBeInTheDocument();
  });
});

test('renders default staff dashboard with menu options', () => {
    render(<StaffDash />);
    expect(screen.getByText(/Select an action/i)).toBeInTheDocument();
    expect(screen.getByText(/🔍 Student Search/i)).toBeInTheDocument();
    expect(screen.getByText(/📌 Manage Requests/i)).toBeInTheDocument();
    expect(screen.getByText(/📄 Review Submitted Forms/i)).toBeInTheDocument();
});

test('renders empty state when no requests are found', async () => {
    global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ requests: [] })
    });

    render(<StaffDash />);
    fireEvent.click(screen.getByText(/Manage Requests/i));

    await waitFor(() => {
        expect(screen.getByText(/No students found/i)).toBeInTheDocument();
    });
});

test('clicking on a request displays full details', async () => {
    global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
            requests: [{ user_id: 1, user_email: 'user1@example.com', uin: 111111111, notes: 'Detailed Request Notes' }]
        })
    });

    render(<StaffDash />);
    fireEvent.click(screen.getByText(/Manage Requests/i));

    await waitFor(() => {
        fireEvent.click(screen.getByText(/user1@example.com/i));
    });

    await waitFor(() => {
        expect(screen.getByText(/Student Request Details/i)).toBeInTheDocument();
        expect(screen.getByText(/Detailed Request Notes/i)).toBeInTheDocument();
    });
});

test('pagination updates correctly', async () => {
    global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
            requests: Array.from({ length: 20 }, (_, i) => ({
                user_id: i + 1,
                user_email: `user${i + 1}@example.com`,
                uin: 100000000 + i,
                notes: `Request ${i + 1}`
            }))
        })
    });

    render(<StaffDash />);
    fireEvent.click(screen.getByText(/Manage Requests/i));

    await waitFor(() => {
        expect(screen.getByText(/user1@example.com/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(/Next/i));

    await waitFor(() => {
        expect(screen.getByText(/user11@example.com/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(/Previous/i));

    await waitFor(() => {
        expect(screen.getByText(/user1@example.com/i)).toBeInTheDocument();
    });
});

test('editing student details and canceling reverts changes', async () => {
    global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
            students: [{ student_id: 1, name: 'Alice Doe', uin: 111111111, dob: '2000-01-01', email: 'alice@example.com', phone_number: '555-555-5555' }]
        })
    });

    render(<StaffDash />);
    fireEvent.click(screen.getByText(/Student Search/i));

    await waitFor(() => {
        fireEvent.click(screen.getByText('Alice Doe'));
    });

    await waitFor(() => {
        fireEvent.click(screen.getByText(/Edit/i));
    });

    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'Alice Smith' } });

    expect(screen.getByDisplayValue('Alice Smith')).toBeInTheDocument();

    fireEvent.click(screen.getByText(/Back to Profile View/i));

    await waitFor(() => {
        expect(screen.getByText(/Name: Alice Doe/i)).toBeInTheDocument();
    });
});

test('handles API failure when fetching students', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Failed to fetch students'));

    render(<StaffDash />);
    fireEvent.click(screen.getByText(/Student Search/i));

    await waitFor(() => {
        expect(screen.getByText(/No matching students found/i)).toBeInTheDocument();
    });
});

test('displays alerts correctly on dashboard', () => {
    render(<StaffDash />);
    expect(screen.getByText(/📢 Alerts/i)).toBeInTheDocument();
    expect(screen.getByText(/New accommodation request from John Doe/i)).toBeInTheDocument();
});




