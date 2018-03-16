import { apiUrl } from './../constants/apiUrl';

const callApi = (endpoint, method, data = null ) => {
    return axios({
        url : apiUrl+endpoint,
        method : method,
        data : data
    }).catch(err => {
        console.log(err);
    })
}
export default callApi;