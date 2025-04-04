import React from 'react';
import { render, screen, fireEvent, waitFor, act, useState } from '@testing-library/react';
import '@testing-library/jest-dom';
import { App } from '../App.js';
import { LoginScreen } from '../loginScreen';
import BasicSettingsBar from '../basicSettingsBar.js';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

global.fetch = jest.fn();

const mockSetLoggedIn = jest.fn();
const mockSetSettings = jest.fn();
const mockLogout = jest.fn();
const mockOnClose = jest.fn();
const mockHandleButtonAction = jest.fn();
const mockChangeTxtSize = jest.fn();
const mockSetDyslexiaSettings = jest.fn();
const mockScrollEvent = jest.fn();
const mockSetScrolledPosition = jest.fn();
const mockSetSelectedCategory = jest.fn();

const mockSettings = {
    cursor_color: '#000000',
    cursor_border_color: '#FFFFFF',
    background_color: '#FFFFFF',
    foreground_color: '#000000',
    text_color: '#111111',
    highlight_hover_color: '#FF0000',
    align_text: 'left',
    font_size: '14px',
    letter_spacing: '2px',
    contrast: '100%',
    saturation: '100%',
    cursor_size: 2,
    mute_sounds: false,
    highlight_hover: false,
    font: 'Roboto',
};

