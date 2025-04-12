import React from 'react';
import { render, screen, act } from '@testing-library/react';
import Forms from '../forms';

import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

// Mock subcomponents
// jest.mock('../user/userForms.js', () => () => <div data-testid="user-forms">User Forms</div>);
jest.mock('../student/studentForms.js', () => () => <div data-testid="student-forms">Student Forms</div>);

describe('Forms Component', () => {
  const props = {
    displayHeaderRef: React.createRef(),
    settingsTabOpen: true,
    lastIntendedFocusRef: React.createRef()
  };

  test('Forms should have no accessibility violations', async () => {
    let container;
    await act(async () => {
            const rendered = render(<Forms {...props} userInfo={{ role: 'STUDENT' }} />);
            container = rendered.container;
    });

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

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