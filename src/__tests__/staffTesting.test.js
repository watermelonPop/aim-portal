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
