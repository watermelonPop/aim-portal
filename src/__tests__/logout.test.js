import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { App, logout } from '../App.js';
import {LoginScreen} from '../loginScreen.js';

// Mock the fetch function
global.fetch = jest.fn();

describe('logout', () => {
       const mockSetLoggedIn = jest.fn();
        const mockSetUserType = jest.fn();
        const mockSetStaffRoles = jest.fn();
        const mockSetUserId = jest.fn();
        const mockSetSettings = jest.fn();
        const mockLoggedIn = false;
        let originalLocation;

        beforeAll(() => {
                originalLocation = window.location;
                delete window.location;
                window.location = { href: 'http://localhost/' };
        });

        afterAll(() => {
                window.location = originalLocation;
        });

        test('logs out', async () => {
                global.fetch = jest.fn().mockResolvedValue({
                        ok: true,
                        json: () => Promise.resolve({ message: 'Logged out successfully' })
                });
                await logout(mockSetLoggedIn);
                await waitFor(() => {
                        expect(global.fetch).toHaveBeenCalledWith('/api/logout', {"credentials": "include", "headers": {"Content-Type": "application/json"}, "method": "POST"});
                });
        });
        test('redirects to login', async () => {
                global.fetch = jest.fn().mockResolvedValue({
                        ok: true,
                        json: () => Promise.resolve({ message: 'Logged out successfully' })
                });
                Object.defineProperty(window.location, 'href', {
                        writable: true,
                        value: 'http://localhost/'
                });
                
                await logout(mockSetLoggedIn);
                
                await waitFor(() => {
                        expect(window.location.href).toEqual('/');
                });
        });
});

describe('logout errors', () => {
        let setLoggedIn;
      
        beforeEach(() => {
          setLoggedIn = jest.fn();
          global.fetch = jest.fn();
          jest.spyOn(console, 'error').mockImplementation(() => {}); // silence errors in test logs
        });
      
        afterEach(() => {
          jest.resetAllMocks();
        });
      
        test('throws error and logs when response is not ok', async () => {
          global.fetch.mockResolvedValue({
            ok: false,
            json: async () => ({ message: 'Logout failed due to server error' }),
          });
      
          await logout(setLoggedIn);
      
          expect(console.error).toHaveBeenCalledWith(
            'Error logging out:',
            expect.any(Error)
          );
          expect(setLoggedIn).not.toHaveBeenCalled();
        });
      
        test('logs error if fetch itself throws', async () => {
          global.fetch.mockRejectedValue(new Error('Network error'));
      
          await logout(setLoggedIn);
      
          expect(console.error).toHaveBeenCalledWith(
            'Error logging out:',
            expect.any(Error)
          );
          expect(setLoggedIn).not.toHaveBeenCalled();
        });
});