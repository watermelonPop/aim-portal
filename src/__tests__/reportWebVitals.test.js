import reportWebVitals from '../reportWebVitals';

describe('reportWebVitals', () => {
  let getCLS, getFID, getFCP, getLCP, getTTFB, mockMetrics;

  beforeEach(() => {
    getCLS = jest.fn();
    getFID = jest.fn();
    getFCP = jest.fn();
    getLCP = jest.fn();
    getTTFB = jest.fn();

    mockMetrics = {
      getCLS,
      getFID,
      getFCP,
      getLCP,
      getTTFB
    };
  });

  it('does nothing if onPerfEntry is not a function', async () => {
    await reportWebVitals(null, mockMetrics);

    expect(getCLS).not.toHaveBeenCalled();
    expect(getFID).not.toHaveBeenCalled();
    expect(getFCP).not.toHaveBeenCalled();
    expect(getLCP).not.toHaveBeenCalled();
    expect(getTTFB).not.toHaveBeenCalled();
  });
});
