import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { App } from '../App.js';
import { axe, toHaveNoViolations } from 'jest-axe';
import LoginScreen from '../loginScreen.js';

expect.extend(toHaveNoViolations);

const mockSetSettings = jest.fn(); 
const mockSetStaffAccess = jest.fn(); 
const mockSetUserInfo = jest.fn(); 
const mockSetLoading = jest.fn(); 
const mockSetLoggedIn = jest.fn();

global.fetch = jest.fn();

describe('App', () => {
        beforeEach(() => {
                jest.clearAllMocks();
        });
        
        describe('loggedIn set to true', () => {
                test('renders sign up', async () => {
                        // Mock the fetch call for setSettingsDatabase
                        global.fetch = jest.fn((url) => {
                                if (url === '/api/accountConnected?userId=123') {
                                    return Promise.resolve({
                                        ok: true,
                                        json: () => Promise.resolve({ exists: false }),
                                    });
                                }else if (url === '/api/checkAccount') {
                                    return Promise.resolve({
                                        ok: true,
                                        json: () => Promise.resolve({ exists: true, user_info: {id: 123}}),
                                    });
                                }else{
                                    //console.log("OTHER API ROUTE");
                                }
                        });
                    
                        act(() => {
                          render(<App />);
                        });
                    
                        await act(async () => {
                                await App.setUserInfo({id: 123});
                                await App.setLoggedIn(true);
                        });
                    
                        await waitFor(() => {
                          expect(screen.queryByTestId('sign-up-screen')).toBeInTheDocument();
                        });
                });

                test('renders basic view if account is connected', async () => {
                        // Mock the fetch call for setSettingsDatabase
                        global.fetch = jest.fn((url) => {
                                if (url === '/api/accountConnected?userId=123') {
                                    return Promise.resolve({
                                        ok: true,
                                        json: () => Promise.resolve({ exists: true }),
                                    });
                                }else if (url === '/api/checkAccount') {
                                    return Promise.resolve({
                                        ok: true,
                                        json: () => Promise.resolve({ exists: true, user_info: {id: 123}}),
                                    });
                                }else{
                                    //console.log("OTHER API ROUTE");
                                }
                        });
                    
                        act(() => {
                          render(<App />);
                        });
                    
                        await act(async () => {
                                await App.setUserInfo({id: 123});
                                await App.setLoggedIn(true);
                        });
                    
                    
                        await waitFor(() => {
                          expect(screen.queryByTestId('basicScreen')).toBeInTheDocument();
                        });
                });
                      

                test('renders basicHeader if account is connected', async () => {
                        global.fetch = jest.fn((url) => {
                                if (url === '/api/accountConnected?userId=123') {
                                    return Promise.resolve({
                                        ok: true,
                                        json: () => Promise.resolve({ exists: true }),
                                    });
                                }else if (url === '/api/checkAccount') {
                                    return Promise.resolve({
                                        ok: true,
                                        json: () => Promise.resolve({ exists: true, user_info: {id: 123}}),
                                    });
                                }else{
                                    //console.log("OTHER API ROUTE");
                                }
                        });
                    
                        act(() => {
                          render(<App />);
                        });
                    
                        await act(async () => {
                                await App.setUserInfo({id: 123});
                                await App.setLoggedIn(true);
                        });

                        await waitFor(() => {
                                expect(screen.queryByTestId('basicHeader')).toBeInTheDocument();
                        });
                });

                test('by default, userType = User, renders basicTabNav, with the correct User tabs', async () => {
                        global.fetch = jest.fn((url) => {
                                if (url === '/api/accountConnected?userId=123') {
                                    return Promise.resolve({
                                        ok: true,
                                        json: () => Promise.resolve({ exists: true }),
                                    });
                                }else if (url === '/api/checkAccount') {
                                    return Promise.resolve({
                                        ok: true,
                                        json: () => Promise.resolve({ exists: true, user_info: {id: 123}}),
                                    });
                                }else{
                                    //console.log("OTHER API ROUTE");
                                }
                        });
                    
                        act(() => {
                          render(<App />);
                        });
                    
                        await act(async () => {
                                await App.setUserInfo({id: 123});
                                await App.setLoggedIn(true);
                                await App.setUserConnected(true);
                                await App.setTabs([{name: 'Dashboard', elem: null},
                                        {name: 'Accommodations', elem: null},
                                        {name: 'Forms', elem: null},
                                        {name: 'Profile', elem: null}]);
                        });
                          
                        await waitFor(() => {
                                expect(screen.queryByTestId('basicTabNav')).toBeInTheDocument();
                                expect(screen.queryByTestId('basicTabNav')).toHaveTextContent("Dashboard");
                                expect(screen.queryByTestId('basicTabNav')).toHaveTextContent("Profile");
                                expect(screen.queryByTestId('basicTabNav')).toHaveTextContent("Accommodations");
                                expect(screen.queryByTestId('basicTabNav')).toHaveTextContent("Forms");
                        });
                });

                test('Student View renders basicTabNav, with the correct Student tabs', async () => {
                        global.fetch = jest.fn((url) => {
                                if (url === '/api/accountConnected?userId=123') {
                                    return Promise.resolve({
                                        ok: true,
                                        json: () => Promise.resolve({ exists: true }),
                                    });
                                }else if (url === '/api/checkAccount') {
                                    return Promise.resolve({
                                        ok: true,
                                        json: () => Promise.resolve({ exists: true, user_info: {id: 123}}),
                                    });
                                }else{
                                    //console.log("OTHER API ROUTE");
                                }
                        });
                    
                        act(() => {
                          render(<App />);
                        });
                    
                        await act(async () => {
                                await App.setUserInfo({id: 123});
                                await App.setLoggedIn(true);
                                await App.setUserConnected(true);
                                await App.setTabs([{name: 'Dashboard', elem: null},
                                        {name: 'Accommodations', elem: null},
                                        {name: 'Forms', elem: null},
                                        {name: 'Profile', elem: null}, {name: 'Testing', elem: null}, {name: 'Note Taking', elem: null}]);
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
                        global.fetch = jest.fn((url) => {
                                if (url === '/api/accountConnected?userId=123') {
                                    return Promise.resolve({
                                        ok: true,
                                        json: () => Promise.resolve({ exists: true }),
                                    });
                                }else if (url === '/api/checkAccount') {
                                    return Promise.resolve({
                                        ok: true,
                                        json: () => Promise.resolve({ exists: true, user_info: {id: 123}}),
                                    });
                                }else{
                                    //console.log("OTHER API ROUTE");
                                }
                        });
                    
                        act(() => {
                          render(<App />);
                        });
                    
                        await act(async () => {
                                await App.setUserInfo({id: 123});
                                await App.setLoggedIn(true);
                                await App.setUserConnected(true);
                                await App.setTabs([{name: 'Dashboard', elem: null},
                                        {name: 'Accommodations', elem: null},
                                        {name: 'Profile', elem: null}, {name: 'Testing', elem: null}, {name: 'Note Taking', elem: null}]);
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
                        global.fetch = jest.fn((url) => {
                                if (url === '/api/accountConnected?userId=123') {
                                    return Promise.resolve({
                                        ok: true,
                                        json: () => Promise.resolve({ exists: true }),
                                    });
                                }else if (url === '/api/checkAccount') {
                                    return Promise.resolve({
                                        ok: true,
                                        json: () => Promise.resolve({ exists: true, user_info: {id: 123}}),
                                    });
                                }else{
                                    //console.log("OTHER API ROUTE");
                                }
                        });
                    
                        act(() => {
                          render(<App />);
                        });
                    
                        await act(async () => {
                                await App.setUserInfo({id: 123});
                                await App.setLoggedIn(true);
                                await App.setUserConnected(true);
                                await App.setTabs([{name: 'Dashboard', elem: null},
                                        {name: 'Forms', elem: null},
                                        {name: 'Profile', elem: null}]);
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