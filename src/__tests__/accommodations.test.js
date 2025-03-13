import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import {Accommodations} from '../accommodations.js';

describe('accommodations', () => {
        const mockSetAlertMessage = jest.fn();
        const mockSetShowAlert = jest.fn();
        beforeEach(() => {
                jest.clearAllMocks();
        });


        test('renders user UserAccommodations if userType is user', async () => {
                act(() => {
                        render(<Accommodations userType={"User"} name={"test name"} email={"test@email.com"} setAlertMessage={mockSetAlertMessage} setShowAlert={mockSetShowAlert}/>);
                });

                expect(screen.queryByTestId('basicAccommodations')).toBeInTheDocument();
        });
});