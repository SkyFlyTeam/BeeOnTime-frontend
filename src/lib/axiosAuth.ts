import axios, { AxiosResponse } from 'axios';
import { getTokenFromAuthCookie } from './server/auth/cookie';

const axiosAuth = axios.create();

export function axiosToResponse(res: AxiosResponse): Response{
    return new Response(`${res}`, { status: res.status });
}

/*axiosAuth.interceptors.request.use(
    async (config) => {
        const token = await getTokenFromAuthCookie();
        config.headers["Authorization"] = "Bearer " + token
        return config
    },
    (error) => Promise.reject(error)
);*/


export default axiosAuth;