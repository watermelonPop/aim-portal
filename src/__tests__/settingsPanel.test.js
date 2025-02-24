import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { App } from '../App.js';
import { LoginScreen } from '../loginScreen';

// Mock the fetch function
global.fetch = jest.fn();

describe('settingsPanel', () => {
        const mockSetLoggedIn = jest.fn();
        const mockSetUserType = jest.fn();
        const mockSetStaffRoles = jest.fn();
        const mockSetUserId = jest.fn();
        const mockSetSettings = jest.fn();
        const mockSetLoading = jest.fn();
        const mockLoggedIn = true;
       
       
        beforeEach(() => {
                jest.clearAllMocks();
        });

        test('clicking the button opens the settings panel', async () => {
                global.fetch = jest.fn().mockResolvedValueOnce({
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
                    const button = screen.getByTestId('settingsBtn');
                    fireEvent.click(button);
                });
            
                expect(screen.getByTestId('settings')).toBeInTheDocument();
                expect(screen.getByTestId('settings')).toHaveAttribute('aria-hidden', 'false');
        });

        test('by default, settings panel should NOT be open', async () => {
                global.fetch = jest.fn().mockResolvedValueOnce({
                    ok: true,
                    json: () => Promise.resolve({ success: true })
                });
                
                act(() => {
                    render(<App />);
                });
            
                await act(async () => {
                    await App.setLoggedIn(true);
                });
            
                expect(screen.getByTestId('settings')).toHaveAttribute('aria-hidden', 'true');
        });

        describe('text size adjust', () => {

                test('display text size amount', async () => {
                        // Mock all fetch calls
                        global.fetch = jest.fn().mockImplementation(() =>
                            Promise.resolve({
                                ok: true,
                                json: () => Promise.resolve({ success: true })
                            })
                        );
                        
                        act(() => {
                            render(<App />);
                        });
                    
                        await act(async () => {
                            await App.setLoggedIn(true);
                        });
                        
                        await waitFor(() => {
                            const button = screen.getByTestId('settingsBtn');
                            fireEvent.click(button);
                        });
                        
                        await waitFor(() => {});
                        
                        expect(screen.getByTestId('txtSizeLabel').textContent).toBe("100%");
                });
                    
                    
                test('increase text size button', async () => {
                        // Mock all fetch calls
                        global.fetch = jest.fn().mockImplementation(() =>
                                Promise.resolve({
                                    ok: true,
                                    json: () => Promise.resolve({ success: true })
                                })
                            );
                            
                            act(() => {
                                render(<App />);
                            });
                        
                            await act(async () => {
                                await App.setLoggedIn(true);
                            });
                            
                            await waitFor(() => {
                                const button = screen.getByTestId('settingsBtn');
                                fireEvent.click(button);
                            });
                        
                            await waitFor(() => {
                                const inc = screen.getByTestId('txtSizeInc');
                                fireEvent.click(inc);
                            });
                            
                            await waitFor(() => {});
                        
                            const computedStyle = window.getComputedStyle(document.documentElement);
                            const txtChangeSizeAmount = computedStyle.getPropertyValue('--txtChangeSizeAmount');
                            
                            expect(parseFloat(txtChangeSizeAmount)).toBe(1.1);
                });

                test('decrease text size button', async () => {
                        // Mock all fetch calls
                        global.fetch = jest.fn().mockImplementation(() =>
                                Promise.resolve({
                                    ok: true,
                                    json: () => Promise.resolve({ success: true })
                                })
                            );
                            
                            act(() => {
                                render(<App />);
                            });
                        
                            await act(async () => {
                                await App.setLoggedIn(true);
                            });
                            
                            await waitFor(() => {
                                const button = screen.getByTestId('settingsBtn');
                                fireEvent.click(button);
                            });
                        
                            await waitFor(() => {
                                const inc = screen.getByTestId('txtSizeDec');
                                fireEvent.click(inc);
                            });
                            
                            await waitFor(() => {});
                        
                            const computedStyle = window.getComputedStyle(document.documentElement);
                            const txtChangeSizeAmount = computedStyle.getPropertyValue('--txtChangeSizeAmount');
                            
                            expect(parseFloat(txtChangeSizeAmount)).toBe(1.0);
                });

                test('save to local storage', async () => {
                        // Mock all fetch calls
                        global.fetch = jest.fn().mockImplementation(() =>
                            Promise.resolve({
                                ok: true,
                                json: () => Promise.resolve({ success: true })
                            })
                        );
                        
                        act(() => {
                            render(<App />);
                        });
                    
                        await act(async () => {
                            await App.setLoggedIn(true);
                        });
                        
                        await waitFor(() => {
                            const button = screen.getByTestId('settingsBtn');
                            fireEvent.click(button);
                        });
                        await waitFor(() => {
                                const inc = screen.getByTestId('txtSizeInc');
                                fireEvent.click(inc);
                        });
                        
                        await waitFor(() => {});
                
                        expect(JSON.parse(localStorage.getItem("aim-settings")).font_size).toBe(1.1);
                });

                test('when user has account, call /api/setSettings', async () => {
                        // Mock all fetch calls
                        global.fetch = jest.fn().mockImplementation(() =>
                            Promise.resolve({
                                ok: true,
                                json: () => Promise.resolve({ success: true })
                            })
                        );
                        
                        act(() => {
                            render(<App />);
                        });
                    
                        await act(async () => {
                            await App.setLoggedIn(true);
                            await App.setUserType("Student");
                            await App.setUserId('mockUserId');
                        });
                        
                        await waitFor(() => {
                            const button = screen.getByTestId('settingsBtn');
                            fireEvent.click(button);
                        });
                    
                        await waitFor(() => {
                            const inc = screen.getByTestId('txtSizeInc');
                            fireEvent.click(inc);
                        });
                    
                        // Wait for any asynchronous operations to complete
                        await waitFor(() => {
                                expect(global.fetch).toHaveBeenCalledWith('/api/setSettings', expect.objectContaining({
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: expect.stringContaining('"user_id":"mockUserId"')
                                }));
                        });

                        const lastCall = global.fetch.mock.calls[global.fetch.mock.calls.length - 1];
                        const requestBody = JSON.parse(lastCall[1].body);
                        expect(requestBody).toEqual({
                                user_id: 'mockUserId',
                                settings: expect.objectContaining({
                                content_size: 100,
                                highlight_tiles: false,
                                highlight_links: false,
                                text_magnifier: false,
                                align_text: "Middle",
                                font_size: 1.2, // Use expect.any(Number) instead of a specific value
                                line_height: 5000,
                                letter_spacing: 1,
                                contrast: "Regular",
                                saturation: "Regular",
                                mute_sounds: false,
                                hide_images: false,
                                reading_mask: false,
                                highlight_hover: false,
                                cursor: "Regular"
                                })
                        });
                        
                });
                    
        });

        describe('letter spacing adjust', () => {
                test('display letter spacing amount', async () => {
                        // Mock all fetch calls
                        global.fetch = jest.fn().mockImplementation(() =>
                            Promise.resolve({
                                ok: true,
                                json: () => Promise.resolve({ success: true })
                            })
                        );
                        
                        act(() => {
                            render(<App />);
                        });
                    
                        await act(async () => {
                            await App.setLoggedIn(true);
                        });
                        
                        await waitFor(() => {
                            const button = screen.getByTestId('settingsBtn');
                            fireEvent.click(button);
                        });
                        
                        await waitFor(() => {});
                    
                        expect(screen.getByTestId('letterSpacingLabel').textContent).toBe("100%");
                });
                    
                    
                test('increase letter spacing button', async () => {
                        // Mock all fetch calls
                        global.fetch = jest.fn().mockImplementation(() =>
                                Promise.resolve({
                                    ok: true,
                                    json: () => Promise.resolve({ success: true })
                                })
                            );
                            
                            act(() => {
                                render(<App />);
                            });
                        
                            await act(async () => {
                                await App.setLoggedIn(true);
                            });
                            
                            await waitFor(() => {
                                const button = screen.getByTestId('settingsBtn');
                                fireEvent.click(button);
                            });
                        
                            await waitFor(() => {
                                const inc = screen.getByTestId('letterSpacingInc');
                                fireEvent.click(inc);
                            });
                            
                            await waitFor(() => {});
                        
                            const computedStyle = window.getComputedStyle(document.documentElement);
                            const letterSpacingChangeSizeAmount = computedStyle.getPropertyValue('--letterSpacingChangeSizeAmount');
                            
                            expect(parseFloat(letterSpacingChangeSizeAmount)).toBe(2);
                });

                test('decrease letter spacing button', async () => {
                        global.fetch = jest.fn().mockImplementation(() =>
                                Promise.resolve({
                                    ok: true,
                                    json: () => Promise.resolve({ success: true })
                                })
                            );
                            
                            act(() => {
                                render(<App />);
                            });
                        
                            await act(async () => {
                                await App.setLoggedIn(true);
                            });
                            
                            await waitFor(() => {
                                const button = screen.getByTestId('settingsBtn');
                                fireEvent.click(button);
                            });
                        
                            await waitFor(() => {
                                const dec = screen.getByTestId('letterSpacingDec');
                                fireEvent.click(dec);
                            });
                            
                            await waitFor(() => {});
                        
                            const computedStyle = window.getComputedStyle(document.documentElement);
                            const letterSpacingChangeSizeAmount = computedStyle.getPropertyValue('--letterSpacingChangeSizeAmount');
                            
                            expect(parseFloat(letterSpacingChangeSizeAmount)).toBe(1);
                });

                test('save to local storage', async () => {
                        // Mock all fetch calls
                        global.fetch = jest.fn().mockImplementation(() =>
                            Promise.resolve({
                                ok: true,
                                json: () => Promise.resolve({ success: true })
                            })
                        );
                        
                        act(() => {
                            render(<App />);
                        });
                    
                        await act(async () => {
                            await App.setLoggedIn(true);
                        });
                        
                        await waitFor(() => {
                            const button = screen.getByTestId('settingsBtn');
                            fireEvent.click(button);
                        });
                        await waitFor(() => {
                                const inc = screen.getByTestId('letterSpacingInc');
                                fireEvent.click(inc);
                        });
                        
                        await waitFor(() => {});
                
                        expect(JSON.parse(localStorage.getItem("aim-settings")).letter_spacing).toBe(2);
                });

                test('when user has account, call /api/setSettings', async () => {
                        // Mock all fetch calls
                        global.fetch = jest.fn().mockImplementation(() =>
                            Promise.resolve({
                                ok: true,
                                json: () => Promise.resolve({ success: true })
                            })
                        );
                        
                        act(() => {
                            render(<App />);
                        });
                    
                        await act(async () => {
                            await App.setLoggedIn(true);
                            await App.setUserType("Student");
                            await App.setUserId('mockUserId');
                        });
                        
                        await waitFor(() => {
                            const button = screen.getByTestId('settingsBtn');
                            fireEvent.click(button);
                        });
                    
                        await waitFor(() => {
                            const inc = screen.getByTestId('letterSpacingInc');
                            fireEvent.click(inc);
                        });
                    
                        // Wait for any asynchronous operations to complete
                        await waitFor(() => {
                                expect(global.fetch).toHaveBeenCalledWith('/api/setSettings', expect.objectContaining({
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: expect.stringContaining('"user_id":"mockUserId"')
                                }));
                        });

                        const lastCall = global.fetch.mock.calls[global.fetch.mock.calls.length - 1];
                        const requestBody = JSON.parse(lastCall[1].body);
                        expect(requestBody).toEqual({
                                user_id: 'mockUserId',
                                settings: expect.objectContaining({
                                content_size: 100,
                                highlight_tiles: false,
                                highlight_links: false,
                                text_magnifier: false,
                                align_text: "Middle",
                                font_size: expect.any(Number), // Use expect.any(Number) instead of a specific value
                                line_height: 5000,
                                letter_spacing: 3,
                                contrast: "Regular",
                                saturation: "Regular",
                                mute_sounds: false,
                                hide_images: false,
                                reading_mask: false,
                                highlight_hover: false,
                                cursor: "Regular"
                                })
                        });
                        
                });
        });
});