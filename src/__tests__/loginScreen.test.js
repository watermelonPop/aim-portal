import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { LoginScreen } from '../LoginScreen';

// Mock the fetch function
global.fetch = jest.fn();

describe('LoginScreen', () => {
        
        const mockSetLoggedIn = jest.fn();
        const mockSetUserType = jest.fn();
        const mockSetStaffRoles = jest.fn();

        beforeEach(() => {
                jest.clearAllMocks();
        });

        test('renders login button', () => {
                render(<LoginScreen setLoggedIn={mockSetLoggedIn} setUserType={mockSetUserType} setStaffRoles={mockSetStaffRoles} />);
                const loginButton = screen.getByRole('button', { name: /log in/i });
                expect(loginButton).toBeInTheDocument();
        });

        test('starts login process when button is clicked', async () => {
                global.fetch.mockResolvedValueOnce({
                        ok: true,
                        text: () => Promise.resolve(JSON.stringify({ authUrl: 'https://google.com/auth' })),
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

        describe('startLogin', () => {
            test('does api/auth get request & returns auth url', async () => {
                const result = await LoginScreen.startLogin();
                await waitFor(() => {
                    expect(global.fetch).toHaveBeenCalledWith('/api/auth');
                    expect(window.location.href).toBe('https://google.com/auth');
                });
            });
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
                    const result = await LoginScreen.verifyToken("mockToken");
                    await waitFor(() => {
                        expect(global.fetch).toHaveBeenCalledWith('/api/verifyToken', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ token: 'mockToken' })
                        });
                    });
                });

                test('when token cannot be verified, redirects to login screen', async () => {
                    global.fetch = jest.fn().mockImplementationOnce(() =>
                        Promise.resolve({
                            json: () => Promise.resolve({ valid: false, error: 'Invalid or expired token' })
                        })
                    );
                    const result = await LoginScreen.verifyToken("mockToken");
                    //expect userExists to be called
        
                    await waitFor(() => {
                        expect(window.location.href).toEqual('/');
                    });
                });

                test('when token is verified, should call the /api/checkAccount api route', async () => {
                    //call verifyToken() function
                    //mock correct response from /api/verifyToken with { valid: true, userId: userId, email: payload.email }
        
                    global.fetch = jest.fn().mockImplementationOnce(() =>
                        Promise.resolve({
                            json: () => Promise.resolve({ valid: true, userId: 'mockUserId', email: 'test@example.com' })
                        })
                    );
                    const result = await LoginScreen.verifyToken("mockToken");
                    //expect userExists to be called
        
                    await waitFor(() => {
                        expect(global.fetch).toHaveBeenCalledWith('/api/checkAccount', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ email: "test@example.com" })
                        });
                    });
                });

                test('when token is verified, should setLoggedIn as true', async () => {
                    global.fetch = jest.fn().mockImplementationOnce(() =>
                        Promise.resolve({
                            json: () => Promise.resolve({ valid: true, userId: 'mockUserId', email: 'test@example.com' })
                        })
                    ).mockImplementationOnce(() => // Mock for userExists
                    Promise.resolve({
                            json: () => Promise.resolve({ exists: true, user_info: { user_role: 'User' } })
                        })
                    );
                    const result = await LoginScreen.verifyToken("mockToken");
        
                    await waitFor(() => {
                        expect(mockSetLoggedIn).toHaveBeenCalledWith(true);
                    });
                });

                test('successful response to /api/checkAccount api route should set the user type', async () => {
                    //call verifyToken() function
                    //mock correct response from /api/verifyToken with { valid: true, userId: userId, email: payload.email }
        
                    global.fetch = jest.fn().mockImplementationOnce(() =>
                        Promise.resolve({
                            json: () => Promise.resolve({ valid: true, userId: 'mockUserId', email: 'test@example.com' })
                        })
                    ).mockImplementationOnce(() =>
                        Promise.resolve({
                            json: () => Promise.resolve({ exists: true, user_info: {userId: 'mockUserId', email: 'test@example.com', user_role: "Student"} })
                        })
                    );
                    const result = await LoginScreen.verifyToken("mockToken");
                    //expect userExists to be called

                    expect(mockSetUserType).toHaveBeenCalledWith("Student");
                });

                test('if user type is not Staff, getStaffRoles is NOT called', async () => {
                    //call verifyToken() function
                    //mock correct response from /api/verifyToken with { valid: true, userId: userId, email: payload.email }
        
                    global.fetch = jest.fn().mockImplementationOnce(() =>
                        Promise.resolve({
                            json: () => Promise.resolve({ valid: true, userId: 'mockUserId', email: 'test@example.com' })
                        })
                    ).mockImplementationOnce(() =>
                        Promise.resolve({
                            json: () => Promise.resolve({ exists: true, user_info: {userId: 'mockUserId', email: 'test@example.com', user_role: "Student"} })
                        })
                    );
                    const result = await LoginScreen.verifyToken("mockToken");
                    //expect userExists to be called

                    expect(mockSetStaffRoles).not.toHaveBeenCalled();
                });
                test('if user type is Staff, getStaffRoles is called', async () => {
                    //call verifyToken() function
                    //mock correct response from /api/verifyToken with { valid: true, userId: userId, email: payload.email }
        
                    global.fetch = jest.fn().mockImplementationOnce(() =>
                        Promise.resolve({
                            json: () => Promise.resolve({ valid: true, userId: 'mockUserId', email: 'test@example.com' })
                        })
                    ).mockImplementationOnce(() =>
                        Promise.resolve({
                            json: () => Promise.resolve({ exists: true, user_info: {user_id: 'mockUserId', email: 'test@example.com', user_role: "Staff"} })
                        })
                    );
                    const result = await LoginScreen.verifyToken("mockToken");
                    //expect userExists to be called

                    //expect(global.fetch).toHaveBeenCalledWith('/api/getStaffRole?user_id=mockUserId');
                    await waitFor(() => {
                        expect(global.fetch).toHaveBeenCalledWith('/api/getStaffRole?user_id=mockUserId');
                    });
                });

                test('if user type is Staff & correct response from getStaffRoles calls setStaffRoles', async () => {
                    //call verifyToken() function
                    //mock correct response from /api/verifyToken with { valid: true, userId: userId, email: payload.email }

                    global.fetch = jest.fn().mockImplementationOnce(() =>
                        Promise.resolve({
                            json: () => Promise.resolve({ valid: true, user_id: 'mockUserId', email: 'test@example.com' })
                        })
                    ).mockImplementationOnce(() =>
                        Promise.resolve({
                            json: () => Promise.resolve({ exists: true, user_info: {user_id: 'mockUserId', email: 'test@example.com', user_role: "Staff"} })
                        })
                    ).mockImplementationOnce(() => // /api/getStaffRole
                    Promise.resolve({
                            text: () => Promise.resolve(JSON.stringify({
                                user_id: "mockUserId",
                                email: "test@example.com",
                                name: 'Mock User',
                                role: "Admin"
                            })),
                            ok: true
                        })
                    );
                    const result = await LoginScreen.verifyToken("mockToken");
                    //expect userExists to be called

                    await waitFor(() => {
                        expect(mockSetStaffRoles).toHaveBeenCalledWith("Admin");
                    });
                });
                /*test('handles error when checking user existence', async () => {
                        const mockEmail = 'test@example.com';
                        const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

                        global.fetch = jest.fn().mockRejectedValueOnce(new Error('Network error'));

                        await LoginScreen.userExists(mockEmail);

                        expect(consoleSpy).toHaveBeenCalledWith('Error checking exists', expect.any(Error));
                        consoleSpy.mockRestore();
                });*/
        });
        
            
        describe('userExists', () => {
                test('calls api/checkAccount', async () => {
                        const mockEmail = 'test@example.com';
                        const mockUserData = { exists: true, user_info: { user_role: 'Staff', user_id: '123' } };
                    
                        // Mock fetch before calling userExists
                        const fetchMock = jest.fn().mockResolvedValueOnce({
                            ok: true,
                            json: () => Promise.resolve(mockUserData),
                        });
                        global.fetch = fetchMock;
                    
                        // Call userExists
                        const result = await LoginScreen.userExists(mockEmail);
                    
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
                        const result = await LoginScreen.userExists(mockEmail);
                    
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
                        const result = await LoginScreen.userExists(mockEmail);
                    
                        // Assert that the result matches the mock data
                        expect(result).toEqual(mockUserData);
                });

                test('handles error when checking user existence', async () => {
                        const mockEmail = 'test@example.com';
                        const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

                        global.fetch = jest.fn().mockRejectedValueOnce(new Error('Network error'));

                        await LoginScreen.userExists(mockEmail);

                        expect(consoleSpy).toHaveBeenCalledWith('Error checking exists', expect.any(Error));
                        consoleSpy.mockRestore();
                });
        });

        describe('getStaffRoles', () => {
            test('calls api/getStaffRole', async () => {
                const mockUserId = "MockUserId";
                await LoginScreen.getStaffRoles(mockUserId);
                await waitFor(() => {
                    expect(global.fetch).toHaveBeenCalledWith(`/api/getStaffRole?user_id=${mockUserId}`);
                });
            });

            test('if call to api/getStaffRole is ok, returns role', async () => {
                const mockUserId = "MockUserId";
                const mockStaffRole = "Admin";
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
                    expect(result).toEqual(mockStaffRole);
                });
            });

            test('if call to api/getStaffRole is NOT ok, redirects to login', async () => {
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
                });
            });
        });
      
      
});
