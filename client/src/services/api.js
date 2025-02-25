import axios from "axios"
import { constant } from "../constant"


export const postApi = async (path, data, login = false) => {
    try {
        const response = await axios.post(constant.baseUrl + path, data, {
            headers: {
                Authorization: localStorage.getItem("token") || sessionStorage.getItem("token")
            }
        });
        
        // Handle token storage
        if (response.data?.token) {
            if (login) {
                localStorage.setItem('token', response.data.token);
            } else {
                sessionStorage.setItem('token', response.data.token);
            }
            
            if (response.data?.user) {
                localStorage.setItem('user', JSON.stringify(response.data.user));
            }
        }
        
        return { success: true, data: response.data };
    } catch (error) {
        console.error('API Error:', error);
        
        // Return a standardized error response
        return { 
            success: false, 
            error: error.response?.data || error.message || 'Unknown error',
            status: error.response?.status
        };
    }
}
export const putApi = async (path, data, id) => {
    try {
        let result = await axios.put(constant.baseUrl + path, data, {
            headers: {
                Authorization: localStorage.getItem("token") || sessionStorage.getItem("token")
            }
        })
        return result
    } catch (e) {
        console.error(e)
        return e
    }
}

export const deleteApi = async (path, param) => {
    try {
        let result = await axios.delete(constant.baseUrl + path + param, {
            headers: {
                Authorization: localStorage.getItem("token") || sessionStorage.getItem("token")
            }
        })
        if (result.data?.token && result.data?.token !== null) {
            localStorage.setItem('token', result.data?.token)
        }
        return result
    } catch (e) {
        console.error(e)
        return e
    }
}

export const deleteManyApi = async (path, data) => {
    console.log(constant.baseUrl + path);
    try {
        let result = await axios.post(constant.baseUrl + path, data, {
            headers: {
                Authorization: localStorage.getItem("token") || sessionStorage.getItem("token")
            }
        })
        if (result.data?.token && result.data?.token !== null) {
            localStorage.setItem('token', result.data?.token)
        }
        return result
    } catch (e) {
        console.error(e)
        return e
    }
}

export const getApi = async (path, id) => {
    try {
        const url = id ? constant.baseUrl + path + id : constant.baseUrl + path;
        
        const response = await axios.get(url, {
            headers: {
                Authorization: localStorage.getItem("token") || sessionStorage.getItem("token")
            }
        });
        
        // Handle token if present in response
        if (response.data?.token && response.data.token !== null) {
            localStorage.setItem('token', response.data.token);
        }
        
        return { success: true, data: response.data };
    } catch (error) {
        console.error('API Error:', error);
        
        // Return a standardized error response
        return { 
            success: false, 
            error: error.response?.data || error.message || 'Unknown error',
            status: error.response?.status
        };
    }
}

