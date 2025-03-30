import axios from "axios";

export const Api = () =>{
    return axios.create({
        baseURL: 'http://localhost:8080'
    })
}

export const hostname = 'http://localhost:8080/'