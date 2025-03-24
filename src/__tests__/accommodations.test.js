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
                let mockUserInfo = {
                        id: 123,
                        name: "Mock User",
                        email: "test@gmail.com",
                        role: "USER",
                        picture: null,
                        dob: "2000-01-01",
                        uin: 123456789,
                        phone_number: 1001001001,
                };
                act(() => {
                        render(<Accommodations userInfo={mockUserInfo} setAlertMessage={mockSetAlertMessage} setShowAlert={mockSetShowAlert}/>);
                });

                expect(screen.queryByTestId('basicAccommodations')).toBeInTheDocument();
        });
});