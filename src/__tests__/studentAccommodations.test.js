/**
 * @jest-environment jsdom
 */
 import React from 'react';
 import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
 import StudentAccommodations from '../student/studentAccommodations';
 import '@testing-library/jest-dom';
 import { axe, toHaveNoViolations } from 'jest-axe';
 
 expect.extend(toHaveNoViolations);
 
 // Mock the file input component.
 jest.mock('../student/CustomFileInput', () => (props) => (
   <input
     type="file"
     data-testid="custom-file-input"
     onChange={(e) => props.onFileChange(e.target.files[0])}
   />
 ));
 
 const dummyUserInfo = { id: '1', role: 'STUDENT' };
 const dummyStudentData = {
   accommodations: [
     {
       id: 'acc1',
       type: 'Audio/Visual Aids',
       status: 'pending',
       date_requested: new Date().toISOString(),
       notes: 'Test notes',
       advisor: { account: { name: 'Advisor One' } }
     }
   ],
   assistive_technologies: [
     {
       type: 'Screen Reader',
       available: true,
       advisor: { account: { name: 'Advisor Two' } }
     }
   ],
   courses: [
     { id: 101, name: 'Math 101' },
     { id: 102, name: 'History 101' }
   ]
 };
 
 describe('StudentAccommodations Component - Extended Coverage Suite', () => {
   let originalFetch;
   let alertMock;
   let confirmMock;
 
   beforeEach(() => {
     originalFetch = global.fetch;
     alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});
     // Default confirm returns true.
     confirmMock = jest.spyOn(window, 'confirm').mockImplementation(() => true);
   });
 
   afterEach(() => {
     global.fetch = originalFetch;
     jest.clearAllMocks();
     jest.useRealTimers();
   });
 
   // Helper: setup fetch mock for various endpoints.
   const setupFetch = (data = dummyStudentData, ok = true) => {
     global.fetch = jest.fn((url, options) => {
       if (url.includes('/api/getStudentData')) {
         return Promise.resolve({ ok, json: () => Promise.resolve(data) });
       }
       if (url.includes('/api/applyForAccommodation')) {
         return Promise.resolve({ ok, json: () => Promise.resolve({}) });
       }
       if (url.includes('/api/uploadForm')) {
         return Promise.resolve({ ok });
       }
       if (url.includes('/api/applyForAssistiveTech')) {
         return Promise.resolve({ ok, json: () => Promise.resolve({}) });
       }
       if (url.includes('/api/deleteAccommodation')) {
         return Promise.resolve({ ok });
       }
       return Promise.resolve({ ok });
     });
   };
 
   test('passes accessibility check', async () => {
     setupFetch();
     let container;
     await act(async () => {
       const rendered = render(<StudentAccommodations userInfo={dummyUserInfo} />);
       container = rendered.container;
     });
     const results = await axe(container);
     expect(results).toHaveNoViolations();
   });
 
   test('renders headings and buttons correctly', async () => {
     setupFetch();
     render(<StudentAccommodations userInfo={dummyUserInfo} />);
     expect(await screen.findByRole('heading', { name: /Accommodations/i })).toBeInTheDocument();
     expect(screen.getByRole('button', { name: /Apply for new accommodation/i })).toBeInTheDocument();
     expect(screen.getByRole('button', { name: /Apply for assistive technology/i })).toBeInTheDocument();
   });
 
   test('shows loading spinner then displays student data', async () => {
     setupFetch();
     render(<StudentAccommodations userInfo={dummyUserInfo} />);
     expect(screen.getByText(/Loading/i)).toBeInTheDocument();
     expect(await screen.findByText(/Audio\/Visual Aids/i)).toBeInTheDocument();
   });
 
   test('handles fetch failure and displays error message', async () => {
     global.fetch = jest.fn(() => Promise.reject('Fetch error'));
     render(<StudentAccommodations userInfo={dummyUserInfo} />);
     expect(await screen.findByText(/Failed to fetch student data/i)).toBeInTheDocument();
   });
 
   test('does not fetch data if userInfo is missing or role is not STUDENT', async () => {
     // Pass userInfo with role other than STUDENT
     const nonStudentUser = { id: '2', role: 'ADMIN' };
     render(<StudentAccommodations userInfo={nonStudentUser} />);
     // Since useEffect will not run fetch, it should not show a loading spinner.
     expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument();
   });
 
   test('opens and closes general accommodation modal via Cancel and overlay click', async () => {
     setupFetch();
     render(<StudentAccommodations userInfo={dummyUserInfo} />);
     // Open modal.
     fireEvent.click(await screen.findByRole('button', { name: /Apply for new accommodation/i }));
     let modal = await screen.findByRole('dialog');
     expect(modal).toBeInTheDocument();
     // Close via Cancel button.
     fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));
     await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
     // Reopen modal.
     fireEvent.click(await screen.findByRole('button', { name: /Apply for new accommodation/i }));
     modal = await screen.findByRole('dialog');
     // Close via clicking on overlay (element with role="presentation").
     const overlay = screen.getByRole('presentation');
     fireEvent.click(overlay);
     await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
   });
 
   test('alerts if no accommodation option or classes are selected', async () => {
     setupFetch();
     render(<StudentAccommodations userInfo={dummyUserInfo} />);
     fireEvent.click(await screen.findByRole('button', { name: /Apply for new accommodation/i }));
     const modal = await screen.findByRole('dialog');
     fireEvent.submit(modal.querySelector('form'));
     expect(alertMock).toHaveBeenCalledWith(expect.stringContaining('Please select an accommodation option'));
   });
 
   test('alerts if no classes are selected when accommodation is chosen', async () => {
     setupFetch();
     render(<StudentAccommodations userInfo={dummyUserInfo} />);
     // Open modal and set an accommodation option.
     fireEvent.click(await screen.findByRole('button', { name: /Apply for new accommodation/i }));
     const modal = await screen.findByRole('dialog');
     fireEvent.change(screen.getByLabelText(/Select Accommodation:/i), { target: { value: 'Audio/Visual Aids' } });
     // Do not select any courses.
     fireEvent.submit(modal.querySelector('form'));
     expect(alertMock).toHaveBeenCalledWith(expect.stringContaining("Please select at least one class for this accommodation."));
   });
 
   test('opens and closes assistive technology modal via Cancel and overlay click', async () => {
     setupFetch();
     render(<StudentAccommodations userInfo={dummyUserInfo} />);
     fireEvent.click(await screen.findByRole('button', { name: /Apply for assistive technology/i }));
     let modal = await screen.findByRole('dialog');
     expect(modal).toBeInTheDocument();
     fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));
     expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
     // Reopen and close via overlay.
     fireEvent.click(await screen.findByRole('button', { name: /Apply for assistive technology/i }));
     modal = await screen.findByRole('dialog');
     const overlay = screen.getByRole('presentation');
     fireEvent.click(overlay);
     await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
   });
 
   test('alerts if no assistive technology option is selected', async () => {
     setupFetch();
     render(<StudentAccommodations userInfo={dummyUserInfo} />);
     fireEvent.click(await screen.findByRole('button', { name: /Apply for assistive technology/i }));
     const modal = await screen.findByRole('dialog');
     fireEvent.submit(modal.querySelector('form'));
     expect(alertMock).toHaveBeenCalledWith(expect.stringContaining('Please select an assistive technology option'));
   });
 
   test('deletes an accommodation when confirmed', async () => {
     setupFetch();
     render(<StudentAccommodations userInfo={dummyUserInfo} />);
     const deleteButton = await screen.findByRole('button', {
       name: /Delete accommodation request for Audio\/Visual Aids/i
     });
     fireEvent.click(deleteButton);
     await waitFor(() => {
       expect(global.fetch).toHaveBeenCalledWith(
         expect.stringContaining('/api/deleteAccommodation'),
         expect.objectContaining({ method: 'DELETE' })
       );
     });
   });
 
   test('shows deletion error alert if deletion fetch returns not ok', async () => {
     // Simulate deletion fetch returning not ok.
     global.fetch = jest.fn((url, options) => {
       if (url.includes('/api/getStudentData')) {
         return Promise.resolve({ ok: true, json: () => Promise.resolve(dummyStudentData) });
       }
       if (url.includes('/api/deleteAccommodation')) {
         return Promise.resolve({ ok: false });
       }
       return Promise.resolve({ ok: true });
     });
     render(<StudentAccommodations userInfo={dummyUserInfo} />);
     const deleteButton = await screen.findByRole('button', {
       name: /Delete accommodation request for Audio\/Visual Aids/i
     });
     fireEvent.click(deleteButton);
     await waitFor(() => {
       expect(alertMock).toHaveBeenCalledWith(expect.stringContaining("Failed to delete accommodation request."));
     });
   });
 
   test('does not delete accommodation if deletion is cancelled', async () => {
     setupFetch();
     confirmMock.mockImplementationOnce(() => false);
     render(<StudentAccommodations userInfo={dummyUserInfo} />);
     const deleteButton = await screen.findByRole('button', {
       name: /Delete accommodation request for Audio\/Visual Aids/i
     });
     fireEvent.click(deleteButton);
     expect(global.fetch).not.toHaveBeenCalledWith(
       expect.stringContaining('/api/deleteAccommodation'),
       expect.any(Object)
     );
   });
 
   test('shows Back to Top link with correct href', async () => {
     setupFetch();
     render(<StudentAccommodations userInfo={dummyUserInfo} />);
     const link = await screen.findByRole('link', { name: /Back to Top/i });
     expect(link).toBeInTheDocument();
     expect(link.getAttribute('href')).toBe('#applyAccommodationButton');
   });
 
   test('displays message when no courses exist in modal', async () => {
     const noCourseData = { ...dummyStudentData, courses: [] };
     setupFetch(noCourseData);
     render(<StudentAccommodations userInfo={dummyUserInfo} />);
     fireEvent.click(await screen.findByRole('button', { name: /Apply for new accommodation/i }));
     expect(await screen.findByText(/You are not enrolled in any courses/i)).toBeInTheDocument();
   });
 
   test('submits general accommodation without file upload', async () => {
     // Test submission path where no file is uploaded.
     setupFetch();
     render(<StudentAccommodations userInfo={dummyUserInfo} />);
     fireEvent.click(await screen.findByRole('button', { name: /Apply for new accommodation/i }));
     const modal = await screen.findByRole('dialog');
     fireEvent.change(screen.getByLabelText(/Select Accommodation:/i), { target: { value: 'Audio/Visual Aids' } });
     const firstCourseCheckbox = screen.getByLabelText(dummyStudentData.courses[0].name);
     fireEvent.click(firstCourseCheckbox);
     // Do not trigger file upload.
     fireEvent.submit(modal.querySelector('form'));
     const successModal = await screen.findByRole('dialog', { name: /Request Submitted/i });
     expect(successModal).toBeInTheDocument();
   });
 
   test('submits general accommodation with file upload success', async () => {
     setupFetch();
     render(<StudentAccommodations userInfo={dummyUserInfo} />);
     fireEvent.click(await screen.findByRole('button', { name: /Apply for new accommodation/i }));
     const modal = await screen.findByRole('dialog');
     fireEvent.change(screen.getByLabelText(/Select Accommodation:/i), { target: { value: 'Audio/Visual Aids' } });
     const firstCourseCheckbox = screen.getByLabelText(dummyStudentData.courses[0].name);
     fireEvent.click(firstCourseCheckbox);
     const fileInput = screen.getByTestId('custom-file-input');
     const file = new File(['dummy content'], 'testfile.txt', { type: 'text/plain' });
     fireEvent.change(fileInput, { target: { files: [file] } });
     fireEvent.submit(modal.querySelector('form'));
     const successModal = await screen.findByRole('dialog', { name: /Request Submitted/i });
     expect(successModal).toBeInTheDocument();
   });
 
   test('submits general accommodation but file upload fails', async () => {
     global.fetch = jest.fn((url, options) => {
       if (url.includes('/api/getStudentData')) {
         return Promise.resolve({ ok: true, json: () => Promise.resolve(dummyStudentData) });
       }
       if (url.includes('/api/applyForAccommodation')) {
         return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
       }
       if (url.includes('/api/uploadForm')) {
         return Promise.resolve({ ok: false });
       }
       return Promise.resolve({ ok: true });
     });
     render(<StudentAccommodations userInfo={dummyUserInfo} />);
     fireEvent.click(await screen.findByRole('button', { name: /Apply for new accommodation/i }));
     const modal = await screen.findByRole('dialog');
     fireEvent.change(screen.getByLabelText(/Select Accommodation:/i), { target: { value: 'Audio/Visual Aids' } });
     const firstCourseCheckbox = screen.getByLabelText(dummyStudentData.courses[0].name);
     fireEvent.click(firstCourseCheckbox);
     const fileInput = screen.getByTestId('custom-file-input');
     const file = new File(['dummy content'], 'testfile.txt', { type: 'text/plain' });
     fireEvent.change(fileInput, { target: { files: [file] } });
     fireEvent.submit(modal.querySelector('form'));
     await waitFor(() => {
       expect(alertMock).toHaveBeenCalledWith(
         expect.stringContaining("Accommodation request submitted but file upload failed")
       );
     });
     const successModal = await screen.findByRole('dialog', { name: /Request Submitted/i });
     expect(successModal).toBeInTheDocument();
   });
 
   test('fails general accommodation submission if initial POST returns not ok', async () => {
     global.fetch = jest.fn((url, options) => {
       if (url.includes('/api/getStudentData')) {
         return Promise.resolve({ ok: true, json: () => Promise.resolve(dummyStudentData) });
       }
       if (url.includes('/api/applyForAccommodation')) {
         return Promise.resolve({ ok: false });
       }
       return Promise.resolve({ ok: true });
     });
     render(<StudentAccommodations userInfo={dummyUserInfo} />);
     fireEvent.click(await screen.findByRole('button', { name: /Apply for new accommodation/i }));
     const modal = await screen.findByRole('dialog');
     fireEvent.change(screen.getByLabelText(/Select Accommodation:/i), { target: { value: 'Audio/Visual Aids' } });
     const firstCourseCheckbox = screen.getByLabelText(dummyStudentData.courses[0].name);
     fireEvent.click(firstCourseCheckbox);
     fireEvent.submit(modal.querySelector('form'));
     await waitFor(() => {
       expect(alertMock).toHaveBeenCalledWith(expect.stringContaining("Failed to submit accommodation request."));
     });
   });
 
   test('fails general accommodation submission on exception thrown', async () => {
     global.fetch = jest.fn((url, options) => {
       if (url.includes('/api/getStudentData')) {
         return Promise.resolve({ ok: true, json: () => Promise.resolve(dummyStudentData) });
       }
       if (url.includes('/api/applyForAccommodation')) {
         return Promise.reject(new Error("Network error"));
       }
       return Promise.resolve({ ok: true });
     });
     render(<StudentAccommodations userInfo={dummyUserInfo} />);
     fireEvent.click(await screen.findByRole('button', { name: /Apply for new accommodation/i }));
     const modal = await screen.findByRole('dialog');
     fireEvent.change(screen.getByLabelText(/Select Accommodation:/i), { target: { value: 'Audio/Visual Aids' } });
     const firstCourseCheckbox = screen.getByLabelText(dummyStudentData.courses[0].name);
     fireEvent.click(firstCourseCheckbox);
     fireEvent.submit(modal.querySelector('form'));
     await waitFor(() => {
       expect(alertMock).toHaveBeenCalledWith(expect.stringContaining("Error submitting accommodation request."));
     });
   });
 
   test('submits assistive technology successfully', async () => {
     setupFetch();
     render(<StudentAccommodations userInfo={dummyUserInfo} />);
     fireEvent.click(await screen.findByRole('button', { name: /Apply for assistive technology/i }));
     const modal = await screen.findByRole('dialog');
     fireEvent.change(screen.getByLabelText(/Select Assistive Technology:/i), { target: { value: 'Screen Reader' } });
     fireEvent.submit(modal.querySelector('form'));
     const successModal = await screen.findByRole('dialog', { name: /Request Submitted/i });
     expect(successModal).toBeInTheDocument();
   });
 
   test('shows error alert when assistive technology submission fails', async () => {
     global.fetch = jest.fn((url, options) => {
       if (url.includes('/api/getStudentData')) {
         return Promise.resolve({ ok: true, json: () => Promise.resolve(dummyStudentData) });
       }
       if (url.includes('/api/applyForAssistiveTech')) {
         return Promise.resolve({ ok: false });
       }
       return Promise.resolve({ ok: true });
     });
     render(<StudentAccommodations userInfo={dummyUserInfo} />);
     fireEvent.click(await screen.findByRole('button', { name: /Apply for assistive technology/i }));
     const modal = await screen.findByRole('dialog');
     fireEvent.change(screen.getByLabelText(/Select Assistive Technology:/i), { target: { value: 'Screen Reader' } });
     fireEvent.submit(modal.querySelector('form'));
     await waitFor(() => {
       expect(alertMock).toHaveBeenCalledWith(expect.stringContaining("Failed to submit assistive technology request."));
     });
   });
 
   test('success modal dismisses when clicking Close button', async () => {
     setupFetch();
     render(<StudentAccommodations userInfo={dummyUserInfo} />);
     fireEvent.click(await screen.findByRole('button', { name: /Apply for assistive technology/i }));
     const modal = await screen.findByRole('dialog');
     fireEvent.change(screen.getByLabelText(/Select Assistive Technology:/i), { target: { value: 'Screen Reader' } });
     fireEvent.submit(modal.querySelector('form'));
     const successModal = await screen.findByRole('dialog', { name: /Request Submitted/i });
     expect(successModal).toBeInTheDocument();
     fireEvent.click(screen.getByRole('button', { name: /Close/i }));
     await waitFor(() => {
       expect(screen.queryByRole('dialog', { name: /Request Submitted/i })).not.toBeInTheDocument();
     });
   });
 
   test('trapFocus wraps focus when Tab and Shift+Tab keys are pressed', async () => {
     // Instead of spying on preventDefault, we verify actual focus changes.
     setupFetch();
     render(<StudentAccommodations userInfo={dummyUserInfo} />);
     fireEvent.click(await screen.findByRole('button', { name: /Apply for new accommodation/i }));
     const selectElement = screen.getByLabelText(/Select Accommodation:/i);
     const cancelButton = screen.getByRole('button', { name: /Cancel/i });
     // Simulate focus on the last focusable element.
     cancelButton.focus();
     expect(document.activeElement).toBe(cancelButton);
     fireEvent.keyDown(cancelButton, { key: 'Tab', bubbles: true });
     await waitFor(() => {
       // Expect focus to wrap to the first focusable element.
       expect(document.activeElement).toBe(selectElement);
     });
     // Now simulate Shift+Tab when the first element is focused.
     selectElement.focus();
     expect(document.activeElement).toBe(selectElement);
     fireEvent.keyDown(selectElement, { key: 'Tab', shiftKey: true, bubbles: true });
     await waitFor(() => {
       // Expect focus to wrap to the last focusable element.
       expect(document.activeElement).toBe(cancelButton);
     });
   });
 });
 