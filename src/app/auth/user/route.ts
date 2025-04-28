// "/auth/user"

// Libs
import { getCodFromAuthCookie, getTokenFromAuthCookie } from '@/lib/server/auth/cookie';
import { MS_USUARIO } from '@/lib/constants';
import { axiosToResponse } from '@/lib/axiosAuth';
import axios, { AxiosResponse } from 'axios';





export async function GET(req: Request): Promise<Response> {
    const id = parseInt("" + getCodFromAuthCookie(req));
    
    try {
        const res = await axios.get(`${MS_USUARIO}/usuario/${id}`);
        return Response.json(res.data as any);
    }
    catch (error) { return axiosToResponse(error as AxiosResponse) }
}