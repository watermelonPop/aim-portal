import React from 'react';
import { render, screen, fireEvent, waitFor, act, useState } from '@testing-library/react';
import '@testing-library/jest-dom';
import { App } from '../App.js';
import { LoginScreen } from '../loginScreen';
import BasicSettingsBar from '../basicSettingsBar.js';

global.fetch = jest.fn();

describe('settingsPanel', () => {
        const mockSetLoggedIn = jest.fn();
        const mockSetSettings = jest.fn();
        const mockLogout = jest.fn();
        const mockOnClose = jest.fn();
        const mockHandleButtonAction = jest.fn();
        const mockChangeTxtSize = jest.fn();
        const mockSetDyslexiaSettings = jest.fn();
        const mockScrollEvent = jest.fn();
        const mockSetScrolledPosition = jest.fn();
       
       
        beforeEach(() => {
                jest.clearAllMocks();
        });
        describe('open & close panel', () => {
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
                        await App.setUserConnected(true);
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
                        await App.setUserConnected(true);
                    });
                
                    expect(screen.getByTestId('settings')).toHaveAttribute('aria-hidden', 'true');
            });
            test('clicking close button closes the settings panel', async () => {
                let mockSettings = {
                    content_size: 100,
                    highlight_tiles: false,
                    highlight_links: false,
                    text_magnifier: false,
                    align_text: "Middle",
                    font_size: "16px",
                    line_height: 5000,
                    letter_spacing: "5px",
                    contrast: "100%",
                    saturation: "Regular",
                    mute_sounds: false,
                    hide_images: false,
                    reading_mask: false,
                    highlight_hover: false,
                    cursor: "Regular"
                  };
                act(() => {
                    render(<BasicSettingsBar 
                        isOpen={true} 
                        onClose={mockOnClose} 
                        settings={mockSettings} 
                        setSettings={mockSetSettings}
                        logout={mockLogout} 
                        setLoggedIn={mockSetLoggedIn}
                    />);
                });
            
                await waitFor(() => {
                    const inc = screen.getByTestId('closeSettingsBtn');
                    fireEvent.click(inc);
                });

                await waitFor(() => {
                    expect(mockOnClose).toHaveBeenCalled();
                });
            });
        });

        describe('scroll behavior', () => {
            test('scroll position persists after button click', async () => {
                let mockSettings = {
                    content_size: 100,
                    highlight_tiles: false,
                    highlight_links: false,
                    text_magnifier: false,
                    align_text: "Middle",
                    font_size: "16px",
                    line_height: 5000,
                    letter_spacing: "5px",
                    contrast: "100%",
                    saturation: "Regular",
                    mute_sounds: false,
                    hide_images: false,
                    reading_mask: false,
                    highlight_hover: false,
                    cursor: "Regular"
                };
            
                act(() => {
                    render(<BasicSettingsBar 
                        isOpen={true} 
                        onClose={mockOnClose} 
                        settings={mockSettings} 
                        setSettings={mockSetSettings}
                        logout={mockLogout} 
                        setLoggedIn={mockSetLoggedIn}
                    />);
                });

                await act(async () => {
                    document.getElementById("settingsScroll").scrollTop = 35;
                    const inc = screen.getByTestId('contrastInc');
                    fireEvent.click(inc);
                });
        
                await waitFor(() => {
                    expect(document.getElementById("settingsScroll").scrollTop).toBe(35);
                });
            }); 

            test('scrolling triggers set local storage', async () => {
                window.HTMLElement.prototype.scrollIntoView = jest.fn();
                let mockSettings = {
                    content_size: 100,
                    highlight_tiles: false,
                    highlight_links: false,
                    text_magnifier: false,
                    align_text: "Middle",
                    font_size: "16px",
                    line_height: 5000,
                    letter_spacing: "5px",
                    contrast: "100%",
                    saturation: "Regular",
                    mute_sounds: false,
                    hide_images: false,
                    reading_mask: false,
                    highlight_hover: false,
                    cursor: "Regular"
                };
            
                act(() => {
                    render(<BasicSettingsBar 
                        isOpen={true} 
                        onClose={mockOnClose} 
                        settings={mockSettings} 
                        setSettings={mockSetSettings}
                        logout={mockLogout} 
                        setLoggedIn={mockSetLoggedIn}
                    />);
                });

                await act(async () => {
                    fireEvent.scroll(screen.getByTestId('settingsScroll'), { target: { scrollTop: 100 } });
                });

                await waitFor(() => {
                    expect(localStorage.getItem("scroll-position-settings")).toBe("100");
                });
            }); 
        });

        describe('disability profiles', () => {
            test('button sets dyslexia settings', async () => {
                let mockSettings = {
                    content_size: 100,
                    highlight_tiles: false,
                    highlight_links: false,
                    text_magnifier: false,
                    align_text: "Middle",
                    font_size: "16px",
                    line_height: 5000,
                    letter_spacing: "5px",
                    contrast: "100%",
                    saturation: "Regular",
                    mute_sounds: false,
                    hide_images: false,
                    reading_mask: false,
                    highlight_hover: false,
                    cursor: "Regular"
                };
            
                act(() => {
                    render(<BasicSettingsBar 
                        isOpen={true} 
                        onClose={mockOnClose} 
                        settings={mockSettings} 
                        setSettings={mockSetSettings}
                        logout={mockLogout} 
                        setLoggedIn={mockSetLoggedIn}
                    />);
                });

                await act(async () => {
                    const inc = screen.getByTestId('dyslexiaBtn');
                    fireEvent.click(inc);
                });
        
                await waitFor(() => {
                    expect(mockSetSettings).toHaveBeenCalledWith({
                        ...mockSettings,
                        font_size: "14px",
                        letter_spacing: "4.5px",
                        contrast: "50%"
                    });
                });
            }); 

            test('button sets visual impairment settings', async () => {
                let mockSettings = {
                    content_size: 100,
                    highlight_tiles: false,
                    highlight_links: false,
                    text_magnifier: false,
                    align_text: "Middle",
                    font_size: "16px",
                    line_height: 5000,
                    letter_spacing: "5px",
                    contrast: "100%",
                    saturation: "Regular",
                    mute_sounds: false,
                    hide_images: false,
                    reading_mask: false,
                    highlight_hover: false,
                    cursor: "Regular"
                };
            
                act(() => {
                    render(<BasicSettingsBar 
                        isOpen={true} 
                        onClose={mockOnClose} 
                        settings={mockSettings} 
                        setSettings={mockSetSettings}
                        logout={mockLogout} 
                        setLoggedIn={mockSetLoggedIn}
                    />);
                });

                await act(async () => {
                    const inc = screen.getByTestId('visImpBtn');
                    fireEvent.click(inc);
                });
        
                await waitFor(() => {
                    expect(mockSetSettings).toHaveBeenCalledWith({
                        ...mockSettings,
                        font_size: "16px",
                        letter_spacing: "2px",
                        contrast: "200%"
                    });
                });
            }); 

            test('button sets default settings', async () => {
                let mockSettings = {
                    content_size: 100,
                    highlight_tiles: false,
                    highlight_links: false,
                    text_magnifier: false,
                    align_text: "Middle",
                    font_size: "16px",
                    line_height: 5000,
                    letter_spacing: "5px",
                    contrast: "100%",
                    saturation: "Regular",
                    mute_sounds: false,
                    hide_images: false,
                    reading_mask: false,
                    highlight_hover: false,
                    cursor: "Regular"
                };
            
                act(() => {
                    render(<BasicSettingsBar 
                        isOpen={true} 
                        onClose={mockOnClose} 
                        settings={mockSettings} 
                        setSettings={mockSetSettings}
                        logout={mockLogout} 
                        setLoggedIn={mockSetLoggedIn}
                    />);
                });

                await act(async () => {
                    const inc = screen.getByTestId('defaultBtn');
                    fireEvent.click(inc);
                });
        
                await waitFor(() => {
                    expect(mockSetSettings).toHaveBeenCalledWith({
                        ...mockSettings,
                        font_size: "14px",
                        letter_spacing: "0px",
                        contrast: "100%"
                    });
                });
            }); 
        });

        describe('text size adjust', () => {
                test('display text size amount', async () => {
                    let mockSettings = {
                        content_size: 100,
                        highlight_tiles: false,
                        highlight_links: false,
                        text_magnifier: false,
                        align_text: "Middle",
                        font_size: "16px",
                        line_height: 5000,
                        letter_spacing: "0px",
                        contrast: "100%",
                        saturation: "Regular",
                        mute_sounds: false,
                        hide_images: false,
                        reading_mask: false,
                        highlight_hover: false,
                        cursor: "Regular"
                    };
                
                    act(() => {
                        render(<BasicSettingsBar 
                            isOpen={true} 
                            onClose={mockOnClose} 
                            settings={mockSettings} 
                            setSettings={mockSetSettings}
                            logout={mockLogout} 
                            setLoggedIn={mockSetLoggedIn}
                        />);
                    });
            
                    await waitFor(() => {
                        expect(screen.getByTestId('txtSizeLabel').textContent).toBe("16px");
                    });
                });

                describe('increase button', () => {
                    test('increases settings text size', async () => {
                        let mockSettings = {
                            content_size: 100,
                            highlight_tiles: false,
                            highlight_links: false,
                            text_magnifier: false,
                            align_text: "Middle",
                            font_size: "16px",
                            line_height: 5000,
                            letter_spacing: "5px",
                            contrast: "100%",
                            saturation: "Regular",
                            mute_sounds: false,
                            hide_images: false,
                            reading_mask: false,
                            highlight_hover: false,
                            cursor: "Regular"
                        };
                    
                        act(() => {
                            render(<BasicSettingsBar 
                                isOpen={true} 
                                onClose={mockOnClose} 
                                settings={mockSettings} 
                                setSettings={mockSetSettings}
                                logout={mockLogout} 
                                setLoggedIn={mockSetLoggedIn}
                            />);
                        });

                        await act(async () => {
                            const inc = screen.getByTestId('txtSizeInc');
                            fireEvent.click(inc);
                        });
                
                        await waitFor(() => {
                            expect(mockSetSettings).toHaveBeenCalledWith({
                                ...mockSettings,
                                font_size: "17px"
                            });
                        });
                    }); 
                    test('increases label text size', async () => {
                        let mockSettings = {
                            content_size: 100,
                            highlight_tiles: false,
                            highlight_links: false,
                            text_magnifier: false,
                            align_text: "Middle",
                            font_size: "16px",
                            line_height: 5000,
                            letter_spacing: "5px",
                            contrast: "100%",
                            saturation: "Regular",
                            mute_sounds: false,
                            hide_images: false,
                            reading_mask: false,
                            highlight_hover: false,
                            cursor: "Regular"
                        };
                    
                        const mockSetSetts = jest.fn((newSettings) => {
                            mockSettings = { ...mockSettings, ...newSettings };
                            rerender(<BasicSettingsBar 
                                isOpen={true} 
                                onClose={mockOnClose} 
                                settings={mockSettings} 
                                setSettings={mockSetSetts}
                                logout={mockLogout} 
                                setLoggedIn={mockSetLoggedIn}
                            />);
                        });
                    
                        const { rerender } = render(<BasicSettingsBar 
                            isOpen={true} 
                            onClose={mockOnClose} 
                            settings={mockSettings} 
                            setSettings={mockSetSetts}
                            logout={mockLogout} 
                            setLoggedIn={mockSetLoggedIn}
                        />);
                    
                        expect(screen.getByTestId('txtSizeLabel').textContent).toBe("16px");
                    
                        act(() => {
                            mockSetSetts({ font_size: "17px" });
                        });
                    
                        await waitFor(() => {
                            expect(screen.getByTestId('txtSizeLabel').textContent).toBe("17px");
                        });
                    });
                    test('increases text size css var', async () => {
                        let mockSettings = {
                            content_size: 100,
                            highlight_tiles: false,
                            highlight_links: false,
                            text_magnifier: false,
                            align_text: "Middle",
                            font_size: "16px",
                            line_height: 5000,
                            letter_spacing: "5px",
                            contrast: "100%",
                            saturation: "Regular",
                            mute_sounds: false,
                            hide_images: false,
                            reading_mask: false,
                            highlight_hover: false,
                            cursor: "Regular"
                        };
                    
                        const mockSetSetts = jest.fn((newSettings) => {
                            mockSettings = { ...mockSettings, ...newSettings };
                            document.documentElement.style.setProperty('--txtSize', mockSettings.font_size);
                            rerender(<BasicSettingsBar 
                                isOpen={true} 
                                onClose={mockOnClose} 
                                settings={mockSettings} 
                                setSettings={mockSetSetts}
                                logout={mockLogout} 
                                setLoggedIn={mockSetLoggedIn}
                            />);
                        });
                    
                        const { rerender } = render(<BasicSettingsBar 
                            isOpen={true} 
                            onClose={mockOnClose} 
                            settings={mockSettings} 
                            setSettings={mockSetSetts}
                            logout={mockLogout} 
                            setLoggedIn={mockSetLoggedIn}
                        />);
                    
                        act(() => {
                            mockSetSetts({ font_size: "17px" });
                        });
                    
                        await waitFor(() => {
                            expect(getComputedStyle(document.documentElement).getPropertyValue('--txtSize')).toBe('17px');
                        });
                    });
                    //should set database if databse user
                    //save to local storage if not databse user
                });

                describe('decrease button', () => {
                    test('decreases settings text size', async () => {
                        let mockSettings = {
                            content_size: 100,
                            highlight_tiles: false,
                            highlight_links: false,
                            text_magnifier: false,
                            align_text: "Middle",
                            font_size: "16px",
                            line_height: 5000,
                            letter_spacing: "5px",
                            contrast: "100%",
                            saturation: "Regular",
                            mute_sounds: false,
                            hide_images: false,
                            reading_mask: false,
                            highlight_hover: false,
                            cursor: "Regular"
                        };
                    
                        act(() => {
                            render(<BasicSettingsBar 
                                isOpen={true} 
                                onClose={mockOnClose} 
                                settings={mockSettings} 
                                setSettings={mockSetSettings}
                                logout={mockLogout} 
                                setLoggedIn={mockSetLoggedIn}
                            />);
                        });

                        await act(async () => {
                            const dec = screen.getByTestId('txtSizeDec');
                            fireEvent.click(dec);
                        });
                
                        await waitFor(() => {
                            expect(mockSetSettings).toHaveBeenCalledWith({
                                ...mockSettings,
                                font_size: "15px"
                            });
                        });
                    }); 
                    test('decreases label text size', async () => {
                        let mockSettings = {
                            content_size: 100,
                            highlight_tiles: false,
                            highlight_links: false,
                            text_magnifier: false,
                            align_text: "Middle",
                            font_size: "16px",
                            line_height: 5000,
                            letter_spacing: "5px",
                            contrast: "100%",
                            saturation: "Regular",
                            mute_sounds: false,
                            hide_images: false,
                            reading_mask: false,
                            highlight_hover: false,
                            cursor: "Regular"
                        };
                    
                        const mockSetSetts = jest.fn((newSettings) => {
                            mockSettings = { ...mockSettings, ...newSettings };
                            rerender(<BasicSettingsBar 
                                isOpen={true} 
                                onClose={mockOnClose} 
                                settings={mockSettings} 
                                setSettings={mockSetSetts}
                                logout={mockLogout} 
                                setLoggedIn={mockSetLoggedIn}
                            />);
                        });
                    
                        const { rerender } = render(<BasicSettingsBar 
                            isOpen={true} 
                            onClose={mockOnClose} 
                            settings={mockSettings} 
                            setSettings={mockSetSetts}
                            logout={mockLogout} 
                            setLoggedIn={mockSetLoggedIn}
                        />);
                    
                        expect(screen.getByTestId('txtSizeLabel').textContent).toBe("16px");
                    
                        act(() => {
                            mockSetSetts({ font_size: "15px" });
                        });
                    
                        await waitFor(() => {
                            expect(screen.getByTestId('txtSizeLabel').textContent).toBe("15px");
                        });
                    });
                    test('decreases text size css var', async () => {
                        let mockSettings = {
                            content_size: 100,
                            highlight_tiles: false,
                            highlight_links: false,
                            text_magnifier: false,
                            align_text: "Middle",
                            font_size: "16px",
                            line_height: 5000,
                            letter_spacing: "5px",
                            contrast: "100%",
                            saturation: "Regular",
                            mute_sounds: false,
                            hide_images: false,
                            reading_mask: false,
                            highlight_hover: false,
                            cursor: "Regular"
                        };
                    
                        const mockSetSetts = jest.fn((newSettings) => {
                            mockSettings = { ...mockSettings, ...newSettings };
                            document.documentElement.style.setProperty('--txtSize', mockSettings.font_size);
                            rerender(<BasicSettingsBar 
                                isOpen={true} 
                                onClose={mockOnClose} 
                                settings={mockSettings} 
                                setSettings={mockSetSetts}
                                logout={mockLogout} 
                                setLoggedIn={mockSetLoggedIn}
                            />);
                        });
                    
                        const { rerender } = render(<BasicSettingsBar 
                            isOpen={true} 
                            onClose={mockOnClose} 
                            settings={mockSettings} 
                            setSettings={mockSetSetts}
                            logout={mockLogout} 
                            setLoggedIn={mockSetLoggedIn}
                        />);
                    
                        act(() => {
                            mockSetSetts({ font_size: "15px" });
                        });
                    
                        await waitFor(() => {
                            expect(getComputedStyle(document.documentElement).getPropertyValue('--txtSize')).toBe('15px');
                        });
                    });
                    //no negative values !! sets it back to 0

                    test('values should be capped minimum 0, no negatives', async () => {
                        let mockSettings = {
                            content_size: 100,
                            highlight_tiles: false,
                            highlight_links: false,
                            text_magnifier: false,
                            align_text: "Middle",
                            font_size: "0px",
                            line_height: 5000,
                            letter_spacing: "5px",
                            contrast: "100%",
                            saturation: "Regular",
                            mute_sounds: false,
                            hide_images: false,
                            reading_mask: false,
                            highlight_hover: false,
                            cursor: "Regular"
                        };
                    
                        act(() => {
                            render(<BasicSettingsBar 
                                isOpen={true} 
                                onClose={mockOnClose} 
                                settings={mockSettings} 
                                setSettings={mockSetSettings}
                                logout={mockLogout} 
                                setLoggedIn={mockSetLoggedIn}
                            />);
                        });

                        await act(async () => {
                            const dec = screen.getByTestId('txtSizeDec');
                            fireEvent.click(dec);
                        });
                
                        await waitFor(() => {
                            expect(mockSetSettings).toHaveBeenCalledWith({
                                ...mockSettings,
                                font_size: "0px"
                            });
                        });
                    }); 
                    //should set database if databse user
                    //save to local storage if not databse user
                });
                    
        });

        describe('letter spacing adjust', () => {
                test('display letter spacing amount', async () => {
                    let mockSettings = {
                        content_size: 100,
                        highlight_tiles: false,
                        highlight_links: false,
                        text_magnifier: false,
                        align_text: "Middle",
                        font_size: "14px",
                        line_height: 5000,
                        letter_spacing: "5px",
                        contrast: "100%",
                        saturation: "Regular",
                        mute_sounds: false,
                        hide_images: false,
                        reading_mask: false,
                        highlight_hover: false,
                        cursor: "Regular"
                    };
                
                    act(() => {
                        render(<BasicSettingsBar 
                            isOpen={true} 
                            onClose={mockOnClose} 
                            settings={mockSettings} 
                            setSettings={mockSetSettings}
                            logout={mockLogout} 
                            setLoggedIn={mockSetLoggedIn}
                        />);
                    });
                
                    await waitFor(() => {
                        expect(screen.getByTestId('letterSpacingLabel').textContent).toBe("5px");
                    });
                });
                  
                describe('increase button', () => {
                    test('increases letter spacing css var', async () => {
                        let mockSettings = {
                            content_size: 100,
                            highlight_tiles: false,
                            highlight_links: false,
                            text_magnifier: false,
                            align_text: "Middle",
                            font_size: "16px",
                            line_height: 5000,
                            letter_spacing: "5px",
                            contrast: "100%",
                            saturation: "Regular",
                            mute_sounds: false,
                            hide_images: false,
                            reading_mask: false,
                            highlight_hover: false,
                            cursor: "Regular"
                        };
                    
                        const mockSetSetts = jest.fn((newSettings) => {
                            mockSettings = { ...mockSettings, ...newSettings };
                            document.documentElement.style.setProperty('--letterSpacing', mockSettings.letter_spacing);
                            rerender(<BasicSettingsBar 
                                isOpen={true} 
                                onClose={mockOnClose} 
                                settings={mockSettings} 
                                setSettings={mockSetSetts}
                                logout={mockLogout} 
                                setLoggedIn={mockSetLoggedIn}
                            />);
                        });
                    
                        const { rerender } = render(<BasicSettingsBar 
                            isOpen={true} 
                            onClose={mockOnClose} 
                            settings={mockSettings} 
                            setSettings={mockSetSetts}
                            logout={mockLogout} 
                            setLoggedIn={mockSetLoggedIn}
                        />);
                    
                        act(() => {
                            mockSetSetts({ letter_spacing: "6px" });
                        });
                    
                        await waitFor(() => {
                            expect(getComputedStyle(document.documentElement).getPropertyValue('--letterSpacing')).toBe('6px');
                        });
                    });

                    test('increases settings letter spacing', async () => {
                        let mockSettings = {
                            content_size: 100,
                            highlight_tiles: false,
                            highlight_links: false,
                            text_magnifier: false,
                            align_text: "Middle",
                            font_size: "16px",
                            line_height: 5000,
                            letter_spacing: "5px",
                            contrast: "100%",
                            saturation: "Regular",
                            mute_sounds: false,
                            hide_images: false,
                            reading_mask: false,
                            highlight_hover: false,
                            cursor: "Regular"
                        };
                    
                        act(() => {
                            render(<BasicSettingsBar 
                                isOpen={true} 
                                onClose={mockOnClose} 
                                settings={mockSettings} 
                                setSettings={mockSetSettings}
                                logout={mockLogout} 
                                setLoggedIn={mockSetLoggedIn}
                            />);
                        });

                        await act(async () => {
                            const inc = screen.getByTestId('letterSpacingInc');
                            fireEvent.click(inc);
                        });
                
                        await waitFor(() => {
                            expect(mockSetSettings).toHaveBeenCalledWith({
                                ...mockSettings,
                                letter_spacing: "6px"
                            });
                        });
                    }); 
                    test('increases label text size', async () => {
                        let mockSettings = {
                            content_size: 100,
                            highlight_tiles: false,
                            highlight_links: false,
                            text_magnifier: false,
                            align_text: "Middle",
                            font_size: "16px",
                            line_height: 5000,
                            letter_spacing: "5px",
                            contrast: "100%",
                            saturation: "Regular",
                            mute_sounds: false,
                            hide_images: false,
                            reading_mask: false,
                            highlight_hover: false,
                            cursor: "Regular"
                        };
                    
                        const mockSetSetts = jest.fn((newSettings) => {
                            mockSettings = { ...mockSettings, ...newSettings };
                            rerender(<BasicSettingsBar 
                                isOpen={true} 
                                onClose={mockOnClose} 
                                settings={mockSettings} 
                                setSettings={mockSetSetts}
                                logout={mockLogout} 
                                setLoggedIn={mockSetLoggedIn}
                            />);
                        });
                    
                        const { rerender } = render(<BasicSettingsBar 
                            isOpen={true} 
                            onClose={mockOnClose} 
                            settings={mockSettings} 
                            setSettings={mockSetSetts}
                            logout={mockLogout} 
                            setLoggedIn={mockSetLoggedIn}
                        />);
                    
                        expect(screen.getByTestId('letterSpacingLabel').textContent).toBe("5px");
                    
                        act(() => {
                            mockSetSetts({ letter_spacing: "6px" });
                        });
                    
                        await waitFor(() => {
                            expect(screen.getByTestId('letterSpacingLabel').textContent).toBe("6px");
                        });
                    });
                    //should set database if databse user
                    //save to local storage if not databse user
                });

                describe('decrease button', () => {
                    test('decreases letter spacing css var', async () => {
                        let mockSettings = {
                            content_size: 100,
                            highlight_tiles: false,
                            highlight_links: false,
                            text_magnifier: false,
                            align_text: "Middle",
                            font_size: "16px",
                            line_height: 5000,
                            letter_spacing: "5px",
                            contrast: "100%",
                            saturation: "Regular",
                            mute_sounds: false,
                            hide_images: false,
                            reading_mask: false,
                            highlight_hover: false,
                            cursor: "Regular"
                        };
                    
                        const mockSetSetts = jest.fn((newSettings) => {
                            mockSettings = { ...mockSettings, ...newSettings };
                            document.documentElement.style.setProperty('--letterSpacing', mockSettings.letter_spacing);
                            rerender(<BasicSettingsBar 
                                isOpen={true} 
                                onClose={mockOnClose} 
                                settings={mockSettings} 
                                setSettings={mockSetSetts}
                                logout={mockLogout} 
                                setLoggedIn={mockSetLoggedIn}
                            />);
                        });
                    
                        const { rerender } = render(<BasicSettingsBar 
                            isOpen={true} 
                            onClose={mockOnClose} 
                            settings={mockSettings} 
                            setSettings={mockSetSetts}
                            logout={mockLogout} 
                            setLoggedIn={mockSetLoggedIn}
                        />);
                    
                        act(() => {
                            mockSetSetts({ letter_spacing: "4px" });
                        });
                    
                        await waitFor(() => {
                            expect(getComputedStyle(document.documentElement).getPropertyValue('--letterSpacing')).toBe('4px');
                        });
                    });
                    test('decreases settings letter spacing', async () => {
                        let mockSettings = {
                            content_size: 100,
                            highlight_tiles: false,
                            highlight_links: false,
                            text_magnifier: false,
                            align_text: "Middle",
                            font_size: "16px",
                            line_height: 5000,
                            letter_spacing: "5px",
                            contrast: "100%",
                            saturation: "Regular",
                            mute_sounds: false,
                            hide_images: false,
                            reading_mask: false,
                            highlight_hover: false,
                            cursor: "Regular"
                        };
                    
                        act(() => {
                            render(<BasicSettingsBar 
                                isOpen={true} 
                                onClose={mockOnClose} 
                                settings={mockSettings} 
                                setSettings={mockSetSettings}
                                logout={mockLogout} 
                                setLoggedIn={mockSetLoggedIn}
                            />);
                        });

                        await act(async () => {
                            const dec = screen.getByTestId('letterSpacingDec');
                            fireEvent.click(dec);
                        });
                
                        await waitFor(() => {
                            expect(mockSetSettings).toHaveBeenCalledWith({
                                ...mockSettings,
                                letter_spacing: "4px"
                            });
                        });
                    }); 
                    test('decreases letter spacing label', async () => {
                        let mockSettings = {
                            content_size: 100,
                            highlight_tiles: false,
                            highlight_links: false,
                            text_magnifier: false,
                            align_text: "Middle",
                            font_size: "16px",
                            line_height: 5000,
                            letter_spacing: "5px",
                            contrast: "100%",
                            saturation: "Regular",
                            mute_sounds: false,
                            hide_images: false,
                            reading_mask: false,
                            highlight_hover: false,
                            cursor: "Regular"
                        };
                    
                        const mockSetSetts = jest.fn((newSettings) => {
                            mockSettings = { ...mockSettings, ...newSettings };
                            rerender(<BasicSettingsBar 
                                isOpen={true} 
                                onClose={mockOnClose} 
                                settings={mockSettings} 
                                setSettings={mockSetSetts}
                                logout={mockLogout} 
                                setLoggedIn={mockSetLoggedIn}
                            />);
                        });
                    
                        const { rerender } = render(<BasicSettingsBar 
                            isOpen={true} 
                            onClose={mockOnClose} 
                            settings={mockSettings} 
                            setSettings={mockSetSetts}
                            logout={mockLogout} 
                            setLoggedIn={mockSetLoggedIn}
                        />);
                    
                        expect(screen.getByTestId('letterSpacingLabel').textContent).toBe("5px");
                    
                        act(() => {
                            mockSetSetts({ letter_spacing: "4px" });
                        });
                    
                        await waitFor(() => {
                            expect(screen.getByTestId('letterSpacingLabel').textContent).toBe("4px");
                        });
                    });

                    //no negative values !! sets it back to 0

                    test('values should be capped minimum 0, no negatives', async () => {
                        let mockSettings = {
                            content_size: 100,
                            highlight_tiles: false,
                            highlight_links: false,
                            text_magnifier: false,
                            align_text: "Middle",
                            font_size: "0px",
                            line_height: 5000,
                            letter_spacing: "0px",
                            contrast: "100%",
                            saturation: "Regular",
                            mute_sounds: false,
                            hide_images: false,
                            reading_mask: false,
                            highlight_hover: false,
                            cursor: "Regular"
                        };
                    
                        act(() => {
                            render(<BasicSettingsBar 
                                isOpen={true} 
                                onClose={mockOnClose} 
                                settings={mockSettings} 
                                setSettings={mockSetSettings}
                                logout={mockLogout} 
                                setLoggedIn={mockSetLoggedIn}
                            />);
                        });

                        await act(async () => {
                            const dec = screen.getByTestId('letterSpacingDec');
                            fireEvent.click(dec);
                        });
                
                        await waitFor(() => {
                            expect(mockSetSettings).toHaveBeenCalledWith({
                                ...mockSettings,
                                letter_spacing: "0px"
                            });
                        });
                    }); 
                    //should set database if databse user
                    //save to local storage if not databse user
                });     
        });

        describe('contrast adjust', () => {
            test('display contrast amount', async () => {
                let mockSettings = {
                    content_size: 100,
                    highlight_tiles: false,
                    highlight_links: false,
                    text_magnifier: false,
                    align_text: "Middle",
                    font_size: "14px",
                    line_height: 5000,
                    letter_spacing: "5px",
                    contrast: "95%",
                    saturation: "Regular",
                    mute_sounds: false,
                    hide_images: false,
                    reading_mask: false,
                    highlight_hover: false,
                    cursor: "Regular"
                };
            
                act(() => {
                    render(<BasicSettingsBar 
                        isOpen={true} 
                        onClose={mockOnClose} 
                        settings={mockSettings} 
                        setSettings={mockSetSettings}
                        logout={mockLogout} 
                        setLoggedIn={mockSetLoggedIn}
                    />);
                });
            
                await waitFor(() => {
                    expect(screen.getByTestId('contrastLabel').textContent).toBe("95%");
                });
            });
              
            describe('increase button', () => {
                test('increases contrast css var', async () => {
                    let mockSettings = {
                        content_size: 100,
                        highlight_tiles: false,
                        highlight_links: false,
                        text_magnifier: false,
                        align_text: "Middle",
                        font_size: "16px",
                        line_height: 5000,
                        letter_spacing: "5px",
                        contrast: "100%",
                        saturation: "Regular",
                        mute_sounds: false,
                        hide_images: false,
                        reading_mask: false,
                        highlight_hover: false,
                        cursor: "Regular"
                    };
                
                    const mockSetSetts = jest.fn((newSettings) => {
                        mockSettings = { ...mockSettings, ...newSettings };
                        document.documentElement.style.setProperty('--contrast', mockSettings.contrast);
                        rerender(<BasicSettingsBar 
                            isOpen={true} 
                            onClose={mockOnClose} 
                            settings={mockSettings} 
                            setSettings={mockSetSetts}
                            logout={mockLogout} 
                            setLoggedIn={mockSetLoggedIn}
                        />);
                    });
                
                    const { rerender } = render(<BasicSettingsBar 
                        isOpen={true} 
                        onClose={mockOnClose} 
                        settings={mockSettings} 
                        setSettings={mockSetSetts}
                        logout={mockLogout} 
                        setLoggedIn={mockSetLoggedIn}
                    />);
                
                    act(() => {
                        mockSetSetts({ contrast: "105%" });
                    });
                
                    await waitFor(() => {
                        expect(getComputedStyle(document.documentElement).getPropertyValue('--contrast')).toBe('105%');
                    });
                });

                test('increases settings contrast by 5%', async () => {
                    let mockSettings = {
                        content_size: 100,
                        highlight_tiles: false,
                        highlight_links: false,
                        text_magnifier: false,
                        align_text: "Middle",
                        font_size: "16px",
                        line_height: 5000,
                        letter_spacing: "5px",
                        contrast: "100%",
                        saturation: "Regular",
                        mute_sounds: false,
                        hide_images: false,
                        reading_mask: false,
                        highlight_hover: false,
                        cursor: "Regular"
                    };
                
                    act(() => {
                        render(<BasicSettingsBar 
                            isOpen={true} 
                            onClose={mockOnClose} 
                            settings={mockSettings} 
                            setSettings={mockSetSettings}
                            logout={mockLogout} 
                            setLoggedIn={mockSetLoggedIn}
                        />);
                    });

                    await act(async () => {
                        const inc = screen.getByTestId('contrastInc');
                        fireEvent.click(inc);
                    });
            
                    await waitFor(() => {
                        expect(mockSetSettings).toHaveBeenCalledWith({
                            ...mockSettings,
                            contrast: "105%"
                        });
                    });
                }); 
                test('increases contrast label by 5%', async () => {
                    let mockSettings = {
                        content_size: 100,
                        highlight_tiles: false,
                        highlight_links: false,
                        text_magnifier: false,
                        align_text: "Middle",
                        font_size: "16px",
                        line_height: 5000,
                        letter_spacing: "5px",
                        contrast: "100%",
                        saturation: "Regular",
                        mute_sounds: false,
                        hide_images: false,
                        reading_mask: false,
                        highlight_hover: false,
                        cursor: "Regular"
                    };
                
                    const mockSetSetts = jest.fn((newSettings) => {
                        mockSettings = { ...mockSettings, ...newSettings };
                        rerender(<BasicSettingsBar 
                            isOpen={true} 
                            onClose={mockOnClose} 
                            settings={mockSettings} 
                            setSettings={mockSetSetts}
                            logout={mockLogout} 
                            setLoggedIn={mockSetLoggedIn}
                        />);
                    });
                
                    const { rerender } = render(<BasicSettingsBar 
                        isOpen={true} 
                        onClose={mockOnClose} 
                        settings={mockSettings} 
                        setSettings={mockSetSetts}
                        logout={mockLogout} 
                        setLoggedIn={mockSetLoggedIn}
                    />);
                
                    expect(screen.getByTestId('contrastLabel').textContent).toBe("100%");
                
                    act(() => {
                        mockSetSetts({ contrast: "105%" });
                    });
                
                    await waitFor(() => {
                        expect(screen.getByTestId('contrastLabel').textContent).toBe("105%");
                    });
                });

                //should set database if databse user
                //save to local storage if not databse user
            });

            describe('decrease button', () => {
                test('decreases contrast css var', async () => {
                    let mockSettings = {
                        content_size: 100,
                        highlight_tiles: false,
                        highlight_links: false,
                        text_magnifier: false,
                        align_text: "Middle",
                        font_size: "16px",
                        line_height: 5000,
                        letter_spacing: "5px",
                        contrast: "100%",
                        saturation: "Regular",
                        mute_sounds: false,
                        hide_images: false,
                        reading_mask: false,
                        highlight_hover: false,
                        cursor: "Regular"
                    };
                
                    const mockSetSetts = jest.fn((newSettings) => {
                        mockSettings = { ...mockSettings, ...newSettings };
                        document.documentElement.style.setProperty('--contrast', mockSettings.contrast);
                        rerender(<BasicSettingsBar 
                            isOpen={true} 
                            onClose={mockOnClose} 
                            settings={mockSettings} 
                            setSettings={mockSetSetts}
                            logout={mockLogout} 
                            setLoggedIn={mockSetLoggedIn}
                        />);
                    });
                
                    const { rerender } = render(<BasicSettingsBar 
                        isOpen={true} 
                        onClose={mockOnClose} 
                        settings={mockSettings} 
                        setSettings={mockSetSetts}
                        logout={mockLogout} 
                        setLoggedIn={mockSetLoggedIn}
                    />);
                
                    act(() => {
                        mockSetSetts({ contrast: "95%" });
                    });
                
                    await waitFor(() => {
                        expect(getComputedStyle(document.documentElement).getPropertyValue('--contrast')).toBe('95%');
                    });
                });
                test('decreases settings contrast by 5%', async () => {
                    let mockSettings = {
                        content_size: 100,
                        highlight_tiles: false,
                        highlight_links: false,
                        text_magnifier: false,
                        align_text: "Middle",
                        font_size: "16px",
                        line_height: 5000,
                        letter_spacing: "5px",
                        contrast: "100%",
                        saturation: "Regular",
                        mute_sounds: false,
                        hide_images: false,
                        reading_mask: false,
                        highlight_hover: false,
                        cursor: "Regular"
                    };
                
                    act(() => {
                        render(<BasicSettingsBar 
                            isOpen={true} 
                            onClose={mockOnClose} 
                            settings={mockSettings} 
                            setSettings={mockSetSettings}
                            logout={mockLogout} 
                            setLoggedIn={mockSetLoggedIn}
                        />);
                    });

                    await act(async () => {
                        const dec = screen.getByTestId('contrastDec');
                        fireEvent.click(dec);
                    });
            
                    await waitFor(() => {
                        expect(mockSetSettings).toHaveBeenCalledWith({
                            ...mockSettings,
                            contrast: "95%"
                        });
                    });
                }); 
                test('decreases contrast label by 5%', async () => {
                    let mockSettings = {
                        content_size: 100,
                        highlight_tiles: false,
                        highlight_links: false,
                        text_magnifier: false,
                        align_text: "Middle",
                        font_size: "16px",
                        line_height: 5000,
                        letter_spacing: "5px",
                        contrast: "100%",
                        saturation: "Regular",
                        mute_sounds: false,
                        hide_images: false,
                        reading_mask: false,
                        highlight_hover: false,
                        cursor: "Regular"
                    };
                
                    const mockSetSetts = jest.fn((newSettings) => {
                        mockSettings = { ...mockSettings, ...newSettings };
                        rerender(<BasicSettingsBar 
                            isOpen={true} 
                            onClose={mockOnClose} 
                            settings={mockSettings} 
                            setSettings={mockSetSetts}
                            logout={mockLogout} 
                            setLoggedIn={mockSetLoggedIn}
                        />);
                    });
                
                    const { rerender } = render(<BasicSettingsBar 
                        isOpen={true} 
                        onClose={mockOnClose} 
                        settings={mockSettings} 
                        setSettings={mockSetSetts}
                        logout={mockLogout} 
                        setLoggedIn={mockSetLoggedIn}
                    />);
                
                    expect(screen.getByTestId('contrastLabel').textContent).toBe("100%");
                
                    act(() => {
                        mockSetSetts({ contrast: "95%" });
                    });
                
                    await waitFor(() => {
                        expect(screen.getByTestId('contrastLabel').textContent).toBe("95%");
                    });
                });

                //no negative values !! sets it back to 0

                test('values should be capped minimum 0, no negatives', async () => {
                    let mockSettings = {
                        content_size: 100,
                        highlight_tiles: false,
                        highlight_links: false,
                        text_magnifier: false,
                        align_text: "Middle",
                        font_size: "0px",
                        line_height: 5000,
                        letter_spacing: "0px",
                        contrast: "3%",
                        saturation: "Regular",
                        mute_sounds: false,
                        hide_images: false,
                        reading_mask: false,
                        highlight_hover: false,
                        cursor: "Regular"
                    };
                
                    act(() => {
                        render(<BasicSettingsBar 
                            isOpen={true} 
                            onClose={mockOnClose} 
                            settings={mockSettings} 
                            setSettings={mockSetSettings}
                            logout={mockLogout} 
                            setLoggedIn={mockSetLoggedIn}
                        />);
                    });

                    await act(async () => {
                        const dec = screen.getByTestId('contrastDec');
                        fireEvent.click(dec);
                    });
            
                    await waitFor(() => {
                        expect(mockSetSettings).toHaveBeenCalledWith({
                            ...mockSettings,
                            contrast: "0%"
                        });
                    });
                }); 
                //should set database if databse user
                //save to local storage if not databse user
            });     
        });
});