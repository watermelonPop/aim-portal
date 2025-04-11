import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import Profile from '../profile';
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
  

  // test('renders correct role title for ADVISOR', () => {
  //   const mockAdvisor = {
  //     id: 2,
  //     role: 'ADVISOR',
  //   };
  //   const mockDisplayHeaderRef = { current: null };
  //   const mockLastIntendedFocusRef = { current: null };

  //   render(<Profile userInfo={mockAdvisor} displayHeaderRef={mockDisplayHeaderRef}
  //     lastIntendedFocusRef={mockLastIntendedFocusRef}
  //     settingsTabOpen={false}/>);
  //   expect(screen.getByText('Staff Profile')).toBeInTheDocument();
  // });

  // test('renders correct role title for PROFESSOR', async () => {
  //   const mockProfessor = {
  //     id: 601,
  //     role: 'PROFESSOR',
  //   };
  
  //   global.fetch = jest.fn(() =>
  //     Promise.resolve({
  //       json: () =>
  //         Promise.resolve({
  //           email: 'prof@aim.com',
  //           phone_number: '555-1234',
  //         }),
  //     })
  //   );
  
  //   const mockDisplayHeaderRef = { current: null };
  //   const mockLastIntendedFocusRef = { current: null };
  
    
  //   act(() => {
  //     render(
  //       <Profile
  //         userInfo={mockProfessor}
  //         displayHeaderRef={mockDisplayHeaderRef}
  //         lastIntendedFocusRef={mockLastIntendedFocusRef}
  //         settingsTabOpen={false}
  //       />
  //     );
  //   });
                    
  //   await act(async () => {
  //   });

  //   await waitFor(() => {
  //       expect(screen.findByText('PROFESSOR PROFILE')).toBeInTheDocument();
  //   });
  
    
  // });
  
});


