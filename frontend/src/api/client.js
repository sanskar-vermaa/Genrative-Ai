import axios from 'axios';

// No auth token needed — GenStudio works without an account.
const client = axios.create({ baseURL: '/api' });

export default client;
