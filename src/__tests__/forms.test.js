import React from 'react';
import { render, screen } from '@testing-library/react';
import Forms from '../forms';

// Mock subcomponents
// jest.mock('../user/userForms.js', () => () => <div data-testid="user-forms">User Forms</div>);
jest.mock('../student/studentForms.js', () => () => <div data-testid="student-forms">Student Forms</div>);
jest.mock('../staff/staffForms.js', () => () => <div data-testid="staff-forms">Staff Forms</div>);

describe('Forms Component', () => {
  const props = {
    displayHeaderRef: React.createRef(),
    settingsTabOpen: true,
    lastIntendedFocusRef: React.createRef()
  };

  // test('renders UserForms for role USER', () => {
  //   render(<Forms {...props} userInfo={{ role: 'USER' }} />);
  //   expect(screen.getByTestId('user-forms')).toBeInTheDocument();
  // });

  test('renders StudentForms for role STUDENT', () => {
    render(<Forms {...props} userInfo={{ role: 'STUDENT' }} />);
    expect(screen.getByTestId('student-forms')).toBeInTheDocument();
  });

  test('renders nothing for unrecognized role', () => {
        const { container } = render(<Forms {...props} userInfo={{ role: 'GUEST' }} />);
        const main = container.querySelector('main');
        expect(main).toBeEmptyDOMElement();
});
      
});