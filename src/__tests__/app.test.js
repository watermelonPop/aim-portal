import React, { useState } from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import * as AppModule from '../App';
import App from '../App';
import { axe, toHaveNoViolations } from 'jest-axe';

// Mock the fetch function
global.fetch = jest.fn();
expect.extend(toHaveNoViolations);
jest.useFakeTimers();

describe('Accessibility Tests', () => {
        beforeAll(() => {
                jest.useRealTimers(); // Ensure timers are real for axe
        });
        test('App should have no accessibility violations', async () => {
                const { container } = render(<App />);
                const results = await axe(container);
                expect(results).toHaveNoViolations();
        });
});

describe('Alert Sound useEffect', () => {
        let mockPlay;
        let mockAudio;
      
        beforeEach(() => {
          mockPlay = jest.fn().mockResolvedValue();
          mockAudio = jest.fn(() => ({
            play: mockPlay,
          }));
          global.Audio = mockAudio;
        });
      
        afterEach(() => {
          jest.clearAllMocks();
        });
      
        test('plays alert sound when showAlert is true and sound is not muted', async () => {
                const settings = { mute_sounds: false };
        
                await act(async () => {
                        render(<App />);
                });

                await act(async () => {
                        App.setSettings(settings);
                });

                await act(async () => {
                        App.setShowAlert(true);
                });

                expect(global.Audio).toHaveBeenCalledWith('/notif_on.mp3');
                expect(mockPlay).toHaveBeenCalled();
        });
      
        test('does not play alert sound when mute_sounds is true', async () => {
                const settings = { mute_sounds: true };
        
                await act(async () => {
                        render(<App/>);
                });

                await act(async () => {
                        App.setSettings(settings);
                });

                await act(async () => {
                        App.setShowAlert(true);
                });

                expect(mockPlay).not.toHaveBeenCalled();
        });
      
        test('does not play alert sound when showAlert is false', async () => {
                const settings = { mute_sounds: false };
        
                await act(async () => {
                        render(<App/>);
                });

                await act(async () => {
                        App.setSettings(settings);
                });

                await act(async () => {
                        App.setShowAlert(false);
                });
        
                expect(mockPlay).not.toHaveBeenCalled();
        });

        test('logs error if alert sound fails to play', async () => {
                const mockError = new Error('Playback failed');
                const mockPlay = jest.fn().mockRejectedValue(mockError);
                const mockAudio = jest.fn(() => ({ play: mockPlay }));
                const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
              
                global.Audio = mockAudio;
              
                const settings = { mute_sounds: false };
              
                await act(async () => {
                  render(<App />);
                });
              
                await act(async () => {
                  App.setSettings(settings);
                  App.setShowAlert(true);
                });
              
                expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to play alert sound:', mockError);
              
                consoleErrorSpy.mockRestore();
        });
              
});

describe('Body class toggling when settingsTabOpen changes', () => {
        beforeEach(() => {
          render(<App />);
        });
      
        afterEach(() => {
          document.body.classList.remove('modal-open');
        });
      
        test('adds "modal-open" class to body when settingsTabOpen is true', async () => {
          await act(async () => {
            App.setSettingsTabOpen(true);
          });
      
          expect(document.body.classList.contains('modal-open')).toBe(true);
        });
      
        test('removes "modal-open" class from body when settingsTabOpen is false', async () => {
          // First add it
          await act(async () => {
            App.setSettingsTabOpen(true);
          });
          expect(document.body.classList.contains('modal-open')).toBe(true);
      
          // Then remove it
          await act(async () => {
            App.setSettingsTabOpen(false);
          });
          expect(document.body.classList.contains('modal-open')).toBe(false);
        });
});
      
