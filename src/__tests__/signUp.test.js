
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SignUp from '../signUp';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

describe('SignUp Component', () => {
  const baseUserInfo = {
    id: 'mockId',
    name: '',
    email: '',
    dob: '',
    phone_number: ''
  };

  const baseProps = {
    userInfo: baseUserInfo,
    setUserInfo: jest.fn(),
    setAlertMessage: jest.fn(),
    setShowAlert: jest.fn(),
    setUserConnected: jest.fn(),
    setSettings: jest.fn(),
    setLoading: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('successfully signs up STAFF with mapped role "Admin"', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });
  
    const props = {
      ...baseProps,
      userInfo: {
        ...baseUserInfo,
        name: 'Jane Staff',
        email: 'jane@tamu.edu',
        id: 'staff-id',
      }
    };
  
    render(<SignUp {...props} />);
  
    // Switch to STAFF tab
    fireEvent.click(screen.getByTestId('STAFF'));
  
    // Select "Administration"
    fireEvent.change(screen.getByLabelText(/staff role/i), {
      target: { value: 'Administration' }
    });
  
    fireEvent.click(screen.getByText(/Sign Up as STAFF/i));
  
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/createAdvisor', expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          userId: 'staff-id',
          role: 'Admin',
        }),
      }));
  
      expect(props.setUserConnected).toHaveBeenCalledWith(true);
      expect(props.setUserInfo).toHaveBeenCalledWith(expect.objectContaining({
        role: 'ADVISOR',
      }));
    });
  });

  test('maps "Testing Center" to "Testing_Staff" and signs up', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });
  
    const props = {
      ...baseProps,
      userInfo: { ...baseUserInfo, id: 'testing-id', name: 'Test', email: 'test@tamu.edu' }
    };
  
    render(<SignUp {...props} />);
    fireEvent.click(screen.getByTestId('STAFF'));
  
    fireEvent.change(screen.getByLabelText(/staff role/i), {
      target: { value: 'Testing Center' }
    });
  
    fireEvent.click(screen.getByText(/Sign Up as STAFF/i));
  
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/createAdvisor', expect.objectContaining({
        body: JSON.stringify({
          userId: 'testing-id',
          role: 'Testing_Staff',
        })
      }));
    });
  });

  test('maps "Assistive Technology" to "Tech_Staff" and signs up', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });
  
    const props = {
      ...baseProps,
      userInfo: { ...baseUserInfo, id: 'tech-id', name: 'Techie', email: 'tech@tamu.edu' }
    };
  
    render(<SignUp {...props} />);
    fireEvent.click(screen.getByTestId('STAFF'));
  
    fireEvent.change(screen.getByLabelText(/staff role/i), {
      target: { value: 'Assistive Technology' }
    });
  
    fireEvent.click(screen.getByText(/Sign Up as STAFF/i));
  
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/createAdvisor', expect.objectContaining({
        body: JSON.stringify({
          userId: 'tech-id',
          role: 'Tech_Staff',
        })
      }));
    });
  });
  
  test('displays alert if STAFF signup fails', async () => {
    const mockError = new Error('Sign Up failed');
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ success: false }),
    });
  
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  
    const props = {
      ...baseProps,
      userInfo: { ...baseUserInfo, id: 'staff-id', name: 'Bad Staff', email: 'fail@tamu.edu' }
    };
  
    render(<SignUp {...props} />);
    fireEvent.click(screen.getByTestId('STAFF'));
    fireEvent.change(screen.getByLabelText(/staff role/i), {
      target: { value: 'Administration' }
    });
    fireEvent.click(screen.getByText(/Sign Up as STAFF/i));
  
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error Signing Up:', expect.any(Error));
      expect(props.setAlertMessage).toHaveBeenCalledWith('Failed to sign up. Please try again.');
      expect(props.setShowAlert).toHaveBeenCalledWith(true);
    });
  
    consoleSpy.mockRestore();
  });
  
  

  test('sign up screen should have no accessibility violations', async () => {
    const props = {
      userInfo: {
        id: '1',
        name: 'Test User',
        email: 'test@email.com',
        dob: '2000-01-01',
        phone_number: '1234567890',
        uin: '123456789',
      },
      setUserInfo: jest.fn(),
      setUserConnected: jest.fn(),
      setAlertMessage: jest.fn(),
      setShowAlert: jest.fn(),
      setLoading: jest.fn(),
    };
  
      const { container } = render(<SignUp {...props} />);
  
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

  test('throws error when response is not ok or success is false', async () => {
    const mockError = new Error('Sign Up failed');
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ success: false }),
    });
  
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  
    const props = {
      userInfo: {
        id: '1',
        name: 'Test User',
        email: 'test@email.com',
        dob: '2000-01-01',
        phone_number: '1234567890',
        uin: '123456789',
      },
      setUserInfo: jest.fn(),
      setUserConnected: jest.fn(),
      setAlertMessage: jest.fn(),
      setShowAlert: jest.fn(),
      setLoading: jest.fn(),
    };
  
    render(<SignUp {...props} />);
  
    fireEvent.click(screen.getByRole('button', { name: /Sign Up as USER/i }));
  
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error Signing Up:', expect.any(Error));
      expect(props.setAlertMessage).toHaveBeenCalledWith('Failed to sign up. Please try again.');
      expect(props.setShowAlert).toHaveBeenCalledWith(true);
    });
  
    consoleErrorSpy.mockRestore();
  });

  test('changes role to STAFF when Enter key is pressed on STAFF tab', async () => {
    render(<SignUp {...baseProps} />);
  
    const staffTab = screen.getByTestId('STAFF');
  
    // Simulate pressing Enter key
    fireEvent.keyDown(staffTab, { key: 'Enter', code: 'Enter', charCode: 13 });
  
    await waitFor(() => {
      expect(screen.getByTestId('staffRole')).toBeInTheDocument();
    });
  });
  
  test('changes role to STAFF when Space key is pressed on STAFF tab', async () => {
    render(<SignUp {...baseProps} />);
  
    const staffTab = screen.getByTestId('STAFF');
  
    // Simulate pressing Space key
    fireEvent.keyDown(staffTab, { key: ' ', code: 'Space', charCode: 32 });
  
    await waitFor(() => {
      expect(screen.getByTestId('staffRole')).toBeInTheDocument();
    });
  });
  
  

  test('displays alert when fetch throws an error during USER signup', async () => {
    const mockError = new Error('Network failure');
    global.fetch = jest.fn().mockRejectedValue(mockError);
  
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  
    const props = {
      userInfo: {
        id: '1',
        name: 'Test User',
        email: 'test@email.com',
        dob: '2000-01-01',
        phone_number: '1234567890',
        uin: '123456789',
      },
      setUserInfo: jest.fn(),
      setUserConnected: jest.fn(),
      setAlertMessage: jest.fn(),
      setShowAlert: jest.fn(),
      setLoading: jest.fn(),
    };
  
    render(<SignUp {...props} />);
  
    fireEvent.click(screen.getByRole('button', { name: /Sign Up as USER/i }));
  
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error Signing Up:', mockError);
      expect(props.setAlertMessage).toHaveBeenCalledWith('Failed to sign up. Please try again.');
      expect(props.setShowAlert).toHaveBeenCalledWith(true);
    });
  
    consoleErrorSpy.mockRestore();
  });
  

  test('renders USER role fields by default', () => {
    render(<SignUp {...baseProps} />);
    expect(screen.getByTestId('nameLabel')).toBeInTheDocument();
    expect(screen.getByTestId('dobLabel')).toBeInTheDocument();
    expect(screen.getByTestId('uinLabel')).toBeInTheDocument();
    expect(screen.getByTestId('phoneLabel')).toBeInTheDocument();
  });

  test('switches to STAFF role fields on tab click', () => {
    render(<SignUp {...baseProps} />);
    fireEvent.click(screen.getByText('STAFF'));
    expect(screen.getByTestId('staffRole')).toBeInTheDocument();
  });

  test('displays error when required USER fields are missing', async () => {
    render(<SignUp {...baseProps} />);
    fireEvent.click(screen.getByText(/Sign Up as USER/i));
    await waitFor(() => {
      expect(baseProps.setAlertMessage).toHaveBeenCalledWith(expect.stringContaining('Incorrect required fields:'));
      expect(baseProps.setShowAlert).toHaveBeenCalledWith(true);
    });
  });

  test('displays error when required STAFF fields are missing', async () => {
    render(<SignUp {...baseProps} />);
    fireEvent.click(screen.getByText('STAFF'));
    fireEvent.click(screen.getByText(/Sign Up as STAFF/i));
    await waitFor(() => {
      expect(baseProps.setAlertMessage).toHaveBeenCalledWith(expect.stringContaining('Incorrect required fields:'));
      expect(baseProps.setShowAlert).toHaveBeenCalledWith(true);
    });
  });

  test('calls fetch and updates userInfo on successful USER signup', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true })
    });

    const filledProps = {
      ...baseProps,
      userInfo: {
        ...baseUserInfo,
        name: 'Test Name',
        email: 'test@email.com',
        dob: '2000-01-01',
        phone_number: '1234567890',
        uin: '123456789'
      }
    };

    render(<SignUp {...filledProps} />);

    fireEvent.click(screen.getByTestId('submitSignUp'));

    await waitFor(() => {
      expect(filledProps.setUserConnected).toHaveBeenCalledWith(true);
      expect(filledProps.setUserInfo).toHaveBeenCalledWith(expect.objectContaining({
        dob: '2000-01-01',
        phone_number: '1234567890',
        uin: '123456789'
      }));
    });
  });
});