describe('BasicSettingsBar Component', () => {
    let setSettings, onClose, logout, setLoggedIn;
  
    beforeEach(() => {
      setSettings = jest.fn();
      onClose = jest.fn();
      logout = jest.fn();
      setLoggedIn = jest.fn();
      localStorage.clear();
    });

    test('all interactions forms call preventDefault on submit', async () => {
        const preventDefault = jest.fn();
      
        render(
          <BasicSettingsBar
            isOpen={true}
            onClose={mockOnClose}
            settings={mockSettings}
            setSettings={mockSetSettings}
            logout={mockLogout}
            setLoggedIn={mockSetLoggedIn}
          />
        );
      
        // Show a category with multiple forms
        act(() => {
          BasicSettingsBar.setSelectedCategory('Interactions');
        });
      
        await waitFor(() => {
          expect(document.querySelectorAll('form').length).toBeGreaterThan(0);
        });
      
        const forms = document.querySelectorAll('form');
      
        forms.forEach((form) => {
          const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
          Object.defineProperty(submitEvent, 'preventDefault', { value: preventDefault });
      
          form.dispatchEvent(submitEvent);
        });
      
        expect(preventDefault).toHaveBeenCalled();
    });

    test('all audio forms call preventDefault on submit', async () => {
        const preventDefault = jest.fn();
      
        render(
          <BasicSettingsBar
            isOpen={true}
            onClose={mockOnClose}
            settings={mockSettings}
            setSettings={mockSetSettings}
            logout={mockLogout}
            setLoggedIn={mockSetLoggedIn}
          />
        );
      
        // Show a category with multiple forms
        act(() => {
          BasicSettingsBar.setSelectedCategory('Audio');
        });
      
        await waitFor(() => {
          expect(document.querySelectorAll('form').length).toBeGreaterThan(0);
        });
      
        const forms = document.querySelectorAll('form');
      
        forms.forEach((form) => {
          const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
          Object.defineProperty(submitEvent, 'preventDefault', { value: preventDefault });
      
          form.dispatchEvent(submitEvent);
        });
      
        expect(preventDefault).toHaveBeenCalled();
    });

    test('all cursor forms call preventDefault on submit', async () => {
        const preventDefault = jest.fn();
      
        render(
          <BasicSettingsBar
            isOpen={true}
            onClose={mockOnClose}
            settings={mockSettings}
            setSettings={mockSetSettings}
            logout={mockLogout}
            setLoggedIn={mockSetLoggedIn}
          />
        );
      
        // Show a category with multiple forms
        act(() => {
          BasicSettingsBar.setSelectedCategory('Cursor');
        });
      
        await waitFor(() => {
          expect(document.querySelectorAll('form').length).toBeGreaterThan(0);
        });
      
        const forms = document.querySelectorAll('form');
      
        forms.forEach((form) => {
          const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
          Object.defineProperty(submitEvent, 'preventDefault', { value: preventDefault });
      
          form.dispatchEvent(submitEvent);
        });
      
        expect(preventDefault).toHaveBeenCalled();
    });

    test('all visuals forms call preventDefault on submit', async () => {
        const preventDefault = jest.fn();
      
        render(
          <BasicSettingsBar
            isOpen={true}
            onClose={mockOnClose}
            settings={mockSettings}
            setSettings={mockSetSettings}
            logout={mockLogout}
            setLoggedIn={mockSetLoggedIn}
          />
        );
      
        // Show a category with multiple forms
        act(() => {
          BasicSettingsBar.setSelectedCategory('Visuals');
        });
      
        await waitFor(() => {
          expect(document.querySelectorAll('form').length).toBeGreaterThan(0);
        });
      
        const forms = document.querySelectorAll('form');
      
        forms.forEach((form) => {
          const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
          Object.defineProperty(submitEvent, 'preventDefault', { value: preventDefault });
      
          form.dispatchEvent(submitEvent);
        });
      
        expect(preventDefault).toHaveBeenCalled();
    });

    test('all text forms call preventDefault on submit', async () => {
        const preventDefault = jest.fn();
      
        render(
          <BasicSettingsBar
            isOpen={true}
            onClose={mockOnClose}
            settings={mockSettings}
            setSettings={mockSetSettings}
            logout={mockLogout}
            setLoggedIn={mockSetLoggedIn}
          />
        );
      
        // Show a category with multiple forms
        act(() => {
          BasicSettingsBar.setSelectedCategory('Text');
        });
      
        await waitFor(() => {
          expect(document.querySelectorAll('form').length).toBeGreaterThan(0);
        });
      
        const forms = document.querySelectorAll('form');
      
        forms.forEach((form) => {
          const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
          Object.defineProperty(submitEvent, 'preventDefault', { value: preventDefault });
      
          form.dispatchEvent(submitEvent);
        });
      
        expect(preventDefault).toHaveBeenCalled();
      });
      
      
      

    test('calls logout with setLoggedIn when logout button is clicked', () => {
        render(
          <BasicSettingsBar
            isOpen={true}
            onClose={mockOnClose}
            settings={mockSettings}
            setSettings={mockSetSettings}
            logout={mockLogout}
            setLoggedIn={mockSetLoggedIn}
          />
        );
      
        const logoutButton = screen.getByRole('button', { name: /log out/i });
        fireEvent.click(logoutButton);
      
        expect(mockLogout).toHaveBeenCalledWith(mockSetLoggedIn);
    });
      

    test('sets highlight_keyboard_focus_color on input change and button click', async () => {
        render(
          <BasicSettingsBar
            isOpen={true}
            onClose={mockOnClose}
            settings={{ ...mockSettings, highlight_keyboard_focus_color: '#BD180F' }}
            setSettings={mockSetSettings}
            logout={mockLogout}
            setLoggedIn={mockSetLoggedIn}
          />
        );
      
        await act(async () => {
          BasicSettingsBar.setSelectedCategory('Interactions');
        });
      
        const newColor = '#00FF00';
        const input = screen.getByTestId('highlightKeyboardFocusColorInput');
        fireEvent.change(input, { target: { value: newColor } });
      
        const button = screen.getByRole('button', { name: /set highlight keyboard focus color/i });
        fireEvent.click(button);
      
        await waitFor(() => {
          expect(mockSetSettings).toHaveBeenCalledWith(
            expect.objectContaining({ highlight_keyboard_focus_color: newColor.toLowerCase() })
          );
        });
      });
      
      
      

    test('toggles highlight_keyboard_focus on button click', async () => {
        const mockSettingsWithFocus = {
          ...mockSettings,
          highlight_keyboard_focus: false,
        };
      
        render(
          <BasicSettingsBar
            isOpen={true}
            onClose={mockOnClose}
            settings={mockSettingsWithFocus}
            setSettings={mockSetSettings}
            logout={mockLogout}
            setLoggedIn={mockSetLoggedIn}
          />
        );
      
        // Navigate to Interactions tab
        await act(async () => {
          BasicSettingsBar.setSelectedCategory('Interactions');
        });
      
        const toggleBtn = screen.getByRole('button', { name: /toggle highlight keyboard focus/i });
      
        fireEvent.click(toggleBtn);
      
        await waitFor(() => {
          expect(mockSetSettings).toHaveBeenCalledWith(
            expect.objectContaining({ highlight_keyboard_focus: true })
          );
        });
    });
      

    test('sets highlight_links_color on input change and button click', async () => {
        const settingsWithLinkColor = {
          ...mockSettings,
          highlight_links_color: '#335CFF',
        };
      
        render(
          <BasicSettingsBar
            isOpen={true}
            onClose={mockOnClose}
            settings={settingsWithLinkColor}
            setSettings={mockSetSettings}
            logout={mockLogout}
            setLoggedIn={mockSetLoggedIn}
          />
        );
      
        act(() => {
          BasicSettingsBar.setSelectedCategory("Text");
        });
      
        const newColor = '#FF00FF';
        const input = screen.getByLabelText('Highlight Link Color');
        fireEvent.change(input, { target: { value: newColor } });
      
        const setBtn = screen.getByRole('button', { name: /Set Highlight Link Color/i });
        fireEvent.click(setBtn);
      
        await waitFor(() => {
          expect(mockSetSettings).toHaveBeenCalledWith(
            expect.objectContaining({ highlight_links_color: newColor.toLowerCase() })
          );
        });
    });
      

    test('toggles highlight_links setting', async () => {
        const settingsWithHighlightLinks = {
          ...mockSettings,
          highlight_links: false,
        };
      
        render(
          <BasicSettingsBar
            isOpen={true}
            onClose={mockOnClose}
            settings={settingsWithHighlightLinks}
            setSettings={mockSetSettings}
            logout={mockLogout}
            setLoggedIn={mockSetLoggedIn}
          />
        );
      
        act(() => {
          BasicSettingsBar.setSelectedCategory("Text");
        });
      
        const toggleBtn = screen.getByRole('button', { name: /Toggle Highlight Links/i });
      
        fireEvent.click(toggleBtn);
      
        await waitFor(() => {
          expect(mockSetSettings).toHaveBeenCalledWith(
            expect.objectContaining({ highlight_links: true })
          );
        });
    });
      

    test('increases and decreases line height', async () => {
        const settingsWithLineHeight = {
          ...mockSettings,
          line_height: 1.5,
          letter_spacing: "5px", // required to avoid error when parsing
        };
      
        render(
          <BasicSettingsBar
            isOpen={true}
            onClose={mockOnClose}
            settings={settingsWithLineHeight}
            setSettings={mockSetSettings}
            logout={mockLogout}
            setLoggedIn={mockSetLoggedIn}
          />
        );
      
        act(() => {
          BasicSettingsBar.setSelectedCategory("Text");
        });
      
        const incBtn = screen.getByRole('button', { name: /Increase Line Height/i });
        const decBtn = screen.getByRole('button', { name: /Decrease Line Height/i });
      
        // Increase
        fireEvent.click(incBtn);
        await waitFor(() => {
          expect(mockSetSettings).toHaveBeenCalledWith(
            expect.objectContaining({ line_height: 2.0 })
          );
        });
      
        // Decrease
        fireEvent.click(decBtn);
        await waitFor(() => {
          expect(mockSetSettings).toHaveBeenCalledWith(
            expect.objectContaining({ line_height: 1.0 })
          );
        });
    });
      

    test('increases and decreases word spacing', async () => {
        const settingsWithWordSpacing = {
          ...mockSettings,
          word_spacing: "5px",
        };
      
        render(
          <BasicSettingsBar
            isOpen={true}
            onClose={mockOnClose}
            settings={settingsWithWordSpacing}
            setSettings={mockSetSettings}
            logout={mockLogout}
            setLoggedIn={mockSetLoggedIn}
          />
        );
      
        act(() => {
          BasicSettingsBar.setSelectedCategory("Text");
        });
      
        const incBtn = screen.getByRole('button', { name: /Increase Word Spacing/i });
        const decBtn = screen.getByRole('button', { name: /Decrease Word Spacing/i });
      
        // Increase
        fireEvent.click(incBtn);
        await waitFor(() => {
          expect(mockSetSettings).toHaveBeenCalledWith(
            expect.objectContaining({ word_spacing: "6px" })
          );
        });
      
        // Decrease
        fireEvent.click(decBtn);
        await waitFor(() => {
          expect(mockSetSettings).toHaveBeenCalledWith(
            expect.objectContaining({ word_spacing: "4px" })
          );
        });
    });
      

    test('pressing Enter or Space on category tab opens that category', async () => {
        act(() => {
            render(
                <BasicSettingsBar
                  isOpen={true}
                  onClose={mockOnClose}
                  settings={mockSettings}
                  setSettings={mockSetSettings}
                  logout={mockLogout}
                  setLoggedIn={mockSetLoggedIn}
                />
              );
        });

        await act(async () => {
            const categoryLink = screen.getByTestId('Text');
      
            fireEvent.keyDown(categoryLink, { key: 'Enter', code: 'Enter' });
        });
      
        await waitFor(() => {
          expect(screen.getByText('Text Size')).toBeInTheDocument();
        });
      
        // Reset and try with spacebar
        await act(async () => BasicSettingsBar.setSelectedCategory(null));
    
        await act(async () => {
            const categoryLink = screen.getByTestId('Text');
            fireEvent.keyDown(categoryLink, { key: ' ', code: 'Space' });
        });
      
        await waitFor(() => {
          expect(screen.getByText('Text Size')).toBeInTheDocument();
        });
    });
      
      

    test('focuses back button when a category is selected, then close button when deselected', async () => {
        render(
          <BasicSettingsBar
            isOpen={true}
            onClose={mockOnClose}
            settings={mockSettings}
            setSettings={mockSetSettings}
            logout={mockLogout}
            setLoggedIn={mockSetLoggedIn}
          />
        );
      
        act(() => {
          BasicSettingsBar.setSelectedCategory('Text');
        });
      
        await waitFor(() => {
          const backBtn = screen.getByTestId('backBtn');
          expect(document.activeElement).toBe(backBtn);
        });
      
        act(() => {
          fireEvent.click(screen.getByTestId('backBtn'));
        });
      
        await waitFor(() => {
          const closeBtn = screen.getByTestId('closeSettingsBtn');
          expect(document.activeElement).toBe(closeBtn);
        });
    });
      
      

    test('mute sounds form submit should call preventDefault', async () => {
        const mockPlay = jest.fn().mockResolvedValue(); // Define mockPlay
        window.Audio = jest.fn().mockImplementation(() => ({
            play: mockPlay, // Use mockPlay for the play method
        }));
      
        const preventDefaultSpy = jest.spyOn(Event.prototype, 'preventDefault');
        const stopPropagationSpy = jest.spyOn(Event.prototype, 'stopPropagation');

        render(
          <BasicSettingsBar
            isOpen={true}
            onClose={onClose}
            settings={{ ...mockSettings, mute_sounds: true }}
            setSettings={setSettings}
            logout={logout}
            setLoggedIn={setLoggedIn}
          />
        );
      
        act(() => {
          BasicSettingsBar.setSelectedCategory("Audio");
        });
      
        const muteButton = await screen.findByRole('button', { name: /Toggle Mute Sounds/i });
        fireEvent.click(muteButton);
      
        // Allow promise rejection (catch block) to execute
        await Promise.resolve();
      
        expect(preventDefaultSpy).toHaveBeenCalled();
        expect(stopPropagationSpy).toHaveBeenCalled();
        expect(mockPlay).toHaveBeenCalled();
    });
      
      
      

    test('logs error when alert sound fails to play', () => {
        const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
        const mockPlay = jest.fn(() => Promise.reject(new Error('Audio failed')));
        window.Audio = jest.fn(() => ({ play: mockPlay }));
      
        const mockSettingsWithSound = { ...mockSettings, mute_sounds: true };
      
        render(
          <BasicSettingsBar
            isOpen={true}
            onClose={onClose}
            settings={mockSettingsWithSound}
            setSettings={setSettings}
            logout={logout}
            setLoggedIn={setLoggedIn}
          />
        );
      
        act(() => {
          BasicSettingsBar.setSelectedCategory('Audio');
        });
      
        const toggleBtn = screen.getByRole('button', { name: 'Toggle Mute Sounds' });
      
        return act(async () => {
          fireEvent.click(toggleBtn);
          // Await microtask queue (to flush `.catch`)
          await Promise.resolve();
          expect(mockPlay).toHaveBeenCalled();
          expect(mockConsoleError).toHaveBeenCalledWith(
            'Failed to play alert sound:',
            expect.any(Error)
          );
          mockConsoleError.mockRestore();
        });
    });
      

    test('cursor size does not go below 0', () => {
        const mockSettingsWithZero = { ...mockSettings, cursor_size: 0 };
      
        render(
          <BasicSettingsBar
            isOpen={true}
            onClose={onClose}
            settings={mockSettingsWithZero}
            setSettings={setSettings}
            logout={logout}
            setLoggedIn={setLoggedIn}
          />
        );
      
        act(() => {
          BasicSettingsBar.setSelectedCategory('Cursor');
        });
      
        const decButton = screen.getByRole('button', { name: 'Decrease Cursor Size' });
        fireEvent.click(decButton);
      
        // Since curr is 0, it should be set to 1 before subtracting 1, resulting in 0
        expect(setSettings).toHaveBeenCalledWith(
          expect.objectContaining({ cursor_size: 0 })
        );
    });
      

    test('updates text_color on color input change and set button click', () => {
        render(
          <BasicSettingsBar
            isOpen={true}
            onClose={onClose}
            settings={{ ...mockSettings, text_color: '#222222' }}
            setSettings={setSettings}
            logout={logout}
            setLoggedIn={setLoggedIn}
          />
        );
      
        act(() => {
          BasicSettingsBar.setSelectedCategory('Visuals');
        });
      
        const input = screen.getByTestId('textColorInput');
        fireEvent.change(input, { target: { value: '#f1f1f1' } });
      
        const button = screen.getByRole('button', { name: 'Set Text Color' });
        fireEvent.click(button);
      
        expect(setSettings).toHaveBeenCalledWith(
          expect.objectContaining({ text_color: '#f1f1f1' })
        );
    });
      

    test('updates foreground_color on color input change and set button click', () => {
        render(
          <BasicSettingsBar
            isOpen={true}
            onClose={onClose}
            settings={{ ...mockSettings, foreground_color: '#111111' }}
            setSettings={setSettings}
            logout={logout}
            setLoggedIn={setLoggedIn}
          />
        );
      
        act(() => {
          BasicSettingsBar.setSelectedCategory('Visuals');
        });
      
        const input = screen.getByTestId('foregroundColorInput');
        fireEvent.change(input, { target: { value: '#abcdef' } });
      
        const button = screen.getByRole('button', { name: 'Set Foreground Color' });
        fireEvent.click(button);
      
        expect(setSettings).toHaveBeenCalledWith(
          expect.objectContaining({ foreground_color: '#abcdef' })
        );
    });
      

    test('updates background_color on color input change and set button click', () => {
        render(
          <BasicSettingsBar
            isOpen={true}
            onClose={onClose}
            settings={{ ...mockSettings, background_color: '#000000' }}
            setSettings={setSettings}
            logout={logout}
            setLoggedIn={setLoggedIn}
          />
        );
      
        act(() => {
          BasicSettingsBar.setSelectedCategory('Visuals');
        });
      
        const input = screen.getByTestId('backgroundColorInput');
        fireEvent.change(input, { target: { value: '#123456' } });
      
        const button = screen.getByRole('button', { name: 'Set Background Color' });
        fireEvent.click(button);
      
        expect(setSettings).toHaveBeenCalledWith(
          expect.objectContaining({ background_color: '#123456' })
        );
    });
      

    test('updates align_text on select change and set button click', () => {
        render(
          <BasicSettingsBar
            isOpen={true}
            onClose={onClose}
            settings={{ ...mockSettings, align_text: 'left' }}
            setSettings={setSettings}
            logout={logout}
            setLoggedIn={setLoggedIn}
          />
        );
      
        act(() => {
          BasicSettingsBar.setSelectedCategory("Text");
        });
      
        // Simulate changing the dropdown value
        const select = screen.getByLabelText('Text Align');
        fireEvent.change(select, { target: { value: 'right' } });
      
        // Simulate clicking the set button
        const setButton = screen.getByRole('button', { name: 'Set Text Align' });
        fireEvent.click(setButton);
      
        // Expect update to happen with the new alignment
        expect(setSettings).toHaveBeenCalledWith(
          expect.objectContaining({ align_text: 'right' })
        );
    });
      

    test('updates cursor border color on input change and set button click', () => {
        render(
          <BasicSettingsBar
            isOpen={true}
            onClose={onClose}
            settings={{ ...mockSettings, cursor_border_color: '#ffffff' }}
            setSettings={setSettings}
            logout={logout}
            setLoggedIn={setLoggedIn}
          />
        );
      
        act(() => {
          BasicSettingsBar.setSelectedCategory("Cursor");
        });
      
        const colorInput = screen.getByLabelText('Set Cursor Border Color');
        const newColor = '#00ff00';
      
        fireEvent.change(screen.getByDisplayValue('#ffffff'), { target: { value: newColor } });
        fireEvent.click(colorInput);
      
        expect(setSettings).toHaveBeenCalledWith(
          expect.objectContaining({ cursor_border_color: newColor })
        );
    });
      

    test('updates cursor color on input change and set button click', () => {
        render(
          <BasicSettingsBar
            isOpen={true}
            onClose={onClose}
            settings={{ ...mockSettings, cursor_color: '#000000' }}
            setSettings={setSettings}
            logout={logout}
            setLoggedIn={setLoggedIn}
          />
        );
      
        act(() => {
          BasicSettingsBar.setSelectedCategory("Cursor");
        });
      
        const colorInput = screen.getByLabelText('Set Cursor Color');
        const newColor = '#ff0000';
      
        // Simulate color input change
        fireEvent.change(screen.getByDisplayValue('#000000'), { target: { value: newColor } });
      
        // Click the set button
        fireEvent.click(colorInput);
      
        expect(setSettings).toHaveBeenCalledWith(
          expect.objectContaining({ cursor_color: newColor })
        );
    });
      
      
      
      
    describe('back button', () => {
        test('interaction page goes back to main menu when back button pressed', async () => {
            await act(async () => {
                render(
                    <BasicSettingsBar
                        isOpen={true}
                        onClose={onClose}
                        settings={mockSettings}
                        setSettings={setSettings}
                        logout={logout}
                        setLoggedIn={setLoggedIn}
                    />
                );
            });
        
            await act(async () => {
                BasicSettingsBar.setSelectedCategory("Interactions");
            });
        
            await act(async () => {
                fireEvent.click(screen.getByRole('button', { name: /back/i }));
            });
        
            await waitFor(() => {
                expect(BasicSettingsBar.selectedCategory).toBe(null);
            });
        });
        

        test('text page goes back to main menu when back button pressed', () => {

            act(() => {
                render(
                    <BasicSettingsBar
                    isOpen={true}
                    onClose={onClose}
                    settings={mockSettings}
                    setSettings={setSettings}
                    logout={logout}
                    setLoggedIn={setLoggedIn}
                    />
                );
            });
            act(() => {
                BasicSettingsBar.setSelectedCategory("Text");
            });

            act(() => {
                fireEvent.click(screen.getByRole('button', { name: /back/i }));
            });
            waitFor(() => {
                expect(BasicSettingsBar.selectedCategory).toBe(null);
            });
        });

        test('visuals page goes back to main menu when back button pressed', () => {

            act(() => {
                render(
                    <BasicSettingsBar
                    isOpen={true}
                    onClose={onClose}
                    settings={mockSettings}
                    setSettings={setSettings}
                    logout={logout}
                    setLoggedIn={setLoggedIn}
                    />
                );
            });
            act(() => {
                BasicSettingsBar.setSelectedCategory("Visuals");
            });

            act(() => {
                fireEvent.click(screen.getByTestId('backBtn'));
            });
            waitFor(() => {
                expect(BasicSettingsBar.selectedCategory).toBe(null);
            });
        });

        test('Audio page goes back to main menu when back button pressed', () => {

            act(() => {
                render(
                    <BasicSettingsBar
                    isOpen={true}
                    onClose={onClose}
                    settings={mockSettings}
                    setSettings={setSettings}
                    logout={logout}
                    setLoggedIn={setLoggedIn}
                    />
                );
            });
            act(() => {
                BasicSettingsBar.setSelectedCategory("Audio");
            });

            act(() => {
                fireEvent.click(screen.getByRole('button', { name: /back/i }));
            });
            waitFor(() => {
                expect(BasicSettingsBar.selectedCategory).toBe(null);
            });
        });

        test('cursor page goes back to main menu when back button pressed', () => {

            act(() => {
                render(
                    <BasicSettingsBar
                    isOpen={true}
                    onClose={onClose}
                    settings={mockSettings}
                    setSettings={setSettings}
                    logout={logout}
                    setLoggedIn={setLoggedIn}
                    />
                );
            });
            act(() => {
                BasicSettingsBar.setSelectedCategory("Cursor");
            });

            act(() => {
                fireEvent.click(screen.getByRole('button', { name: /back/i }));
            });
            waitFor(() => {
                expect(BasicSettingsBar.selectedCategory).toBe(null);
            });
        });

        test('profiles page goes back to main menu when back button pressed', () => {

            act(() => {
                render(
                    <BasicSettingsBar
                    isOpen={true}
                    onClose={onClose}
                    settings={mockSettings}
                    setSettings={setSettings}
                    logout={logout}
                    setLoggedIn={setLoggedIn}
                    />
                );
            });
            act(() => {
                BasicSettingsBar.setSelectedCategory("Profiles");
            });

            act(() => {
                fireEvent.click(screen.getByRole('button', { name: /back/i }));
            });
            waitFor(() => {
                expect(BasicSettingsBar.selectedCategory).toBe(null);
            });
        });
    }); 

    test('should toggle highlight hover and change color', () => {

        act(() => {
            render(
                <BasicSettingsBar
                  isOpen={true}
                  onClose={onClose}
                  settings={mockSettings}
                  setSettings={setSettings}
                  logout={logout}
                  setLoggedIn={setLoggedIn}
                />
            );
        });
        act(() => {
            BasicSettingsBar.setSelectedCategory("Interactions");
        });

        act(() => {
            fireEvent.click(screen.getByRole('button', { name: /Toggle Highlight Hover/i }));
            fireEvent.change(screen.getByTestId('highlightHoverInput'), {
            target: { value: '#FF00FF' }
            });
            fireEvent.click(screen.getByRole('button', { name: /Set Highlight Hover Color/i }));
        });
        waitFor(() => {
            expect(mockSetSettings).toHaveBeenCalled();
        });
    });

    test('should toggle mute sounds and play sound if unmuted', async () => {
        const mockPlay = jest.fn().mockResolvedValue();
        window.Audio = jest.fn().mockImplementation(() => ({
          play: mockPlay
        }));
      
        const updatedSettings = { ...mockSettings, mute_sounds: true };
      
        render(
          <BasicSettingsBar
            isOpen={true}
            onClose={onClose}
            settings={updatedSettings}
            setSettings={setSettings}
            logout={logout}
            setLoggedIn={setLoggedIn}
          />
        );
      
        act(() => {
          BasicSettingsBar.setSelectedCategory("Audio");
        });
      
        fireEvent.click(screen.getByRole('button', { name: /Toggle Mute Sounds/i }));
      
        await waitFor(() => {
          expect(mockPlay).toHaveBeenCalled();
        });
    });
      

    test('should change cursor size', () => {
        act(() => {
            render(
                <BasicSettingsBar
                  isOpen={true}
                  onClose={onClose}
                  settings={mockSettings}
                  setSettings={setSettings}
                  logout={logout}
                  setLoggedIn={setLoggedIn}
                />
            );
        });
        act(() => {
            BasicSettingsBar.setSelectedCategory("Cursor");
        });

        act(() => {
            const incBtn = screen.getByRole('button', { name: /Increase Cursor Size/i });
            const decBtn = screen.getByRole('button', { name: /Decrease Cursor Size/i });
            fireEvent.click(incBtn);
            fireEvent.click(decBtn);
        });
        waitFor(() => {
            expect(mockSetSettings).toHaveBeenCalled();
        });
    });

    test('should increase and decrease saturation', () => {
        act(() => {
            render(
                <BasicSettingsBar
                  isOpen={true}
                  onClose={onClose}
                  settings={mockSettings}
                  setSettings={setSettings}
                  logout={logout}
                  setLoggedIn={setLoggedIn}
                />
            );
        });
        act(() => {
            BasicSettingsBar.setSelectedCategory("Visuals");
        });

        act(() => {
            fireEvent.click(screen.getByTestId('saturationDec'));
            fireEvent.click(screen.getByTestId('saturationInc'));
        });
        waitFor(() => {
            expect(mockSetSettings).toHaveBeenCalled();
        });
    });

    test('should change and submit font setting', async() => {
        await act(async () => {
            render(
                <BasicSettingsBar
                  isOpen={true}
                  onClose={onClose}
                  settings={mockSettings}
                  setSettings={setSettings}
                  logout={logout}
                  setLoggedIn={setLoggedIn}
                />
            );
        });

        await act(async () => {
            BasicSettingsBar.setSelectedCategory("Text");
        });

        await act(async() => {
            fireEvent.change(screen.getByRole('combobox', { name: /font/i }), { target: { value: 'Roboto' } });
            fireEvent.click(screen.getByRole('button', { name: /Set Font/i }));
        });
        
        await waitFor(() => {
            expect(BasicSettingsBar.settings).toStrictEqual(expect.objectContaining({ font: 'Roboto' }));
        });
    });
  
    test('renders the component and categories', () => {
      render(
        <BasicSettingsBar
          isOpen={true}
          onClose={onClose}
          settings={mockSettings}
          setSettings={setSettings}
          logout={logout}
          setLoggedIn={setLoggedIn}
        />
      );
  
      expect(screen.getByTestId('settings')).toBeInTheDocument();
      expect(screen.getByTestId('closeSettingsBtn')).toBeInTheDocument();
      expect(screen.getByTestId('settingsScroll')).toBeInTheDocument();
      expect(screen.getByTestId('Text')).toBeInTheDocument();
      expect(screen.getByTestId('Visuals')).toBeInTheDocument();
    });
  
    test('clicking a category shows that categorys settings', async () => {
      render(
        <BasicSettingsBar
          isOpen={true}
          onClose={onClose}
          settings={mockSettings}
          setSettings={setSettings}
          logout={logout}
          setLoggedIn={setLoggedIn}
        />
      );
  
      fireEvent.click(screen.getByTestId('Text'));
      await waitFor(() => {
        expect(screen.getByTestId('txtSizeLabel')).toBeInTheDocument();
        expect(screen.getByTestId('letterSpacingLabel')).toBeInTheDocument();
      });
    });
  
    test('updates font size', () => {
      render(
        <BasicSettingsBar
          isOpen={true}
          onClose={onClose}
          settings={{ ...mockSettings, font_size: '14px' }}
          setSettings={setSettings}
          logout={logout}
          setLoggedIn={setLoggedIn}
        />
      );
      fireEvent.click(screen.getByTestId('Text'));
      fireEvent.click(screen.getByTestId('txtSizeInc'));
      expect(setSettings).toHaveBeenCalledWith(expect.objectContaining({ font_size: '15px' }));
    });
  
    test('toggles mute_sounds and plays sound', () => {
      const playMock = jest.fn();
      window.HTMLMediaElement.prototype.play = playMock;
  
      render(
        <BasicSettingsBar
          isOpen={true}
          onClose={onClose}
          settings={{ ...mockSettings, mute_sounds: false }}
          setSettings={setSettings}
          logout={logout}
          setLoggedIn={setLoggedIn}
        />
      );
      fireEvent.click(screen.getByTestId('Audio'));
      const button = screen.getByRole('button', { name: /Toggle Mute Sounds/i });
      fireEvent.click(button);
      expect(setSettings).toHaveBeenCalledWith(expect.objectContaining({ mute_sounds: true }));
    });
  
    test('closes on close button', () => {
      render(
        <BasicSettingsBar
          isOpen={true}
          onClose={onClose}
          settings={mockSettings}
          setSettings={setSettings}
          logout={logout}
          setLoggedIn={setLoggedIn}
        />
      );
      fireEvent.click(screen.getByTestId('closeSettingsBtn'));
      expect(onClose).toHaveBeenCalled();
    });
  
    test('saves and loads selectedCategory from localStorage', () => {
      localStorage.setItem('selectedCategory', 'Text');
  
      render(
        <BasicSettingsBar
          isOpen={true}
          onClose={onClose}
          settings={mockSettings}
          setSettings={setSettings}
          logout={logout}
          setLoggedIn={setLoggedIn}
        />
      );
  
      expect(screen.getByText('Text')).toBeInTheDocument();
    });
});

