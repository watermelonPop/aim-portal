import React from 'react';
import { render, screen, fireEvent, waitFor, act, within } from '@testing-library/react';
import {ProfessorDashboard, formatDate} from '../professor/professorDashboard.js';
import { userEvent } from '@testing-library/user-event';
import flushPromises from 'flush-promises';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

// Mock fetch for API calls
beforeEach(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
        courses: [
          {
            id: 1,
            name: 'CS101',
            department: 'CS',
            accommodations: [
              {
                id: 1,
                type: 'Extended Time',
                status: 'PENDING',
                date_requested: '2024-05-01',
                notes: 'Needs 1.5x time',
                advisor: {
                  account: { name: 'Dr. Advisor', email: 'advisor@example.com' }
                },
                student: {
                  userId: 10,
                  UIN: '123456789',
                  account: { name: 'Jane Doe', email: 'jane@example.com' }
                }
              }
            ]
          }
        ]
      })
    })
  );
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('ProfessorDashboard', () => {
  const props = {
    userInfo: { id: 1 },
    setAlertMessage: jest.fn(),
    setShowAlert: jest.fn(),
    displayHeaderRef: React.createRef(),
    settingsTabOpen: false,
    lastIntendedFocusRef: { current: null },
  };

  test('prof dash should have no accessibility violations', async () => {
    let container;
    await act(async () => {
            const rendered = render(<ProfessorDashboard {...props} />);
            container = rendered.container;
    });

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
  
        test('returns empty string when dateString is falsy', async() => {
                let falsyDate;
                await act(async () => {
                        falsyDate = formatDate(null);
                });

                await waitFor(() => {
                        expect(falsyDate).toBe('');
                });

                await act(async () => {
                        falsyDate = formatDate(undefined);
                });

                await waitFor(() => {
                        expect(falsyDate).toBe('');
                });

                await act(async () => {
                        falsyDate = formatDate('');
                });

                await waitFor(() => {
                        expect(falsyDate).toBe('');
                });
        });
  test('does not update focus when alert is open during class selection effect', async () => {
        // Add an alert element to simulate alert being open
        const alertDiv = document.createElement('div');
        alertDiv.setAttribute('data-testid', 'alert');
        document.body.appendChild(alertDiv);
      
        // Spy on HTMLElement.prototype.focus to ensure it is NOT called
        const focusSpy = jest.spyOn(HTMLElement.prototype, 'focus');
      
        render(<ProfessorDashboard {...props} />);
      
        // Simulate selecting a class (already in Class View)
        await waitFor(() => screen.getByText(/cs101/i));
        fireEvent.click(screen.getByText(/cs101/i));
      
        // Wait a frame to let useEffect run
        await act(() => new Promise((r) => requestAnimationFrame(r)));
      
        expect(focusSpy).not.toHaveBeenCalled();
      
        // Cleanup
        document.body.removeChild(alertDiv);
        focusSpy.mockRestore();
      });
      

  test('does not update lastIntendedFocusRef when settings tab is open', async () => {
        const lastIntendedFocusRef = { current: null };
      
        render(
          <ProfessorDashboard
            {...props}
            settingsTabOpen={true}
            lastIntendedFocusRef={lastIntendedFocusRef}
          />
        );
      
        // Wait a frame to allow useEffect to run
        await act(() => new Promise((r) => requestAnimationFrame(r)));
      
        expect(lastIntendedFocusRef.current).toBeNull(); // should not have been updated
      });
      

  test('does not fetch classes if userInfo.id is missing', async () => {
        const fetchSpy = jest.spyOn(global, 'fetch');
      
        render(
          <ProfessorDashboard
            {...props}
            userInfo={{}} // No `id`
          />
        );
      
        // Wait to ensure no fetch attempt occurs
        await waitFor(() => {
          expect(fetchSpy).not.toHaveBeenCalled();
        });
      
        fetchSpy.mockRestore();
      });
      

  test('logs error when class fetch fails', async () => {
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
        // Mock failed fetch response
        global.fetch.mockImplementationOnce(() =>
          Promise.resolve({
            ok: false,
            status: 500,
            json: () => Promise.resolve({ message: 'Server error' }),
          })
        );
      
        render(<ProfessorDashboard {...props} />);
      
        await waitFor(() => {
          expect(consoleErrorSpy).toHaveBeenCalled();
          expect(consoleErrorSpy.mock.calls[0][0]).toBe('Error fetching classes:');
          expect(consoleErrorSpy.mock.calls[0][1]).toBeInstanceOf(Error);
        });
      
        consoleErrorSpy.mockRestore();
      });
      
      

  test('does not modify unrelated accommodations when accepting a request', async () => {
        const unrelatedAcc = {
          id: 'acc-unrelated',
          type: 'Note Taker',
          status: 'PENDING',
          date_requested: '2024-05-01',
          notes: 'Unrelated accommodation',
          advisor: {
            account: { name: 'Dr. Advisor', email: 'advisor@example.com' }
          },
          student: {
            userId: 'student-999',
            UIN: '987654321',
            account: { name: 'Unrelated Student', email: 'unrelated@example.com' }
          }
        };
      
        const targetAcc = {
          id: 'acc-target',
          type: 'Extended Time',
          status: 'PENDING',
          date_requested: '2024-05-01',
          notes: 'Needs 1.5x time',
          advisor: {
            account: { name: 'Dr. Advisor', email: 'advisor@example.com' }
          },
          student: {
            userId: 'student-123',
            UIN: '123456789',
            account: { name: 'Jane Doe', email: 'jane@example.com' }
          }
        };
      
        const mockClasses = [
          {
            id: 'class-123',
            name: 'CS101',
            department: 'CS',
            accommodations: [targetAcc, unrelatedAcc]
          }
        ];
      
        global.fetch
          .mockImplementationOnce(() =>
            Promise.resolve({
              ok: true,
              json: () => Promise.resolve({ courses: mockClasses })
            })
          )
          .mockImplementationOnce(() =>
            Promise.resolve({
              ok: true,
              json: () =>
                Promise.resolve({
                  success: true,
                  new_request: {
                    ...targetAcc,
                    status: 'ACCEPTED',
                    notes: 'Updated note'
                  }
                })
            })
          );
      
        render(<ProfessorDashboard {...props} />);
      
        fireEvent.click(screen.getByRole('tab', { name: /class view/i }));
      
        await waitFor(() => screen.getByText(/cs101/i));
        fireEvent.click(screen.getByText(/cs101/i));
      
        // Find the specific card for Jane Doe
        const janeCard = screen.getByText(/Jane Doe/i).closest('.studentCard');
        expect(janeCard).toBeInTheDocument();
      
        // Find and click the "acknowledge & accept" button in Jane's card only
        const button = within(janeCard).getByText(/acknowledge & accept/i);
        fireEvent.click(button);
      
        await waitFor(() => {
          expect(props.setAlertMessage).toHaveBeenCalledWith(
            expect.stringContaining('Acknowledged')
          );
          expect(props.setShowAlert).toHaveBeenCalledWith(true);
      
          // Unrelated notes should still be visible
          expect(screen.getByText(/Unrelated accommodation/i)).toBeInTheDocument();
          // Jane's status should be updated
          expect(screen.getByText(/accepted/i)).toBeInTheDocument();
        });
      });
      
      

  test('logs error when acceptAccommodationRequest fails', async () => {
        const user = userEvent.setup();
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
        const mockClasses = [
          {
            id: 'class-123',
            name: 'CS101',
            department: 'CS',
            accommodations: [
              {
                id: 'acc-1',
                type: 'Extended Time',
                status: 'PENDING',
                date_requested: '2024-05-01',
                notes: 'Needs 1.5x time',
                advisor: {
                  account: { name: 'Dr. Advisor', email: 'advisor@example.com' }
                },
                student: {
                  userId: 'student-123',
                  UIN: '123456789',
                  account: { name: 'Jane Doe', email: 'jane@example.com' }
                }
              }
            ]
          }
        ];
      
        global.fetch
          .mockResolvedValueOnce({
            ok: true,
            json: async () => ({ courses: mockClasses })
          })
          .mockResolvedValueOnce({
            ok: false,
            json: async () => ({ message: 'Server rejected the request' })
          });
      
        render(<ProfessorDashboard {...props} />);
      
        await waitFor(() => screen.getByText(/cs101/i));
        await user.click(screen.getByText(/cs101/i));
      
        const ackButton = await screen.findByText(/acknowledge & accept/i);
        await user.click(ackButton);
      
        await waitFor(() => {
          expect(consoleSpy).toHaveBeenCalledWith(
            'Error accept accommodation process: ',
            expect.any(Error)
          );
        });
      
        consoleSpy.mockRestore();
      });

  test('clicking "acknowledge & accept" calls acceptAccommodationRequest and shows alert', async () => {
        jest.useFakeTimers(); // handle requestAnimationFrame
      
        const mockClasses = [
          {
            id: 'class-123',
            name: 'CS101',
            department: 'CS',
            accommodations: [
              {
                id: 'acc-1',
                type: 'Extended Time',
                status: 'PENDING',
                date_requested: '2024-05-01',
                notes: 'Needs 1.5x time',
                advisor: {
                  account: { name: 'Dr. Advisor', email: 'advisor@example.com' }
                },
                student: {
                  userId: 'student-123',
                  UIN: '123456789',
                  account: { name: 'Jane Doe', email: 'jane@example.com' }
                }
              }
            ]
          }
        ];
      
        const mockStudents = [
          {
            userId: 'student-123',
            UIN: '123456789',
            account: { name: 'Jane Doe', email: 'jane@example.com' },
            accommodations: mockClasses[0].accommodations
          }
        ];
      
        global.fetch
          .mockImplementationOnce(() =>
            Promise.resolve({
              ok: true,
              json: () => Promise.resolve({ courses: mockClasses })
            })
          )
          .mockImplementationOnce(() =>
            Promise.resolve({
              ok: true,
              json: () =>
                Promise.resolve({
                  success: true,
                  new_request: {
                    id: 'acc-1',
                    type: 'Extended Time',
                    status: 'ACCEPTED',
                    date_requested: '2024-05-01',
                    notes: 'Updated notes',
                    advisor: {
                      account: { name: 'Dr. Advisor', email: 'advisor@example.com' }
                    },
                    student: {
                      userId: 'student-123',
                      UIN: '123456789',
                      account: { name: 'Jane Doe', email: 'jane@example.com' }
                    },
                    class: {
                      id: 'class-123',
                      name: 'CS101',
                      department: 'CS'
                    }
                  }
                })
            })
          );
      
        render(<ProfessorDashboard {...props} />);
        fireEvent.click(screen.getByRole('tab', { name: /class view/i }));
      
        await waitFor(() => screen.getByText(/cs101/i));
        fireEvent.click(screen.getByText(/cs101/i));
      
        const ackBtn = await screen.findByText(/acknowledge & accept/i);
      
        await act(async () => {
          fireEvent.click(ackBtn); // ensure onClick is triggered
          await flushPromises(); // flush fetch and state update
          jest.runAllTimers(); // flush requestAnimationFrame
        });
      
        await waitFor(() => {
          expect(screen.getByText(/accepted/i)).toBeInTheDocument();
          expect(props.setAlertMessage).toHaveBeenCalledWith(
            expect.stringContaining('Accommodation Request Acknowledged')
          );
          expect(props.setShowAlert).toHaveBeenCalledWith(true);
        });
      
        jest.useRealTimers();
      });
      
      

  test('pressing Enter or Space on student card selects student', async () => {
        render(<ProfessorDashboard {...props} />);
      
        // Switch to Student View
        fireEvent.click(screen.getByRole('tab', { name: /student view/i }));
      
        // Wait for student list to render
        const studentCard = await screen.findByRole('button', {
          name: /open student jane doe/i,
        });
      
        // Press Enter key
        fireEvent.keyDown(studentCard, { key: 'Enter', code: 'Enter' });
      
        // Verify student detail view is shown
        await waitFor(() => {
          expect(screen.getByText(/uin:/i)).toBeInTheDocument();
        });
      
        // Go back
        fireEvent.click(screen.getByRole('button', { name: /back/i }));
      
        // Try again with Space key
        const studentCardAgain = await screen.findByRole('button', {
          name: /open student jane doe/i,
        });
      
        fireEvent.keyDown(studentCardAgain, { key: ' ', code: 'Space' });
      
        await waitFor(() => {
          expect(screen.getByText(/uin:/i)).toBeInTheDocument();
        });
      });
      

  test('pressing Enter or Space on class card selects class', async () => {
        render(<ProfessorDashboard {...props} />);
      
        // Wait for class list to render
        const classItem = await screen.findByRole('button', { name: /open class cs101/i });
      
        // Press Enter key
        fireEvent.keyDown(classItem, { key: 'Enter', code: 'Enter' });
      
        // Verify class detail view is shown
        await waitFor(() => {
          expect(screen.getByText(/requests/i)).toBeInTheDocument();
        });
      
        // Go back
        fireEvent.click(screen.getByRole('button', { name: /back/i }));
      
        // Now try with Space key
        const classItemAgain = await screen.findByRole('button', { name: /open class cs101/i });
        fireEvent.keyDown(classItemAgain, { key: ' ', code: 'Space' });
      
        await waitFor(() => {
          expect(screen.getByText(/requests/i)).toBeInTheDocument();
        });
      });
      

      test('focuses heading when class is deselected', async () => {
        const headingRef = { current: null };
        const propsWithRef = { ...props, displayHeaderRef: headingRef };
      
        render(<ProfessorDashboard {...propsWithRef} />);
      
        // Switch to Class View
        fireEvent.click(screen.getByRole('tab', { name: /class view/i }));
      
        // Select class
        await waitFor(() => screen.getByText(/cs101/i));
        fireEvent.click(screen.getByText(/cs101/i));
      
        // Wait for back button
        await waitFor(() => screen.getByRole('button', { name: /back/i }));
      
        // Get heading and spy on focus method
        const headingEl = screen.getByRole('heading', { name: /class view dashboard/i });
        headingRef.current = headingEl;
      
        const focusSpy = jest.spyOn(headingEl, 'focus');
      
        // Trigger deselection
        fireEvent.click(screen.getByRole('button', { name: /back/i }));
      
        // Trigger animation frame manually
        await act(() => new Promise((r) => requestAnimationFrame(r)));
      
        expect(focusSpy).toHaveBeenCalled();
      });
      
      
      

      test('focuses back button when class is selected', async () => {
        const focusMock = jest.fn();
        const originalFocus = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'focus');
      
        Object.defineProperty(HTMLElement.prototype, 'focus', {
          configurable: true,
          value: focusMock,
        });
      
        try {
          render(<ProfessorDashboard {...props} />);
      
          // Wait for the class to appear (default is Class View)
          await waitFor(() => screen.getByText(/cs101/i));
      
          // Select the class
          fireEvent.click(screen.getByText(/cs101/i));
      
          // Allow requestAnimationFrame to trigger focus
          await act(() => new Promise((resolve) => requestAnimationFrame(resolve)));
      
          expect(focusMock).toHaveBeenCalled();
        } finally {
          // Restore native focus method
          if (originalFocus) {
            Object.defineProperty(HTMLElement.prototype, 'focus', originalFocus);
          }
        }
      });
      
      

      test('focuses heading when student is deselected', async () => {
        const headingRef = { current: null };
        const propsWithRef = { ...props, displayHeaderRef: headingRef };
      
        render(<ProfessorDashboard {...propsWithRef} />);
      
        // Go to Student tab
        fireEvent.click(screen.getByRole('tab', { name: /student view/i }));
      
        // Wait for student and click to select
        await waitFor(() => screen.getByText(/jane doe/i));
        fireEvent.click(screen.getByText(/jane doe/i));
      
        // Deselect student
        await waitFor(() => screen.getByRole('button', { name: /back/i }));
        fireEvent.click(screen.getByRole('button', { name: /back/i }));
      
        // Attach spy to the heading element
        const headingEl = screen.getByRole('heading', { name: /student view dashboard/i });
        headingRef.current = headingEl;
        const focusSpy = jest.spyOn(headingEl, 'focus');
      
        // Allow requestAnimationFrame to run effect
        await act(() => new Promise((r) => requestAnimationFrame(r)));
      
        expect(focusSpy).toHaveBeenCalled();
      });
      
      

      test('focuses back button when student is selected', async () => {
        const focusMock = jest.fn();
        const originalFocus = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'focus');
      
        // Temporarily override
        Object.defineProperty(HTMLElement.prototype, 'focus', {
          configurable: true,
          value: focusMock,
        });
      
        try {
          render(<ProfessorDashboard {...props} />);
      
          // Switch to Student View
          fireEvent.click(screen.getByRole('tab', { name: /student view/i }));
      
          // Click student
          await waitFor(() => screen.getByText(/jane doe/i));
          fireEvent.click(screen.getByText(/jane doe/i));
      
          // Let rAF complete
          await act(() => new Promise((r) => requestAnimationFrame(r)));
      
          expect(focusMock).toHaveBeenCalled();
        } finally {
          // Restore original .focus
          if (originalFocus) {
            Object.defineProperty(HTMLElement.prototype, 'focus', originalFocus);
          }
        }
      });
      
      
      
      
      

  test('renders class view tab and data correctly', async () => {
    render(<ProfessorDashboard {...props} />);
    expect(screen.getByRole('tab', { name: /class view/i })).toBeInTheDocument();
    expect(screen.getByText(/class view dashboard/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/CS101/i)).toBeInTheDocument();
      expect(screen.getByText(/1 students/i)).toBeInTheDocument();
    });
  });

  test('switches to student view', async () => {
    render(<ProfessorDashboard {...props} />);
    const studentTab = screen.getByRole('tab', { name: /student view/i });
    fireEvent.click(studentTab);
    expect(await screen.findByText(/student view dashboard/i)).toBeInTheDocument();
  });

  test('clicking class item opens class details', async () => {
    render(<ProfessorDashboard {...props} />);
    await waitFor(() => screen.getByText(/CS101/i));

    fireEvent.click(screen.getByText(/CS101/i));

    expect(await screen.findByText(/Extended Time Accommodations on/i)).toBeInTheDocument();
    expect(screen.getByText(/Needs 1.5x time/i)).toBeInTheDocument();
  });

  test('acknowledge & accept button triggers API call and alert', async () => {
    const acceptMock = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true, new_request: { status: 'ACCEPTED' } })
      })
    );
    global.fetch
  .mockImplementationOnce(() =>
    Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve({
          courses: [
            {
              id: 1,
              name: 'CS101',
              department: 'CS',
              accommodations: [
                {
                  id: 101,
                  type: 'extra time',
                  status: 'PENDING',
                  date_requested: '2024-04-01',
                  notes: 'Needs more time',
                  advisor: {
                    account: {
                      name: 'Dr. Smith',
                      email: 'smith@univ.edu'
                    }
                  },
                  student: {
                    userId: 555,
                    UIN: '123456789',
                    account: {
                      name: 'John Doe',
                      email: 'jdoe@univ.edu'
                    }
                  }
                }
              ]
            }
          ]
        })
    })
  )
  .mockImplementationOnce(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ success: true, new_request: { status: 'ACCEPTED' } })
    })
  );


    act(() => {
                render(<ProfessorDashboard {...props} />);
        });

    await waitFor(() => screen.getByText(/CS101/i));
    await act(async() => {
        fireEvent.click(screen.getByText(/CS101/i));
        });

    await waitFor(() => screen.getByText(/acknowledge & accept/i));
    await act(async() => {
        fireEvent.click(screen.getByText(/acknowledge & accept/i));
        });

    await waitFor(() => {
      expect(props.setAlertMessage).toHaveBeenCalledWith(
        expect.stringContaining('Accommodation Request Acknowledged')
      );
      expect(props.setShowAlert).toHaveBeenCalledWith(true);
    });
  });

  test('clicking "acknowledge & accept" in Student View triggers API call and shows alert', async () => {
    // Mock both initial course fetch and acceptAccommodationRequest response
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          courses: [
            {
              id: 1,
              name: 'CS101',
              department: 'CS',
              accommodations: [
                {
                  id: 101,
                  type: 'Extra Time',
                  status: 'PENDING',
                  date_requested: '2024-04-01',
                  notes: 'Needs 2x time',
                  advisor: {
                    account: { name: 'Dr. Smith', email: 'smith@univ.edu' }
                  },
                  student: {
                    userId: 10,
                    UIN: '123456789',
                    account: { name: 'Jane Doe', email: 'jane@univ.edu' }
                  }
                }
              ]
            }
          ]
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          new_request: {
            id: 101,
            status: 'ACCEPTED',
            type: 'Extra Time',
            notes: 'Accepted',
          }
        })
      });
  
    render(<ProfessorDashboard {...props} />);
  
    // Switch to Student View
    fireEvent.click(screen.getByRole('tab', { name: /student view/i }));
  
    // Wait for student card to show
    const studentCard = await screen.findByRole('button', {
      name: /open student jane doe/i,
    });
    fireEvent.click(studentCard);
  
    // Wait for the "acknowledge & accept" button
    const ackBtn = await screen.findByText(/acknowledge & accept/i);
    fireEvent.click(ackBtn);
  
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/professorAcceptStudentAccommodation',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          }),
          body: JSON.stringify({ id: 101 })
        })
      );
  
      expect(props.setAlertMessage).toHaveBeenCalledWith(
        expect.stringContaining('Accommodation Request Acknowledged')
      );
      expect(props.setShowAlert).toHaveBeenCalledWith(true);
    });
  });
  
});
