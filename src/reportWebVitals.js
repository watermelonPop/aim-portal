const reportWebVitals = async (onPerfEntry, metrics = null) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    const {
      getCLS,
      getFID,
      getFCP,
      getLCP,
      getTTFB
    } = metrics || await import('web-vitals');

    getCLS(onPerfEntry);
    getFID(onPerfEntry);
    getFCP(onPerfEntry);
    getLCP(onPerfEntry);
    getTTFB(onPerfEntry);
  }
};

export default reportWebVitals;
