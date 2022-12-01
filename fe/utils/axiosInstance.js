import axios from 'axios'
import Cookies from 'js-cookie'

const baseURL = process.env.api
const axiosInstance = axios.create({
    baseURL,
    //timeout: 5000,
    headers: {
        'Authorization': `Token ${Cookies.get('token')}`,
        'Content-type': 'application/json',
    },
})

export default axiosInstance;