import axios from "axios";

function setAxiosDefaults() {
    console.log('[config][axios] Setting Axios defaults')
    // axios.defaults.baseURL = 'http://localhost:5555/';
    axios.defaults.baseURL = 'https://todov2-production.up.railway.app/';
}

export { setAxiosDefaults };