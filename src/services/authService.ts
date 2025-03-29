import axios, { AxiosResponse } from 'axios';
import { AccessPass } from '@/src/lib/auth';


export async function setLogIn(creds: AccessPass): Promise<AxiosResponse> {
    try {
        const res = await axios.post(`/auth/login`, JSON.stringify(creds), {
            headers: { "Content-Type": "application/json" },
        });
        return res;
    }
    catch (error) {
        return error as AxiosResponse;
    }
}


export async function getUserRoleID(email?: String): Promise<AxiosResponse> {
    try {
        const res = await axios.get(`/auth/${email !== undefined ? email : "user"}`,);
        return res;
    }
    catch (error) {
        return error as AxiosResponse;
    }
}