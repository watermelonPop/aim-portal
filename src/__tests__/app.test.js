import React, { useState } from 'react';
import { render, screen, fireEvent, waitFor, act, createEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import * as AppModule from '../App';
import { App } from '../App';
import { axe, toHaveNoViolations } from 'jest-axe';

// Mock the fetch function
global.fetch = jest.fn();
expect.extend(toHaveNoViolations);
jest.useFakeTimers();

test('pressing Enter or Space on paragraph triggers anchor click via keydown', () => {
  render(
    <p
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          e.currentTarget.querySelector('a')?.click();
        }
      }}
    >
      Website:{' '}
      <a
        href="https://disability.tamu.edu/"
        target="_blank"
        rel="noopener noreferrer"
      >
        https://disability.tamu.edu/
      </a>
    </p>
  );

  const paragraph = screen.getByText(/Website:/i).closest('p');
  const link = paragraph.querySelector('a');

  const linkClickSpy = jest.spyOn(link, 'click');

  // Simulate Enter key press
  const enterEvent = createEvent.keyDown(paragraph, { key: 'Enter' });
  enterEvent.preventDefault = jest.fn();
  fireEvent(paragraph, enterEvent);

  expect(enterEvent.preventDefault).toHaveBeenCalled();
  expect(linkClickSpy).toHaveBeenCalledTimes(1);

  // Reset
  linkClickSpy.mockClear();

  // Simulate Space key press
  const spaceEvent = createEvent.keyDown(paragraph, { key: ' ' });
  spaceEvent.preventDefault = jest.fn();
  fireEvent(paragraph, spaceEvent);

  expect(spaceEvent.preventDefault).toHaveBeenCalled();
  expect(linkClickSpy).toHaveBeenCalledTimes(1);

  linkClickSpy.mockRestore();
});



test('clicking settings button sets hasManuallyOpenedSettings and opens settings panel', async () => {
  await act(async () => {
    render(<App />);
  });

  await act(async () => {
    App.setUserInfo({ id: '123', role: 'USER' });
    App.setLoggedIn(true);
    App.setUserConnected(true);
  });

  // Ensure settings is initially closed
  expect(document.body.classList.contains('modal-open')).toBe(false);

  // Click the settings button
  const settingsBtn = screen.getByTestId('settingsBtn');
  await act(async () => {
    fireEvent.click(settingsBtn);
  });

  // Wait for the effect to apply
  expect(document.body.classList.contains('modal-open')).toBe(true);
});


