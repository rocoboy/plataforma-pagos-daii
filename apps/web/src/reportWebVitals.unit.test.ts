import reportWebVitals from './reportWebVitals';

jest.mock('web-vitals', () => ({
  getCLS: jest.fn((onPerfEntry) => {
    if (onPerfEntry) {
      onPerfEntry({ name: 'CLS', value: 0.1, rating: 'good', delta: 0.1, id: '1', entries: [] });
    }
  }),
  getFID: jest.fn((onPerfEntry) => {
    if (onPerfEntry) {
      onPerfEntry({ name: 'FID', value: 10, rating: 'good', delta: 10, id: '2', entries: [] });
    }
  }),
  getFCP: jest.fn((onPerfEntry) => {
    if (onPerfEntry) {
      onPerfEntry({ name: 'FCP', value: 1000, rating: 'good', delta: 1000, id: '3', entries: [] });
    }
  }),
  getLCP: jest.fn((onPerfEntry) => {
    if (onPerfEntry) {
      onPerfEntry({ name: 'LCP', value: 2000, rating: 'good', delta: 2000, id: '4', entries: [] });
    }
  }),
  getTTFB: jest.fn((onPerfEntry) => {
    if (onPerfEntry) {
      onPerfEntry({ name: 'TTFB', value: 300, rating: 'good', delta: 300, id: '5', entries: [] });
    }
  }),
}));

const { getCLS, getFID, getFCP, getLCP, getTTFB } = require('web-vitals');

describe('reportWebVitals', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('does not throw when no function provided', () => {
    expect(() => reportWebVitals()).not.toThrow();
  });
});

