const axios = require('axios');

const get = async (url, params = {}, headers = {}) => {
  try {
    const response = await axios.get(url, { params, headers });
    return response.data;
  } catch (error) {
    console.error('API GET request failed:', error);
    throw error;
  }
};

const post = async (url, data = {}, headers = {}) => {
  try {
    const response = await axios.post(url, data, { headers });
    return response.data;
  } catch (error) {
    console.error('API POST request failed:', error);
    throw error;
  }
};

module.exports = {
  get,
  post
};