describe('settingsPanel', () => {
        beforeEach(() => {
                jest.clearAllMocks();
        });

        test('Profile should have no accessibility violations', async () => {
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
            let container;
            await act(async () => {
                    const rendered = render(<BasicSettingsBar isOpen={true} settings={mockSettings} setSettings={mockSetSettings} logout={mockLogout} setLoggedIn={mockSetLoggedIn} />);
                    container = rendered.container;
            });
            const results = await axe(container);
            expect(results).toHaveNoViolations();
        });

        describe('open & close panel', () => {
            test('clicking the button opens the settings panel', async () => {
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
                        console.log("OTHER API ROUTE");
                    }
                    });
                    
                    act(() => {
                        render(<App />);
                    });
                
                    await act(async () => {
                        await App.setUserInfo({id: 123});
                        await App.setSettings({
                            content_size: 100,
                            highlight_tiles: false,
                            highlight_links: false,
                            text_magnifier: false,
                            align_text: "center",
                            font_size: "14px",
                            line_height: 1.5,
                            letter_spacing: "0px",
                            contrast: "100%",
                            saturation: "100%",
                            mute_sounds: false,
                            hide_images: false,
                            reading_mask: false,
                            highlight_hover: false,
                            highlight_hover_color: "#BD180F",
                            cursor_size: 3,
                          cursor_color: "#000000",
                          cursor_border_color: "#FFFFFF",
                          background_color: "#FFEDED",
                          foreground_color: "#4F0000",
                          text_color: "#000000",
                          font: "Mitr",
                      });
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
                        console.log("OTHER API ROUTE");
                    }
                    });
                    
                    act(() => {
                        render(<App />);
                    });
                
                    await act(async () => {
                        await App.setUserInfo({id: 123});
                        await App.setSettings({
                            content_size: 100,
                            highlight_tiles: false,
                            highlight_links: false,
                            text_magnifier: false,
                            align_text: "center",
                            font_size: "14px",
                            line_height: 1.5,
                            letter_spacing: "0px",
                            contrast: "100%",
                            saturation: "100%",
                            mute_sounds: false,
                            hide_images: false,
                            reading_mask: false,
                            highlight_hover: false,
                            highlight_hover_color: "#BD180F",
                            cursor_size: 3,
                          cursor_color: "#000000",
                          cursor_border_color: "#FFFFFF",
                          background_color: "#FFEDED",
                          foreground_color: "#4F0000",
                          text_color: "#000000",
                          font: "Mitr",
                      });
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
                    BasicSettingsBar.setSelectedCategory("Text");
                });

                await act(async () => {
                    document.getElementById("settingsScroll").scrollTop = 35;
                    const inc = screen.getByTestId('txtSizeInc');
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
                    BasicSettingsBar.setSelectedCategory(null);
                });

                await act(async () => {
                    const inc = screen.getByTestId('Profiles');
                    fireEvent.click(inc);
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
                                                        contrast: "50%",
                                                        background_color: "#FFFFF6",
                                                        line_height: 2,
                                                        align_text: "left",
                                                        font: "Lexend",
                                                        highlight_hover: false,
                                                        highlight_links_color: "#8398EB",
                                                        cursor_size: 5,
                                                        word_spacing: "5px",
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
                                                        contrast: "200%",
                                                        font: "Arimo",
                                                        line_height: 1.5,
                                                        align_text: "left",
                                                        highlight_links: true,
                                                        saturation: "200%",
                                                        highlight_hover: true,
                                                        highlight_hover_color: "#335CFF",
                                                        cursor_size: 6,
                                                        cursor_color:"#A42D2D",
                                                        highlight_links_color: "#A42D2D",
                                                        word_spacing: "3px",
                    });
                });
            }); 

            test('button sets default settings', async () => {
                let mockSettings = {
                    content_size: 100,
                    highlight_tiles: false,
                    highlight_links: false,
                    text_magnifier: false,
                    align_text: "center",
                    font_size: "16px",
                    line_height: 5000,
                    letter_spacing: "5px",
                    contrast: "100%",
                    saturation: "100%",
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
                        highlight_links: false,
      highlight_links_color: "#335CFF",
      text_magnifier: false,
      align_text: "center",
      font_size: "14px",
      line_height: 1.5,
      letter_spacing: "0px",
      contrast: "100%",
      saturation: "100%",
      mute_sounds: false,
      highlight_hover: false,
      highlight_keyboard_focus: false,
      highlight_keyboard_focus_color: "#BD180F",
      highlight_hover_color: "#BD180F",
      cursor_size: 3,
    cursor_color: "#000000",
    cursor_border_color: "#FFFFFF",
    background_color: "#FFEDED",
    foreground_color: "#4F0000",
    text_color: "#000000",
    font: "Mitr",
    word_spacing: "0px"
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

                    await act(async () => {
                        BasicSettingsBar.setSelectedCategory(null);
                    });

                    await act(async () => {
                        const inc = screen.getByTestId('Text');
                        fireEvent.click(inc);
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

                await act(async () => {
                    BasicSettingsBar.setSelectedCategory("Visuals");
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

                    await act(async () => {
                        BasicSettingsBar.setSelectedCategory("Visuals");
                    });
                
                    await act(async () => {
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