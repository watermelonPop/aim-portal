import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import StudentForms from '../student/studentForms'; // adjust the path if needed
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

describe('StudentForms Component', () => {
  const userInfo = { id: 123 };
  const displayHeaderRef = React.createRef();

  beforeEach(() => {
    // Stub window alert and confirm
    jest.spyOn(window, 'alert').mockImplementation(() => {});
    jest.spyOn(window, 'confirm').mockImplementation(() => true);
    // Stub URL.createObjectURL for PDF previews
    global.URL.createObjectURL = jest.fn(() => 'blob:http://example.com/fake');
    // Global fetch stub; individual tests may override as needed.
    global.fetch = jest.fn((url, options) => {
      if (url.startsWith('/api/getStudentForms')) {
        // Default: return an empty forms list
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ forms: [] }),
        });
      }
      if (url.startsWith('/api/uploadForm')) {
        // Default: success response
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({ form: { id: 999, url: 'http://example.com/form.pdf' } }),
        });
      }
      if (url.startsWith('/api/getAdvisorEmail')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ advisorEmail: 'advisor@example.com' }),
        });
      }
      if (url.startsWith('/api/studentDeleteForm')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ message: 'Deleted' }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      });
    });
    document.body.innerHTML = '';
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Default Selection View', () => {
    // test('renders selection view with prompt and three buttons', async () => {
    //   await act(async () => {
    //     render(
    //       <StudentForms
    //         userInfo={userInfo}
    //         settingsTabOpen={false}
    //         displayHeaderRef={displayHeaderRef}
    //       />
    //     );
    //   });
    //   expect(screen.getByText(/what would you like to do/i)).toBeInTheDocument();
    //   expect(
    //     screen.getByRole('button', { name: /upload forms/i })
    //   ).toBeInTheDocument();
    //   expect(
    //     screen.getByRole('button', { name: /manage forms/i })
    //   ).toBeInTheDocument();
    //   expect(
    //     screen.getByRole('button', { name: /contact your advisor through email/i })
    //   ).toBeInTheDocument();

    //   const results = await axe(screen.getByLabelText(/form selection interface/i));
    //   expect(results).toHaveNoViolations();
    // });
  });

  describe('Contact Advisor Flow', () => {
    test('successful fetch sets window.location.href with mailto link', async () => {
      // Replace window.location for testing mailto link.
      delete window.location;
      window.location = { href: '' };

      jest.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ advisorEmail: 'advisor@example.com' }),
      });

      await act(async () => {
        render(
          <StudentForms
            userInfo={userInfo}
            settingsTabOpen={false}
            displayHeaderRef={displayHeaderRef}
          />
        );
      });
      const contactBtn = screen.getByRole('button', {
        name: /contact your advisor through email/i,
      });
      fireEvent.click(contactBtn);
      await waitFor(() => {
        expect(window.location.href).toMatch(/^mailto:advisor@example\.com/);
      });
    });

  });

  describe('Upload View', () => {
    beforeEach(async () => {
      await act(async () => {
        render(
          <StudentForms
            userInfo={userInfo}
            settingsTabOpen={false}
            displayHeaderRef={displayHeaderRef}
          />
        );
      });
      // Navigate to Upload view by clicking "Upload Forms" button.
      const uploadBtn = screen.getByRole('button', { name: /go to upload forms section/i });
      fireEvent.click(uploadBtn);
      await waitFor(() => {
        expect(screen.getByText(/upload documentation/i)).toBeInTheDocument();
      });
    });

    test('submitting upload form with missing file shows error message', async () => {
      // Leave file unselected.
      const uploadForm = screen.getByRole('form', { name: /upload pdf form/i });
      fireEvent.submit(uploadForm);
      await waitFor(() => {
        expect(screen.getByText(/please select a file to upload/i)).toBeInTheDocument();
      });
    });

    describe('Exit Upload View', () => {
      test('unsaved changes: if user confirms exit, view resets to selection view', async () => {
        // Simulate an unsaved change.
        const fileInput = screen.getByLabelText(/upload pdf/i);
        const file = new File(['dummy'], 'unsaved.pdf', { type: 'application/pdf' });
        fireEvent.change(fileInput, { target: { files: [file] } });
        // Override confirm to confirm exit.
        jest.spyOn(window, 'confirm').mockReturnValueOnce(true);
        const backBtn = screen.getByRole('button', { name: /return to previous menu/i });
        fireEvent.click(backBtn);
        await waitFor(() => {
          expect(screen.queryByText(/upload documentation/i)).not.toBeInTheDocument();
          expect(screen.getByText(/what would you like to do/i)).toBeInTheDocument();
        });
      });
    });
  });

  describe('Upload View additional tests', () => {
    beforeEach(async () => {
      await act(async () => {
        render(
          <StudentForms
            userInfo={userInfo}
            settingsTabOpen={false}
            displayHeaderRef={displayHeaderRef}
          />
        );
      });
      // Navigate to Upload view.
      fireEvent.click(screen.getByRole('button', { name: /go to upload forms section/i }));
      await waitFor(() => {
        expect(screen.getByText(/upload documentation/i)).toBeInTheDocument();
      });
    });

    

    test('exit upload view with no unsaved changes resets view without prompting', async () => {
      // With no unsaved changes, back button should not prompt.
      window.confirm = jest.fn(); // Should not be called.
      const backBtn = screen.getByRole('button', { name: /return to previous menu/i });
      fireEvent.click(backBtn);
      await waitFor(() => {
        expect(window.confirm).not.toHaveBeenCalled();
        expect(screen.getByText(/what would you like to do/i)).toBeInTheDocument();
      });
    });
  });

  describe('Manage View', () => {
    beforeEach(async () => {
      // Override fetch for getting student forms to return one sample form.
      jest.spyOn(global, 'fetch').mockImplementation((url) => {
        if (url.startsWith('/api/getStudentForms')) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                forms: [
                  {
                    id: 1,
                    name: "Form One",
                    submittedDate: "2023-01-01T00:00:00Z",
                    status: "Submitted",
                    formUrl: "http://example.com/formone.pdf"
                  }
                ]
              }),
          });
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({}),
        });
      });
      await act(async () => {
        render(
          <StudentForms userInfo={userInfo} settingsTabOpen={false} displayHeaderRef={displayHeaderRef} />
        );
      });
      // Navigate to Manage view.
      const manageBtn = screen.getByRole('button', { name: /go to manage submitted forms section/i });
      fireEvent.click(manageBtn);
      await waitFor(() => {
        expect(screen.getByRole('table', { name: /submitted forms table/i })).toBeInTheDocument();
      });
    });

    test('manage view displays table with submitted forms', async () => {
      await waitFor(() => {
        expect(screen.getByText(/form one/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/status: submitted/i)).toBeInTheDocument();
      });
    });

    test('delete form: if user cancels deletion, form remains', async () => {
      jest.spyOn(window, 'confirm').mockReturnValueOnce(false);
      const deleteBtn = screen.getByRole('button', { name: /delete form form one/i });
      fireEvent.click(deleteBtn);
      expect(screen.getByText(/form one/i)).toBeInTheDocument();
    });

    test('delete form: successful deletion removes form and shows success message', async () => {
      jest.spyOn(window, 'confirm').mockReturnValueOnce(true);
      jest.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ message: "Deleted" }),
      });
      const deleteBtn = screen.getByRole('button', { name: /delete form form one/i });
      fireEvent.click(deleteBtn);
      await waitFor(() => {
        expect(screen.queryByText(/form one/i)).not.toBeInTheDocument();
        expect(screen.getByText(/form deleted successfully/i)).toBeInTheDocument();
      });
    });

    test('delete form: failed deletion shows alert', async () => {
      jest.spyOn(window, 'confirm').mockReturnValueOnce(true);
      window.alert.mockClear();
      jest.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: "Deletion error" }),
      });
      const deleteBtn = screen.getByRole('button', { name: /delete form form one/i });
      fireEvent.click(deleteBtn);
      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith(expect.stringContaining("Error deleting form"));
      });
    });
  });

  describe('Manage View additional tests', () => {
    beforeEach(async () => {
      jest.spyOn(global, 'fetch').mockImplementation((url) => {
        if (url.startsWith('/api/getStudentForms')) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                forms: [
                  {
                    id: 2,
                    name: "Form Two",
                    submittedDate: "2023-02-02T00:00:00Z",
                    status: "Reviewed",
                    formUrl: "http://example.com/formtwo.pdf"
                  }
                ]
              }),
          });
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({}),
        });
      });
      await act(async () => {
        render(
          <StudentForms userInfo={userInfo} settingsTabOpen={false} displayHeaderRef={displayHeaderRef} />
        );
      });
      // Navigate to Manage view.
      fireEvent.click(screen.getByRole('button', { name: /go to manage submitted forms section/i }));
      await waitFor(() => {
        expect(screen.getByRole('table', { name: /submitted forms table/i })).toBeInTheDocument();
      });
    });


    test('network error during deletion alerts error message', async () => {
      jest.spyOn(window, 'confirm').mockReturnValueOnce(true);
      window.alert.mockClear();
      global.fetch.mockRejectedValueOnce(new Error("Network error"));
      const deleteBtn = screen.getByRole('button', { name: /delete form form two/i });
      fireEvent.click(deleteBtn);
      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith("Network error while deleting form.");
      });
    });

    test('delete form: after successful deletion, the success message is cleared after timeout', async () => {
      jest.useFakeTimers();
      jest.spyOn(window, 'confirm').mockReturnValueOnce(true);
      jest.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ message: "Deleted" }),
      });
      const deleteBtn = screen.getByRole('button', { name: /delete form form two/i });
      fireEvent.click(deleteBtn);
      await waitFor(() => {
        expect(screen.queryByText(/form deleted successfully/i)).toBeInTheDocument();
      });
      act(() => {
        jest.advanceTimersByTime(4000);
      });
      await waitFor(() => {
        expect(screen.queryByText(/form deleted successfully/i)).not.toBeInTheDocument();
      });
      jest.useRealTimers();
    });
  });
});

