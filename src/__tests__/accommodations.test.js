import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import {Accommodations} from '../accommodations.js';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

global.fetch = jest.fn();

describe('accommodations', () => {
        const mockSetAlertMessage = jest.fn();
        const mockSetShowAlert = jest.fn();
        beforeEach(() => {
                jest.clearAllMocks();
                global.fetch = jest.fn(() =>
                  Promise.resolve({
                    json: () => Promise.resolve({ some: 'data' }),
                  })
                );
        });

        test('Accommodations should have no accessibility violations', async () => {
                global.fetch = jest.fn((url) => {
                        if (url === '/api/checkRequests?userId=123') {
                            return Promise.resolve({
                                ok: true,
                                json: () => Promise.resolve({ exists: false, message: "No request found" }),
                            });
                        }else{
                            console.log("OTHER API ROUTE");
                        }
                });
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
                const mockSetAlertMessage = jest.fn();
                const mockSetShowAlert = jest.fn();
                const mockDisplayHeaderRef = { current: null };
                const mockLastIntendedFocusRef = { current: null };
                let container;
                await act(async () => {
                        const rendered = render(
                    <Accommodations
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


        test('renders user UserAccommodations if userType is user', async () => {
                global.fetch = jest.fn((url) => {
                        if (url === '/api/checkRequests?userId=123') {
                            return Promise.resolve({
                                ok: true,
                                json: () => Promise.resolve({ exists: false, message: "No request found" }),
                            });
                        }else{
                            console.log("OTHER API ROUTE");
                        }
                });
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
                const mockSetAlertMessage = jest.fn();
                const mockSetShowAlert = jest.fn();
                const mockDisplayHeaderRef = { current: null };
                const mockLastIntendedFocusRef = { current: null };
              
                await act(async () => {
                  render(
                    <Accommodations
                      userInfo={mockUserInfo}
                      setAlertMessage={mockSetAlertMessage}
                      setShowAlert={mockSetShowAlert}
                      displayHeaderRef={mockDisplayHeaderRef}
                      lastIntendedFocusRef={mockLastIntendedFocusRef}
                      settingsTabOpen={false}
                    />
                  );
                });

                expect(screen.queryByTestId('basicAccommodations')).toBeInTheDocument();
        });

        test('On render, student type role calls /api/getStudentData', async () => {
                const mockUserInfo = {
                  id: 123,
                  name: "Mock User",
                  email: "test@gmail.com",
                  role: "STUDENT",
                  picture: null,
                  dob: "2000-01-01",
                  uin: 123456789,
                  phone_number: 1001001001,
                };
              
                const mockSetAlertMessage = jest.fn();
                const mockSetShowAlert = jest.fn();
                const mockDisplayHeaderRef = { current: null };
                const mockLastIntendedFocusRef = { current: null };
              
                await act(async () => {
                  render(
                    <Accommodations
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
                  expect(global.fetch).toHaveBeenCalledWith('/api/getStudentData?userId=123');
                });
        });

        test('Does not call /api/getStudentData if role is not STUDENT', async () => {
                global.fetch = jest.fn((url) => {
                        if (url === '/api/checkRequests?userId=123') {
                            return Promise.resolve({
                                ok: true,
                                json: () => Promise.resolve({ exists: false, message: "No request found" }),
                            });
                        }else{
                            console.log("OTHER API ROUTE");
                        }
                });
                const mockUserInfo = {
                  id: 123,
                  role: "USER", // Not student
                };
              
                const mockSetAlertMessage = jest.fn();
                const mockSetShowAlert = jest.fn();
                const mockDisplayHeaderRef = { current: null };
                const mockLastIntendedFocusRef = { current: null };
              
                await act(async () => {
                  render(
                    <Accommodations
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
                        const getStudentCalls = global.fetch.mock.calls.filter(call =>
                          call[0].includes('/api/getStudentData')
                        );
                        expect(getStudentCalls.length).toBe(0);
                });
        });

        test('Logs error and disables loading on fetch failure', async () => {
                const mockUserInfo = { id: 123, role: 'STUDENT' };
                const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
              
                global.fetch.mockRejectedValueOnce(new Error("Fetch failed"));
              
                const mockSetAlertMessage = jest.fn();
                const mockSetShowAlert = jest.fn();
                const mockDisplayHeaderRef = { current: null };
                const mockLastIntendedFocusRef = { current: null };
              
                await act(async () => {
                  render(
                    <Accommodations
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
                  expect(consoleSpy).toHaveBeenCalledWith(
                    'Failed to fetch student data',
                    expect.any(Error)
                  );
                });
              
                consoleSpy.mockRestore();
        });
});