describe('Dynamic tab initialization based on user role', () => {
        beforeEach(() => {
          render(<App />);
        });
      
        afterEach(() => {
          jest.clearAllMocks();
        });
      
        const mockUser = {
          id: 1,
          name: 'Test User',
          role: 'USER',
          email: 'test@email.com',
          dob: '2000-01-01',
          uin: '123456789',
          phone_number: '1234567890',
        };
      
        test('sets USER tabs correctly', async () => {
          await act(async () => {
            App.setUserInfo(mockUser);
            App.setUserConnected(true);
            App.setLoggedIn(true);
          });
      
          expect(App.tabs).toEqual(
            expect.arrayContaining([
              expect.objectContaining({ name: 'Dashboard' }),
              expect.objectContaining({ name: 'Accommodations' }),
              expect.objectContaining({ name: 'Forms' }),
              expect.objectContaining({ name: 'Profile' }),
            ])
          );
      
          expect(App.currentTab.name).toBe('Dashboard');
        });
      
        test('sets STUDENT tabs correctly', async () => {
          await act(async () => {
            App.setUserInfo({ ...mockUser, role: 'STUDENT' });
            App.setUserConnected(true);
            App.setLoggedIn(true);
          });
      
          expect(App.tabs.length).toBeGreaterThan(4); // Includes Testing and Note Taking
          expect(App.tabs.find(t => t.name === 'Testing')).toBeTruthy();
          expect(App.currentTab.name).toBe('Dashboard');
        });
      
        test('sets PROFESSOR tabs correctly', async () => {
          await act(async () => {
            App.setUserInfo({ ...mockUser, role: 'PROFESSOR' });
            App.setUserConnected(true);
            App.setLoggedIn(true);
          });
      
          expect(App.tabs.find(t => t.name === 'Note Taking')).toBeTruthy();
          expect(App.currentTab.name).toBe('Dashboard');
        });
      
        test('sets ADVISOR tabs correctly based on staffAccess', async () => {
          const mockStaffAccess = [
            { hasAccess: true, access: 'Global Settings' },
            { hasAccess: true, access: 'Accommodations' },
            { hasAccess: false, access: 'Note Taking' },
            { hasAccess: true, access: 'Assistive Technology' },
            { hasAccess: false, access: 'Testing' },
            { hasAccess: true, access: 'Student Cases' },
          ];
      
          await act(async () => {
            App.setStaffAccess(mockStaffAccess);
            App.setUserInfo({ ...mockUser, role: 'ADVISOR' });
            App.setUserConnected(true);
            App.setLoggedIn(true);
          });
      
          const tabNames = App.tabs.map(t => t.name);
          expect(tabNames).toEqual(expect.arrayContaining([
            'Global Settings',
            'Accommodations',
            'Assistive Technology',
            'Student Cases',
          ]));
      
          expect(App.currentTab.name).toBe('Dashboard');
        });
});
      

describe('App.getUser', () => {
        let consoleErrorSpy;
        let mockSetUserInfo;
      
        beforeEach(() => {
          consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
          mockSetUserInfo = jest.fn();
      
          render(<App />);
        });
      
        afterEach(() => {
          jest.clearAllMocks();
        });
      
        test('logs and returns early if no userId is provided', async () => {
          const result = await App.getUser(null);
          expect(consoleErrorSpy).toHaveBeenCalledWith('Invalid user ID provided to getUser');
          expect(result).toBeUndefined();
        });
      
        test('logs error and returns if fetch response is not ok', async () => {
          global.fetch = jest.fn().mockResolvedValue({
            ok: false,
            status: 500,
            statusText: 'Internal Server Error',
          });
      
          const result = await App.getUser('123');
          expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to get user:', 500, 'Internal Server Error');
          expect(result).toBeUndefined();
        });
      
        test('returns null if user does not exist', async () => {
          global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ exists: false }),
          });
      
          const result = await App.getUser('123');
          expect(result).toBeNull();
        });
      
        test('calls setUserInfo and returns user_info if user exists', async () => {
          const userData = {
            dob: '2000-01-01',
            UIN: '123456789',
            phone_number: '1234567890',
          };
      
          global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: async () => ({
              exists: true,
              user_info: userData,
            }),
          });
      
          let result;
        await act(async () => {
                result = await App.getUser('123');
        });

        await waitFor(() => {
                expect(result).toEqual(userData);
        });
        });
      
        test('logs error if fetch throws', async () => {
          global.fetch = jest.fn().mockRejectedValue(new Error('Fetch failed'));
      
          const result = await App.getUser('123');
          expect(consoleErrorSpy).toHaveBeenCalledWith('Error while getting user:', expect.any(Error));
          expect(result).toBeUndefined();
        });
});