describe('App updateSettings behavior with timeout', () => {
  const customSettings = {
    font_size: '18px',
    letter_spacing: '2px',
    word_spacing: '3px',
    contrast: '150%',
    background_color: '#000000',
    foreground_color: '#ffffff',
    text_color: '#333333',
    highlight_hover_color: '#ff0',
    highlight_keyboard_focus_color: '#f00',
    highlight_links_color: '#00f',
    saturation: '120%',
    font: 'Arial',
    line_height: 2,
    align_text: 'center',
    highlight_hover: true,
    highlight_links: true,
    highlight_keyboard_focus: true,
    cursor_color: '#000',
    cursor_border_color: '#fff',
    cursor_size: 2,
  };

  beforeEach(() => {
    document.body.className = '';
    document.documentElement.style = '';
  });

  beforeEach(() => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ students: [] }),
      })
    );
  });
  
  afterEach(() => {
    jest.resetAllMocks();
  });
  

  afterEach(() => {
    jest.clearAllTimers();
    jest.clearAllMocks();
  });

  test('sets custom properties and classes after settings change with timeout', async () => {
    await act(async () => {
      render(<App />);
    });

    await act(async () => {
      App.setUserInfo({ id: '123', role: 'USER' });
      App.setLoggedIn(true);
      App.setUserConnected(true);
      App.setSettings(customSettings);
    });

    // Fast-forward time to let the setTimeout fire
    act(() => {
      jest.runAllTimers();
    });

    expect(document.documentElement.style.getPropertyValue('--txtSize')).toBe('18px');
    expect(document.documentElement.style.getPropertyValue('--letterSpacing')).toBe('2px');
    expect(document.documentElement.style.getPropertyValue('--word-spacing')).toBe('3px');
    expect(document.documentElement.style.getPropertyValue('--contrast')).toBe('150%');
    expect(document.documentElement.style.getPropertyValue('--background-color')).toBe('#000000');
    expect(document.documentElement.style.getPropertyValue('--foreground-color')).toBe('#ffffff');
    expect(document.documentElement.style.getPropertyValue('--text-color')).toBe('#333333');
    expect(document.documentElement.style.getPropertyValue('--highlight-hover-color')).toBe('#ff0');
    expect(document.documentElement.style.getPropertyValue('--highlight-keyboard-focus-color')).toBe('#f00');
    expect(document.documentElement.style.getPropertyValue('--highlight-links-color')).toBe('#00f');
    expect(document.documentElement.style.getPropertyValue('--saturation')).toBe('120%');
    expect(document.documentElement.style.getPropertyValue('--font')).toBe('Arial');
    expect(document.documentElement.style.getPropertyValue('--line-height')).toBe('2');
    expect(document.documentElement.style.getPropertyValue('--align-text')).toBe('center');

    expect(document.body.classList.contains('align-center')).toBe(true);
    expect(document.body.classList.contains('highlight-hover-enabled')).toBe(true);
    expect(document.body.classList.contains('highlight-links-enabled')).toBe(true);
    expect(document.body.classList.contains('highlight-keyboard-focus-enabled')).toBe(true);
  });

  test('removes highlight classes when settings are false', async () => {
    await act(async () => {
      render(<App />);
    });
  
    await act(async () => {
      App.setUserInfo({ id: '123', role: 'USER' });
      App.setLoggedIn(true);
      App.setUserConnected(true);
      App.setSettings({
        ...customSettings,
        highlight_hover: false,
        highlight_links: false,
        highlight_keyboard_focus: false,
      });
    });
  
    act(() => {
      jest.runAllTimers();
    });
  
    expect(document.body.classList.contains('highlight-hover-enabled')).toBe(false);
    expect(document.body.classList.contains('highlight-links-enabled')).toBe(false);
    expect(document.body.classList.contains('highlight-keyboard-focus-enabled')).toBe(false);
  });
  
});

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

        test('focuses loading screen element when loading is true', async () => {
          const focusSpy = jest.fn();
        
          const loadingDiv = document.createElement('div');
          loadingDiv.className = 'loadingScreen';
          loadingDiv.focus = focusSpy;
          document.body.appendChild(loadingDiv);
        
          await act(async () => {
            App.setLoggedIn(true);
            App.setUserConnected(true);
            App.setSettingsTabOpen(false);
            App.setTabs([{ name: 'Dashboard', elem: <div>Dashboard</div> }]);
            App.setShowAlert(false);
            App.setUserInfo({ id: '1', role: 'USER' });
          });
        
          render(<App />);
        
          await act(async () => {
            App.setSettings((prev) => ({ ...prev }));
          });
        
          expect(focusSpy).toHaveBeenCalled();
        });

        test('clicking tab sets it as currentTab', async () => {
          render(<App/>);
          await act(async () => {
          App.setTabs([
            { name: 'Dashboard', elem: <div>Dashboard View</div> },
            { name: 'Accommodations', elem: <div>Accommodations View</div> },
          ]);
          App.setCurrentTab({ name: 'Dashboard', elem: <div>Dashboard View</div> });
          App.setLoggedIn(true);
          App.setUserConnected(true);
          App.setUserInfo({ id: 1, role: 'USER' });
          });
      
          const accommodationsTab = screen.getByRole('tab', { name: 'Accommodations' });
          fireEvent.click(accommodationsTab);
      
          expect(App.currentTab.name).toBe('Accommodations');
        });

        test('pressing Enter triggers setCurrentTab', async() => {
          render(<App/>);
          await act(async () => {
          App.setTabs([
            { name: 'Dashboard', elem: <div>Dashboard View</div> },
            { name: 'Accommodations', elem: <div>Accommodations View</div> },
          ]);
          App.setCurrentTab({ name: 'Dashboard', elem: <div>Dashboard View</div> });
          App.setLoggedIn(true);
          App.setUserConnected(true);
          App.setUserInfo({ id: 1, role: 'USER' });
        });
      
          const accommodationsTab = screen.getByRole('tab', { name: 'Accommodations' });
          fireEvent.keyDown(accommodationsTab, { key: 'Enter', code: 'Enter' });
      
          expect(App.currentTab.name).toBe('Accommodations');
        });
      
        test('sets USER tabs correctly', async () => {
          global.fetch = jest.fn((url) => {
            if (url === '/api/accountConnected?userId=1') {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({ exists: true }),
                });
            }else if (url === '/api/checkAccount') {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({ exists: true, user_info: {id: 1, name: 'Test User',
                      role: 'USER',
                      email: 'test@email.com',
                      dob: '2000-01-01',
                      uin: '123456789',
                      phone_number: '1234567890',}}),
                });
            }else if (url === '/api/getUser?userId=1') {
              return Promise.resolve({
                  ok: true,
                  json: () => Promise.resolve({ exists: true, user_info: {id: 1, name: 'Test User',
                    role: 'USER',
                    email: 'test@email.com',
                    dob: '2000-01-01',
                    uin: '123456789',
                    phone_number: '1234567890',}}),
              });
            }else{
                console.log("OTHER API ROUTE");
            }
          });
          await act(async () => {
            App.setUserInfo(mockUser);
            App.setUserConnected(true);
            App.setLoggedIn(true);
          });
      
          expect(App.tabs).toEqual(
            expect.arrayContaining([
              expect.objectContaining({ name: 'Dashboard' }),
              expect.objectContaining({ name: 'Accommodations' }),
              expect.objectContaining({ name: 'Profile' }),
            ])
          );
      
          expect(App.currentTab.name).toBe('Dashboard');
        });
      
        test('sets STUDENT tabs correctly', async () => {
          global.fetch = jest.fn((url) => {
            if (url === '/api/accountConnected?userId=1') {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({ exists: true }),
                });
            }else if (url === '/api/checkAccount') {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({ exists: true, user_info: {id: 1, name: 'Test User',
                      role: 'USER',
                      email: 'test@email.com',
                      dob: '2000-01-01',
                      uin: '123456789',
                      phone_number: '1234567890',}}),
                });
            }else if (url === '/api/getUser?userId=1') {
              return Promise.resolve({
                  ok: true,
                  json: () => Promise.resolve({ exists: true, user_info: {id: 1, name: 'Test User',
                    role: 'USER',
                    email: 'test@email.com',
                    dob: '2000-01-01',
                    uin: '123456789',
                    phone_number: '1234567890',}}),
              });
            }else if (url === '/api/getStudentCourses?userId=1') {
              return Promise.resolve({
                  ok: true,
                  json: () => Promise.resolve([]),
              });
            }else{
                console.log("OTHER API ROUTE");
            }
          });
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
          global.fetch = jest.fn((url) => {
            if (url === '/api/accountConnected?userId=1') {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({ exists: true }),
                });
            }else if (url === '/api/checkAccount') {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({ exists: true, user_info: {id: 1, name: 'Test User',
                      role: 'USER',
                      email: 'test@email.com',
                      dob: '2000-01-01',
                      uin: '123456789',
                      phone_number: '1234567890',}}),
                });
            }else if (url === '/api/getUser?userId=1') {
              return Promise.resolve({
                  ok: true,
                  json: () => Promise.resolve({ exists: true, user_info: {id: 1, name: 'Test User',
                    role: 'USER',
                    email: 'test@email.com',
                    dob: '2000-01-01',
                    uin: '123456789',
                    phone_number: '1234567890',}}),
              });
            }else if (url === '/api/getStudentCourses?userId=1') {
              return Promise.resolve({
                  ok: true,
                  json: () => Promise.resolve([]),
              });
            }else{
                console.log("OTHER API ROUTE");
            }
          });
          await act(async () => {
            App.setUserInfo({ ...mockUser, role: 'PROFESSOR' });
            App.setUserConnected(true);
            App.setLoggedIn(true);
          });
      
          expect(App.tabs.find(t => t.name === 'Note Taking')).toBeTruthy();
          expect(App.currentTab.name).toBe('Dashboard');
        });
      
        test('sets ADVISOR tabs correctly based on staffAccess', async () => {
          global.fetch = jest.fn((url) => {
            if (url === '/api/accountConnected?userId=1') {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({ exists: true }),
                });
            }else if (url === '/api/checkAccount') {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({ exists: true, user_info: {id: 1, name: 'Test User',
                      role: 'USER',
                      email: 'test@email.com',
                      dob: '2000-01-01',
                      uin: '123456789',
                      phone_number: '1234567890',}}),
                });
            }else if (url === '/api/getUser?userId=1') {
              return Promise.resolve({
                  ok: true,
                  json: () => Promise.resolve({ exists: true, user_info: {id: 1, name: 'Test User',
                    role: 'USER',
                    email: 'test@email.com',
                    dob: '2000-01-01',
                    uin: '123456789',
                    phone_number: '1234567890',}}),
              });
            }else if (url === '/api/getStudentCourses?userId=1') {
              return Promise.resolve({
                  ok: true,
                  json: () => Promise.resolve([]),
              });
            }else if (url === '/api/getStudents') {
              return Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ students: [] }),
              });
            }else{
                console.log("OTHER API ROUTE");
            }
          });
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
                  cursor_size: 2,
                  highlight_links: false,
                highlight_links_color: "#335CFF",
                text_magnifier: true,
                line_height: 2,
                word_spacing: "2px",
                mute_sounds: true,
                highlight_keyboard_focus: true,
                highlight_keyboard_focus_color: "#BD180F",
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
                  cursor_size: 2,
                  highlight_links: false,
                highlight_links_color: "#335CFF",
                text_magnifier: true,
                line_height: 2,
                word_spacing: 2,
                mute_sounds: true,
                highlight_keyboard_focus: true,
                highlight_keyboard_focus_color: "#BD180F",
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
