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
                const { container } = render(<Accommodations userInfo={mockUserInfo} setAlertMessage={mockSetAlertMessage} setShowAlert={mockSetShowAlert}/>);
                const results = await axe(container);
                expect(results).toHaveNoViolations();
        });


        test('renders user UserAccommodations if userType is user', async () => {
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
                act(() => {
                        render(<Accommodations userInfo={mockUserInfo} setAlertMessage={mockSetAlertMessage} setShowAlert={mockSetShowAlert}/>);
                });

                expect(screen.queryByTestId('basicAccommodations')).toBeInTheDocument();
        });

        test('On render, student type role calls /api/getStudentData', async () => {
                let mockUserInfo = {
                        id: 123,
                        name: "Mock User",
                        email: "test@gmail.com",
                        role: "STUDENT",
                        picture: null,
                        dob: "2000-01-01",
                        uin: 123456789,
                        phone_number: 1001001001,
                };
                act(() => {
                        render(<Accommodations userInfo={mockUserInfo} setAlertMessage={mockSetAlertMessage} setShowAlert={mockSetShowAlert}/>);
                });

                await waitFor(() => {
                        expect(global.fetch).toHaveBeenCalledWith('/api/getStudentData?userId=123');
                });
        });

        test('Does not call /api/getStudentData if role is not STUDENT', async () => {
                const mockUserInfo = {
                  id: 123,
                  role: "USER", // Not student
                };
              
                await act(async () => {
                  render(<Accommodations userInfo={mockUserInfo} setAlertMessage={mockSetAlertMessage} setShowAlert={mockSetShowAlert} />);
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
              
                await act(async () => {
                  render(<Accommodations userInfo={mockUserInfo} setAlertMessage={mockSetAlertMessage} setShowAlert={mockSetShowAlert} />);
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