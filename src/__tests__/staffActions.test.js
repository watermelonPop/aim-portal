import {
    refreshStudentData,
    confirmAndSaveRequestStatus,
    fetchForms,
    handleFormStatusChange,
    handleSaveChanges,
    confirmAndSaveStatus,
    formatFormType 
  } from '../staff/staffActions';

  describe('staffActions', () => {
    beforeEach(() => {
      global.fetch = jest.fn();
      window.confirm = jest.fn(() => true);
      global.alert = jest.fn();
    });
  
    afterEach(() => {
      jest.resetAllMocks();
    });
  
    describe('refreshStudentData', () => {
      it('fetches and sets updated student', async () => {
        const mockStudent = { userId: 1 };
        fetch.mockResolvedValueOnce({
          json: () => Promise.resolve({ students: [mockStudent] })
        });
  
        const setFns = {
          setRefreshingStudent: jest.fn(),
          setStudentsData: jest.fn(fn => fn([{ userId: 1 }, { userId: 2 }])),
          setSelectedStudent: jest.fn(),
          setEditedStudent: jest.fn()
        };
  
        await refreshStudentData(1, setFns);
  
        expect(setFns.setRefreshingStudent).toHaveBeenCalledWith(true);
        expect(setFns.setSelectedStudent).toHaveBeenCalledWith(mockStudent);
        expect(setFns.setRefreshingStudent).toHaveBeenCalledWith(false);
      });
    });
  
    describe('fetchForms', () => {
      it('sets form list on success', async () => {
        fetch.mockResolvedValueOnce({
          json: () => Promise.resolve({ forms: ['A', 'B'] })
        });
        const setter = jest.fn();
        await fetchForms(42, setter);
        expect(setter).toHaveBeenCalledWith(['A', 'B']);
      });
  
      it('sets empty list on error', async () => {
        fetch.mockRejectedValue(new Error('fail'));
        const setter = jest.fn();
        await fetchForms(42, setter);
        expect(setter).toHaveBeenCalledWith([]);
      });
    });
  
    describe('handleFormStatusChange', () => {
      it('sets a confirmation fullscreenMessage', () => {
        const setMessage = jest.fn();
        const call = handleFormStatusChange('1', 'APPROVED', {
          setFullscreenMessage: setMessage,
          setIsRefreshing: jest.fn(),
          selectedStudent: { userId: 123 },
          fetchForms: jest.fn()
        });
  
        expect(setMessage).toHaveBeenCalledWith(expect.objectContaining({
          title: expect.any(String),
          confirm: expect.any(Function)
        }));
      });
    });
  
    describe('handleSaveChanges', () => {
      it('blocks save if invalid data', async () => {
        const setInfo = jest.fn();
        const setSuccess = jest.fn();
        const setLoading = jest.fn();
  
        await handleSaveChanges({
          editedStudent: {
            student_name: '',
            UIN: 'notnine',
            dob: '',
            phone_number: 'wrong'
          },
          selectedStudent: {},
          setInfoMessage: setInfo,
          setSuccessMessage: setSuccess,
          setLoading: setLoading,
          setFullscreenMessage: jest.fn(),
          refreshStudentData: jest.fn(),
          hasChanges: () => true
        });
  
        expect(setInfo).toHaveBeenCalledWith(expect.stringContaining("Please fix"));
      });

      it('shows message and exits early when no changes are detected', async () => {
        const mockSetInfo = jest.fn();
        const mockSetSuccess = jest.fn();
      
        jest.useFakeTimers(); // So we can fast-forward setTimeout
      
        await handleSaveChanges({
          editedStudent: {},
          selectedStudent: {},
          setInfoMessage: mockSetInfo,
          setSuccessMessage: mockSetSuccess,
          setLoading: jest.fn(),
          setFullscreenMessage: jest.fn(),
          refreshStudentData: jest.fn(),
          hasChanges: () => false
        });
      
        expect(mockSetInfo).toHaveBeenCalledWith('⚠️ No changes to save.');
        jest.advanceTimersByTime(4000);
        expect(mockSetInfo).toHaveBeenCalledWith('');
        jest.useRealTimers();
      });

      it('handles non-ok server response with message from result', async () => {
        fetch.mockResolvedValueOnce({
          ok: false,
          json: async () => ({ error: 'Custom backend error' })
        });
      
        const mockSet = {
          setInfoMessage: jest.fn(),
          setSuccessMessage: jest.fn(),
          setLoading: jest.fn(),
          setFullscreenMessage: jest.fn(),
          refreshStudentData: jest.fn()
        };
      
        await handleSaveChanges({
          ...mockSet,
          editedStudent: {
            userId: 1,
            student_name: 'Test User',
            UIN: '123456789',
            dob: '2000-01-01',
            email: 'test@example.com',
            phone_number: '(123) 456-7890'
          },
          selectedStudent: {},
          hasChanges: () => true
        });
      
        expect(mockSet.setInfoMessage).toHaveBeenCalledWith('❌ Failed to update student.');
      });

      it('catches and logs error during save', async () => {
        fetch.mockRejectedValueOnce(new Error('crash!'));
        console.error = jest.fn();
      
        const mockSet = {
          setInfoMessage: jest.fn(),
          setSuccessMessage: jest.fn(),
          setLoading: jest.fn(),
          setFullscreenMessage: jest.fn(),
          refreshStudentData: jest.fn()
        };
      
        await handleSaveChanges({
          ...mockSet,
          editedStudent: {
            userId: 1,
            student_name: 'Test User',
            UIN: '123456789',
            dob: '2000-01-01',
            email: 'test@example.com',
            phone_number: '(123) 456-7890'
          },
          selectedStudent: {},
          hasChanges: () => true
        });
      
        expect(console.error).toHaveBeenCalledWith(
          "❌ Update error:",
          expect.any(Error)
        );
        expect(mockSet.setInfoMessage).toHaveBeenCalledWith('❌ Failed to update student.');
      });

      it('clears success message after timeout', async () => {
        jest.useFakeTimers();
        fetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({})
        });
      
        const mockSet = {
          setInfoMessage: jest.fn(),
          setSuccessMessage: jest.fn(),
          setLoading: jest.fn(),
          setFullscreenMessage: jest.fn(),
          refreshStudentData: jest.fn()
        };
      
        await handleSaveChanges({
          ...mockSet,
          editedStudent: {
            userId: 1,
            student_name: 'Test User',
            UIN: '123456789',
            dob: '2000-01-01',
            email: 'test@example.com',
            phone_number: '(123) 456-7890'
          },
          selectedStudent: {},
          hasChanges: () => true
        });
      
        jest.advanceTimersByTime(2500);
        expect(mockSet.setSuccessMessage).toHaveBeenCalledWith('');
        jest.useRealTimers();
      });
      
      
      
  
      it('calls fetch to update student on success', async () => {
        fetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({})
        });
  
        const mock = {
          setInfoMessage: jest.fn(),
          setSuccessMessage: jest.fn(),
          setLoading: jest.fn(),
          setFullscreenMessage: jest.fn(),
          refreshStudentData: jest.fn(),
          editedStudent: {
            userId: 1,
            student_name: 'Test User',
            UIN: '123456789',
            dob: '2000-01-01',
            email: 'test@example.com',
            phone_number: '(123) 456-7890'
          },
          selectedStudent: {},
          hasChanges: () => true
        };
  
        await handleSaveChanges(mock);
        expect(fetch).toHaveBeenCalled();
        expect(mock.setFullscreenMessage).toHaveBeenCalledWith(expect.objectContaining({
          title: expect.stringContaining("Success")
        }));
      });
    });
  });
  describe('handleFormStatusChange confirm logic', () => {
    const mockSetFullscreenMessage = jest.fn();
    const mockSetIsRefreshing = jest.fn();
    const mockFetchForms = jest.fn();
  
    const defaultProps = {
      setFullscreenMessage: mockSetFullscreenMessage,
      setIsRefreshing: mockSetIsRefreshing,
      selectedStudent: { userId: 123 },
      fetchForms: mockFetchForms
    };
  
    beforeEach(() => {
      jest.clearAllMocks();
    });
  
    it('handles successful status update', async () => {
      fetch.mockResolvedValueOnce({ ok: true });
  
      handleFormStatusChange("form123", "APPROVED", defaultProps);
      const confirmFn = mockSetFullscreenMessage.mock.calls[0][0].confirm;
  
      await confirmFn();
  
      expect(mockSetIsRefreshing).toHaveBeenCalledWith(true);
      expect(fetch).toHaveBeenCalledWith("/api/updateFormStatus", expect.any(Object));
      expect(mockFetchForms).toHaveBeenCalledWith(123);
      expect(mockSetFullscreenMessage).toHaveBeenCalledWith({
        title: "✅ Success!",
        message: "Form status updated successfully!",
      });
      expect(mockSetIsRefreshing).toHaveBeenCalledWith(false);
    });
  
    it('handles failed response from fetch (non-200)', async () => {
      fetch.mockResolvedValueOnce({ ok: false, status: 500 });
  
      handleFormStatusChange("form123", "DENIED", defaultProps);
      const confirmFn = mockSetFullscreenMessage.mock.calls[0][0].confirm;
  
      await confirmFn();
  
      expect(mockSetFullscreenMessage).toHaveBeenCalledWith({
        title: "❌ Error",
        message: "An error occurred while updating the status.",
      });
      expect(mockSetIsRefreshing).toHaveBeenCalledWith(false);
    });
  
    it('handles fetch exception', async () => {
      fetch.mockRejectedValueOnce(new Error('network fail'));
  
      handleFormStatusChange("form123", "APPROVED", defaultProps);
      const confirmFn = mockSetFullscreenMessage.mock.calls[0][0].confirm;
  
      await confirmFn();
  
      expect(mockSetFullscreenMessage).toHaveBeenCalledWith({
        title: "❌ Error",
        message: "An error occurred while updating the status.",
      });
      expect(mockSetIsRefreshing).toHaveBeenCalledWith(false);
    });
  });
  

