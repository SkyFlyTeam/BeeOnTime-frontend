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
        return res;
    }
    catch (error) {
        const res = (error as AxiosResponse)
        return res
    }
}