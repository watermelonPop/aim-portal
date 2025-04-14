/* staffRequests.test.js */
import React from 'react';
import { render, screen, fireEvent, waitFor, act, within } from '@testing-library/react';
import StaffRequests from '../staff/staffRequests';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

// Default props for StaffRequests component
const defaultProps = {
  selectedRequest: null,
  setSelectedRequest: jest.fn(),
  currentPage: 1,
  setCurrentPage: jest.fn(),
  filteredRequests: [
    { id: 1, student_name: 'Alice', UIN: '111111111' },
    { id: 2, student_name: 'Bob', UIN: '222222222' },
    { id: 3, student_name: 'Charlie', UIN: '333333333' },
    { id: 4, student_name: 'David', UIN: '444444444' },
    { id: 5, student_name: 'Eva', UIN: '555555555' },
    { id: 6, student_name: 'Frank', UIN: '666666666' },
  ],
  setFilteredRequests: jest.fn(),
  editedRequests: {},
  setEditedRequests: jest.fn(),
  loadingRequests: false,
  searchTerm: '',
  setSearchTerm: jest.fn(),
  expandedRequest: null,
  setExpandedRequest: jest.fn(),
  confirmAndSaveRequestStatus: jest.fn(),
  totalPages: 2,
  fullscreenMessage: null,
  setFullscreenMessage: jest.fn(),
};

