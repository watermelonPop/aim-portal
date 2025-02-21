import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { App, BasicView, BasicTabNav, BasicHeader } from '../App.js';

global.fetch = jest.fn();

describe('App', () => {

        const mockStaff = {
                
        };
        
        beforeEach(() => {
                jest.clearAllMocks();
        });
        describe('loggedIn set to true', () => {
                test('renders basic view', async () => {
                        act(() => {
                                render(<App />);
                        });
                        const result = await App.setLoggedIn(true);
                        await waitFor(() => {
                                expect(screen.queryByTestId('basicScreen')).toBeInTheDocument();
                        });
                });

                test('renders basicHeader', async () => {
                        act(() => {
                                render(<App />);
                        });
                        const result = await App.setLoggedIn(true);
                        await waitFor(() => {
                                expect(screen.queryByTestId('basicHeader')).toBeInTheDocument();
                        });
                });

                test('by default, userType = User, renders basicTabNav, with the correct User tabs', async () => {
                        act(() => {
                                render(<App />);
                        });
                        const result2 = await App.setLoggedIn(true);

                        await waitFor(() => {
                                const basicTN = screen.getByTestId('basicTabNav');
                                expect(basicTN).toBeInTheDocument();

                                expect(basicTN).toHaveTextContent('Dashboard');
                                expect(basicTN).toHaveTextContent('Profile');
                                expect(basicTN).toHaveTextContent('Accommodations');
                                expect(basicTN).toHaveTextContent('Forms');
                        });
                });

                test('Student View renders basicTabNav, with the correct Student tabs', async () => {
                        await act(async () => {
                                render(<App />);
                        });
                        const result = await App.setUserType("Student");
                        const result2 = await App.setLoggedIn(true);

                        await waitFor(() => {
                                const basicTN = screen.getByTestId('basicTabNav');
                                expect(basicTN).toBeInTheDocument();

                                expect(basicTN).toHaveTextContent('Dashboard');
                                expect(basicTN).toHaveTextContent('Profile');
                                expect(basicTN).toHaveTextContent('Accommodations');
                                expect(basicTN).toHaveTextContent('Forms');
                                expect(basicTN).toHaveTextContent('Testing');
                                expect(basicTN).toHaveTextContent('Note Taking');
                        });
                });

                test('Professor View renders basicTabNav, with the correct Professor tabs', async () => {
                        await act(async () => {
                                render(<App />);
                        });
                        const result = await App.setUserType("Professor");
                        const result2 = await App.setLoggedIn(true);

                        await waitFor(() => {
                                const basicTN = screen.getByTestId('basicTabNav');
                                expect(basicTN).toBeInTheDocument();

                                expect(basicTN).toHaveTextContent('Dashboard');
                                expect(basicTN).toHaveTextContent('Profile');
                                expect(basicTN).toHaveTextContent('Accommodations');
                                expect(basicTN).toHaveTextContent('Testing');
                                expect(basicTN).toHaveTextContent('Note Taking');
                        });
                });

                test('Staff View renders basicTabNav, with the correct Staff tabs', async () => {
                        await act(async () => {
                                render(<App />);
                        });
                        const result = await App.setUserType("Staff");
                        const result2 = await App.setLoggedIn(true);

                        await waitFor(() => {
                                const basicTN = screen.getByTestId('basicTabNav');
                                expect(basicTN).toBeInTheDocument();

                                expect(basicTN).toHaveTextContent('Dashboard');
                                expect(basicTN).toHaveTextContent('Profile');
                                expect(basicTN).toHaveTextContent('Forms');
                        });
                });
        });
});