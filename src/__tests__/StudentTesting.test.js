// StudentTesting.test.js
import React from 'react';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import StudentTesting from '../student/studentTesting.js';

const mockUserInfo = { id: 123 };

const upcomingExamsData = [
  {
    id: 1,
    name: "Math Midterm",
    date: new Date(Date.now() + 86400000).toISOString(), // tomorrow
    location: "Room 101",
    courseName: "Calculus 101",
    accommodations: []
  }
];

const submittedExamsData = [
  {
    id: 2,
    name: "History Final",
    date: new Date(Date.now() - 86400000).toISOString(), // yesterday
    courseName: "World History",
    completedExamURL: "https://example.com/history-final.pdf"
  }
];

describe('StudentTesting Component', () => {
  beforeEach(() => {
    global.fetch = jest.fn((url) => {
      // Default: successful responses.
      if (url.includes('getStudentUpcomingExams')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(upcomingExamsData)
        });
      }
      if (url.includes('getStudentSubmittedExams')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(submittedExamsData)
        });
      }
      if (url.includes('applyForExamAccommodations')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ id: 77, ...upcomingExamsData[0] })
        });
      }
      if (url.includes('uploadForm')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ url: "https://example.com/uploaded-file.pdf" })
        });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });
  });
  
  afterEach(() => {
    jest.resetAllMocks();
  });
  
  test('renders upcoming and submitted exam section headings even when loading messages are not visible', async () => {
    await act(async () => {
      render(<StudentTesting userInfo={mockUserInfo} />);
    });
    // Use getAllByText since multiple matching elements may exist.
    const upcomingHeadings = screen.getAllByText(/Upcoming Exams/i);
    expect(upcomingHeadings.length).toBeGreaterThan(0);
    const submittedHeadings = screen.getAllByText(/Submitted Exams/i);
    expect(submittedHeadings.length).toBeGreaterThan(0);
  });
  
  test('displays error message for upcoming exams fetch failure', async () => {
    // For upcoming exams, simulate failure.
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ message: "Error fetching upcoming exams" })
      })
    );
    await act(async () => {
      render(<StudentTesting userInfo={mockUserInfo} />);
    });
    await waitFor(() => {
      expect(
        screen.getByText((content, element) =>
          element.tagName.toLowerCase() === 'p' &&
          content.includes('Failed to fetch upcoming exams')
        )
      ).toBeInTheDocument();
    });
  });
  
  test('displays error message for submitted exams fetch failure', async () => {
    // For upcoming exams, return success.
    global.fetch
      .mockImplementationOnce((url) => {
        if (url.includes('getStudentUpcomingExams')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(upcomingExamsData)
          });
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
      })
      // Then for submitted exams, simulate failure.
      .mockImplementationOnce((url) => {
        if (url.includes('getStudentSubmittedExams')) {
          return Promise.resolve({
            ok: false,
            json: () => Promise.resolve({ message: "Error fetching submitted exams" })
          });
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
      });
  
    await act(async () => {
      render(<StudentTesting userInfo={mockUserInfo} />);
    });
    await waitFor(() => {
      expect(
        screen.getByText((content, element) =>
          element.tagName.toLowerCase() === 'p' &&
          content.includes('Failed to fetch submitted exams')
        )
      ).toBeInTheDocument();
    });
  });
  
  test('does not crash when userInfo is not provided', async () => {
    await act(async () => {
      render(<StudentTesting />);
    });
    // Using getAllByText since there may be multiple "Upcoming Exams" headings.
    const upcomingHeadings = screen.getAllByText(/Upcoming Exams/i);
    expect(upcomingHeadings.length).toBeGreaterThan(0);
  });
  
  test('opens and closes modal with Cancel button', async () => {
    await act(async () => {
      render(<StudentTesting userInfo={mockUserInfo} />);
    });
    await waitFor(() => screen.getByText(/Math Midterm/i));
    const applyButtons = screen.getAllByLabelText(/Apply for accommodation for Math Midterm/i);
    expect(applyButtons.length).toBeGreaterThan(0);
    
    await act(async () => {
      fireEvent.click(applyButtons[0]);
    });
    
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    
    await act(async () => {
      fireEvent.click(screen.getByText(/Cancel/i));
    });
    
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });
  
  test('closes modal when Escape key is pressed', async () => {
    await act(async () => {
      render(<StudentTesting userInfo={mockUserInfo} />);
    });
    await waitFor(() => screen.getByText(/Math Midterm/i));
    const applyButtons = screen.getAllByLabelText(/Apply for accommodation for Math Midterm/i);
    await act(async () => {
      fireEvent.click(applyButtons[0]);
    });
    const dialog = screen.getByRole('dialog');
    await act(async () => {
      fireEvent.keyDown(dialog, { key: 'Escape', code: 'Escape' });
    });
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });
  
  test('shows alert if no accommodation is selected on submit', async () => {
    window.alert = jest.fn();
    await act(async () => {
      render(<StudentTesting userInfo={mockUserInfo} />);
    });
    await waitFor(() => screen.getByText(/Math Midterm/i));
    const applyButtons = screen.getAllByLabelText(/Apply for accommodation for Math Midterm/i);
    await act(async () => {
      fireEvent.click(applyButtons[0]);
    });
    
    const submitButton = screen.getByText(/Submit Request/i);
    await act(async () => {
      fireEvent.click(submitButton);
    });
    expect(window.alert).toHaveBeenCalledWith("Please select an accommodation option.");
  });
  
  test('submits accommodation request and file upload and shows success modal', async () => {
    await act(async () => {
      render(<StudentTesting userInfo={mockUserInfo} />);
    });
    await waitFor(() => screen.getByText(/Math Midterm/i));
    const applyButtons = screen.getAllByLabelText(/Apply for accommodation for Math Midterm/i);
    await act(async () => {
      fireEvent.click(applyButtons[0]);
    });
    const select = screen.getByLabelText(/Select Accommodation/i);
    await act(async () => {
      fireEvent.change(select, { target: { value: "Extended Time" } });
    });
    const file = new File(["dummy content"], "support.pdf", { type: "application/pdf" });
    const fileInput = screen.getByLabelText(/Upload PDF file/i);
    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [file] } });
    });
    const submitButton = screen.getByText(/Submit Request/i);
    await act(async () => {
      fireEvent.click(submitButton);
    });
    await waitFor(() => {
      expect(screen.getByText(/Your accommodation request has been submitted successfully/i)).toBeInTheDocument();
    });
  });
  
  test('closes the success modal when "Close" is clicked', async () => {
    await act(async () => {
      render(<StudentTesting userInfo={mockUserInfo} />);
    });
    await waitFor(() => screen.getByText(/Math Midterm/i));
    const applyButtons = screen.getAllByLabelText(/Apply for accommodation for Math Midterm/i);
    await act(async () => {
      fireEvent.click(applyButtons[0]);
    });
    const select = screen.getByLabelText(/Select Accommodation/i);
    await act(async () => {
      fireEvent.change(select, { target: { value: "Extended Time" } });
    });
    // Submit without a file for simplicity.
    const submitButton = screen.getByText(/Submit Request/i);
    await act(async () => {
      fireEvent.click(submitButton);
    });
    const successModalHeading = await waitFor(() =>
      screen.getByText((content, element) =>
        element.tagName.toLowerCase() === 'h2' && content.includes('Request Submitted')
      )
    );
    expect(successModalHeading).toBeInTheDocument();
    const closeButton = screen.getByText(/Close/i);
    await act(async () => {
      fireEvent.click(closeButton);
    });
    await waitFor(() => {
      expect(screen.queryByText((content, element) =>
        element.tagName.toLowerCase() === 'h2' && content.includes('Request Submitted')
      )).not.toBeInTheDocument();
    });
  });
});
