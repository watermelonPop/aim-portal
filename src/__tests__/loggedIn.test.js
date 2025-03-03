import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { App } from '../App.js';

global.fetch = jest.fn();

describe('App', () => {
        beforeEach(() => {
                jest.clearAllMocks();
        });
        describe('loggedIn set to true', () => {
                test('renders basic view', async () => {
                        // Mock the fetch call for setSettingsDatabase
                        global.fetch.mockResolvedValueOnce({
                          ok: true,
                          json: () => Promise.resolve({ success: true })
                        });
                    
                        act(() => {
                          render(<App />);
                        });
                    
                        await act(async () => {
                          await App.setLoggedIn(true);
                        });
                    
                        await waitFor(() => {
                          expect(screen.queryByTestId('basicScreen')).toBeInTheDocument();
                        });
                    
                        // Optionally, you can assert that fetch was called with the correct arguments
                        //expect(global.fetch).toHaveBeenCalledWith('/api/setSettings', expect.any(Object));
                });
                      

                test('renders basicHeader', async () => {
                        global.fetch.mockResolvedValueOnce({
                                ok: true,
                                json: () => Promise.resolve({ success: true })
                        });
                        act(() => {
                                render(<App />);
                        });
                        await act(async () => {
                                await App.setLoggedIn(true);
                        });
                        await waitFor(() => {
                                expect(screen.queryByTestId('basicHeader')).toBeInTheDocument();
                        });
                });

                test('by default, userType = User, renders basicTabNav, with the correct User tabs', async () => {
                        global.fetch.mockResolvedValueOnce({
                                ok: true,
                                json: () => Promise.resolve({ success: true })
                        });
                        act(() => {
                                render(<App />);
                        });
                        await act(async () => {
                                await App.setLoggedIn(true);
                                await App.setUserInfo({name: "example", email: "example@example.com"});
                        });

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
                        global.fetch.mockResolvedValueOnce({
                                ok: true,
                                json: () => Promise.resolve({ success: true })
                        });
                        
                        act(() => {
                                render(<App />);
                        });
                        await act(async () => {
                                await App.setLoggedIn(true);
                                await App.setUserType("Student");
                        });

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
                        global.fetch.mockResolvedValueOnce({
                                ok: true,
                                json: () => Promise.resolve({ success: true })
                        });
                        
                        act(() => {
                                render(<App />);
                        });
                        await act(async () => {
                                await App.setLoggedIn(true);
                                await App.setUserType("Professor");
                        });

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
                        global.fetch.mockResolvedValueOnce({
                                ok: true,
                                json: () => Promise.resolve({ success: true })
                        });
                        
                        act(() => {
                                render(<App />);
                        });
                        await act(async () => {
                                await App.setLoggedIn(true);
                                await App.setUserType("Staff");
                        });

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