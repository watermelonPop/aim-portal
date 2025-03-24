import React from 'react';
import { render, screen } from '@testing-library/react';
import Profile from '../profile';
import '@testing-library/jest-dom';

describe('Profile component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
            dob: '2024-12-24T00:00:00.000Z',
            phone_number: '1-935-865-0245 x848',
            email: 'student1.aim@gmail.com',
          }),
      })
    );

    render(<Profile userInfo={mockUserInfo} />);

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

    render(<Profile userInfo={mockAdvisor} />);
    expect(screen.getByText('STAFF PROFILE')).toBeInTheDocument();
  });

  test('renders correct role title for PROFESSOR', () => {
    const mockProfessor = {
      id: 3,
      role: 'PROFESSOR',
    };

    render(<Profile userInfo={mockProfessor} />);
    expect(screen.getByText('PROFESSOR PROFILE')).toBeInTheDocument();
  });
});
