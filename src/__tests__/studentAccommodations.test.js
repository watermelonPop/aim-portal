/**
 * @jest-environment jsdom
 */
 import React from 'react';
 import { render, screen, fireEvent, waitFor } from '@testing-library/react';
 import StudentAccommodations from '../student/studentAccommodations.js';
 import '@testing-library/jest-dom';
 
 // Create a dummy CustomFileInput component since it's imported in the file.
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
 
 describe('StudentAccommodations Component', () => {
   let originalFetch;
   let alertMock;
   let confirmMock;
 
   beforeEach(() => {
     originalFetch = global.fetch;
     alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});
     confirmMock = jest.spyOn(window, 'confirm').mockImplementation(() => true);
   });
 
   afterEach(() => {
     global.fetch = originalFetch;
     jest.clearAllMocks();
   });
 
   // Helper to setup fetch mock for getStudentData
   const setupGetStudentDataFetch = (data = dummyStudentData, ok = true) => {
     global.fetch = jest.fn((url) => {
       if (url.includes('/api/getStudentData')) {
         return Promise.resolve({
           ok,
           json: () => Promise.resolve(data)
         });
       }
       // Default response for other endpoints.
       return Promise.resolve({ ok });
     });
   };
 
   test('renders header and buttons', async () => {
     setupGetStudentDataFetch();
     render(<StudentAccommodations userInfo={dummyUserInfo} />);
     // Use the heading role with level 2 to uniquely identify the header.
     expect(screen.getByRole('heading', { level: 2, name: /Accommodations/i })).toBeInTheDocument();
     // Check for buttons using their aria-labels.
     expect(screen.getByRole('button', { name: /Apply for new accommodation/i })).toBeInTheDocument();
     expect(screen.getByRole('button', { name: /Apply for assistive technology/i })).toBeInTheDocument();
     await waitFor(() => expect(global.fetch).toHaveBeenCalled());
   });
 
   test('displays loading state then student data', async () => {
     setupGetStudentDataFetch();
     render(<StudentAccommodations userInfo={dummyUserInfo} />);
     expect(screen.getByText(/Loading.../i)).toBeInTheDocument();
     // Wait until the delete button (with its aria-label) is present.
     await waitFor(() => 
       expect(screen.getByRole('button', { name: /Delete accommodation request for Audio\/Visual Aids/i })).toBeInTheDocument()
     );
   });
 
   test('displays error when fetching student data fails', async () => {
     global.fetch = jest.fn(() => Promise.reject('Fetch error'));
     render(<StudentAccommodations userInfo={dummyUserInfo} />);
     await waitFor(() => {
       expect(screen.getByText(/Failed to fetch student data/i)).toBeInTheDocument();
     });
   });
 
   test('opens and cancels the Apply for Accommodation modal', async () => {
     setupGetStudentDataFetch();
     render(<StudentAccommodations userInfo={dummyUserInfo} />);
     // Click the button using its aria-label.
     fireEvent.click(screen.getByRole('button', { name: /Apply for new accommodation/i }));
     // Wait for the modal dialog by querying for its role and accessible name.
     const modal = await waitFor(() =>
       screen.getByRole('dialog', { name: /Apply for Accommodation/i })
     );
     expect(modal).toBeInTheDocument();
     // Click the cancel button inside the modal.
     fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));
     await waitFor(() =>
       expect(screen.queryByRole('dialog', { name: /Apply for Accommodation/i })).not.toBeInTheDocument()
     );
   });
 
   test('shows alert if submitting accommodation form without required fields', async () => {
     setupGetStudentDataFetch();
     render(<StudentAccommodations userInfo={dummyUserInfo} />);
     fireEvent.click(screen.getByRole('button', { name: /Apply for new accommodation/i }));
     // Wait for modal to appear.
     const modal = await waitFor(() =>
       screen.getByRole('dialog', { name: /Apply for Accommodation/i })
     );
     // Locate the form via the label and then closest form element.
     const form = modal.querySelector('form') || screen.getByText(/Select Accommodation:/i).closest('form');
     fireEvent.submit(form);
     await waitFor(() =>
       expect(alertMock).toHaveBeenCalledWith(expect.stringContaining("Please select an accommodation option."))
     );
   });
 
   test('submits accommodation request successfully and shows success modal', async () => {
     // Setup fetch for initial student data, apply request, file upload, and refresh call.
     global.fetch = jest.fn((url) => {
       if (url.includes('/api/getStudentData')) {
         return Promise.resolve({
           ok: true,
           json: () => Promise.resolve(dummyStudentData)
         });
       }
       if (url.includes('/api/applyForAccommodation')) {
         return Promise.resolve({ ok: true });
       }
       if (url.includes('/api/uploadForm')) {
         return Promise.resolve({ ok: true });
       }
       return Promise.resolve({ ok: true });
     });
 
     render(<StudentAccommodations userInfo={dummyUserInfo} />);
     fireEvent.click(screen.getByRole('button', { name: /Apply for new accommodation/i }));
     // Wait for modal to appear.
     const modal = await waitFor(() =>
       screen.getByRole('dialog', { name: /Apply for Accommodation/i })
     );
     // Select an accommodation option.
     fireEvent.change(screen.getByLabelText(/Select Accommodation:/i), { target: { value: 'Modified Assignments' } });
     // Wait until the course checkbox label is available.
     const courseLabel = await waitFor(() => screen.getByText(/Math 101/i));
     // Since the label is associated with an input, get its corresponding checkbox.
     const checkboxId = courseLabel.getAttribute('for');
     const checkbox = document.getElementById(checkboxId);
     fireEvent.click(checkbox);
     // Simulate file upload.
     const file = new File(['dummy content'], 'test.pdf', { type: 'application/pdf' });
     const fileInput = screen.getByTestId('custom-file-input');
     fireEvent.change(fileInput, { target: { files: [file] } });
     // Submit the form.
     const form = modal.querySelector('form') || screen.getByText(/Select Accommodation:/i).closest('form');
     fireEvent.submit(form);
     await waitFor(() =>
       expect(screen.getByText(/Request Submitted/i)).toBeInTheDocument()
     );
   });
 
   test('handles delete accommodation', async () => {
     setupGetStudentDataFetch();
     render(<StudentAccommodations userInfo={dummyUserInfo} />);
     await waitFor(() =>
       expect(screen.getByRole('button', { name: /Delete accommodation request for Audio\/Visual Aids/i })).toBeInTheDocument()
     );
     // Simulate clicking delete.
     fireEvent.click(screen.getByRole('button', { name: /Delete accommodation request for Audio\/Visual Aids/i }));
     await waitFor(() => {
       expect(global.fetch).toHaveBeenCalledWith(
         expect.stringContaining('/api/deleteAccommodation?accId=acc1'),
         expect.objectContaining({ method: 'DELETE' })
       );
     });
   });
 
   test('opens and cancels the Assistive Technology modal', async () => {
     setupGetStudentDataFetch();
     render(<StudentAccommodations userInfo={dummyUserInfo} />);
     fireEvent.click(screen.getByRole('button', { name: /Apply for assistive technology/i }));
     // Wait for the assistive tech modal dialog.
     const assistiveModal = await waitFor(() =>
       screen.getByRole('dialog', { name: /Apply for Assistive Technology/i })
     );
     expect(assistiveModal).toBeInTheDocument();
     // Click the cancel button inside the modal.
     const cancelButtons = screen.getAllByRole('button', { name: /Cancel/i });
     fireEvent.click(cancelButtons[0]);
     await waitFor(() =>
       expect(screen.queryByRole('dialog', { name: /Apply for Assistive Technology/i })).not.toBeInTheDocument()
     );
   });
 
   test('shows alert if submitting assistive technology form without selection', async () => {
     setupGetStudentDataFetch();
     render(<StudentAccommodations userInfo={dummyUserInfo} />);
     fireEvent.click(screen.getByRole('button', { name: /Apply for assistive technology/i }));
     // Wait for modal dialog.
     const assistiveModal = await waitFor(() =>
       screen.getByRole('dialog', { name: /Apply for Assistive Technology/i })
     );
     const form = assistiveModal.querySelector('form') || screen.getByText(/Select Assistive Technology:/i).closest('form');
     fireEvent.submit(form);
     await waitFor(() =>
       expect(alertMock).toHaveBeenCalledWith(expect.stringContaining("Please select an assistive technology option."))
     );
   });
 
   test('submits assistive technology request successfully and shows success modal', async () => {
     global.fetch = jest.fn((url) => {
       if (url.includes('/api/getStudentData')) {
         return Promise.resolve({
           ok: true,
           json: () => Promise.resolve(dummyStudentData)
         });
       }
       if (url.includes('/api/applyForAssistiveTech')) {
         return Promise.resolve({ ok: true });
       }
       return Promise.resolve({ ok: true });
     });
 
     render(<StudentAccommodations userInfo={dummyUserInfo} />);
     fireEvent.click(screen.getByRole('button', { name: /Apply for assistive technology/i }));
     const assistiveModal = await waitFor(() =>
       screen.getByRole('dialog', { name: /Apply for Assistive Technology/i })
     );
     // Select an assistive technology option.
     fireEvent.change(screen.getByLabelText(/Select Assistive Technology:/i), { target: { value: 'Screen Reader' } });
     const form = assistiveModal.querySelector('form') || screen.getByText(/Select Assistive Technology:/i).closest('form');
     fireEvent.submit(form);
     await waitFor(() =>
       expect(screen.getByText(/Request Submitted/i)).toBeInTheDocument()
     );
   });
 
   test('renders correct message when no accommodations or assistive technologies found', async () => {
     const emptyData = { accommodations: [], assistive_technologies: [], courses: [] };
     setupGetStudentDataFetch(emptyData);
     render(<StudentAccommodations userInfo={dummyUserInfo} />);
     await waitFor(() => expect(screen.getByText(/No accommodations found/i)).toBeInTheDocument());
     expect(screen.getByText(/No assistive technologies found/i)).toBeInTheDocument();
   });
 });
 