describe('App.checkAccountConnected', () => {
        let consoleErrorSpy;
        let mockSetUserConnected;
        let mockSetLoading;
      
        beforeEach(() => {
          consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
          mockSetUserConnected = jest.fn();
          mockSetLoading = jest.fn();
      
          render(<App />);

        });
      
        afterEach(() => {
          jest.clearAllMocks();
        });
      
        test('logs and exits if no userId is provided', async () => {
          const result = await App.checkAccountConnected(null, mockSetUserConnected);
          expect(consoleErrorSpy).toHaveBeenCalledWith('Invalid user ID provided');
          expect(result).toBeUndefined();
          expect(mockSetUserConnected).not.toHaveBeenCalled();
          expect(mockSetLoading).not.toHaveBeenCalled();
        });
      
        test('logs error if fetch response is not ok', async () => {
          global.fetch = jest.fn().mockResolvedValue({
            ok: false,
            status: 500,
            statusText: 'Server Error',
          });
      
          const result = await App.checkAccountConnected('123', mockSetUserConnected);
          expect(consoleErrorSpy).toHaveBeenCalledWith(
            'Failed to check account connection:',
            500,
            'Server Error'
          );
          expect(result).toBeUndefined();
          expect(mockSetUserConnected).not.toHaveBeenCalled();
          expect(mockSetLoading).not.toHaveBeenCalled();
        });
      
        test('returns false if data.exists is null or undefined', async () => {
          global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ exists: null }),
          });
      
          const result = await App.checkAccountConnected('123', mockSetUserConnected);
          expect(result).toBe(false);
          expect(mockSetUserConnected).not.toHaveBeenCalled();
          expect(mockSetLoading).not.toHaveBeenCalled();
        });
      
        test('sets user connected and loading state if user is connected', async () => {
          global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ exists: true }),
          });
      
          const result = await App.checkAccountConnected('123', mockSetUserConnected);
          expect(result).toBe(true);
          expect(mockSetUserConnected).toHaveBeenCalledWith(true);
        });
      
        test('logs error if fetch throws', async () => {
          global.fetch = jest.fn().mockRejectedValue(new Error('Network fail'));
      
          const result = await App.checkAccountConnected('123', mockSetUserConnected);
          expect(consoleErrorSpy).toHaveBeenCalledWith(
            'Error while getting settings:',
            expect.any(Error)
          );
          expect(result).toBeUndefined();
          expect(mockSetUserConnected).not.toHaveBeenCalled();
          expect(mockSetLoading).not.toHaveBeenCalled();
        });
});


describe('App.setSettingsDatabase', () => {
        let consoleErrorSpy;
      
        const mockUserId = '123';
        const mockSettings = {
          font_size: '18px',
          letter_spacing: '2px',
          contrast: '150%',
          background_color: '#000',
          foreground_color: '#fff',
          text_color: '#ccc',
          highlight_hover_color: '#ff0',
          saturation: '120%',
          font: 'Arial',
          align_text: 'center',
          highlight_hover: true,
          cursor_color: '#000000',
          cursor_border_color: '#ffffff',
          cursor_size: 2
        };
      
        beforeEach(() => {
          consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
          render(<App />);
        });
      
        afterEach(() => {
          jest.clearAllMocks();
        });
      
        test('sends POST request with correctly formatted settings', async () => {
                const mockUserId = '123';
                const mockSettings = {
                  font_size: '18px',
                  letter_spacing: '2px',
                  contrast: '150%',
                  background_color: '#000',
                  foreground_color: '#fff',
                  text_color: '#ccc',
                  highlight_hover_color: '#ff0',
                  saturation: '120%',
                  font: 'Arial',
                  align_text: 'center',
                  highlight_hover: true,
                  cursor_color: '#000000',
                  cursor_border_color: '#ffffff',
                  cursor_size: 2
                };
              
                global.fetch = jest.fn().mockResolvedValue({
                  ok: true,
                  json: async () => ({ success: true }),
                });
              
                await App.setSettingsDatabase(mockUserId, mockSettings);
              
                expect(global.fetch).toHaveBeenCalledWith(
                  '/api/setSettings',
                  {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      user_id: mockUserId,
                      settings: {
                        font_size: 18,
                        letter_spacing: 2,
                        contrast: '150%',
                        background_color: '#000',
                        foreground_color: '#fff',
                        text_color: '#ccc',
                        highlight_hover_color: '#ff0',
                        saturation: '120%',
                        font: 'Arial',
                        align_text: 'center',
                        highlight_hover: true,
                        cursor_color: '#000000',
                        cursor_border_color: '#ffffff',
                        cursor_size: 2
                      }
                    }),
                  }
                );
        });
              
      
        test('handles fetch errors gracefully', async () => {
          global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));
      
          const result = await App.setSettingsDatabase(mockUserId, mockSettings);
      
          expect(consoleErrorSpy).toHaveBeenCalledWith(
            'Error checking exists',
            expect.any(Error)
          );
          expect(result).toBeUndefined();
        });
});
