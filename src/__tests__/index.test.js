import React from 'react';
import App from '../App';

// Use "mockRender" (Jest allows mock-prefixed vars)
let mockRender;

jest.mock('react-dom/client', () => {
  mockRender = jest.fn(); // safe because it starts with "mock"
  return {
    createRoot: jest.fn(() => ({
      render: mockRender,
    })),
  };
});

describe('index.js', () => {
  beforeEach(() => {
    const root = document.createElement('div');
    root.setAttribute('id', 'root');
    document.body.appendChild(root);
  });

  afterEach(() => {
    document.body.innerHTML = '';
    jest.resetModules(); // clear require cache so index.js re-executes
    jest.clearAllMocks();
  });

  test('renders App without crashing', () => {
    require('../index'); // Import after mocks are in place

    expect(mockRender).toHaveBeenCalledWith(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  });
});