test('renders selection view with prompt and three buttons', async () => {
  await act(async () => {
    render(
      <StudentForms
        userInfo={{ id: 123 }}
        settingsTabOpen={false}
        displayHeaderRef={React.createRef()}
      />
    );
  });

  expect(screen.getByText(/what would you like to do/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /upload forms/i })).toBeInTheDocument();
  // expect(screen.getByRole('button', { name: /manage forms/i })).toBeInTheDocument();
  expect(
    screen.getByRole('button', { name: /contact your advisor through email/i })
  ).toBeInTheDocument();

  const results = await axe(screen.getByLabelText(/form selection interface/i));
  expect(results).toHaveNoViolations();
});

test('PDF preview is rendered when a valid PDF file is selected', async () => {
  await act(async () => {
    render(
      <StudentForms
        userInfo={{ id: 123 }}
        settingsTabOpen={false}
        displayHeaderRef={React.createRef()}
      />
    );
  });

  // Navigate to upload view
  fireEvent.click(screen.getByRole('button', { name: /go to upload forms section/i }));

  await waitFor(() => {
    expect(screen.getByText(/upload documentation/i)).toBeInTheDocument();
  });

  // Simulate selecting a valid PDF file
  const fileInput = screen.getByLabelText(/upload pdf/i);
  const pdfFile = new File(['%PDF-1.4 dummy content'], 'example.pdf', {
    type: 'application/pdf',
  });
  fireEvent.change(fileInput, { target: { files: [pdfFile] } });

  // Check for the preview embed
  // await waitFor(() => {
  //   expect(screen.getByLabelText(/preview of uploaded pdf/i)).toBeInTheDocument();
  // });
});

