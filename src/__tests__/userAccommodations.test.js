import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import {UserAccommodations} from '../user/userAccommodations';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

describe('userAccommodations', () => {
        const mockSetAlertMessage = jest.fn();
        const mockSetShowAlert = jest.fn();
        const mockSetExistingRequest = jest.fn();
        const mockValidateForm = jest.fn();
        const mockHandleFileUpload = jest.fn();
        beforeEach(() => {
                jest.clearAllMocks();
        });

        test('deleteDocumentation throws when message is not "Form deleted successfully"', async () => {
                const mockUserId = 123;
              
                global.fetch = jest.fn().mockResolvedValue({
                  ok: true,
                  json: jest.fn().mockResolvedValueOnce({ message: 'Something went wrong' }), // bad message
                });
              
                const mockSetAlertMessage = jest.fn();
                const mockSetShowAlert = jest.fn();
                const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
              
                const mockUserInfo = {
                  id: mockUserId,
                  name: 'Test User',
                  email: 'test@example.com',
                  dob: '2000-01-01',
                  uin: 123456789,
                  phone_number: 1234567890,
                  role: 'USER',
                  picture: null,
                };
                                const mockDisplayHeaderRef = { current: null };
                                const mockLastIntendedFocusRef = { current: null };
                              
                                await act(async () => {
                                  render(
                                    <UserAccommodations
                                      userInfo={mockUserInfo}
                                      setAlertMessage={mockSetAlertMessage}
                                      setShowAlert={mockSetShowAlert}
                                      displayHeaderRef={mockDisplayHeaderRef}
                                      lastIntendedFocusRef={mockLastIntendedFocusRef}
                                      settingsTabOpen={false}
                                    />
                                  );
                                });
              
                const result = await UserAccommodations.deleteDocumentation(mockUserId);
              
                expect(result).toBe(false);
                expect(mockConsoleError).toHaveBeenCalledWith(
                  'Error deleting form:',
                  expect.any(Error)
                );
                expect(mockSetAlertMessage).toHaveBeenCalledWith('Form deletion failed.');
                expect(mockSetShowAlert).toHaveBeenCalledWith(true);
              
                mockConsoleError.mockRestore();
        });
              
                   
        test('getUserDocumentation throws error when response is not ok', async () => {
                const mockUserId = 123;
              
                // Mock fetch to simulate failed response
                global.fetch = jest.fn().mockResolvedValue({
                  ok: false,
                  status: 500,
                  json: jest.fn(),
                });
              
                const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
              
                // Render the component to initialize the assigned functions
                const mockSetAlertMessage = jest.fn();
                const mockSetShowAlert = jest.fn();
                const mockUserInfo = {
                  id: mockUserId,
                  name: "Test User",
                  email: "test@example.com",
                  dob: "2000-01-01",
                  uin: 123456789,
                  phone_number: 1234567890,
                  role: "USER",
                  picture: null,
                };
              
                const mockDisplayHeaderRef = { current: null };
                                const mockLastIntendedFocusRef = { current: null };
                              
                                await act(async () => {
                                  render(
                                    <UserAccommodations
                                      userInfo={mockUserInfo}
                                      setAlertMessage={mockSetAlertMessage}
                                      setShowAlert={mockSetShowAlert}
                                      displayHeaderRef={mockDisplayHeaderRef}
                                      lastIntendedFocusRef={mockLastIntendedFocusRef}
                                      settingsTabOpen={false}
                                    />
                                  );
                                });
              
                // Now it's safe to call the assigned function
                const result = await UserAccommodations.getUserDocumentation(mockUserId);
              
                expect(consoleErrorSpy).toHaveBeenCalledWith(
                  'Error while getting user documentation:',
                  expect.any(Error)
                );
                expect(result).toBeNull();
              
                consoleErrorSpy.mockRestore();
        });
              
              

        test('handleChange logs warning when no name is provided', async () => {
                global.fetch = jest.fn((url) => {
                        if (url === '/api/accountConnected?userId=mockId') {
                            return Promise.resolve({
                                ok: true,
                                json: () => Promise.resolve({ exists: true }),
                            });
                        }else if (url === '/api/checkAccount') {
                            return Promise.resolve({
                                ok: true,
                                json: () => Promise.resolve({ exists: true, user_info: {id: "mockId"}}),
                            });
                        }else if (url === '/api/checkRequests?userId=mockId') {
                                return Promise.resolve({
                                    ok: true,
                                    json: () => Promise.resolve({ exists: false, message: "No request found"}),
                                });
                            }else{
                            console.log("OTHER API ROUTE");
                        }
                });
                const mockUserInfo = {
                  id: "mockId",
                  name: "Mock User",
                  email: "test@gmail.com",
                  role: "USER",
                  picture: null,
                  dob: "2000-01-01",
                  uin: 123456789,
                  phone_number: 1001001001,
                };
              
                const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
              
                const mockDisplayHeaderRef = { current: null };
                                const mockLastIntendedFocusRef = { current: null };
                              
                                await act(async () => {
                                  render(
                                    <UserAccommodations
                                      userInfo={mockUserInfo}
                                      setAlertMessage={mockSetAlertMessage}
                                      setShowAlert={mockSetShowAlert}
                                      displayHeaderRef={mockDisplayHeaderRef}
                                      lastIntendedFocusRef={mockLastIntendedFocusRef}
                                      settingsTabOpen={false}
                                    />
                                  );
                                });
              
                // Directly trigger the handleChange method
                const fakeEvent = {
                  target: {
                    name: undefined,
                    value: 'Some Value',
                  }
                };
              
                // Simulate calling handleChange manually via the input's onChange
                const input = screen.getByTestId('name');
                input.props?.onChange?.(fakeEvent); // Will only work in Enzyme — so instead:
              
                // Use dispatchEvent with custom change
                fireEvent.change(input, fakeEvent); // Won’t hit your handleChange unless input has name
              
                // So instead just call the function manually (last resort if above fails)
                await act(() => {
                  UserAccommodations.handleChange?.(fakeEvent); // If exported as static or exposed
                });
              
                expect(consoleSpy).toHaveBeenCalledWith(
                  'Missing name or value in handleChange',
                  expect.objectContaining({ value: 'Some Value' })
                );
              
                consoleSpy.mockRestore();
        });
              
              
              
        describe('on load', () => {
                test('UserAccommodation should have no accessibility violations', async () => {
                        global.fetch = jest.fn((url) => {
                                if (url === '/api/accountConnected?userId=mockId') {
                                    return Promise.resolve({
                                        ok: true,
                                        json: () => Promise.resolve({ exists: true }),
                                    });
                                }else if (url === '/api/checkAccount') {
                                    return Promise.resolve({
                                        ok: true,
                                        json: () => Promise.resolve({ exists: true, user_info: {id: "mockId"}}),
                                    });
                                }else if (url === '/api/checkRequests?userId=mockId') {
                                        return Promise.resolve({
                                            ok: true,
                                            json: () => Promise.resolve({ exists: false, message: "No request found"}),
                                        });
                                    }else{
                                    console.log("OTHER API ROUTE");
                                }
                        });
                        let mockUserInfo = {
                                id: "mockId",
                                name: "Mock User",
                                email: "test@gmail.com",
                                role: "USER",
                                picture: null,
                                dob: "2000-01-01",
                                uin: 123456789,
                                phone_number: 1001001001,
                        };
                        const mockDisplayHeaderRef = { current: null };
                                const mockLastIntendedFocusRef = { current: null };
                              
                                await act(async () => {
                                  render(
                                    <UserAccommodations
                                      userInfo={mockUserInfo}
                                      setAlertMessage={mockSetAlertMessage}
                                      setShowAlert={mockSetShowAlert}
                                      displayHeaderRef={mockDisplayHeaderRef}
                                      lastIntendedFocusRef={mockLastIntendedFocusRef}
                                      settingsTabOpen={false}
                                    />
                                  );
                                });
                        let container;
                        await act(async () => {
                                const rendered = render(
                                        <UserAccommodations
                                          userInfo={mockUserInfo}
                                          setAlertMessage={mockSetAlertMessage}
                                          setShowAlert={mockSetShowAlert}
                                          displayHeaderRef={mockDisplayHeaderRef}
                                          lastIntendedFocusRef={mockLastIntendedFocusRef}
                                          settingsTabOpen={false}
                                        />
                                      );
                                container = rendered.container;
                        });

                        const results = await axe(container);
                        expect(results).toHaveNoViolations();
                });
                test('makes a call to /api/checkRequests?email=${email} with the proper email', async () => {
                        let mockUserInfo = {
                                id: "mockId",
                                name: "Mock User",
                                email: "test@gmail.com",
                                role: "USER",
                                picture: null,
                                dob: "2000-01-01",
                                uin: 123456789,
                                phone_number: 1001001001,
                        };
                        global.fetch = jest.fn().mockResolvedValue({
                                ok: true,
                                json: jest.fn().mockResolvedValueOnce({})
                        });

                        const mockDisplayHeaderRef = { current: null };
                                const mockLastIntendedFocusRef = { current: null };
                              
                                await act(async () => {
                                  render(
                                    <UserAccommodations
                                      userInfo={mockUserInfo}
                                      setAlertMessage={mockSetAlertMessage}
                                      setShowAlert={mockSetShowAlert}
                                      displayHeaderRef={mockDisplayHeaderRef}
                                      lastIntendedFocusRef={mockLastIntendedFocusRef}
                                      settingsTabOpen={false}
                                    />
                                  );
                        });

                        await waitFor(() => {
                                expect(global.fetch).toHaveBeenCalledWith('/api/checkRequests?userId=mockId');
                        });
                });

                test('sets the existing as null if no request', async () => {
                        let mockUserInfo = {
                                id: "mockId",
                                name: "Mock User",
                                email: "test@gmail.com",
                                role: "USER",
                                picture: null,
                                dob: "2000-01-01",
                                uin: 123456789,
                                phone_number: 1001001001,
                        };
                        global.fetch = jest.fn().mockResolvedValue({
                                ok: true,
                                json: jest.fn().mockResolvedValueOnce({exists: false, message: "No request found"})
                        });

                        const mockDisplayHeaderRef = { current: null };
                                const mockLastIntendedFocusRef = { current: null };
                              
                                await act(async () => {
                                  render(
                                    <UserAccommodations
                                      userInfo={mockUserInfo}
                                      setAlertMessage={mockSetAlertMessage}
                                      setShowAlert={mockSetShowAlert}
                                      displayHeaderRef={mockDisplayHeaderRef}
                                      lastIntendedFocusRef={mockLastIntendedFocusRef}
                                      settingsTabOpen={false}
                                    />
                                  );
                        });

                        await waitFor(() => {
                                expect(UserAccommodations.existingRequest).toEqual(null);
                        });
                });

                /*test('sets the existing request', async () => {
                        let mockUserInfo = {
                                id: 123,
                                name: "Mock User",
                                email: "test@gmail.com",
                                role: "USER",
                                picture: null,
                                dob: "2000-01-01",
                                uin: 123456789,
                                phone_number: 1001001001,
                        };

                        global.fetch = jest.fn((url) => {
                                if (url === '/api/checkRequests?userId=123') {
                                    return Promise.resolve({
                                        ok: true,
                                        json: () => Promise.resolve({ exists: true, request: {non_registered_userId: 123, documentation: false} }),
                                    });
                                } else if (url === '/api/getUserDocumentation?user_id=123') {
                                    return Promise.resolve({
                                        ok: true,
                                        json: () => Promise.resolve({ exists: false }),
                                    });
                                }else{
                                        console.log("OTHER CALL MADE: ", url);
                                }
                        });

                        const mockDisplayHeaderRef = { current: null };
                        const mockLastIntendedFocusRef = { current: null };
                              
                        await act(async () => {
                                  render(
                                    <UserAccommodations
                                      userInfo={mockUserInfo}
                                      setAlertMessage={mockSetAlertMessage}
                                      setShowAlert={mockSetShowAlert}
                                      displayHeaderRef={mockDisplayHeaderRef}
                                      lastIntendedFocusRef={mockLastIntendedFocusRef}
                                      settingsTabOpen={false}
                                    />
                                  );
                        });

                        await waitFor(() => {
                                expect(UserAccommodations.existingRequest).toEqual({non_registered_userId: 123, documentation: false});
                        });
                }); */

        });     
        describe('correct form display based on checkRequest', () => {
                test('shows the new student application if no request', async () => {
                        let mockUserInfo = {
                                id: "mockId",
                                name: "Mock User",
                                email: "test@gmail.com",
                                role: "USER",
                                picture: null,
                                dob: "2000-01-01",
                                uin: 123456789,
                                phone_number: 1001001001,
                        };
                        global.fetch = jest.fn().mockResolvedValue({
                                ok: true,
                                json: jest.fn().mockResolvedValueOnce({exists: false, message: "No request found"})
                        });

                        const mockDisplayHeaderRef = { current: null };
                                const mockLastIntendedFocusRef = { current: null };
                              
                                await act(async () => {
                                  render(
                                    <UserAccommodations
                                      userInfo={mockUserInfo}
                                      setAlertMessage={mockSetAlertMessage}
                                      setShowAlert={mockSetShowAlert}
                                      displayHeaderRef={mockDisplayHeaderRef}
                                      lastIntendedFocusRef={mockLastIntendedFocusRef}
                                      settingsTabOpen={false}
                                    />
                                  );
                        });

                        await waitFor(() => {
                                expect(screen.queryByTestId('newStudentApp')).toBeInTheDocument();
                                expect(screen.queryByTestId('existingRequest')).not.toBeInTheDocument();
                        });
                });

                /*test('shows the existing request if exists', async () => {
                        let mockUserInfo = {
                                id: "mockId",
                                name: "Mock User",
                                email: "test@gmail.com",
                                role: "USER",
                                picture: null,
                                dob: "2000-01-01",
                                uin: 123456789,
                                phone_number: 1001001001,
                        };
                        global.fetch = jest.fn().mockResolvedValue({
                                ok: true,
                                json: jest.fn().mockResolvedValueOnce({exists: true, request: {}})
                        });

                        const mockDisplayHeaderRef = { current: null };
                                const mockLastIntendedFocusRef = { current: null };
                              
                                await act(async () => {
                                  render(
                                    <UserAccommodations
                                      userInfo={mockUserInfo}
                                      setAlertMessage={mockSetAlertMessage}
                                      setShowAlert={mockSetShowAlert}
                                      displayHeaderRef={mockDisplayHeaderRef}
                                      lastIntendedFocusRef={mockLastIntendedFocusRef}
                                      settingsTabOpen={false}
                                    />
                                  );
                        });

                        await waitFor(() => {
                                expect(screen.queryByTestId('newStudentApp')).not.toBeInTheDocument();
                                expect(screen.queryByTestId('existingRequest')).toBeInTheDocument();
                        });
                });*/

                /*test('shows correct label when student has documentation', async () => {
                        let mockUserInfo = {
                                id: 123,
                                name: "Mock User",
                                email: "test@gmail.com",
                                role: "USER",
                                picture: null,
                                dob: "2000-01-01",
                                uin: 123456789,
                                phone_number: 1001001001,
                        };

                        global.fetch = jest.fn((url) => {
                                if (url === '/api/checkRequests?userId=123') {
                                    return Promise.resolve({
                                        ok: true,
                                        json: () => Promise.resolve({ exists: true, request: {non_registered_userId: 123, documentation: true} }),
                                    });
                                } else if (url === '/api/getUserDocumentation?user_id=123') {
                                    return Promise.resolve({
                                        ok: true,
                                        json: () => Promise.resolve({ exists: true, form: {name: "fileName", formUrl: "form/testurl", userId: 123, type: "REGISTRATION_ELIGIBILITY"} }),
                                    });
                                }else{
                                        console.log("OTHER CALL MADE: ", url);
                                }
                        });

                        const mockDisplayHeaderRef = { current: null };
                                const mockLastIntendedFocusRef = { current: null };
                              
                                await act(async () => {
                                  render(
                                    <UserAccommodations
                                      userInfo={mockUserInfo}
                                      setAlertMessage={mockSetAlertMessage}
                                      setShowAlert={mockSetShowAlert}
                                      displayHeaderRef={mockDisplayHeaderRef}
                                      lastIntendedFocusRef={mockLastIntendedFocusRef}
                                      settingsTabOpen={false}
                                    />
                                  );
                        });

                        await waitFor(() => {
                                        expect(screen.getByText(/You have submitted your documentation, and your request is under review! Review your documentation/)).toBeInTheDocument();
                                        expect(screen.getByRole('link', { name: /here/i })).toHaveAttribute('href', 'form/testurl');
                                        expect(screen.queryByText("You have not submitted your documentation yet. Please submit it in Forms before we can review your request.")).not.toBeInTheDocument();
                        });
                });*/

                /*test('shows correct label when student doesnt have documentation', async () => {
                        let mockUserInfo = {
                                id: 123,
                                name: "Mock User",
                                email: "test@gmail.com",
                                role: "USER",
                                picture: null,
                                dob: "2000-01-01",
                                uin: 123456789,
                                phone_number: 1001001001,
                        };

                        global.fetch = jest.fn((url) => {
                                if (url === '/api/checkRequests?userId=123') {
                                    return Promise.resolve({
                                        ok: true,
                                        json: () => Promise.resolve({ exists: true, request: {non_registered_userId: 123, documentation: false} }),
                                    });
                                } else if (url === '/api/getUserDocumentation?user_id=123') {
                                    return Promise.resolve({
                                        ok: true,
                                        json: () => Promise.resolve({ exists: false }),
                                    });
                                }else{
                                        console.log("OTHER CALL MADE: ", url);
                                }
                        });

                        const mockDisplayHeaderRef = { current: null };
                                const mockLastIntendedFocusRef = { current: null };
                              
                                await act(async () => {
                                  render(
                                    <UserAccommodations
                                      userInfo={mockUserInfo}
                                      setAlertMessage={mockSetAlertMessage}
                                      setShowAlert={mockSetShowAlert}
                                      displayHeaderRef={mockDisplayHeaderRef}
                                      lastIntendedFocusRef={mockLastIntendedFocusRef}
                                      settingsTabOpen={false}
                                    />
                                  );
                        });

                        await waitFor(() => {
                                expect(screen.getByText("You have not submitted your documentation yet. Please submit it in Forms before we can review your request.")).toBeInTheDocument();
                                expect(screen.queryByText("You have submitted your documentation, and your request is under review!")).not.toBeInTheDocument();
                        });
                });*/

                test('new student application shows correct form labels', async () => {
                        let mockUserInfo = {
                                id: 123,
                                name: "Mock User",
                                email: "test@gmail.com",
                                role: "USER",
                                picture: null,
                                dob: "2000-01-01",
                                uin: 123456789,
                                phone_number: 1001001001,
                        };

                        global.fetch = jest.fn((url) => {
                                if (url === '/api/checkRequests?userId=123') {
                                    return Promise.resolve({
                                        ok: true,
                                        json: () => Promise.resolve({ exists: false }),
                                    });
                                } else if (url === '/api/getUserDocumentation?user_id=123') {
                                    return Promise.resolve({
                                        ok: true,
                                        json: () => Promise.resolve({ exists: false }),
                                    });
                                }else{
                                        console.log("OTHER CALL MADE: ", url);
                                }
                        });

                        const mockDisplayHeaderRef = { current: null };
                        const mockLastIntendedFocusRef = { current: null };
                              
                        await act(async () => {
                                  render(
                                    <UserAccommodations
                                      userInfo={mockUserInfo}
                                      setAlertMessage={mockSetAlertMessage}
                                      setShowAlert={mockSetShowAlert}
                                      displayHeaderRef={mockDisplayHeaderRef}
                                      lastIntendedFocusRef={mockLastIntendedFocusRef}
                                      settingsTabOpen={false}
                                    />
                                  );
                        });

                        await waitFor(() => {
                                expect(screen.getByText("Name")).toBeInTheDocument();
                                expect(screen.getByText("Email")).toBeInTheDocument();
                                expect(screen.getByText("Date of Birth")).toBeInTheDocument();
                                expect(screen.getByText("UIN")).toBeInTheDocument();
                                expect(screen.getByText("Phone Number")).toBeInTheDocument();
                                expect(screen.getByText("What is your disability or disabilities?")).toBeInTheDocument();
                                expect(screen.getByText("What challenges do you experience related to taking tests/exams, if any?")).toBeInTheDocument();
                                expect(screen.getByText("What challenges do you experience in the classroom or learning environment, if any?")).toBeInTheDocument();
                                expect(screen.getByText("If you are living on-campus, do you require any disability accommodations in the housing environment?")).toBeInTheDocument();
                                expect(screen.getByText("Do you experience any side effects related to treatment or medications that may be relevant to identifying accommodations?")).toBeInTheDocument();
                                expect(screen.getByText("What specific accommodations are you requesting?")).toBeInTheDocument();
                                expect(screen.getByText("What accommodations have you used in the past?")).toBeInTheDocument();
                                expect(screen.getByText("Already have documentation? Upload Here!")).toBeInTheDocument();
                        });
                });

                test('new student application shows correct form inputs', async () => {
                        let mockUserInfo = {
                                id: 123,
                                name: "Mock User",
                                email: "test@gmail.com",
                                role: "USER",
                                picture: null,
                                dob: "2000-01-01",
                                uin: 123456789,
                                phone_number: 1001001001,
                        };

                        global.fetch = jest.fn((url) => {
                                if (url === '/api/checkRequests?userId=123') {
                                    return Promise.resolve({
                                        ok: true,
                                        json: () => Promise.resolve({ exists: false }),
                                    });
                                } else if (url === '/api/getUserDocumentation?user_id=123') {
                                    return Promise.resolve({
                                        ok: true,
                                        json: () => Promise.resolve({ exists: false }),
                                    });
                                }else{
                                        console.log("OTHER CALL MADE: ", url);
                                }
                        });

                        const mockDisplayHeaderRef = { current: null };
                        const mockLastIntendedFocusRef = { current: null };
                              
                        await act(async () => {
                                  render(
                                    <UserAccommodations
                                      userInfo={mockUserInfo}
                                      setAlertMessage={mockSetAlertMessage}
                                      setShowAlert={mockSetShowAlert}
                                      displayHeaderRef={mockDisplayHeaderRef}
                                      lastIntendedFocusRef={mockLastIntendedFocusRef}
                                      settingsTabOpen={false}
                                    />
                                  );
                        });
                        await waitFor(() => {
                                expect(screen.queryByTestId('name')).toBeInTheDocument();
                                expect(screen.queryByTestId('email')).toBeInTheDocument();
                                expect(screen.queryByTestId('dob')).toBeInTheDocument();
                                expect(screen.queryByTestId('uin')).toBeInTheDocument();
                                expect(screen.queryByTestId('phone_number')).toBeInTheDocument();
                                expect(screen.queryByTestId('disability')).toBeInTheDocument();
                                expect(screen.queryByTestId('testing')).toBeInTheDocument();
                                expect(screen.queryByTestId('inClass')).toBeInTheDocument();
                                expect(screen.queryByTestId('housing')).toBeInTheDocument();
                                expect(screen.queryByTestId('sideEffect')).toBeInTheDocument();
                                expect(screen.queryByTestId('accommodations')).toBeInTheDocument();
                                expect(screen.queryByTestId('pastAcc')).toBeInTheDocument();
                                expect(screen.queryByTestId('uploadFile')).toBeInTheDocument();
                        });
                });

                /*test('existing request shows correct form labels', async () => {
                        let mockUserInfo = {
                                id: 123,
                                name: "Mock User",
                                email: "test@gmail.com",
                                role: "USER",
                                picture: null,
                                dob: "2000-01-01",
                                uin: 123456789,
                                phone_number: 1001001001,
                        };

                        global.fetch = jest.fn((url) => {
                                if (url === '/api/checkRequests?userId=123') {
                                    return Promise.resolve({
                                        ok: true,
                                        json: () => Promise.resolve({ exists: true, request: {non_registered_userId: 123, documentation: false} }),
                                    });
                                } else if (url === '/api/getUserDocumentation?user_id=123') {
                                    return Promise.resolve({
                                        ok: true,
                                        json: () => Promise.resolve({ exists: false }),
                                    });
                                }else{
                                        console.log("OTHER CALL MADE: ", url);
                                }
                        });

                        const mockDisplayHeaderRef = { current: null };
                                const mockLastIntendedFocusRef = { current: null };
                              
                                await act(async () => {
                                  render(
                                    <UserAccommodations
                                      userInfo={mockUserInfo}
                                      setAlertMessage={mockSetAlertMessage}
                                      setShowAlert={mockSetShowAlert}
                                      displayHeaderRef={mockDisplayHeaderRef}
                                      lastIntendedFocusRef={mockLastIntendedFocusRef}
                                      settingsTabOpen={false}
                                    />
                                  );
                        });

                        await waitFor(() => {
                                expect(screen.getByText("Name")).toBeInTheDocument();
                                expect(screen.getByText("Email")).toBeInTheDocument();
                                expect(screen.getByText("Date of Birth")).toBeInTheDocument();
                                expect(screen.getByText("UIN")).toBeInTheDocument();
                                expect(screen.getByText("Phone Number")).toBeInTheDocument();
                                expect(screen.getByText("Notes")).toBeInTheDocument();
                        });
                });*/

                /*test('existing request shows correct form inputs', async () => {
                        let mockUserInfo = {
                                id: 123,
                                name: "Mock User",
                                email: "test@gmail.com",
                                role: "USER",
                                picture: null,
                                dob: "2000-01-01",
                                uin: 123456789,
                                phone_number: 1001001001,
                        };

                        global.fetch = jest.fn((url) => {
                                if (url === '/api/checkRequests?userId=123') {
                                    return Promise.resolve({
                                        ok: true,
                                        json: () => Promise.resolve({ exists: true, request: {non_registered_userId: 123, documentation: false} }),
                                    });
                                } else if (url === '/api/getUserDocumentation?user_id=123') {
                                    return Promise.resolve({
                                        ok: true,
                                        json: () => Promise.resolve({ exists: false }),
                                    });
                                }else{
                                        console.log("OTHER CALL MADE: ", url);
                                }
                        });

                        const mockDisplayHeaderRef = { current: null };
                                const mockLastIntendedFocusRef = { current: null };
                              
                                await act(async () => {
                                  render(
                                    <UserAccommodations
                                      userInfo={mockUserInfo}
                                      setAlertMessage={mockSetAlertMessage}
                                      setShowAlert={mockSetShowAlert}
                                      displayHeaderRef={mockDisplayHeaderRef}
                                      lastIntendedFocusRef={mockLastIntendedFocusRef}
                                      settingsTabOpen={false}
                                    />
                                  );
                        });

                        await waitFor(() => {
                                expect(screen.queryByTestId('name')).toBeInTheDocument();
                                expect(screen.queryByTestId('email')).toBeInTheDocument();
                                expect(screen.queryByTestId('dob')).toBeInTheDocument();
                                expect(screen.queryByTestId('uin')).toBeInTheDocument();
                                expect(screen.queryByTestId('phone_number')).toBeInTheDocument();
                                expect(screen.queryByTestId('notes')).toBeInTheDocument();
                        });
                });*/
        }); 

        describe('input form change', () => {
                test('new student app: on input change, should change the value', async () => {
                        let mockUserInfo = {
                                id: 123,
                                name: "Mock User",
                                email: "test@gmail.com",
                                role: "USER",
                                picture: null,
                                dob: "2000-01-01",
                                uin: 123456789,
                                phone_number: 1001001001,
                        };

                        global.fetch = jest.fn((url) => {
                                if (url === '/api/checkRequests?userId=123') {
                                    return Promise.resolve({
                                        ok: true,
                                        json: () => Promise.resolve({ exists: false }),
                                    });
                                } else if (url === '/api/getUserDocumentation?user_id=123') {
                                    return Promise.resolve({
                                        ok: true,
                                        json: () => Promise.resolve({ exists: false }),
                                    });
                                }else{
                                        console.log("OTHER CALL MADE: ", url);
                                }
                        });

                        const mockDisplayHeaderRef = { current: null };
                                const mockLastIntendedFocusRef = { current: null };
                              
                                await act(async () => {
                                  render(
                                    <UserAccommodations
                                      userInfo={mockUserInfo}
                                      setAlertMessage={mockSetAlertMessage}
                                      setShowAlert={mockSetShowAlert}
                                      displayHeaderRef={mockDisplayHeaderRef}
                                      lastIntendedFocusRef={mockLastIntendedFocusRef}
                                      settingsTabOpen={false}
                                    />
                                  );
                        });

                        const inputElement = screen.getByTestId('name');
                        fireEvent.change(inputElement, { target: { value: 'Test Name' } });

                        await waitFor(() => {
                                expect(inputElement.value).toBe('Test Name');
                        });
                });

                /*test('existing request: on input change, should not change value', async () => {
                        let mockUserInfo = {
                                id: 123,
                                name: "Mock User",
                                email: "test@gmail.com",
                                role: "USER",
                                picture: null,
                                dob: "2000-01-01",
                                uin: 123456789,
                                phone_number: 1001001001,
                        };

                        global.fetch = jest.fn((url) => {
                                if (url === '/api/checkRequests?userId=123') {
                                    return Promise.resolve({
                                        ok: true,
                                        json: () => Promise.resolve({ exists: true, request: {non_registered_userId: 123, documentation: false} }),
                                    });
                                } else if (url === '/api/getUserDocumentation?user_id=123') {
                                    return Promise.resolve({
                                        ok: true,
                                        json: () => Promise.resolve({ exists: false }),
                                    });
                                }else{
                                        console.log("OTHER CALL MADE: ", url);
                                }
                        });

                        const mockDisplayHeaderRef = { current: null };
                                const mockLastIntendedFocusRef = { current: null };
                              
                                await act(async () => {
                                  render(
                                    <UserAccommodations
                                      userInfo={mockUserInfo}
                                      setAlertMessage={mockSetAlertMessage}
                                      setShowAlert={mockSetShowAlert}
                                      displayHeaderRef={mockDisplayHeaderRef}
                                      lastIntendedFocusRef={mockLastIntendedFocusRef}
                                      settingsTabOpen={false}
                                    />
                                  );
                        });

                        const inputElement = screen.getByTestId('name');
                        fireEvent.change(inputElement, { target: { value: 'NOT Test Name' } });

                        await waitFor(() => {
                                expect(inputElement.value).not.toBe('Test Name');
                        });
                });*/
        }); 

        describe('new student application submit process', () => {
                describe('validateForm()', () => {
                        test('clicking submit button with valid values should change form data', async () => {
                                let mockUserInfo = {
                                        id: 123,
                                        name: "Mock User",
                                        email: "test@gmail.com",
                                        role: "USER",
                                        picture: null,
                                        dob: "2000-01-01",
                                        uin: 123456789,
                                        phone_number: 1001001001,
                                };
        
                                global.fetch = jest.fn((url) => {
                                        if (url === '/api/checkRequests?userId=123') {
                                            return Promise.resolve({
                                                ok: true,
                                                json: () => Promise.resolve({ exists: false }),
                                            });
                                        } else if (url === '/api/getUserDocumentation?user_id=123') {
                                            return Promise.resolve({
                                                ok: true,
                                                json: () => Promise.resolve({ exists: false }),
                                            });
                                        }else if (url === '/api/createRequest') {
                                                return Promise.resolve({
                                                    ok: true,
                                                    json: () => Promise.resolve({ success: true, request: {} }),
                                                });
                                        }else{
                                                console.log("OTHER CALL MADE: ", url);
                                        }
                                });
        
                                const mockDisplayHeaderRef = { current: null };
                                const mockLastIntendedFocusRef = { current: null };
                              
                                await act(async () => {
                                  render(
                                    <UserAccommodations
                                      userInfo={mockUserInfo}
                                      setAlertMessage={mockSetAlertMessage}
                                      setShowAlert={mockSetShowAlert}
                                      displayHeaderRef={mockDisplayHeaderRef}
                                      lastIntendedFocusRef={mockLastIntendedFocusRef}
                                      settingsTabOpen={false}
                                    />
                                  );
                                });
        
                                fireEvent.change(screen.getByTestId('name'), { target: { value: 'Test Name' } });
                                fireEvent.change(screen.getByTestId('email'), { target: { value: 'test@email.com' } });
                                fireEvent.change(screen.getByTestId('dob'), { target: { value: '2003-01-01' } });
                                fireEvent.change(screen.getByTestId('uin'), { target: { value: 123456789 } });
                                fireEvent.change(screen.getByTestId('phone_number'), { target: { value: 1234567890 } });
                                fireEvent.change(screen.getByTestId('disability'), { target: { value: 'disability' } });
                                fireEvent.change(screen.getByTestId('testing'), { target: { value: 'testing' } });
                                fireEvent.change(screen.getByTestId('inClass'), { target: { value: 'inClass' } });
                                fireEvent.change(screen.getByTestId('housing'), { target: { value: 'housing' } });
                                fireEvent.change(screen.getByTestId('sideEffect'), { target: { value: 'sideEffect' } });
                                fireEvent.change(screen.getByTestId('accommodations'), { target: { value: 'accommodations' } });
                                fireEvent.change(screen.getByTestId('pastAcc'), { target: { value: 'pastAcc' } });
                                const submitButton = screen.getByRole('button', { name: /Submit/i });
                                fireEvent.click(submitButton);
                                await waitFor(() => {
                                        expect(UserAccommodations.formData).toStrictEqual({
                                                name: "Test Name",
                                                email: 'test@email.com',
                                                dob: '2003-01-01',
                                                uin: 123456789,
                                                phone_number: '1234567890',
                                                disability: 'disability',
                                                testing: 'testing',
                                                inClass: 'inClass',
                                                housing: 'housing',
                                                sideEffect: 'sideEffect',
                                                accommodations: 'accommodations',
                                                pastAcc: 'pastAcc',
                                                file: null,
                                        });
                                });
                        });

                        test('clicking submit button with invalid values should NOT set formData', async () => {
                                let mockUserInfo = {
                                        id: 123,
                                        name: "Mock User",
                                        email: "test@gmail.com",
                                        role: "USER",
                                        picture: null,
                                        dob: "2000-01-01",
                                        uin: 123456789,
                                        phone_number: 1001001001,
                                };
        
                                global.fetch = jest.fn((url) => {
                                        if (url === '/api/checkRequests?userId=123') {
                                            return Promise.resolve({
                                                ok: true,
                                                json: () => Promise.resolve({ exists: false }),
                                            });
                                        } else if (url === '/api/getUserDocumentation?user_id=123') {
                                            return Promise.resolve({
                                                ok: true,
                                                json: () => Promise.resolve({ exists: false }),
                                            });
                                        }else{
                                                console.log("OTHER CALL MADE: ", url);
                                        }
                                });
        
                                const mockDisplayHeaderRef = { current: null };
                                const mockLastIntendedFocusRef = { current: null };
                              
                                await act(async () => {
                                  render(
                                    <UserAccommodations
                                      userInfo={mockUserInfo}
                                      setAlertMessage={mockSetAlertMessage}
                                      setShowAlert={mockSetShowAlert}
                                      displayHeaderRef={mockDisplayHeaderRef}
                                      lastIntendedFocusRef={mockLastIntendedFocusRef}
                                      settingsTabOpen={false}
                                    />
                                  );
                                });

                                const submitButton = screen.getByRole('button', { name: /Submit/i });
                                fireEvent.click(submitButton);
                                await waitFor(() => {
                                        expect(UserAccommodations.formData).toStrictEqual({
                                                name: "Mock User",
                                                email: "test@gmail.com",
                                                dob: '2000-01-01',
                                                uin: 123456789,
                                                phone_number: 1001001001,
                                                disability: '',
                                                testing: '',
                                                inClass: '',
                                                housing: '',
                                                sideEffect: '',
                                                accommodations: '',
                                                pastAcc: '',
                                                file: null
                                        });
                                });
                        });

                        test('clicking submit button with invalid values should setErrors', async () => {
                                let mockUserInfo = {
                                        id: 123,
                                        name: "Mock User",
                                        email: "test@gmail.com",
                                        role: "USER",
                                        picture: null,
                                        dob: "2000-01-01",
                                        uin: 123456789,
                                        phone_number: 1001001001,
                                };
        
                                global.fetch = jest.fn((url) => {
                                        if (url === '/api/checkRequests?userId=123') {
                                            return Promise.resolve({
                                                ok: true,
                                                json: () => Promise.resolve({ exists: false }),
                                            });
                                        } else if (url === '/api/getUserDocumentation?user_id=123') {
                                            return Promise.resolve({
                                                ok: true,
                                                json: () => Promise.resolve({ exists: false }),
                                            });
                                        }else{
                                                console.log("OTHER CALL MADE: ", url);
                                        }
                                });
        
                                const mockDisplayHeaderRef = { current: null };
                                const mockLastIntendedFocusRef = { current: null };
                              
                                await act(async () => {
                                  render(
                                    <UserAccommodations
                                      userInfo={mockUserInfo}
                                      setAlertMessage={mockSetAlertMessage}
                                      setShowAlert={mockSetShowAlert}
                                      displayHeaderRef={mockDisplayHeaderRef}
                                      lastIntendedFocusRef={mockLastIntendedFocusRef}
                                      settingsTabOpen={false}
                                    />
                                  );
                                });
                                act(() => {
                                        fireEvent.change(screen.getByTestId('name'), { target: { value: '' } });
                                        fireEvent.change(screen.getByTestId('email'), { target: { value: '' } });
                                        const submitButton = screen.getByRole('button', { name: /Submit/i });
                                        fireEvent.click(submitButton);
                                });

                                await waitFor(() => {
                                        expect(UserAccommodations.errors).toStrictEqual({
                                                email: "Email is required",
                                                name: "Name is required",
                                                notes: "Please answer all of the longform questions"
                                        });
                                });
                        });

                        test('clicking submit button with invalid values should display errors as alerts to user', async () => {
                                let mockUserInfo = {
                                        id: 123,
                                        name: "Mock User",
                                        email: "test@gmail.com",
                                        role: "USER",
                                        picture: null,
                                        dob: "2000-01-01",
                                        uin: 123456789,
                                        phone_number: 1001001001,
                                };
        
                                global.fetch = jest.fn((url) => {
                                        if (url === '/api/checkRequests?userId=123') {
                                            return Promise.resolve({
                                                ok: true,
                                                json: () => Promise.resolve({ exists: false }),
                                            });
                                        } else if (url === '/api/getUserDocumentation?user_id=123') {
                                            return Promise.resolve({
                                                ok: true,
                                                json: () => Promise.resolve({ exists: false }),
                                            });
                                        }else{
                                                console.log("OTHER CALL MADE: ", url);
                                        }
                                });
        
                                const mockDisplayHeaderRef = { current: null };
                                const mockLastIntendedFocusRef = { current: null };
                              
                                await act(async () => {
                                  render(
                                    <UserAccommodations
                                      userInfo={mockUserInfo}
                                      setAlertMessage={mockSetAlertMessage}
                                      setShowAlert={mockSetShowAlert}
                                      displayHeaderRef={mockDisplayHeaderRef}
                                      lastIntendedFocusRef={mockLastIntendedFocusRef}
                                      settingsTabOpen={false}
                                    />
                                  );
                                });

                                act(() => {
                                        fireEvent.change(screen.getByTestId('name'), { target: { value: '' } });
                                        fireEvent.change(screen.getByTestId('email'), { target: { value: '' } });
                                        const submitButton = screen.getByRole('button', { name: /Submit/i });
                                        fireEvent.click(submitButton);
                                });

                                await waitFor(() => {
                                        expect(mockSetAlertMessage).toHaveBeenCalledWith(
                                                expect.stringMatching(/(Incorrect required fields:|name is required|email is required|date of Birth is required|UIN must be 9 digits|Please enter a valid 10-digit phone number|Disability is required|Testing is required|InClass is required|Housing is required|SideEffect is required|accommodations is required|pastAcc is required)/)
                                        );
                                        expect(mockSetShowAlert).toHaveBeenCalledWith(true);
                                });
                        });

                        test('calling validateForm() with invalid form data should setErrors', async () => {
                                let mockUserInfo = {
                                        id: 123,
                                        name: "Mock User",
                                        email: "test@gmail.com",
                                        role: "USER",
                                        picture: null,
                                        dob: "2000-01-01",
                                        uin: 123456789,
                                        phone_number: 1001001001,
                                };
        
                                global.fetch = jest.fn((url) => {
                                        if (url === '/api/checkRequests?userId=123') {
                                            return Promise.resolve({
                                                ok: true,
                                                json: () => Promise.resolve({ exists: false }),
                                            });
                                        } else if (url === '/api/getUserDocumentation?user_id=123') {
                                            return Promise.resolve({
                                                ok: true,
                                                json: () => Promise.resolve({ exists: false }),
                                            });
                                        }else{
                                                console.log("OTHER CALL MADE: ", url);
                                        }
                                });
        
                                const mockDisplayHeaderRef = { current: null };
                                const mockLastIntendedFocusRef = { current: null };
                              
                                await act(async () => {
                                  render(
                                    <UserAccommodations
                                      userInfo={mockUserInfo}
                                      setAlertMessage={mockSetAlertMessage}
                                      setShowAlert={mockSetShowAlert}
                                      displayHeaderRef={mockDisplayHeaderRef}
                                      lastIntendedFocusRef={mockLastIntendedFocusRef}
                                      settingsTabOpen={false}
                                    />
                                  );
                                });

                                await act(async () => {
                                        UserAccommodations.setFormData({
                                                name: "",
                                                email: "",
                                                dob: '',
                                                uin: '',
                                                phoneNumber: '',
                                                disability: '',
                                                testing: '',
                                                inClass: '',
                                                housing: '',
                                                sideEffect: '',
                                                accommodations: '',
                                                pastAcc: '',
                                                file: null,
                                        });
                                        UserAccommodations.validateForm();
                                });

                                await act(async () => {
                                        UserAccommodations.validateForm();
                                });

                                await waitFor(() => {
                                        expect(UserAccommodations.errors).toStrictEqual({
                                                name: "Name is required",
                                                email: "Email is required",
                                                dob: "Date of Birth is required",
                                                uin: "UIN must be 9 digits",
                                                phone_number: "Please enter a valid 10-digit phone number",
                                                notes: "Please answer all of the longform questions",
                                        });
                                });
                        });
                });
                describe('if form is valid', () => {
                        test('calls /api/createRequest with correct attributes', async () => {
                                let mockUserInfo = {
                                        id: 123,
                                        name: "Mock User",
                                        email: "test@gmail.com",
                                        role: "USER",
                                        picture: null,
                                        dob: "2000-01-01",
                                        uin: 123456789,
                                        phone_number: 1001001001,
                                };
        
                                global.fetch = jest.fn((url) => {
                                        if (url === '/api/checkRequests?userId=123') {
                                            return Promise.resolve({
                                                ok: true,
                                                json: () => Promise.resolve({ exists: false }),
                                            });
                                        } else if (url === '/api/getUserDocumentation?user_id=123') {
                                            return Promise.resolve({
                                                ok: true,
                                                json: () => Promise.resolve({ exists: false }),
                                            });
                                        }else if (url === '/api/createRequest') {
                                                return Promise.resolve({
                                                    ok: true,
                                                    json: () => Promise.resolve({ success: true, request: {} }),
                                                });
                                        }
                                        else{
                                                console.log("OTHER CALL MADE: ", url);
                                        }
                                });
        
                                const mockDisplayHeaderRef = { current: null };
                                const mockLastIntendedFocusRef = { current: null };
                              
                                await act(async () => {
                                  render(
                                    <UserAccommodations
                                      userInfo={mockUserInfo}
                                      setAlertMessage={mockSetAlertMessage}
                                      setShowAlert={mockSetShowAlert}
                                      displayHeaderRef={mockDisplayHeaderRef}
                                      lastIntendedFocusRef={mockLastIntendedFocusRef}
                                      settingsTabOpen={false}
                                    />
                                  );
                                });

                                fireEvent.change(screen.getByTestId('name'), { target: { value: 'Test Name' } });
                                fireEvent.change(screen.getByTestId('email'), { target: { value: 'test@email.com' } });
                                fireEvent.change(screen.getByTestId('dob'), { target: { value: '2003-01-01' } });
                                fireEvent.change(screen.getByTestId('uin'), { target: { value: 123456789 } });
                                fireEvent.change(screen.getByTestId('phone_number'), { target: { value: 1234567890 } });
                                fireEvent.change(screen.getByTestId('disability'), { target: { value: 'disability' } });
                                fireEvent.change(screen.getByTestId('testing'), { target: { value: 'testing' } });
                                fireEvent.change(screen.getByTestId('inClass'), { target: { value: 'inClass' } });
                                fireEvent.change(screen.getByTestId('housing'), { target: { value: 'housing' } });
                                fireEvent.change(screen.getByTestId('sideEffect'), { target: { value: 'sideEffect' } });
                                fireEvent.change(screen.getByTestId('accommodations'), { target: { value: 'accommodations' } });
                                fireEvent.change(screen.getByTestId('pastAcc'), { target: { value: 'pastAcc' } });
                                const submitButton = screen.getByRole('button', { name: /Submit/i });
                                fireEvent.click(submitButton);
                                await waitFor(() => {
                                        expect(global.fetch).toHaveBeenCalledWith(
                                                '/api/createRequest',
                                                expect.objectContaining({
                                                  method: 'POST',
                                                  headers: { 'Content-Type': 'application/json' },
                                                  body: expect.stringMatching(/"userId":123.*"documentation":false.*"notes":".*".*"doc_url":null/),
                                                })
                                        );
                                });
                        });
                        describe('File upload', () => {
                                test('with file, form submission calls handleFileUpload', async () => {
                                        const file = new File(['dummy content'], 'example.pdf', { type: 'application/pdf' });
                                      
                                        const mockUserInfo = {
                                          id: 123,
                                          name: 'Mock User',
                                          email: 'test@gmail.com',
                                          role: 'USER',
                                          picture: null,
                                          dob: '2000-01-01',
                                          uin: 123456789,
                                          phone_number: 1001001001,
                                        };
                                      
                                        const mockHandleFileUpload = jest.fn();
                                        const mockSetAlertMessage = jest.fn();
                                        const mockSetShowAlert = jest.fn();
                                      
                                        global.fetch = jest.fn((url) => {
                                                if (url === '/api/submitDocumentation') {
                                                    return Promise.resolve({
                                                        ok: true,
                                                        json: () => Promise.resolve({ url: 'https://example.com/uploaded-file.pdf' }),
                                                    });
                                                } else if (url === '/api/checkRequests?userId=123') {
                                                    return Promise.resolve({
                                                        ok: true,
                                                        json: () => Promise.resolve({ exists: false }),
                                                    });
                                                } else if (url === '/api/getUserDocumentation?user_id=123') {
                                                    return Promise.resolve({
                                                        ok: true,
                                                        json: () => Promise.resolve({ exists: false }),
                                                    });
                                                }else if (url === '/api/createRequest') {
                                                        return Promise.resolve({
                                                            ok: true,
                                                            json: () => Promise.resolve({ success: true, request: {} }),
                                                        });
                                                    } else {
                                                    console.log('OTHER CALL MADE:', url);
                                                }
                                            });
                                            
                                      
                                            const mockDisplayHeaderRef = { current: null };
                                            const mockLastIntendedFocusRef = { current: null };
                                          
                                            await act(async () => {
                                              render(
                                                <UserAccommodations
                                                  userInfo={mockUserInfo}
                                                  setAlertMessage={mockSetAlertMessage}
                                                  setShowAlert={mockSetShowAlert}
                                                  displayHeaderRef={mockDisplayHeaderRef}
                                                  lastIntendedFocusRef={mockLastIntendedFocusRef}
                                                  settingsTabOpen={false}
                                                />
                                              );
                                            });
                                      
                                        fireEvent.change(screen.getByTestId('name'), { target: { value: 'Test Name' } });
                                        fireEvent.change(screen.getByTestId('email'), { target: { value: 'test@email.com' } });
                                        fireEvent.change(screen.getByTestId('dob'), { target: { value: '2003-01-01' } });
                                        fireEvent.change(screen.getByTestId('uin'), { target: { value: 123456789 } });
                                        fireEvent.change(screen.getByTestId('phone_number'), { target: { value: 1234567890 } });
                                        fireEvent.change(screen.getByTestId('disability'), { target: { value: 'disability' } });
                                        fireEvent.change(screen.getByTestId('testing'), { target: { value: 'testing' } });
                                        fireEvent.change(screen.getByTestId('inClass'), { target: { value: 'inClass' } });
                                        fireEvent.change(screen.getByTestId('housing'), { target: { value: 'housing' } });
                                        fireEvent.change(screen.getByTestId('sideEffect'), { target: { value: 'sideEffect' } });
                                        fireEvent.change(screen.getByTestId('accommodations'), { target: { value: 'accommodations' } });
                                        fireEvent.change(screen.getByTestId('pastAcc'), { target: { value: 'pastAcc' } });
                                      
                                        const fileInput = screen.getByTestId('uploadFile');
                                        fireEvent.change(fileInput, {
                                          target: {
                                            files: [file],
                                          },
                                        });
                                      
                                        fireEvent.click(screen.getByRole('button', { name: /Submit/i }));
                                      
                                        await waitFor(() => {
                                                expect(screen.getByTestId('uploadFile').files[0]).toBe(file);
                                                expect(UserAccommodations.formData.file).toBe(file);
                                        });
                                });  
                                
                                test('with file, form submission calls /api', async () => {
                                        const file = new File(['dummy content'], 'example.pdf', { type: 'application/pdf' });
                                      
                                        const mockUserInfo = {
                                          id: 123,
                                          name: 'Mock User',
                                          email: 'test@gmail.com',
                                          role: 'USER',
                                          picture: null,
                                          dob: '2000-01-01',
                                          uin: 123456789,
                                          phone_number: 1001001001,
                                        };
                                      
                                        const mockHandleFileUpload = jest.fn();
                                        const mockSetAlertMessage = jest.fn();
                                        const mockSetShowAlert = jest.fn();
                                      
                                        global.fetch = jest.fn((url) => {
                                                if (url === '/api/submitDocumentation') {
                                                    return Promise.resolve({
                                                        ok: true,
                                                        json: () => Promise.resolve({ url: 'https://example.com/uploaded-file.pdf' }),
                                                    });
                                                } else if (url === '/api/checkRequests?userId=123') {
                                                    return Promise.resolve({
                                                        ok: true,
                                                        json: () => Promise.resolve({ exists: false }),
                                                    });
                                                } else if (url === '/api/getUserDocumentation?user_id=123') {
                                                    return Promise.resolve({
                                                        ok: true,
                                                        json: () => Promise.resolve({ exists: false }),
                                                    });
                                                }else if (url === '/api/createRequest') {
                                                        return Promise.resolve({
                                                            ok: true,
                                                            json: () => Promise.resolve({ success: true, request: {} }),
                                                        });
                                                    } else {
                                                    console.log('OTHER CALL MADE:', url);
                                                }
                                        });
                                      
                                        const mockDisplayHeaderRef = { current: null };
                                const mockLastIntendedFocusRef = { current: null };
                              
                                await act(async () => {
                                  render(
                                    <UserAccommodations
                                      userInfo={mockUserInfo}
                                      setAlertMessage={mockSetAlertMessage}
                                      setShowAlert={mockSetShowAlert}
                                      displayHeaderRef={mockDisplayHeaderRef}
                                      lastIntendedFocusRef={mockLastIntendedFocusRef}
                                      settingsTabOpen={false}
                                    />
                                  );
                                });
                                      
                                        fireEvent.change(screen.getByTestId('name'), { target: { value: 'Test Name' } });
                                        fireEvent.change(screen.getByTestId('email'), { target: { value: 'test@email.com' } });
                                        fireEvent.change(screen.getByTestId('dob'), { target: { value: '2003-01-01' } });
                                        fireEvent.change(screen.getByTestId('uin'), { target: { value: 123456789 } });
                                        fireEvent.change(screen.getByTestId('phone_number'), { target: { value: 1234567890 } });
                                        fireEvent.change(screen.getByTestId('disability'), { target: { value: 'disability' } });
                                        fireEvent.change(screen.getByTestId('testing'), { target: { value: 'testing' } });
                                        fireEvent.change(screen.getByTestId('inClass'), { target: { value: 'inClass' } });
                                        fireEvent.change(screen.getByTestId('housing'), { target: { value: 'housing' } });
                                        fireEvent.change(screen.getByTestId('sideEffect'), { target: { value: 'sideEffect' } });
                                        fireEvent.change(screen.getByTestId('accommodations'), { target: { value: 'accommodations' } });
                                        fireEvent.change(screen.getByTestId('pastAcc'), { target: { value: 'pastAcc' } });
                                      
                                        const fileInput = screen.getByTestId('uploadFile');
                                        fireEvent.change(fileInput, {
                                          target: {
                                            files: [file],
                                          },
                                        });
                                      
                                        fireEvent.click(screen.getByRole('button', { name: /Submit/i }));
                                      
                                        await waitFor(() => {
                                                expect(global.fetch).toHaveBeenCalledWith(
                                                        "/api/submitDocumentation",
                                                        expect.objectContaining({
                                                          method: "POST",
                                                          body: expect.any(FormData),
                                                        })
                                                );
                                        });
                                }); 

                                test('error from handleFileUpload gives user error', async () => {
                                        const file = new File(['dummy content'], 'example.pdf', { type: 'application/pdf' });
                                      
                                        const mockUserInfo = {
                                          id: 123,
                                          name: 'Mock User',
                                          email: 'test@gmail.com',
                                          role: 'USER',
                                          picture: null,
                                          dob: '2000-01-01',
                                          uin: 123456789,
                                          phone_number: 1001001001,
                                        };
                                      
                                        const mockHandleFileUpload = jest.fn();
                                        const mockSetAlertMessage = jest.fn();
                                        const mockSetShowAlert = jest.fn();
                                      
                                        global.fetch = jest.fn((url) => {
                                                if (url === '/api/submitDocumentation') {
                                                    return Promise.resolve({
                                                        ok: true,
                                                        json: () => Promise.resolve({ error: "Internal Server Error" }),
                                                    });
                                                } else if (url === '/api/checkRequests?userId=123') {
                                                    return Promise.resolve({
                                                        ok: true,
                                                        json: () => Promise.resolve({ exists: false }),
                                                    });
                                                } else if (url === '/api/getUserDocumentation?user_id=123') {
                                                    return Promise.resolve({
                                                        ok: true,
                                                        json: () => Promise.resolve({ exists: false }),
                                                    });
                                                }else if (url === '/api/createRequest') {
                                                        return Promise.resolve({
                                                            ok: true,
                                                            json: () => Promise.resolve({ success: false }),
                                                        });
                                                    } else {
                                                    console.log('OTHER CALL MADE:', url);
                                                }
                                        });

                                        // error: "Internal Server Error"
                                      
                                        const mockDisplayHeaderRef = { current: null };
                                const mockLastIntendedFocusRef = { current: null };
                              
                                await act(async () => {
                                  render(
                                    <UserAccommodations
                                      userInfo={mockUserInfo}
                                      setAlertMessage={mockSetAlertMessage}
                                      setShowAlert={mockSetShowAlert}
                                      displayHeaderRef={mockDisplayHeaderRef}
                                      lastIntendedFocusRef={mockLastIntendedFocusRef}
                                      settingsTabOpen={false}
                                    />
                                  );
                                });
                                      
                                        fireEvent.change(screen.getByTestId('name'), { target: { value: 'Test Name' } });
                                        fireEvent.change(screen.getByTestId('email'), { target: { value: 'test@email.com' } });
                                        fireEvent.change(screen.getByTestId('dob'), { target: { value: '2003-01-01' } });
                                        fireEvent.change(screen.getByTestId('uin'), { target: { value: 123456789 } });
                                        fireEvent.change(screen.getByTestId('phone_number'), { target: { value: 1234567890 } });
                                        fireEvent.change(screen.getByTestId('disability'), { target: { value: 'disability' } });
                                        fireEvent.change(screen.getByTestId('testing'), { target: { value: 'testing' } });
                                        fireEvent.change(screen.getByTestId('inClass'), { target: { value: 'inClass' } });
                                        fireEvent.change(screen.getByTestId('housing'), { target: { value: 'housing' } });
                                        fireEvent.change(screen.getByTestId('sideEffect'), { target: { value: 'sideEffect' } });
                                        fireEvent.change(screen.getByTestId('accommodations'), { target: { value: 'accommodations' } });
                                        fireEvent.change(screen.getByTestId('pastAcc'), { target: { value: 'pastAcc' } });
                                      
                                        const fileInput = screen.getByTestId('uploadFile');
                                        fireEvent.change(fileInput, {
                                          target: {
                                            files: [file],
                                          },
                                        });
                                      
                                        fireEvent.click(screen.getByRole('button', { name: /Submit/i }));
                                      
                                        await waitFor(() => {
                                                expect(mockSetAlertMessage).toHaveBeenCalledWith("Request submission failed. Please try again.");
                                        });
                                }); 
                        });
                        describe('if valid api result from createRequest', () => {
                                test('alerts the user success', async () => {
                                        let mockUserInfo = {
                                                id: 123,
                                                name: "Mock User",
                                                email: "test@gmail.com",
                                                role: "USER",
                                                picture: null,
                                                dob: "2000-01-01",
                                                uin: 123456789,
                                                phone_number: 1001001001,
                                        };
                                        global.fetch = jest.fn().mockResolvedValue({
                                                ok: true,
                                                json: jest.fn().mockResolvedValueOnce({exists: false, message: "No request found"})
                                        }).mockResolvedValue({
                                                ok: true,
                                                status: 200,
                                                json: jest.fn().mockResolvedValue({ success: true, request: {} })
                                        });
        
                                        const mockDisplayHeaderRef = { current: null };
                                const mockLastIntendedFocusRef = { current: null };
                              
                                await act(async () => {
                                  render(
                                    <UserAccommodations
                                      userInfo={mockUserInfo}
                                      setAlertMessage={mockSetAlertMessage}
                                      setShowAlert={mockSetShowAlert}
                                      displayHeaderRef={mockDisplayHeaderRef}
                                      lastIntendedFocusRef={mockLastIntendedFocusRef}
                                      settingsTabOpen={false}
                                    />
                                  );
                                });

                                        fireEvent.change(screen.getByTestId('name'), { target: { value: 'Test Name' } });
                                        fireEvent.change(screen.getByTestId('email'), { target: { value: 'test@email.com' } });
                                        fireEvent.change(screen.getByTestId('dob'), { target: { value: '2003-01-01' } });
                                        fireEvent.change(screen.getByTestId('uin'), { target: { value: 123456789 } });
                                        fireEvent.change(screen.getByTestId('phone_number'), { target: { value: 1234567890 } });
                                        fireEvent.change(screen.getByTestId('disability'), { target: { value: 'disability' } });
                                        fireEvent.change(screen.getByTestId('testing'), { target: { value: 'testing' } });
                                        fireEvent.change(screen.getByTestId('inClass'), { target: { value: 'inClass' } });
                                        fireEvent.change(screen.getByTestId('housing'), { target: { value: 'housing' } });
                                        fireEvent.change(screen.getByTestId('sideEffect'), { target: { value: 'sideEffect' } });
                                        fireEvent.change(screen.getByTestId('accommodations'), { target: { value: 'accommodations' } });
                                        fireEvent.change(screen.getByTestId('pastAcc'), { target: { value: 'pastAcc' } });
                                        const submitButton = screen.getByRole('button', { name: /Submit/i });
                                        fireEvent.click(submitButton);

                                        await waitFor(() => {
                                                expect(global.fetch).toHaveBeenCalledWith(
                                                        '/api/createRequest',
                                                        expect.objectContaining({
                                                          method: 'POST',
                                                          headers: { 'Content-Type': 'application/json' },
                                                          body: expect.stringMatching(/"userId":123.*"documentation":false.*"notes":".*".*"doc_url":null/),
                                                        })
                                                );
                                                expect(mockSetAlertMessage).toHaveBeenCalledWith(
                                                        "Request submitted successfully"
                                                );
                                                expect(mockSetShowAlert).toHaveBeenCalledWith(true);
                                        });
                                });
                                /*test('calls checkRequests again', async () => {
                                        let mockUserInfo = {
                                                id: 123,
                                                name: "Mock User",
                                                email: "test@gmail.com",
                                                role: "USER",
                                                picture: null,
                                                dob: "2000-01-01",
                                                uin: 123456789,
                                                phone_number: 1001001001,
                                        };

                                        global.fetch = jest.fn().mockResolvedValue({
                                                ok: true,
                                                json: jest.fn().mockResolvedValueOnce({exists: false, message: "No request found"})
                                        }).mockResolvedValue({
                                                ok: true,
                                                status: 200,
                                                json: jest.fn().mockResolvedValue({ success: true, request: {} })
                                        }).mockResolvedValue({
                                                ok: true,
                                                json: jest.fn().mockResolvedValueOnce({exists: true, request: {}})
                                        });
        
                                        const mockDisplayHeaderRef = { current: null };
                                const mockLastIntendedFocusRef = { current: null };
                              
                                await act(async () => {
                                  render(
                                    <UserAccommodations
                                      userInfo={mockUserInfo}
                                      setAlertMessage={mockSetAlertMessage}
                                      setShowAlert={mockSetShowAlert}
                                      displayHeaderRef={mockDisplayHeaderRef}
                                      lastIntendedFocusRef={mockLastIntendedFocusRef}
                                      settingsTabOpen={false}
                                    />
                                  );
                                });

                                        fireEvent.change(screen.getByTestId('name'), { target: { value: 'Test Name' } });
                                        fireEvent.change(screen.getByTestId('email'), { target: { value: 'test@email.com' } });
                                        fireEvent.change(screen.getByTestId('dob'), { target: { value: '2003-01-01' } });
                                        fireEvent.change(screen.getByTestId('uin'), { target: { value: 123456789 } });
                                        fireEvent.change(screen.getByTestId('phone_number'), { target: { value: 1234567890 } });
                                        fireEvent.change(screen.getByTestId('disability'), { target: { value: 'disability' } });
                                        fireEvent.change(screen.getByTestId('testing'), { target: { value: 'testing' } });
                                        fireEvent.change(screen.getByTestId('inClass'), { target: { value: 'inClass' } });
                                        fireEvent.change(screen.getByTestId('housing'), { target: { value: 'housing' } });
                                        fireEvent.change(screen.getByTestId('sideEffect'), { target: { value: 'sideEffect' } });
                                        fireEvent.change(screen.getByTestId('accommodations'), { target: { value: 'accommodations' } });
                                        fireEvent.change(screen.getByTestId('pastAcc'), { target: { value: 'pastAcc' } });
                                        const submitButton = screen.getByRole('button', { name: /Submit/i });
                                        fireEvent.click(submitButton);
                                        await waitFor(() => {
                                                expect(global.fetch).toHaveBeenCalledWith('/api/checkRequests?userId=123');
                                        });
                                });*/
                                /*test('sets existing request', async () => {
                                        let mockUserInfo = {
                                                id: 123,
                                                name: "Mock User",
                                                email: "test@gmail.com",
                                                role: "USER",
                                                picture: null,
                                                dob: "2000-01-01",
                                                uin: 123456789,
                                                phone_number: 1001001001,
                                        };

                                        global.fetch = jest.fn().mockResolvedValue({
                                                ok: true,
                                                json: jest.fn().mockResolvedValueOnce({exists: false, message: "No request found"})
                                        }).mockResolvedValue({
                                                ok: true,
                                                status: 200,
                                                json: jest.fn().mockResolvedValue({ success: true, request: {
                                                        name: 'Test Name',
                                                        user_email: 'test@email.com',
                                                        dob: '2003-01-01',
                                                        uin: '123456789',
                                                        phone_number: '1234567890',
                                                        notes: 'disability\ntesting\ninClass\nhousing\nsideEffect\naccommodations\npastAcc'
                                                } })
                                        }).mockResolvedValue({
                                                ok: true,
                                                json: jest.fn().mockResolvedValueOnce({exists: true, request: {
                                                        name: 'Test Name',
                                                        user_email: 'test@email.com',
                                                        dob: '2003-01-01',
                                                        uin: '123456789',
                                                        phone_number: '1234567890',
                                                        notes: 'disability\ntesting\ninClass\nhousing\nsideEffect\naccommodations\npastAcc'
                                                }})
                                        });
        
                                        const mockDisplayHeaderRef = { current: null };
                                const mockLastIntendedFocusRef = { current: null };
                              
                                await act(async () => {
                                  render(
                                    <UserAccommodations
                                      userInfo={mockUserInfo}
                                      setAlertMessage={mockSetAlertMessage}
                                      setShowAlert={mockSetShowAlert}
                                      displayHeaderRef={mockDisplayHeaderRef}
                                      lastIntendedFocusRef={mockLastIntendedFocusRef}
                                      settingsTabOpen={false}
                                    />
                                  );
                                });

                                        fireEvent.change(screen.getByTestId('name'), { target: { value: 'Test Name' } });
                                        fireEvent.change(screen.getByTestId('email'), { target: { value: 'test@email.com' } });
                                        fireEvent.change(screen.getByTestId('dob'), { target: { value: '2003-01-01' } });
                                        fireEvent.change(screen.getByTestId('uin'), { target: { value: 123456789 } });
                                        fireEvent.change(screen.getByTestId('phone_number'), { target: { value: 1234567890 } });
                                        fireEvent.change(screen.getByTestId('disability'), { target: { value: 'disability' } });
                                        fireEvent.change(screen.getByTestId('testing'), { target: { value: 'testing' } });
                                        fireEvent.change(screen.getByTestId('inClass'), { target: { value: 'inClass' } });
                                        fireEvent.change(screen.getByTestId('housing'), { target: { value: 'housing' } });
                                        fireEvent.change(screen.getByTestId('sideEffect'), { target: { value: 'sideEffect' } });
                                        fireEvent.change(screen.getByTestId('accommodations'), { target: { value: 'accommodations' } });
                                        fireEvent.change(screen.getByTestId('pastAcc'), { target: { value: 'pastAcc' } });
                                        const submitButton = screen.getByRole('button', { name: /Submit/i });
                                        fireEvent.click(submitButton);
                                        await waitFor(() => {
                                                expect(UserAccommodations.existingRequest).toStrictEqual({
                                                        name: 'Test Name',
                                                        user_email: 'test@email.com',
                                                        dob: '2003-01-01',
                                                        uin: '123456789',
                                                        phone_number: '1234567890',
                                                        notes: 'disability\ntesting\ninClass\nhousing\nsideEffect\naccommodations\npastAcc'
                                                });
                                        });
                                });*/
                                /*test('changes view to existing request', async () => {
                                        let mockUserInfo = {
                                                id: 123,
                                                name: "Mock User",
                                                email: "test@gmail.com",
                                                role: "USER",
                                                picture: null,
                                                dob: "2000-01-01",
                                                uin: 123456789,
                                                phone_number: 1001001001,
                                        };

                                        global.fetch = jest.fn().mockResolvedValue({
                                                ok: true,
                                                json: jest.fn().mockResolvedValueOnce({exists: false, message: "No request found"})
                                        }).mockResolvedValue({
                                                ok: true,
                                                status: 200,
                                                json: jest.fn().mockResolvedValue({ success: true, request: {
                                                        name: 'Test Name',
                                                        user_email: 'test@email.com',
                                                        dob: '2003-01-01',
                                                        uin: '123456789',
                                                        phone_number: '1234567890',
                                                        notes: 'disability\ntesting\ninClass\nhousing\nsideEffect\naccommodations\npastAcc'
                                                } })
                                        }).mockResolvedValue({
                                                ok: true,
                                                json: jest.fn().mockResolvedValueOnce({exists: true, request: {
                                                        name: 'Test Name',
                                                        user_email: 'test@email.com',
                                                        dob: '2003-01-01',
                                                        uin: '123456789',
                                                        phone_number: '1234567890',
                                                        notes: 'disability\ntesting\ninClass\nhousing\nsideEffect\naccommodations\npastAcc'
                                                }})
                                        });
        
                                        const mockDisplayHeaderRef = { current: null };
                                const mockLastIntendedFocusRef = { current: null };
                              
                                await act(async () => {
                                  render(
                                    <UserAccommodations
                                      userInfo={mockUserInfo}
                                      setAlertMessage={mockSetAlertMessage}
                                      setShowAlert={mockSetShowAlert}
                                      displayHeaderRef={mockDisplayHeaderRef}
                                      lastIntendedFocusRef={mockLastIntendedFocusRef}
                                      settingsTabOpen={false}
                                    />
                                  );
                                });
                                        fireEvent.change(screen.getByTestId('name'), { target: { value: 'Test Name' } });
                                        fireEvent.change(screen.getByTestId('email'), { target: { value: 'test@email.com' } });
                                        fireEvent.change(screen.getByTestId('dob'), { target: { value: '2003-01-01' } });
                                        fireEvent.change(screen.getByTestId('uin'), { target: { value: 123456789 } });
                                        fireEvent.change(screen.getByTestId('phone_number'), { target: { value: 1234567890 } });
                                        fireEvent.change(screen.getByTestId('disability'), { target: { value: 'disability' } });
                                        fireEvent.change(screen.getByTestId('testing'), { target: { value: 'testing' } });
                                        fireEvent.change(screen.getByTestId('inClass'), { target: { value: 'inClass' } });
                                        fireEvent.change(screen.getByTestId('housing'), { target: { value: 'housing' } });
                                        fireEvent.change(screen.getByTestId('sideEffect'), { target: { value: 'sideEffect' } });
                                        fireEvent.change(screen.getByTestId('accommodations'), { target: { value: 'accommodations' } });
                                        fireEvent.change(screen.getByTestId('pastAcc'), { target: { value: 'pastAcc' } });
                                        const submitButton = screen.getByRole('button', { name: /Submit/i });
                                        fireEvent.click(submitButton);
                                        await waitFor(() => {
                                                expect(screen.queryByTestId('newStudentApp')).not.toBeInTheDocument();
                                                expect(screen.queryByTestId('existingRequest')).toBeInTheDocument();
                                        });
                                });*/
                        });
                        
                        describe('if NOT valid api result from createRequest', () => {
                                test('alerts the user of failure', async () => {

                                        let mockUserInfo = {
                                                id: 123,
                                                name: "Mock User",
                                                email: "test@gmail.com",
                                                role: "USER",
                                                picture: null,
                                                dob: "2000-01-01",
                                                uin: 123456789,
                                                phone_number: 1001001001,
                                        };

                                        global.fetch = jest.fn((url) => {
                                                if (url === '/api/submitDocumentation') {
                                                    return Promise.resolve({
                                                        ok: true,
                                                        json: () => Promise.resolve({ error: "Internal Server Error" }),
                                                    });
                                                } else if (url === '/api/checkRequests?userId=123') {
                                                    return Promise.resolve({
                                                        ok: true,
                                                        json: () => Promise.resolve({ exists: false }),
                                                    });
                                                } else if (url === '/api/getUserDocumentation?user_id=123') {
                                                    return Promise.resolve({
                                                        ok: true,
                                                        json: () => Promise.resolve({ exists: false }),
                                                    });
                                                }else if (url === '/api/createRequest') {
                                                        return Promise.resolve({
                                                            ok: true,
                                                            json: () => Promise.resolve({ error: "ERROR" }),
                                                        });
                                                    } else {
                                                    console.log('OTHER CALL MADE:', url);
                                                }
                                        });

        
                                        const mockDisplayHeaderRef = { current: null };
                                const mockLastIntendedFocusRef = { current: null };
                              
                                await act(async () => {
                                  render(
                                    <UserAccommodations
                                      userInfo={mockUserInfo}
                                      setAlertMessage={mockSetAlertMessage}
                                      setShowAlert={mockSetShowAlert}
                                      displayHeaderRef={mockDisplayHeaderRef}
                                      lastIntendedFocusRef={mockLastIntendedFocusRef}
                                      settingsTabOpen={false}
                                    />
                                  );
                                });
        
                                        fireEvent.change(screen.getByTestId('name'), { target: { value: 'Test Name' } });
                                        fireEvent.change(screen.getByTestId('email'), { target: { value: 'test@email.com' } });
                                        fireEvent.change(screen.getByTestId('dob'), { target: { value: '2003-01-01' } });
                                        fireEvent.change(screen.getByTestId('uin'), { target: { value: 123456789 } });
                                        fireEvent.change(screen.getByTestId('phone_number'), { target: { value: 1234567890 } });
                                        fireEvent.change(screen.getByTestId('disability'), { target: { value: 'disability' } });
                                        fireEvent.change(screen.getByTestId('testing'), { target: { value: 'testing' } });
                                        fireEvent.change(screen.getByTestId('inClass'), { target: { value: 'inClass' } });
                                        fireEvent.change(screen.getByTestId('housing'), { target: { value: 'housing' } });
                                        fireEvent.change(screen.getByTestId('sideEffect'), { target: { value: 'sideEffect' } });
                                        fireEvent.change(screen.getByTestId('accommodations'), { target: { value: 'accommodations' } });
                                        fireEvent.change(screen.getByTestId('pastAcc'), { target: { value: 'pastAcc' } });
                                        const submitButton = screen.getByRole('button', { name: /Submit/i });
                                        fireEvent.click(submitButton);

                                        await waitFor(() => {
                                                expect(mockSetAlertMessage).toHaveBeenCalledWith(
                                                        "Request submission failed. Please try again."
                                                );
                                                expect(mockSetShowAlert).toHaveBeenCalledWith(true);
                                        });
                                });
                        });
                });
                describe('if form is NOT valid', () => {
                        test('alerts user with errors', async () => {
                                let mockUserInfo = {
                                        id: 123,
                                        name: "Mock User",
                                        email: "test@gmail.com",
                                        role: "USER",
                                        picture: null,
                                        dob: "2000-01-01",
                                        uin: 123456789,
                                        phone_number: 1001001001,
                                };
                                global.fetch = jest.fn().mockResolvedValue({
                                        ok: true,
                                        json: jest.fn().mockResolvedValueOnce({exists: false, message: "No request found"})
                                });

                                const mockDisplayHeaderRef = { current: null };
                                const mockLastIntendedFocusRef = { current: null };
                              
                                await act(async () => {
                                  render(
                                    <UserAccommodations
                                      userInfo={mockUserInfo}
                                      setAlertMessage={mockSetAlertMessage}
                                      setShowAlert={mockSetShowAlert}
                                      displayHeaderRef={mockDisplayHeaderRef}
                                      lastIntendedFocusRef={mockLastIntendedFocusRef}
                                      settingsTabOpen={false}
                                    />
                                  );
                                });
                                act(() => {
                                        fireEvent.change(screen.getByTestId('name'), { target: { value: '' } });
                                        fireEvent.change(screen.getByTestId('email'), { target: { value: '' } });
                                        const submitButton = screen.getByRole('button', { name: /Submit/i });
                                        fireEvent.click(submitButton);
                                });
                                await waitFor(() => {
                                        expect(mockSetAlertMessage).toHaveBeenCalledWith(
                                                expect.stringMatching(/(Incorrect required fields:|name is required|email is required|date of Birth is required|UIN must be 9 digits|Please enter a valid 10-digit phone number|Disability is required|Testing is required|InClass is required|Housing is required|SideEffect is required|accommodations is required|pastAcc is required)/)
                                        );
                                        expect(mockSetShowAlert).toHaveBeenCalledWith(true);
                                });
                        });
                });

        }); 

        describe('cancel existing request process', () => {
                /*test('clicking cancel calls /api/cancelRequest with correct userId', async () => {
                        let mockUserInfo = {
                                id: 123,
                                name: "Mock User",
                                email: "test@gmail.com",
                                role: "USER",
                                picture: null,
                                dob: "2000-01-01",
                                uin: 123456789,
                                phone_number: 1001001001,
                        };

                        global.fetch = jest.fn((url) => {
                                if (url === '/api/checkRequests?userId=123') {
                                        console.log("CHECK REQUESTS WAS C");
                                    return Promise.resolve({
                                        ok: true,
                                        json: () => Promise.resolve({ exists: true, request: {
                                                non_registered_userId: 123,
                                                documentation: false,
                                                notes: 'disability\ntesting\ninClass\nhousing\nsideEffect\naccommodations\npastAcc'
                                        }}),
                                    });
                                }else if (url === '/api/getUserDocumentation?user_id=123') {
                                        console.log("GET USER DOC WAS C");
                                        return Promise.resolve({
                                            ok: true,
                                            json: () => Promise.resolve({ exists: false }),
                                        });
                                }else if (url === '/api/deleteForm') {
                                        return Promise.resolve({
                                            ok: true,
                                            json: () => Promise.resolve({ message: 'Form deleted successfully' }),
                                        });
                                }else if (url === '/api/cancelRequest') {
                                        return Promise.resolve({
                                            ok: true,
                                            json: () => Promise.resolve({ message: 'Request deleted successfully' }),
                                        });
                                }
                                else{
                                        console.log("OTHER CALL MADE: ", url);
                                }
                        });

                        const mockDisplayHeaderRef = { current: null };
                                const mockLastIntendedFocusRef = { current: null };
                              
                                await act(async () => {
                                  render(
                                    <UserAccommodations
                                      userInfo={mockUserInfo}
                                      setAlertMessage={mockSetAlertMessage}
                                      setShowAlert={mockSetShowAlert}
                                      displayHeaderRef={mockDisplayHeaderRef}
                                      lastIntendedFocusRef={mockLastIntendedFocusRef}
                                      settingsTabOpen={false}
                                    />
                                  );
                                });
                        

                        const cancelButton = await screen.findByTestId("cancelBtn");
                        fireEvent.click(cancelButton);

                        await waitFor(() => {
                                expect(global.fetch).toHaveBeenCalledWith(
                                        '/api/deleteForm',
                                        expect.objectContaining({
                                          method: 'POST',
                                          headers: { 'Content-Type': 'application/json' },
                                          body: expect.stringMatching(/"userId"\s*:\s*123.*"type"\s*:\s*"REGISTRATION_ELIGIBILITY"/),
                                        })
                                );
                        });
                });*/
                describe('correct response from /api/cancelRequest', () => {
                        /*test('alerts the user of success', async () => {
                                  let mockUserInfo = {
                                        id: 123,
                                        name: "Mock User",
                                        email: "test@gmail.com",
                                        role: "USER",
                                        picture: null,
                                        dob: "2000-01-01",
                                        uin: 123456789,
                                        phone_number: 1001001001,
                                };
        
                                global.fetch = jest.fn((url) => {
                                        if (url === '/api/checkRequests?userId=123') {
                                                console.log("CHECK REQUESTS WAS C");
                                            return Promise.resolve({
                                                ok: true,
                                                json: () => Promise.resolve({ exists: true, 
                                                        request: {
                                                          name: 'Test Name',
                                                          user_email: 'test@email.com',
                                                          dob: '2003-01-01',
                                                          uin: '123456789',
                                                          phone_number: '1234567890',
                                                          notes: 'disability\ntesting\ninClass\nhousing\nsideEffect\naccommodations\npastAcc',
                                                          has_documentation: true
                                                        }}),
                                            });
                                        }else if (url === '/api/getUserDocumentation?user_id=123') {
                                                console.log("GET USER DOC WAS C");
                                                return Promise.resolve({
                                                    ok: true,
                                                    json: () => Promise.resolve({ exists: false }),
                                                });
                                        }else if(url == '/api/deleteForm'){
                                                return Promise.resolve({
                                                        ok: true,
                                                        json: () => Promise.resolve({ message: 'Form deleted successfully' }),
                                                });
                                        }else if(url == '/api/cancelRequest'){
                                                return Promise.resolve({
                                                        ok: true,
                                                        json: () => Promise.resolve({ message: 'Request deleted successfully' }),
                                                });
                                        }
                                        else{
                                                console.log("OTHER CALL MADE: ", url);
                                        }
                                });
        
                                const mockDisplayHeaderRef = { current: null };
                                const mockLastIntendedFocusRef = { current: null };
                              
                                await act(async () => {
                                  render(
                                    <UserAccommodations
                                      userInfo={mockUserInfo}
                                      setAlertMessage={mockSetAlertMessage}
                                      setShowAlert={mockSetShowAlert}
                                      displayHeaderRef={mockDisplayHeaderRef}
                                      lastIntendedFocusRef={mockLastIntendedFocusRef}
                                      settingsTabOpen={false}
                                    />
                                  );
                                });
                                const cancelButton = await screen.findByTestId('cancelBtn');
                                fireEvent.click(cancelButton);
                              
                                await waitFor(() => {
                                  expect(mockSetAlertMessage).toHaveBeenCalledWith("Request cancelled successfully!");
                                  expect(mockSetShowAlert).toHaveBeenCalledWith(true);
                                });
                        });*/
                
                        /*test('sets the existing request as null', async () => {
                                let mockUserInfo = {
                                        id: 123,
                                        name: "Mock User",
                                        email: "test@gmail.com",
                                        role: "USER",
                                        picture: null,
                                        dob: "2000-01-01",
                                        uin: 123456789,
                                        phone_number: 1001001001,
                                };
        
                                global.fetch = jest.fn((url) => {
                                        if (url === '/api/checkRequests?userId=123') {
                                                console.log("CHECK REQUESTS WAS C");
                                            return Promise.resolve({
                                                ok: true,
                                                json: () => Promise.resolve({ exists: true, 
                                                        request: {
                                                          name: 'Test Name',
                                                          user_email: 'test@email.com',
                                                          dob: '2003-01-01',
                                                          uin: '123456789',
                                                          phone_number: '1234567890',
                                                          notes: 'disability\ntesting\ninClass\nhousing\nsideEffect\naccommodations\npastAcc',
                                                          has_documentation: true
                                                        }}),
                                            });
                                        }else if (url === '/api/getUserDocumentation?user_id=123') {
                                                console.log("GET USER DOC WAS C");
                                                return Promise.resolve({
                                                    ok: true,
                                                    json: () => Promise.resolve({ exists: false }),
                                                });
                                        }else if(url == '/api/deleteForm'){
                                                return Promise.resolve({
                                                        ok: true,
                                                        json: () => Promise.resolve({ message: 'Form deleted successfully' }),
                                                });
                                        }else if(url == '/api/cancelRequest'){
                                                return Promise.resolve({
                                                        ok: true,
                                                        json: () => Promise.resolve({ message: 'Request deleted successfully' }),
                                                });
                                        }
                                        else{
                                                console.log("OTHER CALL MADE: ", url);
                                        }
                                });
        
                                const mockDisplayHeaderRef = { current: null };
                                const mockLastIntendedFocusRef = { current: null };
                              
                                await act(async () => {
                                  render(
                                    <UserAccommodations
                                      userInfo={mockUserInfo}
                                      setAlertMessage={mockSetAlertMessage}
                                      setShowAlert={mockSetShowAlert}
                                      displayHeaderRef={mockDisplayHeaderRef}
                                      lastIntendedFocusRef={mockLastIntendedFocusRef}
                                      settingsTabOpen={false}
                                    />
                                  );
                                });
                                const cancelButton = await screen.findByTestId('cancelBtn');
                                fireEvent.click(cancelButton);

                                await waitFor(() => {
                                        expect(UserAccommodations.existingRequest).toEqual(null);
                                });
                        });*/
                        /*test('changes to new student application', async () => {
                                let mockUserInfo = {
                                        id: 123,
                                        name: "Mock User",
                                        email: "test@gmail.com",
                                        role: "USER",
                                        picture: null,
                                        dob: "2000-01-01",
                                        uin: 123456789,
                                        phone_number: 1001001001,
                                };
        
                                global.fetch = jest.fn((url) => {
                                        if (url === '/api/checkRequests?userId=123') {
                                                console.log("CHECK REQUESTS WAS C");
                                            return Promise.resolve({
                                                ok: true,
                                                json: () => Promise.resolve({ exists: true, 
                                                        request: {
                                                          name: 'Test Name',
                                                          user_email: 'test@email.com',
                                                          dob: '2003-01-01',
                                                          uin: '123456789',
                                                          phone_number: '1234567890',
                                                          notes: 'disability\ntesting\ninClass\nhousing\nsideEffect\naccommodations\npastAcc',
                                                          has_documentation: true
                                                        }}),
                                            });
                                        }else if (url === '/api/getUserDocumentation?user_id=123') {
                                                console.log("GET USER DOC WAS C");
                                                return Promise.resolve({
                                                    ok: true,
                                                    json: () => Promise.resolve({ exists: false }),
                                                });
                                        }else if(url == '/api/deleteForm'){
                                                return Promise.resolve({
                                                        ok: true,
                                                        json: () => Promise.resolve({ message: 'Form deleted successfully' }),
                                                });
                                        }else if(url == '/api/cancelRequest'){
                                                return Promise.resolve({
                                                        ok: true,
                                                        json: () => Promise.resolve({ message: 'Request deleted successfully' }),
                                                });
                                        }
                                        else{
                                                console.log("OTHER CALL MADE: ", url);
                                        }
                                });
        
                                const mockDisplayHeaderRef = { current: null };
                                const mockLastIntendedFocusRef = { current: null };
                              
                                await act(async () => {
                                  render(
                                    <UserAccommodations
                                      userInfo={mockUserInfo}
                                      setAlertMessage={mockSetAlertMessage}
                                      setShowAlert={mockSetShowAlert}
                                      displayHeaderRef={mockDisplayHeaderRef}
                                      lastIntendedFocusRef={mockLastIntendedFocusRef}
                                      settingsTabOpen={false}
                                    />
                                  );
                                });
                                const cancelButton = await screen.findByTestId('cancelBtn');
                                fireEvent.click(cancelButton);
                                await waitFor(() => {
                                        expect(screen.queryByTestId('newStudentApp')).toBeInTheDocument();
                                        expect(screen.queryByTestId('existingRequest')).not.toBeInTheDocument();
                                });
                        });*/
                }); 
                describe('NOT correct response from /api/cancelRequest', () => {
                        /*test('alerts the user of failure', async () => {
                                let mockUserInfo = {
                                    id: 123,
                                    name: "Mock User",
                                    email: "test@gmail.com",
                                    role: "USER",
                                    picture: null,
                                    dob: "2000-01-01",
                                    uin: 123456789,
                                    phone_number: 1001001001,
                                };
                            
                                global.fetch = jest.fn((url) => {
                                    if (url === '/api/cancelRequest') {
                                        return Promise.resolve({
                                            ok: true,
                                            json: () => Promise.resolve({ error: "Cancellation failed" }),
                                        });
                                    } else {
                                        console.log("OTHER CALL MADE:", url);
                                    }
                                });
                            
                                const mockDisplayHeaderRef = { current: null };
                                const mockLastIntendedFocusRef = { current: null };
                              
                                await act(async () => {
                                  render(
                                    <UserAccommodations
                                      userInfo={mockUserInfo}
                                      setAlertMessage={mockSetAlertMessage}
                                      setShowAlert={mockSetShowAlert}
                                      displayHeaderRef={mockDisplayHeaderRef}
                                      lastIntendedFocusRef={mockLastIntendedFocusRef}
                                      settingsTabOpen={false}
                                    />
                                  );
                                });
                            
                                const cancelButton = await screen.findByTestId('cancelBtn');
                                fireEvent.click(cancelButton);
                            
                                await waitFor(() => {
                                    expect(mockSetAlertMessage).toHaveBeenCalledWith(
                                        "Request cancellation failed. Please try again."
                                    );
                                    expect(mockSetShowAlert).toHaveBeenCalledWith(true);
                                });
                            
                                // Test that the `cancelRequest` function throws an error
                                await expect(cancelRequest()).rejects.toThrow("Cancellation failed");
                            });*/
                            
                }); 
        }); 
});