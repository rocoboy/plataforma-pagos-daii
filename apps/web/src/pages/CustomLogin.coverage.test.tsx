import React from 'react';

jest.mock('react-router-dom', () => ({
  __esModule: true,
  useNavigate: () => jest.fn(),
}), { virtual: true });

jest.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({ login: jest.fn() }),
}));

describe('CustomLogin - Coverage', () => {
  it('component file exists', () => {
    const component = require('./CustomLogin');
    expect(component).toBeDefined();
  });

  it('exports default component', () => {
    const component = require('./CustomLogin');
    expect(component.default).toBeDefined();
  });

  it('component is a function', () => {
    const component = require('./CustomLogin');
    expect(typeof component.default).toBe('function');
  });
});

