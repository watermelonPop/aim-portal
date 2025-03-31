import React, { useState } from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../App';
import { axe, toHaveNoViolations } from 'jest-axe';

// Mock the fetch function
global.fetch = jest.fn();
expect.extend(toHaveNoViolations);

describe('Accessibility Tests', () => {
        test('App should have no accessibility violations', async () => {
                const { container } = render(<App />);
                const results = await axe(container);
                expect(results).toHaveNoViolations();
        });
});