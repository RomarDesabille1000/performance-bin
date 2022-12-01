import React, { createContext, useContext, useState } from "react";
import axios from 'axios'
import Cookies from 'js-cookie'
import useSWR from "swr";
import { useRouter } from 'next/router'

import axiosInstance from '../utils/axiosInstance'

const AuthContext = createContext({})

const AuthContextProvider = props => {
    const isAuth = Cookies.get('token')
    const router = useRouter();

    const { data: user } = useSWR(() => Cookies.get('token') ? '/users/profile/' : null)

    const login = async (email, password) => {
        try {
            await axios.post(`${process.env.api}/users/login/`, {
                email, 
                password
            }).then(({ data }) => {
                const token = data?.token;
                Cookies.set('token', token, { secure: true });

                axiosInstance.defaults.headers['Authorization'] = `Token ${token}`


                // window.location.href = '/hr'
                router.push('/hr');
            }).catch((error) => {
                console.log(error);
            })
        } finally {
        }

    }


    const logout = () => {
        Cookies.remove('token')
        router.push('/')
    }

    //pass auth details
    const authContextValue = {
        login,
        logout,
        user,
        isAuth,
    }

    return <AuthContext.Provider value={authContextValue} {...props} />
}

const useAuth = () => useContext(AuthContext)

export { AuthContextProvider, useAuth }

