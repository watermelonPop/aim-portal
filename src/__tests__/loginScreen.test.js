import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { LoginScreen } from '../loginScreen';

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


        beforeEach(() => {
                jest.clearAllMocks();
        });

        test('renders login button', () => {
                render(<LoginScreen setLoggedIn={mockSetLoggedIn} setUserType={mockSetUserType} setStaffRoles={mockSetStaffRoles} />);
                const loginButton = screen.getByRole('button', { name: /log in/i });
                expect(loginButton).toBeInTheDocument();
        });

        test('starts login process when button is clicked', async () => {
                global.fetch = jest.fn().mockResolvedValue({
                    ok: true,
                    json: jest.fn().mockResolvedValueOnce({ authUrl: 'https://google.com/auth' }), // ✅ Use `.mockResolvedValueOnce`
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
                    const result = await LoginScreen.verifyToken('mockToken', mockSetUserId, mockSetSettings, false, mockSetLoggedIn, mockSetUserType, mockSetStaffRoles, mockSetLoading);
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

                test('when token is verified, setLoading', async () => {
                    // Mock fetch for verifyToken
                    global.fetch = jest.fn(() =>
                        Promise.resolve({
                          ok: true,
                          json: () => Promise.resolve({ valid: true, userId: 'mockUserId', email: 'test@example.com', payload: "testPayload" }),
                        })
                    );
                    const result = await LoginScreen.verifyToken('mockToken', mockSetUserId, mockSetSettings, false, mockSetLoggedIn, mockSetUserType, mockSetStaffRoles, mockSetLoading, mockSetUserInfo);
                    await waitFor(() => {
                        expect(mockSetLoading).toHaveBeenCalledWith(true);
                    });
                }); 

                test('when token is verified, set userInfo', async () => {
                    // Mock fetch for verifyToken
                    global.fetch = jest.fn(() =>
                        Promise.resolve({
                          ok: true,
                          json: () => Promise.resolve({ valid: true, userId: 'mockUserId', email: 'test@example.com', payload: "testPayload" }),
                        })
                    );
                    const result = await LoginScreen.verifyToken('mockToken', mockSetUserId, mockSetSettings, false, mockSetLoggedIn, mockSetUserType, mockSetStaffRoles, mockSetLoading, mockSetUserInfo);
                    await waitFor(() => {
                        expect(mockSetUserInfo).toHaveBeenCalledWith("testPayload");
                    });
                }); 

                test('when token is verified, should call the /api/checkAccount api route', async () => {
                    // Mock fetch for verifyToken
                    global.fetch = jest.fn(() =>
                        Promise.resolve({
                          ok: true,
                          json: () => Promise.resolve({ valid: true, userId: 'mockUserId', email: 'test@example.com', payload: "testPayload" }),
                        })
                    );
                    const result = await LoginScreen.verifyToken('mockToken', mockSetUserId, mockSetSettings, false, mockSetLoggedIn, mockSetUserType, mockSetStaffRoles, mockSetLoading, mockSetUserInfo);
                    await waitFor(() => {
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
                            json: () => Promise.resolve({ valid: true, userId: 'mockUserId', email: 'test@example.com', payload: "testPayload" })
                        })
                    ).mockImplementationOnce(() => // Mock for userExists
                        Promise.resolve({
                            json: () => Promise.resolve({ exists: true, user_info: {user_id: 'mockUserId', user_role: 'User', user_email: 'test@example.com'} })
                        })
                    ).mockImplementationOnce(() => // Mock for getUserSettings
                        Promise.resolve({
                            ok: true,
                            json: () => Promise.resolve({ exists: true, settings_info: { } })
                        })
                    );
                    const result = await LoginScreen.verifyToken('mockToken', mockSetUserId, mockSetSettings, false, mockSetLoggedIn, mockSetUserType, mockSetStaffRoles, mockSetLoading, mockSetUserInfo);
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
                          json: () => Promise.resolve({ exists: true, user_info: {user_id: 'mockUserId', user_role: 'User', user_email: 'test@example.com'} })
                        })
                    ).mockImplementationOnce(() => // Mock for getUserSettings
                        Promise.resolve({
                            json: () => Promise.resolve({ exists: true, settings_info: { font_size: 1, letter_spacing: 1 } })
                        })
                    );

                    Object.defineProperty(window, 'localStorage', {
                        value: {
                            getItem: jest.fn(() => null),
                            setItem: jest.fn(),
                        },
                        writable: true
                    });
                    
                    
                    const result = await LoginScreen.verifyToken(token, mockSetUserId, mockSetSettings, false, mockSetLoggedIn, mockSetUserType, mockSetStaffRoles, mockSetLoading, mockSetUserInfo);
                    
                    await waitFor(() => {
                        expect(mockSetLoggedIn).toHaveBeenCalledWith(true);
                    });
                });
                  

                test('successful response to /api/checkAccount api route should set the user type', async () => {
                    global.fetch = jest.fn().mockImplementationOnce(() =>
                        Promise.resolve({
                            json: () => Promise.resolve({ valid: true, userId: 'mockUserId', email: 'test@example.com', payload: "testPayload" })
                        })
                    ).mockImplementationOnce(() =>
                        Promise.resolve({
                            json: () => Promise.resolve({ exists: true, user_info: {userId: 'mockUserId', email: 'test@example.com', user_role: "Student"} })
                        })
                    ).mockImplementationOnce(() => // Mock for getUserSettings
                        Promise.resolve({
                            json: () => Promise.resolve({ exists: true, settings_info: { font_size: 1, letter_spacing: 1 } })
                        })
                    );
                    const result = await LoginScreen.verifyToken('mockToken', mockSetUserId, mockSetSettings, false, mockSetLoggedIn, mockSetUserType, mockSetStaffRoles, mockSetLoading, mockSetUserInfo);
                    //expect userExists to be called
                    await waitFor(() => {
                        expect(mockSetUserType).toHaveBeenCalledWith("Student");
                    });
                });

                test('if user type is not Staff, getStaffRoles is NOT called', async () => {
                    global.fetch = jest.fn().mockImplementationOnce(() =>
                        Promise.resolve({
                            json: () => Promise.resolve({ valid: true, userId: 'mockUserId', email: 'test@example.com', payload: "testPayload" })
                        })
                    ).mockImplementationOnce(() =>
                        Promise.resolve({
                            json: () => Promise.resolve({ exists: true, user_info: {userId: 'mockUserId', email: 'test@example.com', user_role: "Student"} })
                        })
                    ).mockImplementationOnce(() => // Mock for getUserSettings
                        Promise.resolve({
                            json: () => Promise.resolve({ exists: true, settings_info: { font_size: 1, letter_spacing: 1 } })
                        })
                    );
                    const result = await LoginScreen.verifyToken('mockToken', mockSetUserId, mockSetSettings, false, mockSetLoggedIn, mockSetUserType, mockSetStaffRoles, mockSetLoading, mockSetUserInfo);
                    //expect userExists to be called

                    await waitFor(() => {
                        expect(mockSetStaffRoles).not.toHaveBeenCalled();
                    });
                });
                
                test('if user type is Staff, getStaffRoles is called', async () => {
                    global.fetch = jest.fn()
                        .mockImplementationOnce(() => Promise.resolve({
                            json: () => Promise.resolve({ valid: true, userId: 'mockUserId', email: 'test@example.com', payload: "testPayload" })
                        }))
                        .mockImplementationOnce(() => Promise.resolve({
                            json: () => Promise.resolve({ exists: true, user_info: { user_id: 'mockUserId', email: 'test@example.com', user_role: "Staff" } })
                        })).mockImplementationOnce(() => // /api/getStaffRole
                        Promise.resolve({
                                text: () => Promise.resolve(JSON.stringify({
                                    user_id: "mockUserId",
                                    email: "test@example.com",
                                    name: 'Mock User',
                                    role: "Admin"
                                })),
                                ok: true
                            })
                        ).mockImplementationOnce(() => // Mock for getUserSettings
                            Promise.resolve({
                                json: () => Promise.resolve({ exists: true, settings_info: { font_size: 1, letter_spacing: 1 } })
                            })
                        );
                
                    console.log("Running test for Staff user role...");
                
                    const result = await LoginScreen.verifyToken('mockToken', mockSetUserId, mockSetSettings, false, mockSetLoggedIn, mockSetUserType, mockSetStaffRoles, mockSetLoading, mockSetUserInfo);
                    
                
                    await waitFor(() => {
                        expect(global.fetch).toHaveBeenCalledWith('/api/getStaffRole?user_id=mockUserId');
                    });
                
                    console.log("getStaffRoles API was called correctly.");
                });
                

                test('if user type is Staff & correct response from getStaffRoles calls setStaffRoles', async () => {
                    //call verifyToken() function
                    //mock correct response from /api/verifyToken with { valid: true, userId: userId, email: payload.email }

                    global.fetch = jest.fn()
                        .mockImplementationOnce(() => Promise.resolve({
                            json: () => Promise.resolve({ valid: true, userId: 'mockUserId', email: 'test@example.com', payload: "testPayload" })
                        }))
                        .mockImplementationOnce(() => Promise.resolve({
                            json: () => Promise.resolve({ exists: true, user_info: { user_id: 'mockUserId', email: 'test@example.com', user_role: "Staff" } })
                        })).mockImplementationOnce(() => // /api/getStaffRole
                        Promise.resolve({
                                text: () => Promise.resolve(JSON.stringify({
                                    user_id: "mockUserId",
                                    email: "test@example.com",
                                    name: 'Mock User',
                                    role: "Admin"
                                })),
                                ok: true
                            })
                        ).mockImplementationOnce(() => // Mock for getUserSettings
                            Promise.resolve({
                                json: () => Promise.resolve({ exists: true, settings_info: { font_size: 1, letter_spacing: 1 } })
                            })
                        );
                    const result = await LoginScreen.verifyToken('mockToken', mockSetUserId, mockSetSettings, false, mockSetLoggedIn, mockSetUserType, mockSetStaffRoles, mockSetLoading, mockSetUserInfo);

                    await waitFor(() => {
                        expect(mockSetStaffRoles).toHaveBeenCalledWith("Admin");
                    });
                });
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
                global.fetch = jest.fn().mockImplementationOnce(() =>
                    Promise.resolve({
                        text: () => Promise.resolve(JSON.stringify({
                            error: "No Staff Role Found"
                        })),
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
                    expect(console.error).toHaveBeenCalledWith('Failed', 404, 'Not Found');
                    expect(window.location.href).toBe('/');
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
                    expect(result).toEqual()
                });
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
                    expect(mockSetSettings).toHaveBeenCalledWith({font_size: 1, letter_spacing: 1});
                });
            });
        });
      
      
});
