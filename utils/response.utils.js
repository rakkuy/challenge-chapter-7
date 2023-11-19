module.exports = {
  success: (message, data) => {
    const response = {
      error: false,
      message,
      data,
    };

    return response;
  },
  error: (message) => {
    const response = {
      error: true,
      message,
    };

    return response;
  },
};