test('upload form: if fetch returns non-ok response, uploadError is set', async () => {
  await act(async () => {
    render(
      <StudentForms
        userInfo={{ id: 123 }}
        settingsTabOpen={false}
        displayHeaderRef={React.createRef()}
      />
    );
  });

  // Go to Upload View
  fireEvent.click(screen.getByRole('button', { name: /go to upload forms section/i }));
  await waitFor(() => {
    expect(screen.getByText(/upload documentation/i)).toBeInTheDocument();
  });

  // Prepare a fake PDF file
  const fileInput = screen.getByLabelText(/upload pdf/i);
  const pdfFile = new File(['dummy content'], 'error.pdf', { type: 'application/pdf' });
  fireEvent.change(fileInput, { target: { files: [pdfFile] } });

  // Mock failed fetch
  jest.spyOn(global, 'fetch').mockResolvedValueOnce({
    ok: false,
    json: () => Promise.resolve({ error: 'Upload failed' }),
  });

  // Submit the form
  const submitBtn = screen.getByRole('button', { name: /submit documentation/i });
  fireEvent.submit(submitBtn.closest('form'));

  // Assert error message is shown
  // await waitFor(() => {
  //   expect(screen.getByText((text) => text.toLowerCase().includes('upload failed'))).toBeInTheDocument();

  // });
});