describe('confirmAndSaveRequestStatus', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
    window.confirm = jest.fn(() => true);
    global.alert = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('does nothing if no newStatus', async () => {
    const mockSet = jest.fn();
    await confirmAndSaveRequestStatus({
      requestId: 1,
      editedRequests: {},
      setEditedRequests: mockSet,
      setRequestsData: mockSet
    });
    expect(fetch).not.toHaveBeenCalled();
  });

  it('cancels if user does not confirm', async () => {
    window.confirm = jest.fn(() => false);
    const mockSet = jest.fn();

    await confirmAndSaveRequestStatus({
      requestId: 1,
      editedRequests: { 1: 'APPROVED' },
      setEditedRequests: mockSet,
      setRequestsData: mockSet
    });

    expect(fetch).not.toHaveBeenCalled();
  });

  it('deletes requestId from editedRequests after success', async () => {
    const mockSetEditedRequests = jest.fn((fn) => {
      const newState = fn({ 1: 'APPROVED', 2: 'PENDING' });
      expect(newState).toEqual({ 2: 'PENDING' }); // Confirm deletion
    });

    const mockSetRequestsData = jest.fn();

    global.fetch
      .mockResolvedValueOnce({ ok: true }) // updateRequestStatus
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ requests: [{ id: 2, status: 'PENDING' }] })
      }); // getRequests

    await confirmAndSaveRequestStatus({
      requestId: 1,
      editedRequests: { 1: 'APPROVED', 2: 'PENDING' },
      setEditedRequests: mockSetEditedRequests,
      setRequestsData: mockSetRequestsData
    });
  });

  it('logs and alerts on .ok === false', async () => {
    global.fetch.mockResolvedValueOnce({ ok: false });
    console.error = jest.fn();

    await confirmAndSaveRequestStatus({
      requestId: 1,
      editedRequests: { 1: 'APPROVED' },
      setEditedRequests: jest.fn(),
      setRequestsData: jest.fn()
    });

    expect(global.alert).toHaveBeenCalledWith('❌ Failed to update request status.');
  });

  it('logs and alerts on fetch throw', async () => {
    global.fetch.mockRejectedValue(new Error('Network fail'));
    console.error = jest.fn();

    await confirmAndSaveRequestStatus({
      requestId: 1,
      editedRequests: { 1: 'APPROVED' },
      setEditedRequests: jest.fn(),
      setRequestsData: jest.fn()
    });

    expect(console.error).toHaveBeenCalledWith(
      '❌ Error updating request status:',
      expect.any(Error)
    );
    expect(global.alert).toHaveBeenCalledWith('❌ Error while saving request status.');
  });

  it('handles successful update', async () => {
    const mockSetEdited = jest.fn();
    const mockSetData = jest.fn();

    global.fetch
      .mockResolvedValueOnce({ ok: true }) // updateRequestStatus
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ requests: [{ id: 1, status: 'APPROVED' }] })
      }); // getRequests

    await confirmAndSaveRequestStatus({
      requestId: 1,
      editedRequests: { 1: 'APPROVED' },
      setEditedRequests: mockSetEdited,
      setRequestsData: mockSetData
    });

    expect(fetch).toHaveBeenCalledTimes(2);
    expect(global.alert).toHaveBeenCalledWith('✅ Request status updated!');
  });

  it('shows alert on server error', async () => {
    global.fetch.mockResolvedValueOnce({ ok: false });
    const mockSet = jest.fn();

    await confirmAndSaveRequestStatus({
      requestId: 1,
      editedRequests: { 1: 'APPROVED' },
      setEditedRequests: mockSet,
      setRequestsData: mockSet
    });

    expect(alert).toHaveBeenCalledWith('❌ Failed to update request status.');
  });

  it('catches and logs fetch error', async () => {
    global.fetch.mockRejectedValue(new Error('fail'));
    console.error = jest.fn();

    await confirmAndSaveRequestStatus({
      requestId: 1,
      editedRequests: { 1: 'APPROVED' },
      setEditedRequests: jest.fn(),
      setRequestsData: jest.fn()
    });

    expect(console.error).toHaveBeenCalledWith(
      '❌ Error updating request status:',
      expect.any(Error)
    );
  });
});

