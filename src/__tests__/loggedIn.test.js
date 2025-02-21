import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { App } from '../App.js';

global.fetch = jest.fn();

describe('App', () => {
        beforeEach(() => {
                jest.clearAllMocks();
        });
});