import { SWRConfig } from 'swr';

import '../styles/globals.scss';
import axiosInstance from '../utils/axiosInstance';
import { AuthContextProvider } from '../context/AuthContext';

function MyApp({ Component, pageProps }) {
	const fetcher = url => axiosInstance.get(url).then(res => res.data);

	return (
		<SWRConfig 
			value={{
				fetcher,
				// errorRetryCount: 2,
			}}>
			<AuthContextProvider>
				<Component {...pageProps} />
			</AuthContextProvider>
		</SWRConfig>
	);
}

export default MyApp
