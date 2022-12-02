import { SWRConfig } from 'swr';
import Head from 'next/head'


import '../styles/globals.scss';
import axiosInstance from '../utils/axiosInstance';
import { AuthContextProvider } from '../context/AuthContext';

function MyApp({ Component, pageProps }) {
	const fetcher = url => axiosInstance.get(url).then(res => res.data);

	return (
		<div>
			<Head>
				<title>App</title>
				<meta name="viewport" content="initial-scale=1.0, width=device-width" />
				<meta property="og:title" content="My page title" key="title" />
			</Head>
			<SWRConfig 
				value={{
					fetcher,
					// errorRetryCount: 2,
				}}>
				<AuthContextProvider>
					<Component {...pageProps} />
				</AuthContextProvider>
			</SWRConfig>
		</div>
	);
}

export default MyApp
