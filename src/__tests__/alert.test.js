import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import {Alert} from '../alert';
import {App} from '../App';

describe('alert', () => {
        beforeEach(() => {
                jest.clearAllMocks();
        });


        test('setting the alert message & show alert should show the message', async () => {
                act(() => {
                        render(<App />);
                });
                
                await act(async () => {
                        await App.setAlertMessage("HELLO");
                        await App.setShowAlert(true);
                });

                await waitFor(() => {
                        expect(screen.queryByTestId('alert')).toBeInTheDocument();
                        expect(screen.getByText("HELLO")).toBeInTheDocument();
                });
        });
});