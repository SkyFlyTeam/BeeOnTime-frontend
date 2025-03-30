import axios, { AxiosResponse } from 'axios';
import { AccessPass } from '../lib/auth';

import { attemptLoginSession } from '../lib/server/auth/login';
import { TextDecoderStream } from 'stream/web';




//export async function setLogIn(creds: AccessPass): Promise<AxiosResponse> {
export async function setLogIn(creds: AccessPass): Promise<AxiosResponse> {
    try {
        const res = await axios.post(`/auth/login`, JSON.stringify(creds), {
            headers: { "Content-Type": "application/json" },
        });
        // alert("setLogIn " + res.data + " " + res.status);
        return res;
    }
    catch (error) {
        const res = (error as AxiosResponse)
        // alert("setLogIn " + res.data + " " + res.status);
        return res
    }
}

export async function getRoleID(): Promise<AxiosResponse> {
    try {
        const res = await axios.get("/auth/user/role");
        return res;
    }
    catch (error) {
        const res = (error as AxiosResponse)
        return res
    }
}



export async function getUsuario(): Promise<AxiosResponse> {
    try {
        const res = await axios.get("/auth/user");
        return res;
    }
    catch (error) {
        const res = (error as AxiosResponse)
        return res
    }
}