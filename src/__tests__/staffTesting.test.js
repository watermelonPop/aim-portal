// staffTesting.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import StaffExamView from '../staff/staffTesting';

// Polyfill for requestAnimationFrame in tests
global.requestAnimationFrame = (cb) => setTimeout(cb, 0);
global.cancelAnimationFrame = (id) => clearTimeout(id);

describe('StaffExamView Component', () => {
  const userInfo = { id: '123' };
  let displayHeaderRef;
  let lastIntendedFocusRef;

  // Sample data used across tests
  const examData = [
    {
      id: 'exam1',
      studentIds: ['student1'],
      course: { professorId: 'prof1', name: 'Math' },
      name: 'Exam 1',
      date: new Date().toISOString(),
      examUrl: 'http://example.com/exam',
    },
  ];
  const studentData = { account: { name: 'Student Test', email: 'student@example.com' }, accommodations: [] };
  const professorData = { account: { name: 'Professor Test', email: 'prof@example.com' } };

  beforeEach(() => {
    // Create a dummy header element to use as ref (with a mock focus method)
    const header = document.createElement('h2');
    header.focus = jest.fn();
    displayHeaderRef = { current: header };
    lastIntendedFocusRef = { current: null };
    // Reset fetch and console mocks
    global.fetch = jest.fn();
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });
  

  test('logs error if fetching professor data fails', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  
    global.fetch.mockImplementation((url) => {
      if (url.includes('/api/getExamFromAdvisor')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(examData),
        });
      }
      if (url.includes('/api/getStudentData')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(studentData),
        });
      }
      if (url.includes('/api/getProfessor')) {
        return Promise.resolve({ ok: false }); // Simulate failure
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });
  
    await act(async () => {
      render(
        <StaffExamView
          userInfo={userInfo}
          displayHeaderRef={displayHeaderRef}
          settingsTabOpen={false}
          lastIntendedFocusRef={lastIntendedFocusRef}
        />
      );
    });
  
    const examItem = await screen.findByText(/Exam 1/i);
    fireEvent.click(examItem);
  
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error fetching professor',
        expect.any(Error)
      );
    });
  
    consoleErrorSpy.mockRestore();
  });

  test('logs error if fetching student data fails', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  
    global.fetch.mockImplementation((url) => {
      if (url.includes('/api/getExamFromAdvisor')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(examData),
        });
      }
      if (url.includes('/api/getStudentData')) {
        return Promise.resolve({ ok: false }); // Simulate failure
      }
      if (url.includes('/api/getProfessor')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(professorData),
        });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });
  
    await act(async () => {
      render(
        <StaffExamView
          userInfo={userInfo}
          displayHeaderRef={displayHeaderRef}
          settingsTabOpen={false}
          lastIntendedFocusRef={lastIntendedFocusRef}
        />
      );
    });
  
    const examItem = await screen.findByText(/Exam 1/i);
    fireEvent.click(examItem);
  
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error fetching student:',
        expect.any(Error)
      );
    });
  
    consoleErrorSpy.mockRestore();
  });
  
  test('logs error if file upload fails', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  
    global.fetch.mockImplementation((url) => {
      if (url.includes('/api/getExamFromAdvisor')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(examData),
        });
      }
      if (url.includes('/api/getStudentData')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(studentData),
        });
      }
      if (url.includes('/api/getProfessor')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(professorData),
        });
      }
      if (url.includes('/api/submitCompletedExam')) {
        return Promise.reject(new Error('Network error during upload'));
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });
  
    await act(async () => {
      render(
        <StaffExamView
          userInfo={userInfo}
          displayHeaderRef={displayHeaderRef}
          settingsTabOpen={false}
          lastIntendedFocusRef={lastIntendedFocusRef}
        />
      );
    });
  
    const examItem = await screen.findByText(/Exam 1/i);
    fireEvent.click(examItem);
  
    await waitFor(() => {
      expect(screen.getByText(/Math - Exam 1/i)).toBeInTheDocument();
    });
  
    const examCard = screen.getByText(/Math - Exam 1/i).parentElement;
    const fileInputElement = examCard.querySelector('input[type="file"]');
  
    const testFile = new File(['file contents'], 'test.txt', { type: 'text/plain' });
    fireEvent.change(fileInputElement, { target: { files: [testFile] } });
  
    const uploadButton = screen.getByRole('button', { name: /Upload Exam/i });
    fireEvent.click(uploadButton);
  
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error uploading file:',
        expect.any(Error)
      );
    });
  
    consoleErrorSpy.mockRestore();
  });
  
  test('logs error if exam fetch fails', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  
    global.fetch.mockImplementationOnce(() => Promise.reject(new Error('Fetch exams failed')));
  
    await act(async () => {
      render(
        <StaffExamView
          userInfo={userInfo}
          displayHeaderRef={displayHeaderRef}
          settingsTabOpen={false}
          lastIntendedFocusRef={lastIntendedFocusRef}
        />
      );
    });
  
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error fetching exams:',
        expect.any(Error)
      );
    });
  
    consoleErrorSpy.mockRestore();
  });
  
  test('throws and logs error if exam fetch response is not ok', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ message: 'Internal Server Error' }),
      })
    );
  
    await act(async () => {
      render(
        <StaffExamView
          userInfo={userInfo}
          displayHeaderRef={displayHeaderRef}
          settingsTabOpen={false}
          lastIntendedFocusRef={lastIntendedFocusRef}
        />
      );
    });
  
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error fetching exams:',
        expect.any(Error)
      );
    });
  
    consoleErrorSpy.mockRestore();
  });
  
  test('displays student accommodation types using .map((acc) => acc.type)', async () => {
    const studentWithAccommodations = {
      account: {
        name: 'Student A',
        email: 'studentA@example.com',
      },
      accommodations: [
        { type: 'Extended Time' },
        { type: 'Accessible Seating' },
      ],
    };
  
    const examData = [
      {
        id: 'exam1',
        studentIds: ['studentA'],
        course: { professorId: 'profA', name: 'Biology' },
        name: 'Midterm',
        date: new Date().toISOString(),
        examUrl: 'http://example.com/exam',
      },
    ];
  
    const professorData = {
      account: {
        name: 'Prof A',
        email: 'profA@example.com',
      },
    };
  
    global.fetch = jest.fn((url) => {
      if (url.includes('/api/getExamFromAdvisor')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(examData) });
      }
      if (url.includes('/api/getStudentData')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(studentWithAccommodations) });
      }
      if (url.includes('/api/getProfessor')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(professorData) });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });
  
    await act(async () => {
      render(
        <StaffExamView
          userInfo={{ id: 'advisor1' }}
          displayHeaderRef={{ current: document.createElement('div') }}
          settingsTabOpen={false}
          lastIntendedFocusRef={{ current: null }}
        />
      );
    });
  
    // Click on the exam to show ExamCard
    fireEvent.click(await screen.findByText(/Midterm/i));
  
    // Wait for accommodation text to appear
    await waitFor(() => {
      expect(screen.getByText(/Extended Time, Accessible Seating/i)).toBeInTheDocument();
    });
  });
  
  
  
  test('clicking close button in ExamCard clears selectedExam and returns to exam list view', async () => {
    // Mock fetch responses for exams, student, and professor
    global.fetch.mockImplementation((url) => {
      if (url.includes('/api/getExamFromAdvisor')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(examData),
        });
      }
      if (url.includes('/api/getStudentData')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(studentData),
        });
      }
      if (url.includes('/api/getProfessor')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(professorData),
        });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });
  
    await act(async () => {
      render(
        <StaffExamView
          userInfo={userInfo}
          displayHeaderRef={displayHeaderRef}
          settingsTabOpen={false}
          lastIntendedFocusRef={lastIntendedFocusRef}
        />
      );
    });
  
    const examItem = await screen.findByText(/Exam 1/i);
    fireEvent.click(examItem);
  
    // Confirm ExamCard is displayed
    await waitFor(() => {
      expect(screen.getByText(/Math - Exam 1/i)).toBeInTheDocument();
    });
  
    // Click the close button (×)
    const closeButton = screen.getByRole('button', { name: /×/i });
    await act(async () => {
      fireEvent.click(closeButton);
    });
  
    // Expect ExamCard to be removed and exam list to be shown again
    await waitFor(() => {
      expect(screen.getByText(/Exam 1/i)).toBeInTheDocument(); // back in list view
      expect(screen.queryByText(/Math - Exam 1/i)).not.toBeInTheDocument(); // card hidden
    });
  });

  test('clicking "Download Exam" opens exam URL in a new tab', async () => {
    const windowOpenSpy = jest.spyOn(window, 'open').mockImplementation(() => null);
  
    global.fetch.mockImplementation((url) => {
      if (url.includes('/api/getExamFromAdvisor')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(examData),
        });
      }
      if (url.includes('/api/getStudentData')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(studentData),
        });
      }
      if (url.includes('/api/getProfessor')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(professorData),
        });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });
  
    await act(async () => {
      render(
        <StaffExamView
          userInfo={userInfo}
          displayHeaderRef={displayHeaderRef}
          settingsTabOpen={false}
          lastIntendedFocusRef={lastIntendedFocusRef}
        />
      );
    });
  
    const examItem = await screen.findByText(/Exam 1/i);
    fireEvent.click(examItem);
  
    await waitFor(() => {
      expect(screen.getByText(/Math - Exam 1/i)).toBeInTheDocument();
    });
  
    const downloadBtn = screen.getByRole('button', { name: /Download Exam/i });
    fireEvent.click(downloadBtn);
  
    expect(windowOpenSpy).toHaveBeenCalledWith('http://example.com/exam', '_blank', 'noopener,noreferrer');
  
    windowOpenSpy.mockRestore();
  });
  
  

  test('renders heading and fetches exams on mount', async () => {
    // Mock fetch for exams
    global.fetch.mockImplementation((url) => {
      if (url.includes('/api/getExamFromAdvisor')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(examData),
        });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });

    await act(async () => {
      render(
        <StaffExamView
          userInfo={userInfo}
          displayHeaderRef={displayHeaderRef}
          settingsTabOpen={false}
          lastIntendedFocusRef={lastIntendedFocusRef}
        />
      );
    });

    expect(screen.getByRole('heading', { name: /Exams Assigned to You/i })).toBeInTheDocument();

    // Wait for the exam list to be rendered
    await waitFor(() => {
      expect(screen.getByText(/Exam 1/i)).toBeInTheDocument();
    });
  });

  test('displays loading message when exams are loading', async () => {
    let resolveFetch;
    global.fetch.mockImplementation(() => {
      return new Promise((resolve) => {
        resolveFetch = resolve;
      });
    });

    render(
      <StaffExamView
        userInfo={userInfo}
        displayHeaderRef={displayHeaderRef}
        settingsTabOpen={false}
        lastIntendedFocusRef={lastIntendedFocusRef}
      />
    );

    expect(screen.getByText(/Loading.../i)).toBeInTheDocument();

    act(() => {
      resolveFetch({
        ok: true,
        json: () => Promise.resolve(examData),
      });
    });

    await waitFor(() => {
      expect(screen.getByText(/Exam 1/i)).toBeInTheDocument();
    });
  });

  test('handles exam click and fetches student and professor data', async () => {
    global.fetch.mockImplementation((url) => {
      if (url.includes('/api/getExamFromAdvisor')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(examData),
        });
      }
      if (url.includes('/api/getStudentData')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(studentData),
        });
      }
      if (url.includes('/api/getProfessor')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(professorData),
        });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });

    await act(async () => {
      render(
        <StaffExamView
          userInfo={userInfo}
          displayHeaderRef={displayHeaderRef}
          settingsTabOpen={false}
          lastIntendedFocusRef={lastIntendedFocusRef}
        />
      );
    });

    const examItem = await screen.findByText(/Exam 1/i);
    fireEvent.click(examItem);

    // Wait for ExamCard to appear
    await waitFor(() => {
      expect(screen.getByText(/Math - Exam 1/i)).toBeInTheDocument();
    });

    // Check that student and professor details are rendered
    await waitFor(() => {
      expect(screen.getByText(/Student Test/i)).toBeInTheDocument();
      expect(screen.getByText(/Professor Test/i)).toBeInTheDocument();
    });
  });

  test('handles exam click via Enter key press', async () => {
    global.fetch.mockImplementation((url) => {
      if (url.includes('/api/getExamFromAdvisor')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(examData),
        });
      }
      if (url.includes('/api/getStudentData')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(studentData),
        });
      }
      if (url.includes('/api/getProfessor')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(professorData),
        });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });

    await act(async () => {
      render(
        <StaffExamView
          userInfo={userInfo}
          displayHeaderRef={displayHeaderRef}
          settingsTabOpen={false}
          lastIntendedFocusRef={lastIntendedFocusRef}
        />
      );
    });

    const examItem = await screen.findByText(/Exam 1/i);
    fireEvent.keyDown(examItem, { key: 'Enter', code: 'Enter' });

    await waitFor(() => {
      expect(screen.getByText(/Math - Exam 1/i)).toBeInTheDocument();
    });
  });

  test('does not perform file upload when no file is selected', async () => {
    global.fetch.mockImplementation((url) => {
      if (url.includes('/api/getExamFromAdvisor')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(examData),
        });
      }
      if (url.includes('/api/getStudentData')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(studentData),
        });
      }
      if (url.includes('/api/getProfessor')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(professorData),
        });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });

    await act(async () => {
      render(
        <StaffExamView
          userInfo={userInfo}
          displayHeaderRef={displayHeaderRef}
          settingsTabOpen={false}
          lastIntendedFocusRef={lastIntendedFocusRef}
        />
      );
    });

    const examItem = await screen.findByText(/Exam 1/i);
    fireEvent.click(examItem);

    await waitFor(() => {
      expect(screen.getByText(/Math - Exam 1/i)).toBeInTheDocument();
    });

    const uploadButton = screen.getByRole('button', { name: /Upload Exam/i });
    fireEvent.click(uploadButton);

    // Verify that the file upload endpoint was not called
    const submitCall = global.fetch.mock.calls.find((call) =>
      call[0].includes('/api/submitCompletedExam')
    );
    expect(submitCall).toBeUndefined();
  });

  test('handles file upload in ExamCard', async () => {
    let fileUploadCalled = false;
    global.fetch.mockImplementation((url, options) => {
      if (url.includes('/api/getExamFromAdvisor')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(examData),
        });
      }
      if (url.includes('/api/getStudentData')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(studentData),
        });
      }
      if (url.includes('/api/getProfessor')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(professorData),
        });
      }
      if (url.includes('/api/submitCompletedExam')) {
        fileUploadCalled = true;
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ url: 'http://example.com/completedExam' }),
        });
      }
      if (url.includes('/api/updateExam')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              ...JSON.parse(options.body),
              completedExamURL: 'http://example.com/completedExam',
            }),
        });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });

    await act(async () => {
      render(
        <StaffExamView
          userInfo={userInfo}
          displayHeaderRef={displayHeaderRef}
          settingsTabOpen={false}
          lastIntendedFocusRef={lastIntendedFocusRef}
        />
      );
    });

    const examItem = await screen.findByText(/Exam 1/i);
    fireEvent.click(examItem);

    await waitFor(() => {
      expect(screen.getByText(/Math - Exam 1/i)).toBeInTheDocument();
    });

    // Find the file input (using querySelector from the ExamCard container)
    const examCard = screen.getByText(/Math - Exam 1/i).parentElement;
    const fileInputElement = examCard.querySelector('input[type="file"]');
    expect(fileInputElement).toBeInTheDocument();

    // Simulate selecting a file
    const testFile = new File(['file contents'], 'test.txt', { type: 'text/plain' });
    fireEvent.change(fileInputElement, { target: { files: [testFile] } });

    // Click the upload button
    const uploadButton = screen.getByRole('button', { name: /Upload Exam/i });
    fireEvent.click(uploadButton);

    await waitFor(() => {
      expect(fileUploadCalled).toBe(true);
      // After a successful upload, the button text should change to 'Reupload Exam'
      expect(screen.getByRole('button', { name: /Reupload Exam/i })).toBeInTheDocument();
    });
  });
});
