import {useState} from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { googleAuth } from "./Api";
import {useNavigate} from 'react-router-dom';
// components 
import GradientBackground from "./components/GradientBackground";
// import Header from "./components/Header";
import HeroSection from "./components/HeroSection";
import Navbar from './components/Navbar';

const buttonClasses = "bg-white text-black px-6 py-1 rounded-2xl font-bold text-sm flex items-center gap-2";



const GoogleLogin = (props) => {
	const [user, setUser] = useState(null);
	const navigate = useNavigate();

	 const [showWelcome, setShowWelcome] = useState(false);
     const [showMail, setShowMail] = useState(false);
	
	const responseGoogle = async (authResult) => {
		try {
			if (authResult["code"]) {
				const result = await googleAuth(authResult.code);
				const {email, name, image} = result.data.user;
				const token = result.data.token;
				const obj = {email, name, token, image};
				localStorage.setItem('user-info', JSON.stringify(obj));
				navigate('/dashboard');
			} else {
				console.log(authResult);
				throw new Error(authResult);
			}
		} catch (e) {
			console.log('Error while Google Login...', e);
		}
	};

	const googleLogin = useGoogleLogin({
		onSuccess: responseGoogle,
		onError: responseGoogle,
		flow: "auth-code",
		scope: "openid email profile https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.modify"
	});

	const LoginScreen = ({ show, onClose }) => {
  		if (!show) return null;

			return (
				<div style={{backgroundColor:"#010312"}} className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50">
				<div style={{background: 'linear-gradient(180deg, rgba(48, 39, 85, .8), rgba(10, 6, 34, .4))',}} className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-4 border-gray-100">
					<h2 className="text-2xl font-bold mb-4 text-center text-white ">Welcome to Qumail!</h2>
					<p className="text-gray-100 mb-6 text-center">Continue With Demo Account or Login with Google</p>
					<button style={{backgroundColor:'#582CCE',}}  onClick={onClose} className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 transition-colors w-full mb-4"> Demo </button>
					<button onClick={googleLogin} className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 transition-colors w-full">  Sign in with Google </button> 
				</div>
				</div>
			);
	};

	return (
		<div className='pb-4 pl-4 pr-4'>
			<GradientBackground>
         		<div className="flex flex-col min-h-screen">
					<header className='flex items-center px-4  mt-8'>
      					<div className='flex items-center gap-4 ml-2'>
        					<div className='font-semibold text-xl'>Qumail</div>
     					</div>

      					<div className='absolute left-1/2 transform -translate-x-1/2'>
						<Navbar />
						</div>

      					<div className='absolute right-9 transform -translate-x-5'>
      						<div className='flex items-center gap-2'>
        						<button  onClick={() => setShowWelcome(true)} type="button" className={buttonClasses}>Login</button>
         						<div>Namelogo </div>
      						</div>
      			        </div>
    				</header>
           			<HeroSection />
         		</div>
       		</GradientBackground>
			<LoginScreen show={showWelcome} onClose={() => {setShowWelcome(false) ; setShowMail(true)}}/>
		</div>
		
	);
};

export default GoogleLogin;

//  <button onClick={googleLogin} className={buttonClasses}Sign in with Google
// 	</button> 