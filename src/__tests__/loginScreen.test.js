import React, { useState } from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { LoginScreen } from '../loginScreen';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);
// Mock the fetch function
global.fetch = jest.fn();

describe('LoginScreen', () => {
        
        const mockSetLoggedIn = jest.fn();
        const mockSetUserType = jest.fn();
        const mockSetStaffRoles = jest.fn();
        const mockSetUserId = jest.fn();
        const mockSetSettings = jest.fn();
        const mockSetLoading = jest.fn();
        const mockSetUserInfo = jest.fn();
        const mockSetStaffAccess = jest.fn();


        beforeEach(() => {
                jest.clearAllMocks();
        });

        test('Login Screen should have no accessibility violations', async () => {
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
                        const { container } = render(<LoginScreen 
                                    userInfo={mockUserInfo} 
                                    setSettings={mockSetSettings} 
                                    loggedIn={false} 
                                    setLoggedIn={mockSetLoggedIn} 
                                    staffAccess={null}
                                    setStaffAccess={mockSetStaffAccess} 
                                    setUserInfo={mockSetUserInfo}
                                    setLoading={mockSetLoading}
                                  />);
                        const results = await axe(container);
                        expect(results).toHaveNoViolations();
        });

        test('renders login button', () => {
                render(<LoginScreen setLoggedIn={mockSetLoggedIn} setUserType={mockSetUserType} setStaffRoles={mockSetStaffRoles} />);
                const loginButton = screen.getByRole('button', { name: /log in/i });
                expect(loginButton).toBeInTheDocument();
        });

        test('starts login process when button is clicked', async () => {
                global.fetch = jest.fn().mockResolvedValue({
                    ok: true,
                    text: () => Promise.resolve(JSON.stringify({ authUrl: 'https://google.com/auth' })),
        headers: new Headers({ 'Content-Type': 'application/json' })
                });

                const { window } = global;
                delete global.window.location;
                global.window.location = { href: jest.fn() };

                render(<LoginScreen setLoggedIn={mockSetLoggedIn} setUserType={mockSetUserType} setStaffRoles={mockSetStaffRoles} />);
                const loginButton = screen.getByRole('button', { name: /log in/i });
                fireEvent.click(loginButton);

                await waitFor(() => {
                        expect(global.fetch).toHaveBeenCalledWith('/api/auth');
                        expect(window.location.href).toBe('https://google.com/auth');
                });

                global.window.location = window.location;
        });

        test('invalid server response throws error', async () => {
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
            global.fetch = jest.fn().mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({ authUrl: 'https://google.com/auth' }),
    headers: new Headers({ 'Content-Type': 'application/json'})
            });

            const { window } = global;
            delete global.window.location;
            global.window.location = { href: jest.fn() };

            render(<LoginScreen setLoggedIn={mockSetLoggedIn} setUserType={mockSetUserType} setStaffRoles={mockSetStaffRoles} />);
            const loginButton = screen.getByRole('button', { name: /log in/i });
            fireEvent.click(loginButton);

            await waitFor(() => {
                expect(consoleErrorSpy).toHaveBeenCalledWith('Error during login:', expect.any(Error));
            });

            global.window.location = window.location;
        });

        test('error when auth api response is NOT ok', async () => {
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
            global.fetch = jest.fn().mockResolvedValue({
                ok: false,
                status: 401,
                statusText: 'Unauthorized',
                text: () => Promise.resolve(JSON.stringify({ authUrl: 'https://google.com/auth' })),
                headers: new Headers({ 'Content-Type': 'application/json' })
            });

            const { window } = global;
            delete global.window.location;
            global.window.location = { href: jest.fn() };

            render(<LoginScreen setLoggedIn={mockSetLoggedIn} setUserType={mockSetUserType} setStaffRoles={mockSetStaffRoles} />);
            const loginButton = screen.getByRole('button', { name: /log in/i });
            fireEvent.click(loginButton);

            await waitFor(() => {
                expect(consoleErrorSpy).toHaveBeenCalledWith(
                    'Failed to start login process',
                    401,  // status
                    'Unauthorized'  // statusText
                );
                expect(window.location.href).toBe('/error');
            });

            global.window.location = window.location;
        });

        test('error when auth api fails', async () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
            
            // Mock fetch to throw an error
            global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));
        
            // Mock window.location
            delete window.location;
            window.location = { href: '' };
        
            render(<LoginScreen setLoggedIn={mockSetLoggedIn} setUserType={mockSetUserType} setStaffRoles={mockSetStaffRoles} />);
            const loginButton = screen.getByRole('button', { name: /log in/i });
            fireEvent.click(loginButton);
        
            await waitFor(() => {
                expect(consoleSpy).toHaveBeenCalledWith('Error during login:', expect.any(Error));
                expect(window.location.href).toBe('/');
            });
        
            consoleSpy.mockRestore();
        });
        
        test('error when json parse doesnt work', async () => {
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
            global.fetch = jest.fn().mockResolvedValue({
                ok: true,
                text: () => Promise.resolve({ authUrl: 'https://google.com/auth' }),
    headers: new Headers({ 'Content-Type': 'application/json' })
            });

            const { window } = global;
            delete global.window.location;
            global.window.location = { href: jest.fn() };

            render(<LoginScreen setLoggedIn={mockSetLoggedIn} setUserType={mockSetUserType} setStaffRoles={mockSetStaffRoles} />);
            const loginButton = screen.getByRole('button', { name: /log in/i });
            fireEvent.click(loginButton);

            await waitFor(() => {
                expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to parse JSON response:', expect.any(Error));
            });

            global.window.location = window.location;
        });

        test('error when no auth url in response', async () => {
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
            global.fetch = jest.fn().mockResolvedValue({
                ok: true,
                text: () => Promise.resolve(JSON.stringify({ otherParam: 'https://google.com/auth' })),
    headers: new Headers({ 'Content-Type': 'application/json' })
            });

            const { window } = global;
            delete global.window.location;
            global.window.location = { href: jest.fn() };

            render(<LoginScreen setLoggedIn={mockSetLoggedIn} setUserType={mockSetUserType} setStaffRoles={mockSetStaffRoles} />);
            const loginButton = screen.getByRole('button', { name: /log in/i });
            fireEvent.click(loginButton);

            await waitFor(() => {
                expect(consoleErrorSpy).toHaveBeenCalledWith('Auth URL not found in response');
            });

            global.window.location = window.location;
        });

        describe('oauthCallback useEffect', () => {
            test('when oauth redirects with token & mounts loginScreen, calls verifyToken & removes token from url', async () => {
                // Mock the global fetch function
                global.fetch = jest.fn(() =>
                    Promise.resolve({
                        json: () => Promise.resolve({ valid: true, userId: 'mockUserId', email: 'test@example.com' })
                    })
                );
        
                // Mock the window.history.replaceState
                const mockReplaceState = jest.fn();
                Object.defineProperty(window, 'history', {
                    writable: true,
                    value: { replaceState: mockReplaceState }
                });
        
                // Set the initial URL with the token
                Object.defineProperty(window, 'location', {
                    writable: true,
                    value: { search: '?token=mockToken' }
                });
        
                await act(async () => {
                    render(<LoginScreen setLoggedIn={mockSetLoggedIn} setUserType={mockSetUserType} setStaffRoles={mockSetStaffRoles} />);
                });
        
                await waitFor(() => {
                    // Check if verifyToken was called
                    expect(global.fetch).toHaveBeenCalledWith('/api/verifyToken', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ token: 'mockToken' })
                    });
        
                    // Check if the token was removed from the URL
                    expect(mockReplaceState).toHaveBeenCalledWith({}, '', window.location.pathname);
                });
            });
        });

        describe('verifyToken', () => {
                test('when given token, calls the /api/verifyToken api route', async () => {
                    global.fetch = jest.fn(() =>
                        Promise.resolve({
                          ok: true,
                          json: () => Promise.resolve({ valid: true, userId: 'mockUserId', email: 'test@example.com' }),
                        })
                    );
                    const result = await LoginScreen.verifyToken('mockToken', mockSetUserId, mockSetSettings, false, mockSetLoggedIn, mockSetUserType, mockSetStaffRoles, mockSetLoading, mockSetUserInfo);
                    await waitFor(() => {
                        expect(global.fetch).toHaveBeenCalledWith('/api/verifyToken', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ token: 'mockToken' })
                        });
                    });
                });

                test('when token cannot be verified, redirects to login screen', async () => {
                    const originalConsoleError = console.error;
                    console.error = jest.fn();

                    // Mock window.location.href
                    const mockHref = jest.fn();
                    Object.defineProperty(window, 'location', {
                        value: { href: mockHref },
                        writable: true
                    });
                    global.fetch = jest.fn().mockImplementationOnce(() =>
                        Promise.resolve({
                            json: () => Promise.resolve({ valid: false, error: 'Invalid or expired token' })
                        })
                    );
                    const result = await LoginScreen.verifyToken('mockToken', mockSetUserId, mockSetSettings, false, mockSetLoggedIn, mockSetUserType, mockSetStaffRoles, mockSetLoading);
                    //expect userExists to be called
        
                    await waitFor(() => {
                        expect(console.error).toHaveBeenCalledWith('Invalid token:', 'Invalid or expired token');
                        expect(window.location.href).toEqual('/');
                    });

                    console.error = originalConsoleError;
                });

                test('network issues throw error', async () => {
                    const originalConsoleError = console.error;
                    console.error = jest.fn();

                    // Mock window.location.href
                    const mockHref = jest.fn();
                    Object.defineProperty(window, 'location', {
                        value: { href: mockHref },
                        writable: true
                    });
                    global.fetch = jest.fn().mockImplementationOnce(() => Promise.reject(new Error('Network error')));
                    const result = await LoginScreen.verifyToken('mockToken', mockSetUserId, mockSetSettings, false, mockSetLoggedIn, mockSetUserType, mockSetStaffRoles, mockSetLoading);
                    //expect userExists to be called
        
                    await waitFor(() => {
                        expect(console.error).toHaveBeenCalledWith('Error verifying token:', expect.any(Error));
                        expect(window.location.href).toEqual('/');
                    });

                    console.error = originalConsoleError;
                });

                test('when token is verified, setLoading', async () => {
                    // Mock fetch for verifyToken
                    global.fetch = jest.fn(() =>
                        Promise.resolve({
                          ok: true,
                          json: () => Promise.resolve({ valid: true, userId: 'mockUserId', email: 'test@example.com', payload: "testPayload" }),
                        })
                    );
                    const result = await LoginScreen.verifyToken('mockToken', {
                        id: null,
                        name: null,
                        email: null,
                        role: null,
                        picture: null,
                        dob: null,
                        uin: null,
                        phone_number: null,
                      }, mockSetSettings, false, mockSetLoggedIn, mockSetStaffRoles, mockSetLoading, mockSetUserInfo);
                    await waitFor(() => {
                        expect(mockSetLoading).toHaveBeenCalledWith(true);
                    });
                }); 

                test('when token is verified, set userInfo', async () => {
                    // Mock fetch for verifyToken
                    global.fetch = jest.fn(() =>
                        Promise.resolve({
                          ok: true,
                          json: () => Promise.resolve({ valid: true, payload: {email: "test@example.com", name: "Mock User"} }),
                        })
                    );
                    const userInfo = {
                        id: null,
                        name: null,
                        email: null,
                        role: null,
                        picture: null,
                        dob: null,
                        uin: null,
                        phone_number: null,
                      };
                    const result = await LoginScreen.verifyToken('mockToken', userInfo, mockSetSettings, false, mockSetLoggedIn, mockSetStaffRoles, mockSetLoading, mockSetUserInfo);
                    await waitFor(() => {
                        expect(mockSetUserInfo).toHaveBeenCalledWith({...userInfo, email: result.payload.email, name: result.payload.name});
                    });
                }); 

                test('when token is verified, should call both /api/verifyToken and /api/checkAccount api routes', async () => {
                    // Mock fetch for both API calls
                    global.fetch = jest.fn((url) => {
                        if (url === '/api/verifyToken') {
                            return Promise.resolve({
                                ok: true,
                                json: () => Promise.resolve({ valid: true, payload: {email: "test@example.com", name: "Mock User"} }),
                            });
                        } else if (url === '/api/checkAccount/') {
                            return Promise.resolve({
                                ok: true,
                                json: () => Promise.resolve({ exists: true, user_info: { user_role: 'User', user_id: 'mockUserId' } }),
                            });
                        }
                    });
                
                    const userInfo = {
                        id: null,
                        name: null,
                        email: null,
                        role: null,
                        picture: null,
                        dob: null,
                        uin: null,
                        phone_number: null,
                      };
                    const result = await LoginScreen.verifyToken('mockToken', userInfo, mockSetSettings, false, mockSetLoggedIn, mockSetStaffRoles, mockSetLoading, mockSetUserInfo);
                
                    await waitFor(() => {
                        // Check first API call
                        expect(global.fetch).toHaveBeenCalledWith('/api/verifyToken', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ token: 'mockToken' })
                        });
                
                        // Check second API call
                        expect(global.fetch).toHaveBeenCalledWith('/api/checkAccount', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ email: 'test@example.com' })
                        });
                    });
                });
                 

                test('when token is verified & user exists, /api/getSettings', async () => {
                    global.fetch = jest.fn().mockImplementationOnce(() =>
                        Promise.resolve({
                            ok: true,
                            json: () => Promise.resolve({ valid: true, payload: {email: "test@example.com", name: "Mock User"} })
                        })
                    ).mockImplementationOnce(() => // Mock for userExists
                        Promise.resolve({
                            json: () => Promise.resolve({ exists: true, user_info: {id: 'mockUserId', role: 'USER', email: 'test@example.com'} })
                        })
                    ).mockImplementationOnce(() => // Mock for getUserSettings
                        Promise.resolve({
                            ok: true,
                            json: () => Promise.resolve({ exists: true, settings_info: { } })
                        })
                    );
                    const userInfo = {
                        id: null,
                        name: null,
                        email: null,
                        role: null,
                        picture: null,
                        dob: null,
                        uin: null,
                        phone_number: null,
                      };
                    const result = await LoginScreen.verifyToken('mockToken', userInfo, mockSetSettings, false, mockSetLoggedIn, mockSetStaffRoles, mockSetLoading, mockSetUserInfo);
                
                    await waitFor(() => {
                        expect(global.fetch).toHaveBeenCalledWith('/api/getSettings?user_id=mockUserId');
                    });
                });

                test('when token is verified, should setLoggedIn as true', async () => {
                    const token = 'mockToken';
                    global.fetch = jest.fn().mockImplementationOnce(() =>
                        Promise.resolve({
                          json: () => Promise.resolve({ valid: true, userId: 'mockUserId', email: 'test@example.com', payload: "testPayload" })
                        })
                    ).mockImplementationOnce(() => // Mock for userExists
                        Promise.resolve({
                          json: () => Promise.resolve({ exists: true, user_info: {id: 'mockUserId', role: 'USER', email: 'test@example.com'} })
                        })
                    ).mockImplementationOnce(() => // Mock for getUserSettings
                        Promise.resolve({
                            json: () => Promise.resolve({ exists: true, settings_info: { font_size: 1, letter_spacing: 1 } })
                        })
                    );
                    
                    const userInfo = {
                        id: null,
                        name: null,
                        email: null,
                        role: null,
                        picture: null,
                        dob: null,
                        uin: null,
                        phone_number: null,
                      };
                    const result = await LoginScreen.verifyToken('mockToken', userInfo, mockSetSettings, false, mockSetLoggedIn, mockSetStaffRoles, mockSetLoading, mockSetUserInfo);
                    
                    await waitFor(() => {
                        expect(mockSetLoggedIn).toHaveBeenCalledWith(true);
                    });
                });
                

                test('if user type is not Staff, getStaffRoles is NOT called', async () => {
                    global.fetch = jest.fn().mockImplementationOnce(() =>
                        Promise.resolve({
                            json: () => Promise.resolve({ valid: true, payload: {email: "test@example.com", name: "Mock User"} })
                        })
                    ).mockImplementationOnce(() =>
                        Promise.resolve({
                            json: () => Promise.resolve({ exists: true, user_info: {id: 'mockUserId', email: 'test@example.com', role: "STUDENT"} })
                        })
                    ).mockImplementationOnce(() => // Mock for getUserSettings
                        Promise.resolve({
                            json: () => Promise.resolve({ exists: true, settings_info: { font_size: 1, letter_spacing: 1 } })
                        })
                    );
                    const userInfo = {
                        id: null,
                        name: null,
                        email: null,
                        role: null,
                        picture: null,
                        dob: null,
                        uin: null,
                        phone_number: null,
                      };
                    const result = await LoginScreen.verifyToken('mockToken', userInfo, mockSetSettings, false, mockSetLoggedIn, mockSetStaffRoles, mockSetLoading, mockSetUserInfo);

                    await waitFor(() => {
                        expect(mockSetStaffRoles).not.toHaveBeenCalled();
                    });
                });
                
                test('if user type is Staff, getStaffRoles is called', async () => {
                    global.fetch = jest.fn().mockImplementationOnce(() =>
                        Promise.resolve({
                            json: () => Promise.resolve({ valid: true, payload: {email: "test@example.com", name: "Mock User"} })
                        })
                    ).mockImplementationOnce(() =>
                        Promise.resolve({
                            json: () => Promise.resolve({ exists: true, user_info: {id: 'mockUserId', email: 'test@example.com', role: "ADVISOR"} })
                        })
                    ).mockImplementationOnce(() => // Mock for getUserSettings
                        Promise.resolve({
                            json: () => Promise.resolve({ exists: true, settings_info: { font_size: 14, letter_spacing: 0, contrast: "100%" } })
                        })
                    );
                    const userInfo = {
                        id: null,
                        name: null,
                        email: null,
                        role: null,
                        picture: null,
                        dob: null,
                        uin: null,
                        phone_number: null,
                      };
                    const result = await LoginScreen.verifyToken('mockToken', userInfo, mockSetSettings, false, mockSetLoggedIn, mockSetStaffRoles, mockSetLoading, mockSetUserInfo);
                
                    await waitFor(() => {
                        expect(global.fetch).toHaveBeenCalledWith('/api/getStaffRole?user_id=mockUserId');
                    });
                
                    //console.log("getStaffRoles API was called correctly.");
                });
                

                test('if user type is Staff & correct response from getStaffRoles calls setStaffRoles', async () => {
                    //call verifyToken() function
                    //mock correct response from /api/verifyToken with { valid: true, userId: userId, email: payload.email }
                    let mockStaffAccess = [
                        {access: 'Global Settings', hasAccess: false, elem: null},
                        {access: 'Accommodations', hasAccess: false, elem: null},
                        {access: 'Note Taking', hasAccess: false, elem: null},
                        {access: 'Assistive Technology', hasAccess: false, elem: null},
                        {access: 'Accessible Testing', hasAccess: false, elem: null},
                        {access: 'Student Cases', hasAccess: false, elem: null},
                    ];
                    global.fetch = jest.fn()
                    .mockImplementationOnce(() =>
                        Promise.resolve({
                            json: () => Promise.resolve({ valid: true, payload: {email: "test@example.com", name: "Mock User"} })
                        })
                    ).mockImplementationOnce(() =>
                        Promise.resolve({
                            json: () => Promise.resolve({ exists: true, user_info: {id: 'mockUserId', email: 'test@example.com', role: "ADVISOR"} })
                        })
                    ).mockImplementationOnce(() => // /api/getStaffRole
                        Promise.resolve({
                                json: () => Promise.resolve({ res: {role: "Admin"}}),
                                ok: true
                        })
                        ).mockImplementationOnce(() => // Mock for getUserSettings
                            Promise.resolve({
                                json: () => Promise.resolve({ exists: true, settings_info: { font_size: 1, letter_spacing: 1 } })
                            })
                        );
                    const userInfo = {
                        id: null,
                        name: null,
                        email: null,
                        role: null,
                        picture: null,
                        dob: null,
                        uin: null,
                        phone_number: null,
                    };
                    const result = await LoginScreen.verifyToken('mockToken', userInfo, mockSetSettings, false, mockSetLoggedIn, mockSetStaffRoles, mockSetLoading, mockSetUserInfo);
                    await waitFor(() => {
                        expect(mockSetStaffRoles).toHaveBeenCalledWith("Admin", undefined, undefined);
                    });
                });

                test('correctly sets staff roles for admin', async () => {
                    let mockStaffAccess = [
                        {access: 'Global Settings', hasAccess: false, elem: null},
                        {access: 'Accommodations', hasAccess: false, elem: null},
                        {access: 'Note Taking', hasAccess: false, elem: null},
                        {access: 'Assistive Technology', hasAccess: false, elem: null},
                        {access: 'Accessible Testing', hasAccess: false, elem: null},
                        {access: 'Student Cases', hasAccess: false, elem: null},
                    ];
                    await act(async () => {
                        await LoginScreen.setStaffRoles("Admin", mockSetStaffAccess, mockStaffAccess);
                    });
                    await waitFor(() => {
                        expect(mockSetStaffAccess).toHaveBeenCalledWith([
                            {access: 'Global Settings', hasAccess: true, elem: null},
                            {access: 'Accommodations', hasAccess: true, elem: null},
                            {access: 'Note Taking', hasAccess: true, elem: null},
                            {access: 'Assistive Technology', hasAccess: true, elem: null},
                            {access: 'Accessible Testing', hasAccess: true, elem: null},
                            {access: 'Student Cases', hasAccess: true, elem: null},
                        ]);
                    });
                });

                test('correctly sets staff roles for coordinators', async () => {
                    let mockStaffAccess = [
                        {access: 'Global Settings', hasAccess: false, elem: null},
                        {access: 'Accommodations', hasAccess: false, elem: null},
                        {access: 'Note Taking', hasAccess: false, elem: null},
                        {access: 'Assistive Technology', hasAccess: false, elem: null},
                        {access: 'Accessible Testing', hasAccess: false, elem: null},
                        {access: 'Student Cases', hasAccess: false, elem: null},
                    ];
                    await act(async () => {
                        await LoginScreen.setStaffRoles("Coordinator", mockSetStaffAccess, mockStaffAccess);
                    });
                    await waitFor(() => {
                        expect(mockSetStaffAccess).toHaveBeenCalledWith([
                            {access: 'Global Settings', hasAccess: false, elem: null},
                            {access: 'Accommodations', hasAccess: true, elem: null},
                            {access: 'Note Taking', hasAccess: true, elem: null},
                            {access: 'Assistive Technology', hasAccess: true, elem: null},
                            {access: 'Accessible Testing', hasAccess: true, elem: null},
                            {access: 'Student Cases', hasAccess: true, elem: null},
                        ]);
                    });
                });

                test('correctly sets staff roles for testing staff', async () => {
                    let mockStaffAccess = [
                        {access: 'Global Settings', hasAccess: false, elem: null},
                        {access: 'Accommodations', hasAccess: false, elem: null},
                        {access: 'Note Taking', hasAccess: false, elem: null},
                        {access: 'Assistive Technology', hasAccess: false, elem: null},
                        {access: 'Accessible Testing', hasAccess: false, elem: null},
                        {access: 'Student Cases', hasAccess: false, elem: null},
                    ];
                    await act(async () => {
                        await LoginScreen.setStaffRoles("Testing_Staff", mockSetStaffAccess, mockStaffAccess);
                    });
                    await waitFor(() => {
                        expect(mockSetStaffAccess).toHaveBeenCalledWith([
                            {access: 'Global Settings', hasAccess: false, elem: null},
                            {access: 'Accommodations', hasAccess: false, elem: null},
                            {access: 'Note Taking', hasAccess: false, elem: null},
                            {access: 'Assistive Technology', hasAccess: false, elem: null},
                            {access: 'Accessible Testing', hasAccess: true, elem: null},
                            {access: 'Student Cases', hasAccess: true, elem: null},
                        ]);
                    });
                });

                test('correctly sets staff roles for Assitive Tech staff', async () => {
                    let mockStaffAccess = [
                        {access: 'Global Settings', hasAccess: false, elem: null},
                        {access: 'Accommodations', hasAccess: false, elem: null},
                        {access: 'Note Taking', hasAccess: false, elem: null},
                        {access: 'Assistive Technology', hasAccess: false, elem: null},
                        {access: 'Accessible Testing', hasAccess: false, elem: null},
                        {access: 'Student Cases', hasAccess: false, elem: null},
                    ];
                    await act(async () => {
                        await LoginScreen.setStaffRoles("Tech_Staff", mockSetStaffAccess, mockStaffAccess);
                    });
                    await waitFor(() => {
                        expect(mockSetStaffAccess).toHaveBeenCalledWith([
                            {access: 'Global Settings', hasAccess: false, elem: null},
                            {access: 'Accommodations', hasAccess: false, elem: null},
                            {access: 'Note Taking', hasAccess: false, elem: null},
                            {access: 'Assistive Technology', hasAccess: true, elem: null},
                            {access: 'Accessible Testing', hasAccess: false, elem: null},
                            {access: 'Student Cases', hasAccess: true, elem: null},
                        ]);
                    });
                });

                test('if user type is Staff & NOT correct response from getStaffRoles, set window to /', async () => {
                    //call verifyToken() function
                    //mock correct response from /api/verifyToken with { valid: true, userId: userId, email: payload.email }
                    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
                    global.fetch = jest.fn()
                    .mockImplementationOnce(() =>
                        Promise.resolve({
                            json: () => Promise.resolve({ valid: true, payload: {email: "test@example.com", name: "Mock User"} })
                        })
                    ).mockImplementationOnce(() =>
                        Promise.resolve({
                            json: () => Promise.resolve({ exists: true, user_info: {id: 'mockUserId', email: 'test@example.com', role: "ADVISOR"} })
                        })
                    ).mockImplementationOnce(() => // /api/getStaffRole
                        Promise.resolve({
                                json: () => Promise.resolve({
                                    error: "ERROR"
                                }),
                                ok: false,
                                status: 500
                            })
                        ).mockImplementationOnce(() => // Mock for getUserSettings
                            Promise.resolve({
                                json: () => Promise.resolve({ exists: true, settings_info: { font_size: 1, letter_spacing: 1 } })
                            })
                        );
                        const userInfo = {
                            id: null,
                            name: null,
                            email: null,
                            role: null,
                            picture: null,
                            dob: null,
                            uin: null,
                            phone_number: null,
                        };
                        const result = await LoginScreen.verifyToken('mockToken', userInfo, mockSetSettings, false, mockSetLoggedIn, mockSetStaffRoles, mockSetLoading, mockSetUserInfo);

                    await waitFor(() => {
                        expect(consoleSpy).toHaveBeenCalledWith('API request failed:', 500, undefined);
                        expect(window.location.href).toBe('/');
                    });
                });
        });
        
            
        describe('userExists', () => {
                test('calls api/checkAccount', async () => {
                        const mockEmail = 'test@example.com';
                        const mockUserData = { exists: true, user_info: [{ user_role: 'Staff', user_id: '123' }] };
                    
                        // Mock fetch before calling userExists
                        const fetchMock = jest.fn().mockResolvedValueOnce({
                            ok: true,
                            json: () => Promise.resolve(mockUserData),
                        });
                        global.fetch = fetchMock;
                    
                        // Call userExists
                        const result = await LoginScreen.accountExists(mockEmail);
                    
                        // Assert that fetch was called with the correct arguments
                        expect(fetchMock).toHaveBeenCalledWith('/api/checkAccount', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ email: mockEmail }),
                        });
                });
                    
                test('returns user data if user exists', async () => {
                        const mockEmail = 'test@example.com';
                        const mockUserData = { exists: true, user_info: { user_role: 'Staff', user_id: '123' } };
                    
                        // Mock fetch before calling userExists
                        const fetchMock = jest.fn().mockResolvedValueOnce({
                            ok: true,
                            json: () => Promise.resolve(mockUserData),
                        });
                        global.fetch = fetchMock;
                    
                        // Call userExists
                        const result = await LoginScreen.accountExists(mockEmail);
                    
                        // Assert that the result matches the mock data
                        expect(result).toEqual(mockUserData);
                });
                
                test('returns false if user doesnt exist', async () => {
                        const mockEmail = 'test@example.com';
                        const mockUserData = { exists: false};
                    
                        // Mock fetch before calling userExists
                        const fetchMock = jest.fn().mockResolvedValueOnce({
                            ok: true,
                            json: () => Promise.resolve(mockUserData),
                        });
                        global.fetch = fetchMock;
                    
                        // Call userExists
                        const result = await LoginScreen.accountExists(mockEmail);
                    
                        // Assert that the result matches the mock data
                        expect(result).toEqual(mockUserData);
                });

                test('handles error when checking user existence', async () => {
                        const mockEmail = 'test@example.com';
                        const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

                        global.fetch = jest.fn().mockRejectedValueOnce(new Error('Network error'));

                        await LoginScreen.accountExists(mockEmail);

                        expect(consoleSpy).toHaveBeenCalledWith('Error checking exists', expect.any(Error));
                        consoleSpy.mockRestore();
                });
        });

        describe('getStaffRoles', () => {
            test('calls api/getStaffRole', async () => {
                global.fetch = jest.fn().mockImplementationOnce(() =>
                    Promise.resolve({
                        json: () => Promise.resolve({
                            error: "No Staff Role Found"
                        }),
                        ok: false,
                        status: 404,
                        statusText: 'Not Found'
                    })
                );
            
                const mockUserId = "MockUserId";
                
                // Mock console.error and window.location.href
                console.error = jest.fn();
                Object.defineProperty(window, 'location', {
                    value: { href: jest.fn() }
                });
            
                await LoginScreen.getStaffRoles(mockUserId);
            
                await waitFor(() => {
                    expect(global.fetch).toHaveBeenCalledWith(`/api/getStaffRole?user_id=${mockUserId}`);
                    expect(console.error).toHaveBeenCalledWith('API request failed:', 404, 'Not Found');
                    expect(window.location.href).toBe('/');
                });
            });
            

            test('if call to api/getStaffRole is ok, returns role', async () => {
                const mockUserId = "MockUserId";
                const mockStaffRole = "Admin";
                global.fetch = jest.fn().mockImplementationOnce(() => // /api/getStaffRole
                Promise.resolve({
                        json: () => Promise.resolve({
                            res: {id: mockUserId,
                            email: "test@example.com",
                            name: 'Mock User',
                            role: mockStaffRole}
                        }),
                        ok: true
                    })
                );
                const result = await LoginScreen.getStaffRoles(mockUserId);
                await waitFor(() => {
                    expect(result).toEqual(mockStaffRole);
                });
            });

            test('if call to api/getStaffRole is NOT ok, redirects to login & returns null', async () => {
                const mockUserId = "MockUserId";
                global.fetch = jest.fn().mockImplementationOnce(() => // /api/getStaffRole
                Promise.resolve({
                        text: () => Promise.resolve(JSON.stringify({
                            error: "No Staff Role Found"
                        })),
                        ok: false
                    })
                );
                const result = await LoginScreen.getStaffRoles(mockUserId);
                await waitFor(() => {
                    expect(window.location.href).toEqual('/');
                    expect(result).toEqual(null);
                });
            });

            test('if return value cannot be parsed, returns null', async () => {
                const mockUserId = "MockUserId";
                const mockStaffRole = "Admin";
                global.fetch = jest.fn().mockImplementationOnce(() => // /api/getStaffRole
                Promise.resolve({
                        text: () => Promise.resolve(
                            'user_id: mockUserId email: "test@example.com" name: "Mock User" role: mockStaffRole'
                        ),
                        ok: true
                    })
                );
                const result = await LoginScreen.getStaffRoles(mockUserId);
                await waitFor(() => {
                    expect(result).toEqual(null);
                });
            });

            test('if call to api/getStaffRole returns empty role, returns null', async () => {
                const mockUserId = "MockUserId";
                const mockStaffRole = "";
                global.fetch = jest.fn().mockImplementationOnce(() => // /api/getStaffRole
                Promise.resolve({
                        text: () => Promise.resolve(JSON.stringify({
                            user_id: mockUserId,
                            email: "test@example.com",
                            name: 'Mock User',
                            role: mockStaffRole
                        })),
                        ok: true
                    })
                );
                const result = await LoginScreen.getStaffRoles(mockUserId);
                await waitFor(() => {
                    expect(result).toEqual(null);
                });
            });

            test('if there is a network error, logs the error and returns null', async () => {
                const mockUserId = "MockUserId";
                const mockNetworkError = new Error("Network Error");
            
                // Mock fetch to simulate a network error
                global.fetch = jest.fn().mockImplementationOnce(() => Promise.reject(mockNetworkError));
            
                // Spy on console.error to verify that the error is logged
                const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
            
                const result = await LoginScreen.getStaffRoles(mockUserId);
            
                // Verify that the network error was logged
                expect(consoleErrorSpy).toHaveBeenCalledWith('Network error:', mockNetworkError);
            
                // Verify that the function returned null
                expect(result).toEqual(null);
            
                // Restore the original console.error implementation
                consoleErrorSpy.mockRestore();
            });
            
        });

        describe('getUserSettings', () => {
            test('calls api/getSettings', async () => {
                global.fetch = jest.fn().mockImplementationOnce(() =>
                    Promise.resolve({
                        json: () => Promise.resolve({exists: true, settings_info: {font_size: 1, letter_spacing: 1} })
                    })
                );
        
                const mockUserId = "MockUserId";
        
                await LoginScreen.getUserSettings(mockUserId, mockSetSettings);
        
                await waitFor(() => {
                    expect(global.fetch).toHaveBeenCalledWith(`/api/getSettings?user_id=${mockUserId}`);
                });
            });

            test('throws error if no userId', async () => {
                const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
                global.fetch = jest.fn().mockImplementationOnce(() =>
                    Promise.resolve({
                        json: () => Promise.resolve({exists: true, settings_info: {font_size: 1, letter_spacing: 1} })
                    })
                );
        
                const mockUserId = "MockUserId";
        
                await LoginScreen.getUserSettings(null, mockSetSettings);
        
                await waitFor(() => {
                    expect(consoleErrorSpy).toHaveBeenCalledWith('Invalid user ID provided');
                });
            });

            test('throws error if response is NOT ok', async () => {
                const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
                global.fetch = jest.fn().mockImplementationOnce(() =>
                    Promise.resolve({
                        ok: false,
                        status: 401,
                        statusText: 'Unauthorized',
                        json: () => Promise.resolve({exists: true, settings_info: {font_size: 1, letter_spacing: 1} })
                    })
                );
        
                const mockUserId = "MockUserId";
        
                await LoginScreen.getUserSettings(mockUserId, mockSetSettings);
        
                await waitFor(() => {
                    expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to fetch settings:', 401, "Unauthorized");
                });
            });


            test('throws error if response is NOT json', async () => {
                const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
                global.fetch = jest.fn().mockImplementationOnce(() =>
                    Promise.resolve({
                        ok: true,
                        text: () => Promise.resolve(JSON.stringify({exists: true, settings_info: {font_size: 1, letter_spacing: 1} }))
                    })
                );
        
                const mockUserId = "MockUserId";
        
                await LoginScreen.getUserSettings(mockUserId, mockSetSettings);
        
                await waitFor(() => {
                    expect(consoleErrorSpy).toHaveBeenCalledWith('Error while getting settings:', expect.any(Error));
                });
            });

            test('warns error if response has no settings_info', async () => {
                const consoleErrorSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
                global.fetch = jest.fn().mockImplementationOnce(() =>
                    Promise.resolve({
                        ok: true,
                        json: () => Promise.resolve({exists: true, otherParam: false })
                    })
                );
        
                const mockUserId = "MockUserId";
        
                await LoginScreen.getUserSettings(mockUserId, mockSetSettings);
        
                await waitFor(() => {
                    expect(consoleErrorSpy).toHaveBeenCalledWith('No settings found or invalid settings data structure');
                });
            });
        });
      
        test('createAccount updates userInfo when success is true', async () => {
            const mockSetUserInfo = jest.fn();
            const mockUserInfo = {
              name: 'Test User',
              email: 'test@example.com',
              role: null,
            };
          
            const mockResponse = {
              success: true,
              account: {
                id: 1,
                name: 'Test User',
                email: 'test@example.com',
                role: 'USER'
              }
            };
          
            global.fetch = jest.fn().mockResolvedValueOnce({
              ok: true,
              json: () => Promise.resolve(mockResponse)
            });
          
            const account = await LoginScreen.createAccount(mockUserInfo, mockSetUserInfo);
          
            expect(mockSetUserInfo).toHaveBeenCalledWith({
              ...mockUserInfo,
              id: 1,
              name: 'Test User',
              email: 'test@example.com',
              role: 'USER'
            });
          
            expect(account).toEqual(mockResponse.account);
          });

          test('createAccount logs error when fetch fails', async () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
            const mockSetUserInfo = jest.fn();
            const mockUserInfo = {
              name: 'Test User',
              email: 'test@example.com',
              role: null,
            };
          
            // Simulate network error
            global.fetch = jest.fn().mockRejectedValueOnce(new Error('Network error'));
          
            await LoginScreen.createAccount(mockUserInfo, mockSetUserInfo);
          
            expect(consoleSpy).toHaveBeenCalledWith('Error checking exists', expect.any(Error));
          
            consoleSpy.mockRestore();
          });
          
          test('logs warning and returns null when staff role is empty or undefined', async () => {
            const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
          
            global.fetch = jest.fn().mockResolvedValueOnce({
              ok: true,
              json: () =>
                Promise.resolve({
                  res: { role: '' }  // simulate missing/empty role
                }),
            });
          
            const result = await LoginScreen.getStaffRoles('mockUserId');
          
            expect(consoleWarnSpy).toHaveBeenCalledWith('Role is empty or undefined');
            expect(result).toBeNull();
          
            consoleWarnSpy.mockRestore();
          });
          
});
