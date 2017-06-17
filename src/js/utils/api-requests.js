import axios from 'axios';

export function apiRequest (url, method, data = {}) {
  axios.defaults.headers.common['Accept'] = 'application/json';
  axios.defaults.headers.common['Content-Type'] = 'application/json';
  axios.defaults.headers.common['Cache-Control'] = 'no-cache';
  return axios({method, url, data});
}

export function apiRequestAuth (url, method, token, data = {}) {
  axios.defaults.headers.common['Accept'] = 'application/json';
  axios.defaults.headers.common['Authorization'] = `token ${token}`;
  axios.defaults.headers.common['Cache-Control'] = 'no-cache';
  axios.defaults.headers.common['Content-Type'] = 'application/json';
  return axios({method, url, data});
}