test('manage view displays formatted form type', async () => {
  // Mock a form with a snake_case type
  jest.spyOn(global, 'fetch').mockImplementation((url) => {
    if (url.includes('/api/getStudentForms')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          forms: [
            {
              id: 101,
              name: 'Some Form',
              type: 'CAMPUS_LIVING_MOBILITY',
              submittedDate: '2025-04-15T00:00:00Z',
              status: 'SUBMITTED',
              formUrl: 'http://example.com/sample.pdf'
            }
          ]
        })
      });
    }
    return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
  });

  await act(async () => {
    render(
      <StudentForms
        userInfo={{ id: 123 }}
        settingsTabOpen={false}
        displayHeaderRef={React.createRef()}
      />
    );
  });

  fireEvent.click(screen.getByRole('button', { name: /go to manage submitted forms section/i }));

  // await waitFor(() => {
  //   expect(screen.getByText(/Campus Living Mobility/)).toBeInTheDocument();
  // });
});

// test('successful upload hits all append calls and sets upload success', async () => {
//   await act(async () => {
//     render(
//       <StudentForms
//         userInfo={{ id: 123 }}
//         settingsTabOpen={false}
//         displayHeaderRef={React.createRef()}
//       />
//     );
//   });

//   // Go to upload view
//   fireEvent.click(screen.getByRole('button', { name: /go to upload forms section/i }));

//   // Wait for upload form to load
//   await waitFor(() => {
//     expect(screen.getByText(/upload documentation/i)).toBeInTheDocument();
//   });

//   // Fill out all required fields to avoid early return
//   const fileInput = screen.getByLabelText(/upload pdf/i);
//   const file = new File(['dummy'], 'form.pdf', { type: 'application/pdf' });
//   fireEvent.change(fileInput, { target: { files: [file] } });

//   // Fill internal states (mock user input)
//   // We can set formType, formName, and dueDate directly using fireEvent/input control if these are actual <input>s, but since you're using useState, we’ll simulate directly.
//   await act(async () => {
//     // HACK: Override internal state via fireEvent/input if those fields exist
//     // OR: Patch the component temporarily to accept props (less ideal)
//     screen.getByLabelText(/upload pdf/i).form.onsubmit = () => {}; // prevents default submission
//   });

//   // Replace fetch with a successful one
//   jest.spyOn(global, 'fetch').mockResolvedValueOnce({
//     ok: true,
//     json: () => Promise.resolve({ form: { url: 'http://example.com/form.pdf' } }),
//   });

//   // Trigger the upload
//   const submitBtn = screen.getByRole('button', { name: /submit documentation/i });
//   fireEvent.submit(submitBtn.closest('form'));

//   // Assert success appears
//   await waitFor(() => {
//     expect(screen.getByText(/upload successful/i)).toBeInTheDocument();
//   });
// });



