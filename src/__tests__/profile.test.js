import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import Profile from '../profile';
import StudentProfile from '../student/studentProfile';
import ProfessorProfile from '../professor/professorProfile';
import StaffProfile from '../staff/staffProfile';
import '@testing-library/jest-dom';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);
describe('Profile component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({}),
      })
    );
  });

  test('StaffProfile useEffect skips focus logic when settingsTabOpen is true', async () => {
    const mockUserInfo = {
      id: 1,
      role: 'ADVISOR',
    };
  
    const lastIntendedFocusRef = { current: null };
    const displayHeaderRef = { current: document.createElement('h2') };
    displayHeaderRef.current.textContent = 'Staff Profile';
  
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({
          account: { name: 'Advisor Name', email: 'advisor@tamu.edu' },
          role: 'Admin',
        }),
      })
    );
  
    const focusSpy = jest.fn();
    displayHeaderRef.current.focus = focusSpy;
  
    await act(async () => {
      render(
        <StaffProfile
          userInfo={mockUserInfo}
          displayHeaderRef={displayHeaderRef}
          settingsTabOpen={true} // 👈 prevents focus logic
          lastIntendedFocusRef={lastIntendedFocusRef}
        />
      );
    });
  
    await waitFor(() => {
      expect(focusSpy).not.toHaveBeenCalled();
    });
  });

  test('StaffProfile useEffect triggers focus when all conditions are met', async () => {
    const mockUserInfo = {
      id: 1,
      role: 'ADVISOR',
    };
  
    const headingElement = document.createElement('h2');
    headingElement.textContent = 'Staff Profile';
    headingElement.focus = jest.fn();
  
    const lastIntendedFocusRef = { current: headingElement };
    const displayHeaderRef = { current: headingElement };
  
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({
          account: { name: 'Advisor Name', email: 'advisor@tamu.edu' },
          role: 'Admin',
        }),
      })
    );
  
    document.body.appendChild(headingElement); // attach to DOM
  
    await act(async () => {
      render(
        <StaffProfile
          userInfo={mockUserInfo}
          displayHeaderRef={displayHeaderRef}
          settingsTabOpen={false}
          lastIntendedFocusRef={lastIntendedFocusRef}
        />
      );
    });
  
    await waitFor(() => {
      expect(headingElement.focus).toHaveBeenCalled();
      expect(lastIntendedFocusRef.current).toBe(null);
    });
  
    document.body.removeChild(headingElement);
  });
  
  test('StaffProfile useEffect does not focus if headingRef is already active', async () => {
    const mockUserInfo = {
      id: 1,
      role: 'ADVISOR',
    };
  
    const heading = document.createElement('h2');
    heading.focus = jest.fn();
    heading.textContent = 'Staff Profile';
    document.body.appendChild(heading);
  
    Object.defineProperty(document, 'activeElement', {
      value: heading,
      configurable: true,
    });
  
    const lastIntendedFocusRef = { current: heading };
    const displayHeaderRef = { current: heading };
  
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({
          account: { name: 'Advisor Name', email: 'advisor@tamu.edu' },
          role: 'Admin',
        }),
      })
    );
  
    await act(async () => {
      render(
        <StaffProfile
          userInfo={mockUserInfo}
          displayHeaderRef={displayHeaderRef}
          settingsTabOpen={false}
          lastIntendedFocusRef={lastIntendedFocusRef}
        />
      );
    });
  
    await waitFor(() => {
      expect(heading.focus).not.toHaveBeenCalled();
    });
  
    document.body.removeChild(heading);
  });

  /*test('StaffProfile assigns headingRef to lastIntendedFocusRef when not equal', async () => {
    const mockUserInfo = {
      id: 99,
      role: 'ADVISOR',
    };
  
    // Ref for heading and an unrelated ref to simulate inequality
    const realHeading = document.createElement('h2');
    realHeading.textContent = 'Staff Profile';
  
    const unrelatedElement = document.createElement('div');
    unrelatedElement.textContent = 'Other Element';
  
    const displayHeaderRef = { current: realHeading };
    const lastIntendedFocusRef = { current: unrelatedElement };
  
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({
          account: { name: 'Jane Advisor', email: 'jane@tamu.edu' },
          role: 'Admin',
        }),
      })
    );
  
    await act(async () => {
      render(
        <StaffProfile
          userInfo={mockUserInfo}
          displayHeaderRef={displayHeaderRef}
          lastIntendedFocusRef={lastIntendedFocusRef}
          settingsTabOpen={false}
        />
      );
    });
  
    await waitFor(() => {
      // 💡 This line ensures the assignment logic ran:
      expect(lastIntendedFocusRef.current).toBe(displayHeaderRef.current);
    });
  });*/
  
  


  test('StaffProfile sets loading to false and skips fetch when role is not ADVISOR', async () => {
    const mockUserInfo = {
      id: 100,
      role: 'STUDENT', // 👈 triggers the else branch
    };
  
    const fetchSpy = jest.spyOn(global, 'fetch');
  
    await act(async () => {
      render(<StaffProfile userInfo={mockUserInfo} settingsTabOpen={false} />);
    });
  
    await waitFor(() => {
      // Spinner should disappear
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
  
      // Title should still be visible
      expect(screen.getByText(/Staff Profile/i)).toBeInTheDocument();
  
      // No data should be rendered
      expect(screen.queryByText(/Name:/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Email:/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Role:/i)).not.toBeInTheDocument();
    });
  
    expect(fetchSpy).not.toHaveBeenCalled();
  
    fetchSpy.mockRestore();
  });
  

  
  test('StaffProfile fetches and sets staff data when user role is ADVISOR', async () => {
    const mockUserInfo = {
      id: 999,
      role: 'ADVISOR',
    };
  
    const mockStaffData = {
      account: {
        name: 'Jane Doe',
        email: 'advisor@example.com',
      },
      role: 'Coordinator',
      global_settings: true,
      accessible_testing_modules: true,
      accomodation_modules: false,
      assistive_technology_modules: true,
      student_case_information: false,
    };
  
    const fetchSpy = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: async () => mockStaffData,
      })
    );
  
    global.fetch = fetchSpy;
  
    await act(async () => {
      render(<StaffProfile userInfo={mockUserInfo} settingsTabOpen={false} />);
    });
  
    await waitFor(() => {
      expect(screen.getByText(/Staff Profile/i)).toBeInTheDocument();
      expect(screen.getByText('Jane Doe')).toBeInTheDocument();
      expect(screen.getByText('advisor@example.com')).toBeInTheDocument();
      expect(screen.getByText('Coordinator')).toBeInTheDocument();
    });
  
    expect(fetchSpy).toHaveBeenCalledWith('/api/getStaffData?userId=999');
  });
  
  
  

  test('StaffProfile sets initial loading=true, staffData=null, and uses localRef when no displayHeaderRef is passed', async () => {
    const mockUserInfo = {
      id: 99,
      role: 'ADVISOR',
    };
  
    // Freeze the fetch promise so the component stays in loading state
    global.fetch = jest.fn(() => new Promise(() => {}));
  
    await act(async () => {
      render(<StaffProfile userInfo={mockUserInfo} settingsTabOpen={false} />);
    });
  
    await waitFor(() => {
      // Spinner should be present (loading === true)
      expect(screen.getByRole('status', { name: /loading, please wait/i })).toBeInTheDocument();
      expect(screen.getByText(/Loading\.\.\./i)).toBeInTheDocument();
  
      // Profile content should NOT appear yet (staffData === null)
      expect(screen.queryByText(/Name:/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Email:/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Role:/i)).not.toBeInTheDocument();
    });
  });
  

  test('ProfessorProfile sets loading to false and skips fetch when user role is not PROFESSOR', async () => {
    const mockUserInfo = {
      id: 123,
      role: 'STUDENT', // Triggers the else branch
    };
  
    const fetchSpy = jest.spyOn(global, 'fetch');
  
    await act(async () => {
      render(<ProfessorProfile userInfo={mockUserInfo} settingsTabOpen={false} />);
    });
  
    await waitFor(() => {
      // Spinner should be gone
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
  
      // Static heading still appears
      expect(screen.getByText(/PROFESSOR PROFILE/i)).toBeInTheDocument();
  
      // No profile fields should render
      expect(screen.queryByText(/Name:/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Email:/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Department:/i)).not.toBeInTheDocument();
    });
  
    expect(fetchSpy).not.toHaveBeenCalled();
  
    fetchSpy.mockRestore();
  });
  

  test('ProfessorProfile fetches and displays data when user role is PROFESSOR', async () => {
    const mockUserInfo = {
      id: 456,
      role: 'PROFESSOR',
    };
  
    const mockData = {
      account: {
        name: 'Prof. Xavier',
        email: 'xavier@university.edu',
      },
      department: 'Mutant Studies',
    };
  
    const fetchSpy = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: async () => mockData,
      })
    );
  
    global.fetch = fetchSpy;
  
    await act(async () => {
      render(<ProfessorProfile userInfo={mockUserInfo} settingsTabOpen={false} />);
    });
  
    await waitFor(() => {
      expect(screen.getByText(/PROFESSOR PROFILE/i)).toBeInTheDocument();
      expect(screen.getByText('Prof. Xavier')).toBeInTheDocument();
      expect(screen.getByText('xavier@university.edu')).toBeInTheDocument();
      expect(screen.getByText('Mutant Studies')).toBeInTheDocument();
    });
  
    expect(fetchSpy).toHaveBeenCalledWith('/api/getProfessorData?userId=456');
  });
  

  test('ProfessorProfile sets loading true and professorData null initially', async () => {
    const mockUserInfo = {
      id: 123,
      role: 'PROFESSOR',
    };
  
    // Delay fetch resolution to freeze component in loading state
    global.fetch = jest.fn(() =>
      new Promise(() => {}) // pending forever to test initial state
    );
  
    await act(async () => {
      render(<ProfessorProfile userInfo={mockUserInfo} settingsTabOpen={false} />);
    });
  
    await waitFor(() => {
      const spinner = screen.getByRole('status', { name: /loading, please wait/i });
      expect(spinner).toBeInTheDocument();
      expect(screen.getByText(/Loading.../)).toBeInTheDocument();
    });
  });
  

  test('StudentProfile sets loading to false and skips fetch when user role is not STUDENT', async () => {
    const mockUserInfo = {
      id: 123,
      role: 'PROFESSOR', // 👈 triggers the `else` branch
    };

    const mockSetLoading = jest.fn();

    const fetchSpy = jest.spyOn(global, 'fetch');

  
    await act(async () => {
      render(<StudentProfile userInfo={mockUserInfo} settingsTabOpen={false} />);
    });
  
    await waitFor(() => {
      // Ensure fetch was NOT made for student profile
      const calledUrls = fetchSpy.mock.calls.map(call => call[0]);
      expect(calledUrls.some(url => url.includes('/api/getStudentProfile'))).toBe(false);
    });

    fetchSpy.mockRestore();
  });
  
  

  test('focuses tab-Profile after slight delay when no alert and settings tab closed', () => {
    jest.useFakeTimers();
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            uin: 123456789,
            dob: '2000-01-01T00:00:00.000Z',
            phone_number: '123-456-7890',
            email: 'student@example.com',
          }),
      })
    );
  
    const mockUserInfo = {
      id: 'testId',
      role: 'STUDENT'
    };
  
    const focusSpy = jest.fn();
    const mockTab = document.createElement('div');
    mockTab.id = 'tab-Profile';
    mockTab.focus = focusSpy;
    document.body.appendChild(mockTab);
  
    render(<Profile userInfo={mockUserInfo} settingsTabOpen={false} />);
  
    act(() => {
      jest.runAllTimers();
    });
  
    expect(focusSpy).toHaveBeenCalled();
  
    document.body.removeChild(mockTab);
    jest.useRealTimers();
  });
  
  

  test('Profile should have no accessibility violations', async () => {
    let mockUserInfo = {
            id: "mockId",
            name: "Mock User",
            email: "test@gmail.com",
            role: "USER",
            picture: null,
            dob: "2000-01-01",
            uin: 123456789,
            phone_number: 1001001001,
    };
    const mockDisplayHeaderRef = { current: null };
    const mockLastIntendedFocusRef = { current: null };
    const { container } = render(<Profile userInfo={mockUserInfo} displayHeaderRef={mockDisplayHeaderRef}
      lastIntendedFocusRef={mockLastIntendedFocusRef}
      settingsTabOpen={false}/>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  test('renders student data correctly', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            uin: 179008299,
            dob: '2024-12-24T06:00:00.000Z',
            phone_number: '1-935-865-0245 x848',
            email: 'student1.aim@gmail.com',
          }),
      })
    );
  
    const mockUserInfo = {
      id: 1,
      role: 'STUDENT',
    };
  
    render(<Profile userInfo={mockUserInfo} settingsTabOpen={false} />);
  
    expect(await screen.findByText(/STUDENT PROFILE/)).toBeInTheDocument();
    expect(await screen.findByText(/179008299/)).toBeInTheDocument();
    expect(await screen.findByText(/12\/24\/2024/)).toBeInTheDocument();
    expect(await screen.findByText(/1-935-865-0245 x848/)).toBeInTheDocument();
    expect(await screen.findByText(/student1.aim@gmail.com/)).toBeInTheDocument();
  });

  test('StaffProfile assigns headingRef to lastIntendedFocusRef when not equal', async () => {
    const mockUserInfo = {
      id: 99,
      role: 'ADVISOR',
    };
  
    const heading = document.createElement('h2');
    heading.textContent = 'Staff Profile';
    heading.focus = jest.fn();
  
    const unrelatedElement = document.createElement('div');
    unrelatedElement.textContent = 'Other Element';
  
    const displayHeaderRef = { current: heading };
    const lastIntendedFocusRef = { current: unrelatedElement };
  
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({
          account: { name: 'Jane Advisor', email: 'jane@tamu.edu' },
          role: 'Admin',
        }),
      })
    );
  
    await act(async () => {
      render(
        <StaffProfile
          userInfo={mockUserInfo}
          displayHeaderRef={displayHeaderRef}
          lastIntendedFocusRef={lastIntendedFocusRef}
          settingsTabOpen={false}
        />
      );
    });
  
    await waitFor(() => {
      expect(lastIntendedFocusRef.current).toBe(displayHeaderRef.current);
    });
  });
  

  
});


