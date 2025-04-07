import React from 'react';
import { render, screen } from '@testing-library/react';
import Profile from '../profile';
import '@testing-library/jest-dom';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);
describe('Profile component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
    const mockUserInfo = {
      id: 1,
      role: 'STUDENT',
    };

    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve({
            uin: 179008299,
            dob: '2024-12-24T06:00:00.000Z',
            phone_number: '1-935-865-0245 x848',
            email: 'student1.aim@gmail.com',
          }),
      })
    );

    const mockDisplayHeaderRef = { current: null };
    const mockLastIntendedFocusRef = { current: null };

    render(<Profile userInfo={mockUserInfo} displayHeaderRef={mockDisplayHeaderRef}
      lastIntendedFocusRef={mockLastIntendedFocusRef}
      settingsTabOpen={false}/>);

    expect(await screen.findByText(/STUDENT PROFILE/)).toBeInTheDocument();
    expect(await screen.findByText(/179008299/)).toBeInTheDocument();
    expect(await screen.findByText(/12\/24\/2024/)).toBeInTheDocument();
    expect(await screen.findByText(/1-935-865-0245 x848/)).toBeInTheDocument();
    expect(await screen.findByText(/student1.aim@gmail.com/)).toBeInTheDocument();
  });

  test('renders correct role title for ADVISOR', () => {
    const mockAdvisor = {
      id: 2,
      role: 'ADVISOR',
    };
    const mockDisplayHeaderRef = { current: null };
    const mockLastIntendedFocusRef = { current: null };

    render(<Profile userInfo={mockAdvisor} displayHeaderRef={mockDisplayHeaderRef}
      lastIntendedFocusRef={mockLastIntendedFocusRef}
      settingsTabOpen={false}/>);
    expect(screen.getByText('STAFF PROFILE')).toBeInTheDocument();
  });

  test('renders correct role title for PROFESSOR', () => {
    const mockProfessor = {
      id: 601,
      role: 'PROFESSOR',
    };

    const mockDisplayHeaderRef = { current: null };
    const mockLastIntendedFocusRef = { current: null };

    render(<Profile userInfo={mockProfessor} displayHeaderRef={mockDisplayHeaderRef}
      lastIntendedFocusRef={mockLastIntendedFocusRef}
      settingsTabOpen={false}/>);
    expect(screen.getByText('PROFESSOR PROFILE')).toBeInTheDocument();
  });
});
