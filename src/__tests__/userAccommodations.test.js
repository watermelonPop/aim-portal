import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import {UserAccommodations} from '../userAccommodations';

describe('userAccommodations', () => {
        const mockSetAlertMessage = jest.fn();
        const mockSetShowAlert = jest.fn();
        const mockSetExistingRequest = jest.fn();
        const mockValidateForm = jest.fn();
        beforeEach(() => {
                jest.clearAllMocks();
        });
        describe('on load', () => {
                test('makes a call to /api/checkRequests?email=${email} with the proper email', async () => {
                        global.fetch = jest.fn().mockResolvedValue({
                                ok: true,
                                json: jest.fn().mockResolvedValueOnce({})
                        });

                        render(<UserAccommodations name={"test name"} email={"test@email.com"} setAlertMessage={mockSetAlertMessage} setShowAlert={mockSetShowAlert}/>);

                        await waitFor(() => {
                                expect(global.fetch).toHaveBeenCalledWith('/api/checkRequests?email=test@email.com');
                        });
                });

                test('sets the existing as null if no request', async () => {
                        global.fetch = jest.fn().mockResolvedValue({
                                ok: true,
                                json: jest.fn().mockResolvedValueOnce({exists: false, message: "No request found"})
                        });

                        render(<UserAccommodations name={"test name"} email={"test@email.com"} setAlertMessage={mockSetAlertMessage} setShowAlert={mockSetShowAlert}/>);

                        await waitFor(() => {
                                expect(UserAccommodations.existingRequest).toEqual(null);
                        });
                });

                test('sets the existing request', async () => {
                        global.fetch = jest.fn().mockResolvedValue({
                                ok: true,
                                json: jest.fn().mockResolvedValueOnce({exists: true, request: {name: "tester name"}})
                        });

                        render(<UserAccommodations name={"test name"} email={"test@email.com"} setAlertMessage={mockSetAlertMessage} setShowAlert={mockSetShowAlert}/>);

                        await waitFor(() => {
                                expect(UserAccommodations.existingRequest).toEqual({name: "tester name"});
                        });
                }); 

        });     
        describe('correct form display based on checkRequest', () => {
                test('shows the new student application if no request', async () => {
                        global.fetch = jest.fn().mockResolvedValue({
                                ok: true,
                                json: jest.fn().mockResolvedValueOnce({exists: false, message: "No request found"})
                        });

                        render(<UserAccommodations name={"test name"} email={"test@email.com"} setAlertMessage={mockSetAlertMessage} setShowAlert={mockSetShowAlert}/>);

                        await waitFor(() => {
                                expect(screen.queryByTestId('newStudentApp')).toBeInTheDocument();
                                expect(screen.queryByTestId('existingRequest')).not.toBeInTheDocument();
                        });
                });

                test('shows the existing request if exists', async () => {
                        global.fetch = jest.fn().mockResolvedValue({
                                ok: true,
                                json: jest.fn().mockResolvedValueOnce({exists: true, request: {}})
                        });

                        render(<UserAccommodations name={"test name"} email={"test@email.com"} setAlertMessage={mockSetAlertMessage} setShowAlert={mockSetShowAlert}/>);

                        await waitFor(() => {
                                expect(screen.queryByTestId('newStudentApp')).not.toBeInTheDocument();
                                expect(screen.queryByTestId('existingRequest')).toBeInTheDocument();
                        });
                });

                test('shows correct label when student has documentation', async () => {
                        global.fetch = jest.fn().mockResolvedValue({
                                ok: true,
                                json: jest.fn().mockResolvedValueOnce({exists: true, request: {has_documentation: true}})
                        });

                        render(<UserAccommodations name={"test name"} email={"test@email.com"} setAlertMessage={mockSetAlertMessage} setShowAlert={mockSetShowAlert}/>);

                        await waitFor(() => {
                                expect(screen.getByText("You have submitted your documentation, and your request is under review!")).toBeInTheDocument();
                                expect(screen.queryByText("You have not submitted your documentation yet. Please submit it in Forms before we can review your request.")).not.toBeInTheDocument();
                        });
                });

                test('shows correct label when student doesnt have documentation', async () => {
                        global.fetch = jest.fn().mockResolvedValue({
                                ok: true,
                                json: jest.fn().mockResolvedValueOnce({exists: true, request: {has_documentation: false}})
                        });

                        render(<UserAccommodations name={"test name"} email={"test@email.com"} setAlertMessage={mockSetAlertMessage} setShowAlert={mockSetShowAlert}/>);

                        await waitFor(() => {
                                expect(screen.getByText("You have not submitted your documentation yet. Please submit it in Forms before we can review your request.")).toBeInTheDocument();
                                expect(screen.queryByText("You have submitted your documentation, and your request is under review!")).not.toBeInTheDocument();
                        });
                });

                test('new student application shows correct form labels', async () => {
                        global.fetch = jest.fn().mockResolvedValue({
                                ok: true,
                                json: jest.fn().mockResolvedValueOnce({exists: false, message: "No request found"})
                        });

                        render(<UserAccommodations name={"test name"} email={"test@email.com"} setAlertMessage={mockSetAlertMessage} setShowAlert={mockSetShowAlert}/>);

                        await waitFor(() => {
                                expect(screen.getByText("Name")).toBeInTheDocument();
                                expect(screen.getByText("Email")).toBeInTheDocument();
                                expect(screen.getByText("Date of Birth")).toBeInTheDocument();
                                expect(screen.getByText("UIN")).toBeInTheDocument();
                                expect(screen.getByText("Phone Number")).toBeInTheDocument();
                                expect(screen.getByText("What is your disability or disabilities?")).toBeInTheDocument();
                                expect(screen.getByText("What challenges do you experience related to taking tests/exams, if any?")).toBeInTheDocument();
                                expect(screen.getByText("What challenges do you experience in the classroom or learning environment, if any?")).toBeInTheDocument();
                                expect(screen.getByText("If you are living on-campus, do you require any disability accommodations in the housing environment?")).toBeInTheDocument();
                                expect(screen.getByText("Do you experience any side effects related to treatment or medications that may be relevant to identifying accommodations?")).toBeInTheDocument();
                                expect(screen.getByText("What specific accommodations are you requesting?")).toBeInTheDocument();
                                expect(screen.getByText("What accommodations have you used in the past?")).toBeInTheDocument();
                        });
                });

                test('new student application shows correct form inputs', async () => {
                        global.fetch = jest.fn().mockResolvedValue({
                                ok: true,
                                json: jest.fn().mockResolvedValueOnce({exists: false, message: "No request found"})
                        });

                        render(<UserAccommodations name={"test name"} email={"test@email.com"} setAlertMessage={mockSetAlertMessage} setShowAlert={mockSetShowAlert}/>);

                        await waitFor(() => {
                                expect(screen.queryByTestId('name')).toBeInTheDocument();
                                expect(screen.queryByTestId('email')).toBeInTheDocument();
                                expect(screen.queryByTestId('dob')).toBeInTheDocument();
                                expect(screen.queryByTestId('uin')).toBeInTheDocument();
                                expect(screen.queryByTestId('phoneNumber')).toBeInTheDocument();
                                expect(screen.queryByTestId('disability')).toBeInTheDocument();
                                expect(screen.queryByTestId('testing')).toBeInTheDocument();
                                expect(screen.queryByTestId('inClass')).toBeInTheDocument();
                                expect(screen.queryByTestId('housing')).toBeInTheDocument();
                                expect(screen.queryByTestId('sideEffect')).toBeInTheDocument();
                                expect(screen.queryByTestId('accommodations')).toBeInTheDocument();
                                expect(screen.queryByTestId('pastAcc')).toBeInTheDocument();
                        });
                });

                test('existing request shows correct form labels', async () => {
                        global.fetch = jest.fn().mockResolvedValue({
                                ok: true,
                                json: jest.fn().mockResolvedValueOnce({exists: true, request: {}})
                        });

                        render(<UserAccommodations name={"test name"} email={"test@email.com"} setAlertMessage={mockSetAlertMessage} setShowAlert={mockSetShowAlert}/>);

                        await waitFor(() => {
                                expect(screen.getByText("Name")).toBeInTheDocument();
                                expect(screen.getByText("Email")).toBeInTheDocument();
                                expect(screen.getByText("Date of Birth")).toBeInTheDocument();
                                expect(screen.getByText("UIN")).toBeInTheDocument();
                                expect(screen.getByText("Phone Number")).toBeInTheDocument();
                                expect(screen.getByText("Notes")).toBeInTheDocument();
                        });
                });

                test('existing request shows correct form inputs', async () => {
                        global.fetch = jest.fn().mockResolvedValue({
                                ok: true,
                                json: jest.fn().mockResolvedValueOnce({exists: true, request: {}})
                        });

                        render(<UserAccommodations name={"test name"} email={"test@email.com"} setAlertMessage={mockSetAlertMessage} setShowAlert={mockSetShowAlert}/>);

                        await waitFor(() => {
                                expect(screen.queryByTestId('name')).toBeInTheDocument();
                                expect(screen.queryByTestId('email')).toBeInTheDocument();
                                expect(screen.queryByTestId('dob')).toBeInTheDocument();
                                expect(screen.queryByTestId('uin')).toBeInTheDocument();
                                expect(screen.queryByTestId('phoneNumber')).toBeInTheDocument();
                                expect(screen.queryByTestId('notes')).toBeInTheDocument();
                        });
                });
        }); 

        describe('input form change', () => {
                test('new student app: on input change, should change the value', async () => {
                        global.fetch = jest.fn().mockResolvedValue({
                                ok: true,
                                json: jest.fn().mockResolvedValueOnce({exists: false, message: "No request found"})
                        });

                        render(<UserAccommodations name={"test name"} email={"test@email.com"} setAlertMessage={mockSetAlertMessage} setShowAlert={mockSetShowAlert}/>);
                        
                        const inputElement = screen.getByTestId('name');
                        fireEvent.change(inputElement, { target: { value: 'Test Name' } });

                        await waitFor(() => {
                                expect(inputElement.value).toBe('Test Name');
                        });
                });

                test('existing request: on input change, should not change value', async () => {
                        global.fetch = jest.fn().mockResolvedValue({
                                ok: true,
                                json: jest.fn().mockResolvedValueOnce({exists: true, request: {name: "Test Name"}})
                        });

                        render(<UserAccommodations name={"test name"} email={"test@email.com"} setAlertMessage={mockSetAlertMessage} setShowAlert={mockSetShowAlert}/>);
                        
                        const inputElement = screen.getByTestId('name');
                        fireEvent.change(inputElement, { target: { value: 'NOT Test Name' } });

                        await waitFor(() => {
                                expect(inputElement.value).not.toBe('Test Name');
                        });
                });
        }); 

        describe('new student application submit process', () => {
                describe('validateForm()', () => {
                        test('clicking submit button with valid values should change form data', async () => {
                                global.fetch = jest.fn().mockResolvedValue({
                                        ok: true,
                                        json: jest.fn().mockResolvedValueOnce({exists: false, message: "No request found"})
                                });

                                render(<UserAccommodations name={"Test Name"} email={"test@email.com"} setAlertMessage={mockSetAlertMessage} setShowAlert={mockSetShowAlert}/>);
                                fireEvent.change(screen.getByTestId('name'), { target: { value: 'Test Name' } });
                                fireEvent.change(screen.getByTestId('email'), { target: { value: 'test@email.com' } });
                                fireEvent.change(screen.getByTestId('dob'), { target: { value: '2003-01-01' } });
                                fireEvent.change(screen.getByTestId('uin'), { target: { value: 123456789 } });
                                fireEvent.change(screen.getByTestId('phoneNumber'), { target: { value: 1234567890 } });
                                fireEvent.change(screen.getByTestId('disability'), { target: { value: 'disability' } });
                                fireEvent.change(screen.getByTestId('testing'), { target: { value: 'testing' } });
                                fireEvent.change(screen.getByTestId('inClass'), { target: { value: 'inClass' } });
                                fireEvent.change(screen.getByTestId('housing'), { target: { value: 'housing' } });
                                fireEvent.change(screen.getByTestId('sideEffect'), { target: { value: 'sideEffect' } });
                                fireEvent.change(screen.getByTestId('accommodations'), { target: { value: 'accommodations' } });
                                fireEvent.change(screen.getByTestId('pastAcc'), { target: { value: 'pastAcc' } });
                                const submitButton = screen.getByRole('button', { name: /Submit/i });
                                fireEvent.click(submitButton);
                                await waitFor(() => {
                                        expect(UserAccommodations.formData).toStrictEqual({
                                                name: "Test Name",
                                                email: 'test@email.com',
                                                dob: '2003-01-01',
                                                uin: '123456789',
                                                phoneNumber: '1234567890',
                                                disability: 'disability',
                                                testing: 'testing',
                                                inClass: 'inClass',
                                                housing: 'housing',
                                                sideEffect: 'sideEffect',
                                                accommodations: 'accommodations',
                                                pastAcc: 'pastAcc'
                                        });
                                });
                        });

                        test('clicking submit button with invalid values should NOT set formData', async () => {
                                global.fetch = jest.fn().mockResolvedValue({
                                        ok: true,
                                        json: jest.fn().mockResolvedValueOnce({exists: false, message: "No request found"})
                                });

                                render(<UserAccommodations name={"Test Name"} email={"test@email.com"} setAlertMessage={mockSetAlertMessage} setShowAlert={mockSetShowAlert}/>);
                                const submitButton = screen.getByRole('button', { name: /Submit/i });
                                fireEvent.click(submitButton);
                                await waitFor(() => {
                                        expect(UserAccommodations.formData).toStrictEqual({
                                                name: "Test Name",
                                                email: "test@email.com",
                                                dob: '',
                                                uin: '',
                                                phoneNumber: '',
                                                disability: '',
                                                testing: '',
                                                inClass: '',
                                                housing: '',
                                                sideEffect: '',
                                                accommodations: '',
                                                pastAcc: ''
                                        });
                                });
                        });

                        test('clicking submit button with invalid values should setErrors', async () => {
                                global.fetch = jest.fn().mockResolvedValue({
                                        ok: true,
                                        json: jest.fn().mockResolvedValueOnce({exists: false, message: "No request found"})
                                });

                                render(<UserAccommodations name={"Test Name"} email={"test@email.com"} setAlertMessage={mockSetAlertMessage} setShowAlert={mockSetShowAlert}/>);
                                fireEvent.change(screen.getByTestId('name'), { target: { value: '' } });
                                fireEvent.change(screen.getByTestId('email'), { target: { value: '' } });
                                const submitButton = screen.getByRole('button', { name: /Submit/i });
                                fireEvent.click(submitButton);
                                await waitFor(() => {
                                        expect(UserAccommodations.errors).toStrictEqual({
                                                name: "Name is required",
                                                email: "Email is required",
                                                dob: "Date of Birth is required",
                                                uin: "UIN must be 9 digits",
                                                phoneNumber: "Please enter a valid 10-digit phone number",
                                                disability: 'Disability is required',
                                                testing: 'Testing is required',
                                                inClass: 'InClass is required',
                                                housing: 'Housing is required',
                                                sideEffect: 'SideEffect is required',
                                                accommodations: 'Accommodations is required',
                                                pastAcc: 'PastAcc is required'
                                        });
                                });
                        });

                        test('clicking submit button with invalid values should display errors as alerts to user', async () => {
                                global.fetch = jest.fn().mockResolvedValue({
                                        ok: true,
                                        json: jest.fn().mockResolvedValueOnce({exists: false, message: "No request found"})
                                });
                                act(() => {
                                        render(<UserAccommodations name={"Test Name"} email={"test@email.com"} setAlertMessage={mockSetAlertMessage} setShowAlert={mockSetShowAlert}/>);
                                });

                                act(() => {
                                        fireEvent.change(screen.getByTestId('name'), { target: { value: '' } });
                                        fireEvent.change(screen.getByTestId('email'), { target: { value: '' } });
                                        const submitButton = screen.getByRole('button', { name: /Submit/i });
                                        fireEvent.click(submitButton);
                                });

                                await waitFor(() => {
                                        expect(mockSetAlertMessage).toHaveBeenCalledWith(
                                                expect.stringMatching(/(Incorrect required fields:|name is required|email is required|date of Birth is required|UIN must be 9 digits|Please enter a valid 10-digit phone number|Disability is required|Testing is required|InClass is required|Housing is required|SideEffect is required|accommodations is required|pastAcc is required)/)
                                        );
                                        expect(mockSetShowAlert).toHaveBeenCalledWith(true);
                                });
                        });

                        test('calling validateForm() with invalid form data should setErrors', async () => {
                                global.fetch = jest.fn().mockResolvedValue({
                                        ok: true,
                                        json: jest.fn().mockResolvedValueOnce({exists: false, message: "No request found"})
                                });

                                render(<UserAccommodations name={""} email={""} setAlertMessage={mockSetAlertMessage} setShowAlert={mockSetShowAlert}/>);

                                await act(async () => {
                                        UserAccommodations.setFormData({
                                                name: "",
                                                email: "",
                                                dob: '',
                                                uin: '',
                                                phoneNumber: '',
                                                disability: '',
                                                testing: '',
                                                inClass: '',
                                                housing: '',
                                                sideEffect: '',
                                                accommodations: '',
                                                pastAcc: ''
                                        });
                                        UserAccommodations.validateForm();
                                });

                                await waitFor(() => {
                                        expect(UserAccommodations.errors).toStrictEqual({
                                                name: "Name is required",
                                                email: "Email is required",
                                                dob: "Date of Birth is required",
                                                uin: "UIN must be 9 digits",
                                                phoneNumber: "Please enter a valid 10-digit phone number",
                                                disability: 'Disability is required',
                                                testing: 'Testing is required',
                                                inClass: 'InClass is required',
                                                housing: 'Housing is required',
                                                sideEffect: 'SideEffect is required',
                                                accommodations: 'Accommodations is required',
                                                pastAcc: 'PastAcc is required'
                                        });
                                });
                        });
                });
                describe('if form is valid', () => {
                        test('calls /api/createRequest with correct attributes', async () => {
                                global.fetch = jest.fn().mockResolvedValue({
                                        ok: true,
                                        json: jest.fn().mockResolvedValueOnce({exists: false, message: "No request found"})
                                });

                                render(<UserAccommodations name={"Test Name"} email={"test@email.com"} setAlertMessage={mockSetAlertMessage} setShowAlert={mockSetShowAlert}/>);
                                fireEvent.change(screen.getByTestId('name'), { target: { value: 'Test Name' } });
                                fireEvent.change(screen.getByTestId('email'), { target: { value: 'test@email.com' } });
                                fireEvent.change(screen.getByTestId('dob'), { target: { value: '2003-01-01' } });
                                fireEvent.change(screen.getByTestId('uin'), { target: { value: 123456789 } });
                                fireEvent.change(screen.getByTestId('phoneNumber'), { target: { value: 1234567890 } });
                                fireEvent.change(screen.getByTestId('disability'), { target: { value: 'disability' } });
                                fireEvent.change(screen.getByTestId('testing'), { target: { value: 'testing' } });
                                fireEvent.change(screen.getByTestId('inClass'), { target: { value: 'inClass' } });
                                fireEvent.change(screen.getByTestId('housing'), { target: { value: 'housing' } });
                                fireEvent.change(screen.getByTestId('sideEffect'), { target: { value: 'sideEffect' } });
                                fireEvent.change(screen.getByTestId('accommodations'), { target: { value: 'accommodations' } });
                                fireEvent.change(screen.getByTestId('pastAcc'), { target: { value: 'pastAcc' } });
                                const submitButton = screen.getByRole('button', { name: /Submit/i });
                                fireEvent.click(submitButton);
                                await waitFor(() => {
                                        expect(global.fetch).toHaveBeenCalledWith(
                                                '/api/createRequest',
                                                expect.objectContaining({
                                                  method: 'POST',
                                                  headers: { 'Content-Type': 'application/json' },
                                                  body: JSON.stringify({
                                                    user_name: 'Test Name',
                                                    user_email: 'test@email.com',
                                                    dob: '2003-01-01',
                                                    uin: '123456789',
                                                    phone_number: '1234567890',
                                                    notes: 'disability\ntesting\ninClass\nhousing\nsideEffect\naccommodations\npastAcc'
                                                  }),
                                                })
                                        );
                                });
                        });
                        describe('if valid api result from createRequest', () => {
                                test('alerts the user success', async () => {
                                        global.fetch = jest.fn().mockResolvedValue({
                                                ok: true,
                                                json: jest.fn().mockResolvedValueOnce({exists: false, message: "No request found"})
                                        }).mockResolvedValue({
                                                ok: true,
                                                status: 200,
                                                json: jest.fn().mockResolvedValue({ message: 'Request created successfully' })
                                        });
        
                                        render(<UserAccommodations name={"Test Name"} email={"test@email.com"} setAlertMessage={mockSetAlertMessage} setShowAlert={mockSetShowAlert}/>);
                                        fireEvent.change(screen.getByTestId('name'), { target: { value: 'Test Name' } });
                                        fireEvent.change(screen.getByTestId('email'), { target: { value: 'test@email.com' } });
                                        fireEvent.change(screen.getByTestId('dob'), { target: { value: '2003-01-01' } });
                                        fireEvent.change(screen.getByTestId('uin'), { target: { value: 123456789 } });
                                        fireEvent.change(screen.getByTestId('phoneNumber'), { target: { value: 1234567890 } });
                                        fireEvent.change(screen.getByTestId('disability'), { target: { value: 'disability' } });
                                        fireEvent.change(screen.getByTestId('testing'), { target: { value: 'testing' } });
                                        fireEvent.change(screen.getByTestId('inClass'), { target: { value: 'inClass' } });
                                        fireEvent.change(screen.getByTestId('housing'), { target: { value: 'housing' } });
                                        fireEvent.change(screen.getByTestId('sideEffect'), { target: { value: 'sideEffect' } });
                                        fireEvent.change(screen.getByTestId('accommodations'), { target: { value: 'accommodations' } });
                                        fireEvent.change(screen.getByTestId('pastAcc'), { target: { value: 'pastAcc' } });
                                        const submitButton = screen.getByRole('button', { name: /Submit/i });
                                        fireEvent.click(submitButton);

                                        await waitFor(() => {
                                                expect(global.fetch).toHaveBeenCalledWith(
                                                        '/api/createRequest',
                                                        expect.objectContaining({
                                                          method: 'POST',
                                                          headers: { 'Content-Type': 'application/json' },
                                                          body: JSON.stringify({
                                                            user_name: 'Test Name',
                                                            user_email: 'test@email.com',
                                                            dob: '2003-01-01',
                                                            uin: '123456789',
                                                            phone_number: '1234567890',
                                                            notes: 'disability\ntesting\ninClass\nhousing\nsideEffect\naccommodations\npastAcc'
                                                          }),
                                                        })
                                                );
                                                expect(mockSetAlertMessage).toHaveBeenCalledWith(
                                                        "Request submitted successfully"
                                                );
                                                expect(mockSetShowAlert).toHaveBeenCalledWith(true);
                                        });
                                });
                                test('calls checkRequests again', async () => {
                                        global.fetch = jest.fn().mockResolvedValue({
                                                ok: true,
                                                json: jest.fn().mockResolvedValueOnce({exists: false, message: "No request found"})
                                        }).mockResolvedValue({
                                                ok: true,
                                                json: jest.fn().mockResolvedValueOnce({exists: true, request: {name: "Test Name"}})
                                        });
        
                                        render(<UserAccommodations name={"Test Name"} email={"test@email.com"} setAlertMessage={mockSetAlertMessage} setShowAlert={mockSetShowAlert}/>);
                                        fireEvent.change(screen.getByTestId('name'), { target: { value: 'Test Name' } });
                                        fireEvent.change(screen.getByTestId('email'), { target: { value: 'test@email.com' } });
                                        fireEvent.change(screen.getByTestId('dob'), { target: { value: '2003-01-01' } });
                                        fireEvent.change(screen.getByTestId('uin'), { target: { value: 123456789 } });
                                        fireEvent.change(screen.getByTestId('phoneNumber'), { target: { value: 1234567890 } });
                                        fireEvent.change(screen.getByTestId('disability'), { target: { value: 'disability' } });
                                        fireEvent.change(screen.getByTestId('testing'), { target: { value: 'testing' } });
                                        fireEvent.change(screen.getByTestId('inClass'), { target: { value: 'inClass' } });
                                        fireEvent.change(screen.getByTestId('housing'), { target: { value: 'housing' } });
                                        fireEvent.change(screen.getByTestId('sideEffect'), { target: { value: 'sideEffect' } });
                                        fireEvent.change(screen.getByTestId('accommodations'), { target: { value: 'accommodations' } });
                                        fireEvent.change(screen.getByTestId('pastAcc'), { target: { value: 'pastAcc' } });
                                        const submitButton = screen.getByRole('button', { name: /Submit/i });
                                        fireEvent.click(submitButton);
                                        await waitFor(() => {
                                                expect(global.fetch).toHaveBeenCalledTimes(2);
                                                expect(global.fetch).toHaveBeenCalledWith('/api/checkRequests?email=test@email.com');
                                        });
                                });
                                test('sets existing request', async () => {
                                        global.fetch = jest.fn().mockResolvedValue({
                                                ok: true,
                                                json: jest.fn().mockResolvedValueOnce({exists: false, message: "No request found"})
                                        }).mockResolvedValue({
                                                ok: true,
                                                json: jest.fn().mockResolvedValueOnce({exists: true, request: {
                                                        name: 'Test Name',
                                                        user_email: 'test@email.com',
                                                        dob: '2003-01-01',
                                                        uin: '123456789',
                                                        phone_number: '1234567890',
                                                        notes: 'disability\ntesting\ninClass\nhousing\nsideEffect\naccommodations\npastAcc'
                                                }})
                                        });
        
                                        render(<UserAccommodations name={"Test Name"} email={"test@email.com"} setAlertMessage={mockSetAlertMessage} setShowAlert={mockSetShowAlert}/>);
                                        fireEvent.change(screen.getByTestId('name'), { target: { value: 'Test Name' } });
                                        fireEvent.change(screen.getByTestId('email'), { target: { value: 'test@email.com' } });
                                        fireEvent.change(screen.getByTestId('dob'), { target: { value: '2003-01-01' } });
                                        fireEvent.change(screen.getByTestId('uin'), { target: { value: 123456789 } });
                                        fireEvent.change(screen.getByTestId('phoneNumber'), { target: { value: 1234567890 } });
                                        fireEvent.change(screen.getByTestId('disability'), { target: { value: 'disability' } });
                                        fireEvent.change(screen.getByTestId('testing'), { target: { value: 'testing' } });
                                        fireEvent.change(screen.getByTestId('inClass'), { target: { value: 'inClass' } });
                                        fireEvent.change(screen.getByTestId('housing'), { target: { value: 'housing' } });
                                        fireEvent.change(screen.getByTestId('sideEffect'), { target: { value: 'sideEffect' } });
                                        fireEvent.change(screen.getByTestId('accommodations'), { target: { value: 'accommodations' } });
                                        fireEvent.change(screen.getByTestId('pastAcc'), { target: { value: 'pastAcc' } });
                                        const submitButton = screen.getByRole('button', { name: /Submit/i });
                                        fireEvent.click(submitButton);
                                        await waitFor(() => {
                                                expect(UserAccommodations.existingRequest).toStrictEqual({
                                                        name: 'Test Name',
                                                        user_email: 'test@email.com',
                                                        dob: '2003-01-01',
                                                        uin: '123456789',
                                                        phone_number: '1234567890',
                                                        notes: 'disability\ntesting\ninClass\nhousing\nsideEffect\naccommodations\npastAcc'
                                                });
                                        });
                                });
                                test('changes view to existing request', async () => {
                                        global.fetch = jest.fn().mockResolvedValue({
                                                ok: true,
                                                json: jest.fn().mockResolvedValueOnce({exists: false, message: "No request found"})
                                        }).mockResolvedValue({
                                                ok: true,
                                                json: jest.fn().mockResolvedValueOnce({exists: true, request: {
                                                        name: 'Test Name',
                                                        user_email: 'test@email.com',
                                                        dob: '2003-01-01',
                                                        uin: '123456789',
                                                        phone_number: '1234567890',
                                                        notes: 'disability\ntesting\ninClass\nhousing\nsideEffect\naccommodations\npastAcc'
                                                }})
                                        });
        
                                        render(<UserAccommodations name={"Test Name"} email={"test@email.com"} setAlertMessage={mockSetAlertMessage} setShowAlert={mockSetShowAlert}/>);
                                        fireEvent.change(screen.getByTestId('name'), { target: { value: 'Test Name' } });
                                        fireEvent.change(screen.getByTestId('email'), { target: { value: 'test@email.com' } });
                                        fireEvent.change(screen.getByTestId('dob'), { target: { value: '2003-01-01' } });
                                        fireEvent.change(screen.getByTestId('uin'), { target: { value: 123456789 } });
                                        fireEvent.change(screen.getByTestId('phoneNumber'), { target: { value: 1234567890 } });
                                        fireEvent.change(screen.getByTestId('disability'), { target: { value: 'disability' } });
                                        fireEvent.change(screen.getByTestId('testing'), { target: { value: 'testing' } });
                                        fireEvent.change(screen.getByTestId('inClass'), { target: { value: 'inClass' } });
                                        fireEvent.change(screen.getByTestId('housing'), { target: { value: 'housing' } });
                                        fireEvent.change(screen.getByTestId('sideEffect'), { target: { value: 'sideEffect' } });
                                        fireEvent.change(screen.getByTestId('accommodations'), { target: { value: 'accommodations' } });
                                        fireEvent.change(screen.getByTestId('pastAcc'), { target: { value: 'pastAcc' } });
                                        const submitButton = screen.getByRole('button', { name: /Submit/i });
                                        fireEvent.click(submitButton);
                                        await waitFor(() => {
                                                expect(screen.queryByTestId('newStudentApp')).not.toBeInTheDocument();
                                                expect(screen.queryByTestId('existingRequest')).toBeInTheDocument();
                                        });
                                });
                        });
                        describe('if NOT valid api result from createRequest', () => {
                                test('alerts the user of failure', async () => {
                                        global.fetch = jest.fn().mockResolvedValue({
                                                ok: true,
                                                json: jest.fn().mockResolvedValueOnce({exists: false, message: "No request found"})
                                        }).mockResolvedValue({
                                                ok: false,
                                                status: 500,
                                                json: jest.fn().mockResolvedValue({ error: "ERROR" })
                                        });
        
                                        render(<UserAccommodations name={"Test Name"} email={"test@email.com"} setAlertMessage={mockSetAlertMessage} setShowAlert={mockSetShowAlert}/>);
                                        fireEvent.change(screen.getByTestId('name'), { target: { value: 'Test Name' } });
                                        fireEvent.change(screen.getByTestId('email'), { target: { value: 'test@email.com' } });
                                        fireEvent.change(screen.getByTestId('dob'), { target: { value: '2003-01-01' } });
                                        fireEvent.change(screen.getByTestId('uin'), { target: { value: 123456789 } });
                                        fireEvent.change(screen.getByTestId('phoneNumber'), { target: { value: 1234567890 } });
                                        fireEvent.change(screen.getByTestId('disability'), { target: { value: 'disability' } });
                                        fireEvent.change(screen.getByTestId('testing'), { target: { value: 'testing' } });
                                        fireEvent.change(screen.getByTestId('inClass'), { target: { value: 'inClass' } });
                                        fireEvent.change(screen.getByTestId('housing'), { target: { value: 'housing' } });
                                        fireEvent.change(screen.getByTestId('sideEffect'), { target: { value: 'sideEffect' } });
                                        fireEvent.change(screen.getByTestId('accommodations'), { target: { value: 'accommodations' } });
                                        fireEvent.change(screen.getByTestId('pastAcc'), { target: { value: 'pastAcc' } });
                                        const submitButton = screen.getByRole('button', { name: /Submit/i });
                                        fireEvent.click(submitButton);

                                        await waitFor(() => {
                                                expect(mockSetAlertMessage).toHaveBeenCalledWith(
                                                        "Request submission failed. Please try again."
                                                );
                                                expect(mockSetShowAlert).toHaveBeenCalledWith(true);
                                        });
                                });
                        });
                });
                describe('if form is NOT valid', () => {
                        test('alerts user with errors', async () => {
                                global.fetch = jest.fn().mockResolvedValue({
                                        ok: true,
                                        json: jest.fn().mockResolvedValueOnce({exists: false, message: "No request found"})
                                });

                                render(<UserAccommodations name={"Test Name"} email={"test@email.com"} setAlertMessage={mockSetAlertMessage} setShowAlert={mockSetShowAlert}/>);
                                fireEvent.change(screen.getByTestId('name'), { target: { value: '' } });
                                fireEvent.change(screen.getByTestId('email'), { target: { value: '' } });
                                const submitButton = screen.getByRole('button', { name: /Submit/i });
                                fireEvent.click(submitButton);
                                await waitFor(() => {
                                        expect(mockSetAlertMessage).toHaveBeenCalledWith(
                                                expect.stringMatching(/(Incorrect required fields:|name is required|email is required|date of Birth is required|UIN must be 9 digits|Please enter a valid 10-digit phone number|Disability is required|Testing is required|InClass is required|Housing is required|SideEffect is required|accommodations is required|pastAcc is required)/)
                                        );
                                        expect(mockSetShowAlert).toHaveBeenCalledWith(true);
                                });
                        });
                });

        }); 

        describe('cancel existing request process', () => {
                test('clicking cancel calls /api/cancelRequest with correct email', async () => {
                        global.fetch = jest.fn().mockResolvedValue({
                                ok: true,
                                json: jest.fn().mockResolvedValueOnce({exists: true, request: {
                                        name: 'Test Name',
                                        user_email: 'test@email.com',
                                        dob: '2003-01-01',
                                        uin: '123456789',
                                        phone_number: '1234567890',
                                        notes: 'disability\ntesting\ninClass\nhousing\nsideEffect\naccommodations\npastAcc',
                                        has_documentation: true
                                }})
                        });

                        render(<UserAccommodations name={"Test Name"} email={"test@email.com"} setAlertMessage={mockSetAlertMessage} setShowAlert={mockSetShowAlert}/>);
                        const cancelButton = await screen.findByTestId("cancelBtn");
                        fireEvent.click(cancelButton);
                        await waitFor(() => {
                                expect(global.fetch).toHaveBeenCalledWith(
                                        '/api/cancelRequest',
                                        expect.objectContaining({
                                          method: 'POST',
                                          headers: { 'Content-Type': 'application/json' },
                                          body: JSON.stringify({
                                            email: 'test@email.com'
                                          }),
                                        })
                                );
                        });
                });
                describe('correct response from /api/cancelRequest', () => {
                        test('alerts the user of success', async () => {
                                global.fetch = jest.fn()
                                  .mockResolvedValueOnce({
                                    ok: true,
                                    json: jest.fn().mockResolvedValue({
                                      exists: true, 
                                      request: {
                                        name: 'Test Name',
                                        user_email: 'test@email.com',
                                        dob: '2003-01-01',
                                        uin: '123456789',
                                        phone_number: '1234567890',
                                        notes: 'disability\ntesting\ninClass\nhousing\nsideEffect\naccommodations\npastAcc',
                                        has_documentation: true
                                      }
                                    })
                                  })
                                  .mockResolvedValueOnce({
                                    ok: true,
                                    json: jest.fn().mockResolvedValue({ message: 'Request deleted successfully' })
                                  });
                              
                                render(<UserAccommodations name="Test Name" email="test@email.com" setAlertMessage={mockSetAlertMessage} setShowAlert={mockSetShowAlert}/>);
                                const cancelButton = await screen.findByTestId('cancelBtn');
                                fireEvent.click(cancelButton);
                              
                                await waitFor(() => {
                                  expect(mockSetAlertMessage).toHaveBeenCalledWith("Request cancelled successfully!");
                                  expect(mockSetShowAlert).toHaveBeenCalledWith(true);
                                });
                        });
                
                        test('sets the existing request as null', async () => {
                                global.fetch = jest.fn()
                                  .mockResolvedValueOnce({
                                    ok: true,
                                    json: jest.fn().mockResolvedValue({
                                      exists: true, 
                                      request: {
                                        name: 'Test Name',
                                        user_email: 'test@email.com',
                                        dob: '2003-01-01',
                                        uin: '123456789',
                                        phone_number: '1234567890',
                                        notes: 'disability\ntesting\ninClass\nhousing\nsideEffect\naccommodations\npastAcc',
                                        has_documentation: true
                                      }
                                    })
                                  })
                                  .mockResolvedValueOnce({
                                    ok: true,
                                    json: jest.fn().mockResolvedValue({ message: 'Request deleted successfully' })
                                  });
                              
                                render(<UserAccommodations name="Test Name" email="test@email.com" setAlertMessage={mockSetAlertMessage} setShowAlert={mockSetShowAlert}/>);
                                const cancelButton = await screen.findByTestId('cancelBtn');
                                fireEvent.click(cancelButton);

                                await waitFor(() => {
                                        expect(UserAccommodations.existingRequest).toEqual(null);
                                });
                        });
                        test('changes to new student application', async () => {
                                global.fetch = jest.fn()
                                  .mockResolvedValueOnce({
                                    ok: true,
                                    json: jest.fn().mockResolvedValue({
                                      exists: true, 
                                      request: {
                                        name: 'Test Name',
                                        user_email: 'test@email.com',
                                        dob: '2003-01-01',
                                        uin: '123456789',
                                        phone_number: '1234567890',
                                        notes: 'disability\ntesting\ninClass\nhousing\nsideEffect\naccommodations\npastAcc',
                                        has_documentation: true
                                      }
                                    })
                                  })
                                  .mockResolvedValueOnce({
                                    ok: true,
                                    json: jest.fn().mockResolvedValue({ message: 'Request deleted successfully' })
                                  });
                              
                                render(<UserAccommodations name="Test Name" email="test@email.com" setAlertMessage={mockSetAlertMessage} setShowAlert={mockSetShowAlert}/>);
                                const cancelButton = await screen.findByTestId('cancelBtn');
                                fireEvent.click(cancelButton);
                                await waitFor(() => {
                                        expect(screen.queryByTestId('newStudentApp')).toBeInTheDocument();
                                        expect(screen.queryByTestId('existingRequest')).not.toBeInTheDocument();
                                });
                        });
                }); 
                describe('NOT correct response from /api/cancelRequest', () => {
                        test('alerts the user of failure', async () => {
                                global.fetch = jest.fn()
                                .mockResolvedValueOnce({
                                  ok: true,
                                  json: jest.fn().mockResolvedValue({
                                    exists: true, 
                                    request: {
                                      name: 'Test Name',
                                      user_email: 'test@email.com',
                                      dob: '2003-01-01',
                                      uin: '123456789',
                                      phone_number: '1234567890',
                                      notes: 'disability\ntesting\ninClass\nhousing\nsideEffect\naccommodations\npastAcc',
                                      has_documentation: true
                                    }
                                  })
                                })
                                .mockResolvedValueOnce({
                                  ok: false,
                                  status: 500,
                                  json: jest.fn().mockResolvedValue({ error: "ERROR" })
                                });

                                render(<UserAccommodations name="Test Name" email="test@email.com" setAlertMessage={mockSetAlertMessage} setShowAlert={mockSetShowAlert}/>);
                                const cancelButton = await screen.findByTestId('cancelBtn');
                                fireEvent.click(cancelButton);

                                await waitFor(() => {
                                        expect(mockSetAlertMessage).toHaveBeenCalledWith(
                                                "Request cancellation failed. Please try again."
                                        );
                                        expect(mockSetShowAlert).toHaveBeenCalledWith(true);
                                });
                        });
                }); 
        }); 
});