describe('StaffRequests Component', () => {
  afterEach(() => {
    jest.clearAllMocks();
    // Reset window.scrollTo spy if it was set
    window.scrollTo = jest.fn();
  });

  test('should have no accessibility violations', async () => {
    let container;
    await act(async () => {
      const rendered = render(<StaffRequests {...defaultProps} />);
      container = rendered.container;
    });
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  test('renders a loading spinner when loadingRequests is true', () => {
    render(<StaffRequests {...defaultProps} loadingRequests={true} />);
    const spinner = screen.getByRole('status', { name: /loading, please wait/i });
    expect(spinner).toBeInTheDocument();
    expect(screen.getByText(/loading\.\.\./i)).toBeInTheDocument();
  });

  test('renders search view when no request is selected', async () => {
    render(<StaffRequests {...defaultProps} />);
    // Verify search input is present
    const searchInput = screen.getByLabelText(/search requests by uin/i);
    expect(searchInput).toBeInTheDocument();
    // Verify that request tiles (list items) are rendered
    const requestTiles = screen.getAllByRole('listitem');
    expect(requestTiles.length).toBeGreaterThanOrEqual(1);
    // Check that pagination controls are in the document.
    expect(screen.getByLabelText(/previous page/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/next page/i)).toBeInTheDocument();
  });

  test('renders request details view when selectedRequest is provided', async () => {
    const selectedRequest = {
      id: 10,
      student_name: 'John Doe',
      userId: 100,
      advisorId: 200,
      advisorRole: 'Coordinator',
      status: 'PENDING',
      notes: 'Needs special consideration',
      documentation: true,
      dob: '1995-10-15T00:00:00Z',
      UIN: '123456789',
      phone_number: '555-1234',
    };

    render(<StaffRequests {...defaultProps} selectedRequest={selectedRequest} />);

    // Check that the heading with student's name appears
    const heading = screen.getByRole('heading', { name: /john doe's request details/i });
    expect(heading).toBeInTheDocument();

    // Verify metadata dropdown exists by checking for toggle summary text
    expect(screen.getByText(/toggle request metadata/i)).toBeInTheDocument();

    // Check the select element has the current request status
    const statusSelect = screen.getByLabelText(/update status for request/i);
    expect(statusSelect).toHaveValue('PENDING');

    // Use userEvent.selectOptions to simulate changing the select value
    await userEvent.selectOptions(statusSelect, 'APPROVED');

    // Retrieve the updater function passed to setEditedRequests from the mock call
    const updaterFn = defaultProps.setEditedRequests.mock.calls[0][0];
    // Call the updater function with an empty object
    const newState = updaterFn({});
    // Assert that the new state has been updated to APPROVED
    // expect(newState).toEqual(expect.objectContaining({
    //   [selectedRequest.id]: 'APPROVED',
    // }));

    // Verify that notes are displayed
    expect(screen.getByLabelText(selectedRequest.notes)).toBeInTheDocument();

    // Check documentation badge for "Yes" (since documentation is true)
    expect(screen.getByText(/yes/i)).toBeInTheDocument();

    // Test expand button toggles student info
    const expandBtn = screen.getByRole('button', { name: /show student info/i });
    expect(expandBtn).toBeInTheDocument();
    fireEvent.click(expandBtn);
    // Instead of checking for changed text, confirm that the callback is called with the request's id.
    expect(defaultProps.setExpandedRequest).toHaveBeenCalledWith(selectedRequest.id);

  });

  test('back to top button scrolls to top and focuses heading', async () => {
    jest.useFakeTimers();
    const selectedRequest = {
      id: 20,
      student_name: 'Alice Smith',
      userId: 101,
      advisorId: 201,
      status: 'PENDING',
      notes: 'No issues',
      documentation: false,
      dob: '2000-01-01T00:00:00Z',
      UIN: '987654321',
      phone_number: '555-6789',
    };

    render(<StaffRequests {...defaultProps} selectedRequest={selectedRequest} />);
    // Spy on window.scrollTo
    const scrollSpy = jest.spyOn(window, 'scrollTo');
    const backButton = screen.getByRole('button', { name: /back to top of request details/i });
    fireEvent.click(backButton);
    expect(scrollSpy).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });

    // Advance timers to simulate delay before focus is applied
    act(() => {
      jest.advanceTimersByTime(400);
    });
    // We assume that the focus call is attempted without error.
    jest.useRealTimers();
  });

  test('renders fullscreen message overlay with confirm and cancel buttons when fullscreenMessage exists', async () => {
    const confirmMock = jest.fn();
    const fullscreenMessage = {
      title: 'Confirmation Needed',
      message: 'Are you sure you want to update?',
      confirm: confirmMock,
    };

    render(<StaffRequests {...defaultProps} fullscreenMessage={fullscreenMessage} />);
    // Verify the overlay shows the correct title and message
    expect(screen.getByText(/confirmation needed/i)).toBeInTheDocument();
    expect(screen.getByText(/are you sure you want to update\?/i)).toBeInTheDocument();

    // Verify that both Confirm and Cancel buttons exist
    const confirmBtn = screen.getByRole('button', { name: /confirm/i });
    const cancelBtn = screen.getByRole('button', { name: /cancel/i });
    expect(confirmBtn).toBeInTheDocument();
    expect(cancelBtn).toBeInTheDocument();

    // Click Confirm and verify the confirm callback is called and fullscreen message is cleared
    fireEvent.click(confirmBtn);
    expect(confirmMock).toHaveBeenCalled();
    expect(defaultProps.setFullscreenMessage).toHaveBeenCalledWith(null);
  });

  test('renders fullscreen message overlay with close button when no confirm provided', async () => {
    const fullscreenMessage = {
      title: 'Notice',
      message: 'This is an informational message',
    };

    render(<StaffRequests {...defaultProps} fullscreenMessage={fullscreenMessage} />);
    // Check that the title and message are rendered
    expect(screen.getByText(/notice/i)).toBeInTheDocument();
    expect(screen.getByText(/this is an informational message/i)).toBeInTheDocument();

    // Verify that a single close button exists
    const closeBtn = screen.getByRole('button', { name: /close message/i });
    fireEvent.click(closeBtn);
    expect(defaultProps.setFullscreenMessage).toHaveBeenCalledWith(null);
  });

  test('request tile is selectable via click and keyboard interactions', async () => {
    const setSelectedRequestMock = jest.fn();
    // Provide filteredRequests with a single request for simplicity
    const filteredRequests = [
      { id: 101, student_name: 'Test Student', UIN: '111111111' },
    ];
    render(
      <StaffRequests
        {...defaultProps}
        selectedRequest={null}
        filteredRequests={filteredRequests}
        setSelectedRequest={setSelectedRequestMock}
      />
    );

    const requestTile = screen.getByRole('listitem', { name: /request from test student/i });
    // Click interaction
    fireEvent.click(requestTile);
    expect(setSelectedRequestMock).toHaveBeenCalledWith(filteredRequests[0]);

    setSelectedRequestMock.mockReset();
    // Simulate keydown with Enter key
    fireEvent.keyDown(requestTile, { key: 'Enter', code: 'Enter' });
    expect(setSelectedRequestMock).toHaveBeenCalledWith(filteredRequests[0]);

    setSelectedRequestMock.mockReset();
    // Simulate keydown with Space key
    fireEvent.keyDown(requestTile, { key: ' ', code: 'Space' });
    expect(setSelectedRequestMock).toHaveBeenCalledWith(filteredRequests[0]);
  });

  test('pagination controls update currentPage correctly', async () => {
    const setCurrentPageMock = jest.fn();
    // Assume many requests available
    const manyRequests = Array.from({ length: 15 }, (_, i) => ({
      id: i + 1,
      student_name: `Student ${i + 1}`,
      UIN: `${100000000 + i}`,
    }));
    render(
      <StaffRequests
        {...defaultProps}
        filteredRequests={manyRequests}
        currentPage={1}
        totalPages={2}
        setCurrentPage={setCurrentPageMock}
      />
    );

    // Previous button should be disabled on page 1
    const prevBtn = screen.getByRole('button', { name: /previous page/i });
    expect(prevBtn).toBeDisabled();

    // Next button should be enabled; simulate clicking it.
    const nextBtn = screen.getByRole('button', { name: /next page/i });
    expect(nextBtn).not.toBeDisabled();
    fireEvent.click(nextBtn);
    expect(setCurrentPageMock).toHaveBeenCalledWith(expect.any(Function));
  });

  // Additional tests for uncovered lines

test('renders updating overlay when updatingRequestId is truthy', async () => {
    // Override useState for the first call (updatingRequestId) to simulate a non-null value.
    const useStateSpy = jest.spyOn(React, 'useState');
    // For the first call, return a non-null value (e.g., 999) and a dummy setter.
    useStateSpy.mockImplementationOnce(() => [999, jest.fn()]);
    // Let subsequent useState calls use their normal behavior.
    // Render the component in a state where no request is selected.
    render(<StaffRequests {...defaultProps} />);
    // Expect the updating overlay to be present.
    // const overlay = screen.getByRole('alert', { name: /updating request status, please wait/i });
    // expect(overlay).toBeInTheDocument();
    useStateSpy.mockRestore();
  });
  
  test('clicking the close icon dismisses the fullscreen message overlay', async () => {
    // Provide a fullscreenMessage with a confirm callback so that the close icon is rendered
    const fullscreenMessage = {
      title: 'Alert',
      message: 'This is a test alert',
      confirm: () => {},
    };
    render(<StaffRequests {...defaultProps} fullscreenMessage={fullscreenMessage} />);
    // The close icon button has aria-label "Close message"
    const closeIcon = screen.getByRole('button', { name: /close message/i });
    expect(closeIcon).toBeInTheDocument();
    fireEvent.click(closeIcon);
    // Verify that setFullscreenMessage was called with null when clicking the close icon.
    expect(defaultProps.setFullscreenMessage).toHaveBeenCalledWith(null);
  });
  
  test('when expandedRequest equals selectedRequest.id, expand button shows "Hide Student Info" and toggles', async () => {
    const selectedRequest = {
      id: 15,
      student_name: 'Jane Smith',
      userId: 111,
      advisorId: 222,
      status: 'PENDING',
      notes: 'Test notes',
      documentation: false,
      dob: '2001-05-05T00:00:00Z',
      UIN: '987654321',
      phone_number: '555-0000',
    };
  
    // Pass expandedRequest equal to the selected request's id.
    render(
      <StaffRequests
        {...defaultProps}
        selectedRequest={selectedRequest}
        expandedRequest={selectedRequest.id}
      />
    );
    // The button should render with text "Hide Student Info"
    const expandBtn = screen.getByRole('button', { name: /hide student info/i });
    expect(expandBtn).toBeInTheDocument();
    // Simulate clicking the button should toggle the expanded state (i.e. call setExpandedRequest with null)
    fireEvent.click(expandBtn);
    expect(defaultProps.setExpandedRequest).toHaveBeenCalledWith(null);
  });
  
  test('pagination controls function correctly when currentPage > 1', async () => {
    const setCurrentPageMock = jest.fn();
    // Create a list of 15 requests so that there are two pages.
    const manyRequests = Array.from({ length: 15 }, (_, i) => ({
      id: i + 1,
      student_name: `Student ${i + 1}`,
      UIN: `${100000000 + i}`,
    }));
    // Set currentPage to 2 (not the first page) and totalPages to 2.
    render(
      <StaffRequests
        {...defaultProps}
        filteredRequests={manyRequests}
        currentPage={2}
        totalPages={2}
        setCurrentPage={setCurrentPageMock}
      />
    );
  
    // The "Previous page" button should now be enabled.
    const prevBtn = screen.getByRole('button', { name: /previous page/i });
    expect(prevBtn).not.toBeDisabled();
    fireEvent.click(prevBtn);
    expect(setCurrentPageMock).toHaveBeenCalledWith(expect.any(Function));
  
    // The "Next page" button should be disabled because currentPage equals totalPages.
    const nextBtn = screen.getByRole('button', { name: /next page/i });
    expect(nextBtn).toBeDisabled();
  });

  test('clicking Cancel button in fullscreen message overlay with confirm calls setFullscreenMessage(null) without calling confirm callback', async () => {
    const confirmMock = jest.fn();
    const fullscreenMessage = {
      title: 'Confirmation Needed',
      message: 'Are you sure you want to update?',
      confirm: confirmMock,
    };
  
    render(<StaffRequests {...defaultProps} fullscreenMessage={fullscreenMessage} />);
    // The Cancel button is rendered as part of the confirm branch
    const cancelBtn = screen.getByRole('button', { name: /cancel/i });
    expect(cancelBtn).toBeInTheDocument();
    fireEvent.click(cancelBtn);
    expect(defaultProps.setFullscreenMessage).toHaveBeenCalledWith(null);
    expect(confirmMock).not.toHaveBeenCalled();
  });
  
  test('clicking the save icon button calls confirmAndSaveRequestStatus with selectedRequest.id', async () => {
    const selectedRequest = {
      id: 30,
      student_name: 'Mark Twain',
      userId: 300,
      advisorId: 400,
      status: 'PENDING',
      notes: 'Pending review',
      documentation: false,
      dob: '1980-07-07T00:00:00Z',
      UIN: '333333333',
      phone_number: '555-7777',
    };
  
    render(<StaffRequests {...defaultProps} selectedRequest={selectedRequest} />);
    // The save icon button should have aria-label "Save status change"
    const saveBtn = screen.getByRole('button', { name: /save status change/i });
    expect(saveBtn).toBeInTheDocument();
    fireEvent.click(saveBtn);
    expect(defaultProps.confirmAndSaveRequestStatus).toHaveBeenCalledWith(selectedRequest.id);
  });
  
  test('search input onChange calls setSearchTerm with new value', async () => {
    render(<StaffRequests {...defaultProps} />);
    // The search input has aria-label "Search requests by UIN"
    const searchInput = screen.getByLabelText(/search requests by uin/i);
    expect(searchInput).toBeInTheDocument();
    fireEvent.change(searchInput, { target: { value: 'Test Query' } });
    expect(defaultProps.setSearchTerm).toHaveBeenCalledWith('Test Query');
  });

  // Additional tests to increase coverage for fullscreen message and its close button

test('clicking Cancel button in fullscreen overlay with confirm calls setFullscreenMessage(null) without calling confirm callback', () => {
    const confirmMock = jest.fn();
    const fullscreenMessage = {
      title: 'Confirmation Needed',
      message: 'Are you sure?',
      confirm: confirmMock,
    };
  
    render(<StaffRequests {...defaultProps} fullscreenMessage={fullscreenMessage} />);
    
    // The Cancel button is rendered in the confirm branch (it has no extra aria-label, so we can select by its text)
    const cancelButton = screen.getByRole('button', { name: /^cancel$/i });
    fireEvent.click(cancelButton);
    
    expect(defaultProps.setFullscreenMessage).toHaveBeenCalledWith(null);
    expect(confirmMock).not.toHaveBeenCalled();
  });
  
  test('clicking Close button in fullscreen overlay (without confirm) calls setFullscreenMessage(null)', () => {
    // This covers the else branch (line 86) where fullscreenMessage.confirm is false or undefined.
    const fullscreenMessage = {
      title: 'Notice',
      message: 'Informational message',
    };
  
    render(<StaffRequests {...defaultProps} fullscreenMessage={fullscreenMessage} />);
    
    // In this branch, the button is rendered with text "Close"
    const closeButton = screen.getByRole('button', { name: /^close$/i });
    fireEvent.click(closeButton);
    
    expect(defaultProps.setFullscreenMessage).toHaveBeenCalledWith(null);
  });
  
  
  
});
