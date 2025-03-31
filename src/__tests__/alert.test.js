import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import Alert from '../alert';
import {App} from '../App';

import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

beforeAll(() => {
        global.Audio = class {
          play = jest.fn().mockResolvedValue();
        };
});

describe('alert', () => {
        const mockSetShowAlert = jest.fn();
        beforeEach(() => {
                jest.clearAllMocks();
        });

        test('Alert should have no accessibility violations', async () => {
                const { container } = render(<Alert message="HELLO" setShowAlert={mockSetShowAlert}/>);
                const results = await axe(container);
                expect(results).toHaveNoViolations();
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

        test('Clicking the close button should get rid of the alert', async () => {
                render(<App />);
              
                await act(async () => {
                  await App.setAlertMessage("HELLO");
                  await App.setShowAlert(true);
                });
              
                const closeBtn = await screen.findByTestId('alert-close');
                fireEvent.click(closeBtn);
              
                await waitFor(() => {
                  expect(screen.queryByTestId('alert')).not.toBeInTheDocument();
                  expect(screen.queryByText("HELLO")).not.toBeInTheDocument();
                });
        });
});