describe('refreshStudentData', () => {
    it('logs and handles when no student is found', async () => {
      fetch.mockResolvedValueOnce({
        json: () => Promise.resolve({ students: [{ userId: 99 }] })
      });
  
      const setFns = {
        setRefreshingStudent: jest.fn(),
        setStudentsData: jest.fn(),
        setSelectedStudent: jest.fn(),
        setEditedStudent: jest.fn()
      };
  
      await refreshStudentData(1, setFns);
  
      expect(setFns.setSelectedStudent).not.toHaveBeenCalled();
      expect(setFns.setRefreshingStudent).toHaveBeenCalledWith(false);
    });
  
    it('logs error on thrown fetch', async () => {
      fetch.mockRejectedValue(new Error('fail'));
      console.error = jest.fn();
  
      const setFns = {
        setRefreshingStudent: jest.fn(),
        setStudentsData: jest.fn(),
        setSelectedStudent: jest.fn(),
        setEditedStudent: jest.fn()
      };
  
      await refreshStudentData(1, setFns);
      expect(console.error).toHaveBeenCalledWith("❌ Error refreshing student data:", expect.any(Error));
    });
  });

  describe('formatFormType', () => {
    it('capitalizes and formats snake_case', () => {
      expect(formatFormType('test_form_name')).toBe('Test Form Name');
      expect(formatFormType('custom_request_type')).toBe('Custom Request Type');
    });
  
    it('handles null/undefined/empty values', () => {
      expect(formatFormType(null)).toBe('N/A');
      expect(formatFormType(undefined)).toBe('N/A');
      expect(formatFormType('')).toBe('N/A');
    });
  
    it('handles single-word lowercase', () => {
      expect(formatFormType('deadline')).toBe('Deadline');
    });
  
    it('handles mixed casing input', () => {
      expect(formatFormType('SoMe_TyPe_Here')).toBe('Some Type Here');
    });
  });
  
  describe('confirmAndSaveStatus', () => {
    const mockSetFullscreenMessage = jest.fn();
    const defaultProps = {
        editedAccommodations: { 3: 'APPROVED', 4: 'APPROVED' }, // ✅ now includes keys
        setFullscreenMessage: jest.fn()
      };
      
  
    beforeEach(() => {
      jest.clearAllMocks();
    });
  
    it('does nothing if no new status', async () => {
      await confirmAndSaveStatus(2, {
        editedAccommodations: {},
        setFullscreenMessage: mockSetFullscreenMessage
      });
      expect(mockSetFullscreenMessage).not.toHaveBeenCalled();
    });
  
    
  
    it('performs full fetch on confirm (mocked recursively)', async () => {
        window.alert = jest.fn();
        global.fetch = jest.fn().mockResolvedValue({ ok: true });
      
        const props = {
          editedAccommodations: { 5: 'DENIED' },
          setFullscreenMessage: jest.fn()
        };
      
        await confirmAndSaveStatus(5, props); // ✅ wait until setFullscreenMessage is called
      
        const confirmFn = props.setFullscreenMessage.mock.calls[0][0].confirm;
        await confirmFn();
      
        expect(global.fetch).toHaveBeenCalledWith('/api/updateAccommodationStatus', expect.any(Object));
        expect(window.alert).toHaveBeenCalledWith('✅ Status updated successfully!');
      });
      
  
      it('shows error message when fetch.ok is false', async () => {
        global.fetch = jest.fn().mockResolvedValue({ ok: false });
      
        const props = {
          editedAccommodations: { 3: 'APPROVED' }, // ✅ required to avoid early return
          setFullscreenMessage: jest.fn()
        };
      
        await confirmAndSaveStatus(3, props);
      
        expect(props.setFullscreenMessage).toHaveBeenCalled(); // ✅ ensure it's actually called
      
        const confirmFn = props.setFullscreenMessage.mock.calls[0][0].confirm;
        await confirmFn();
      
        expect(props.setFullscreenMessage).toHaveBeenCalledWith({
          title: "❌ Error",
          message: "Failed to update status."
        });
      });
      
      
  
      it('catches and logs fetch error', async () => {
        global.fetch = jest.fn().mockRejectedValue(new Error('fail'));
        console.error = jest.fn();
        window.alert = jest.fn();
      
        const props = {
          editedAccommodations: { 4: 'DENIED' },
          setFullscreenMessage: jest.fn()
        };
      
        await confirmAndSaveStatus(4, props);
      
        expect(props.setFullscreenMessage).toHaveBeenCalled(); // ✅ required
      
        const confirmFn = props.setFullscreenMessage.mock.calls[0][0].confirm;
        await confirmFn();
      
        expect(console.error).toHaveBeenCalledWith('Error updating status:', expect.any(Error));
        expect(window.alert).toHaveBeenCalledWith('❌ Error while updating status.');
      });
      
      
  });
