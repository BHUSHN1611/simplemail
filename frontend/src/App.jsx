// import './App.css'
import { GoogleOAuthProvider } from "@react-oauth/google";
import GoogleLogin from '../src/GoogleLogin';
import {BrowserRouter, Route, Routes, Navigate} from 'react-router-dom';
import Dashboard from './Dashboard';
import { useState } from 'react';
import RefrshHandler from './RefrshHandler';
import NotFound from './NotFound';
import GradientBackground from './components/GradientBackground';
function App() {
	const client_Id = import.meta.env.VITE_GOOGLE_CLIENT_ID || "1010783366961-lrshmv8dbgmmg2epinjvsq91j7tjhb70.apps.googleusercontent.com"
	const [isAuthenticated, setIsAuthenticated] = useState(false);

	const GoogleWrapper = ()=>(
		<GoogleOAuthProvider clientId={client_Id}>
			<GoogleLogin></GoogleLogin>
		</GoogleOAuthProvider>
	)
	
	const PrivateRoute = ({ element }) => {
		return isAuthenticated ? element : <Navigate to="/login" />
	}
	return (
		<BrowserRouter>
		    <RefrshHandler setIsAuthenticated={setIsAuthenticated} />
			<Routes>
				<Route path="/login" element={<GoogleWrapper />} />
				<Route path="/" element={<Navigate to="/login" />} />
				<Route path='/dashboard' element={<PrivateRoute element={<Dashboard/>}/>}/>
				<Route path="*" element={<NotFound/>} />
			</Routes>
	</BrowserRouter>
	);
}

export default App