import axios from "axios";

function setAxiosDefaults() {
    console.log('[config][axios] Setting Axios defaults')
    axios.defaults.baseURL = 'http://localhost:5000/';
    // axios.defaults.baseURL = 'https://basictodo.up.railway.app/';
}

export {setAxiosDefaults};