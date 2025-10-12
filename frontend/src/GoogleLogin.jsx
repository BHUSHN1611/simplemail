import {useState} from "react";
import {useNavigate} from 'react-router-dom';
import Teamname from "./components/Teamname";
// API base URL
const API_BASE = import.meta.env.VITE_API_BASE;
// components
import GradientBackground from "./components/GradientBackground";
import HeroSection from "./components/HeroSection";
import Navbar from './components/Navbar';
import Footer from "./components/Footer";
// API functions
import { appPasswordLogin } from "./Api";
// utilities
import {
    AUTH_CONSTANTS,
    validateUserData,
    extractUserInfo,
    storeUserData,
    retryAsync,
    getErrorMessage
} from "./utils/authUtils";

const buttonClasses = "bg-white text-black px-6 py-1 rounded-2xl font-bold text-sm flex items-center gap-2";

const GoogleLogin = (props) => {
    const navigate = useNavigate();

    const [showWelcome, setShowWelcome] = useState(false);
    const [authError, setAuthError] = useState(null);


    const handleModalClose = () => {
        setShowWelcome(false);
    };

    const LoginScreen = ({ show, onClose }) => {
        const navigate = useNavigate();
        if (!show) return null;

        const [isAuthenticating, setIsAuthenticating] = useState(false);
        const [email, setEmail] = useState('');
        const [appPassword, setAppPassword] = useState('');
        const [imapHost, setImapHost] = useState('imap.gmail.com');

        const handleDemoLogin = () => {
            setEmail('qumail1611@gmail.com');
            setAppPassword('znxx feza pwag nmnb');
            setImapHost('imap.gmail.com');
        };

        const handleSubmit = async (e) => {
            e.preventDefault();
            setIsAuthenticating(true);
            setAuthError(null);
            try {
                console.log('🔐 Attempting login for:', email);

                const data = await appPasswordLogin({ email, appPassword, imapHost });

                const validation = validateUserData(data);
                if (!validation.isValid) throw new Error(validation.error);

                const userInfo = extractUserInfo(data);
                storeUserData(userInfo);
                navigate('/dashboard');
            } catch (err) {
                console.error('Login error', err);
                setAuthError(getErrorMessage(err));
            } finally {
                setIsAuthenticating(false);
            }
        };


        return (
            <div style={{backgroundColor:"#010312"}} className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div style={{background: 'linear-gradient(180deg, rgba(48, 39, 85, .8), rgba(10, 6, 34, .4))',}} className="p-4 lg:p-6 xl:p-8 rounded-lg shadow-lg max-w-sm lg:max-w-md xl:max-w-lg w-full mx-auto border-gray-100">
                    <h2 className="text-lg lg:text-xl xl:text-2xl font-bold mb-3 lg:mb-4 text-center text-white">Login with Gmail App Password</h2>
                    <p className="text-gray-200 mb-4 lg:mb-6 text-center text-sm lg:text-base">Enter your Gmail address and an app-specific password (create one at myaccount.google.com/security if needed).</p>

                    <form onSubmit={handleSubmit} className="space-y-3 lg:space-y-4">
                        <div className="mb-2 lg:mb-3">
                            <button
                                type="button"
                                onClick={handleDemoLogin}
                                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 lg:py-3 px-3 lg:px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 text-sm lg:text-base"
                            >
                                🚀 Fill Demo Credentials
                            </button>
                        </div>

                        <input
                            type="email"
                            name="email"
                            required
                            placeholder="you@gmail.com"
                            value={email}
                            onChange={e=>setEmail(e.target.value)}
                            className="w-full p-2 lg:p-3 bg-gray-800 rounded text-white text-sm lg:text-base placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                        />
                        <input
                            type="password"
                            name="appPassword"
                            required
                            placeholder="App Password"
                            value={appPassword}
                            onChange={e=>setAppPassword(e.target.value)}
                            className="w-full p-2 lg:p-3 bg-gray-800 rounded text-white text-sm lg:text-base placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                        />
                        <input
                            type="text"
                            name="imapHost"
                            placeholder="IMAP Host (optional)"
                            value={imapHost}
                            onChange={e=>setImapHost(e.target.value)}
                            className="w-full p-2 lg:p-3 bg-gray-800 rounded text-white text-sm lg:text-base placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                        />

                        <div className="flex gap-2 lg:gap-3">
                            <button
                                type="button"
                                onClick={() => onClose()}
                                disabled={isAuthenticating}
                                className="flex-1 px-3 lg:px-4 py-2 lg:py-3 bg-gray-600 hover:bg-gray-500 rounded text-white text-sm lg:text-base transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isAuthenticating}
                                className="flex-1 px-3 lg:px-4 py-2 lg:py-3 bg-blue-600 hover:bg-blue-500 rounded text-white text-sm lg:text-base transition-colors disabled:opacity-50"
                            >
                                {isAuthenticating ? 'Signing in...' : 'Sign in'}
                            </button>
                        </div>
                    </form>

                    {authError && (
                        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                            {authError}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className='pb-3 lg:pb-4 pl-3 lg:pl-4 pr-3 lg:pr-4'>
            <GradientBackground>
                <div className="flex flex-col min-h-screen">
                    <header className='flex items-center px-3 lg:px-4 mt-6 lg:mt-8 z-10 relative'>
                        <div className='flex items-center gap-3 lg:gap-4 ml-1 lg:ml-2'>
                            <div className='font-semibold text-lg lg:text-xl xl:text-2xl'>Qumail</div>
                        </div>

                        <div className='absolute left-1/2 transform -translate-x-1/2'>
                            <Navbar />
                        </div>

                        <div className='absolute right-6 lg:right-9 transform -translate-x-3 lg:-translate-x-5'>
                            <div className='flex items-center gap-2 lg:gap-3'>
                                <button
                                    onClick={() => setShowWelcome(true)}
                                    type="button"
                                    className="bg-white text-black px-4 lg:px-6 py-1 lg:py-2 rounded-2xl font-bold text-xs lg:text-sm flex items-center gap-2 hover:bg-gray-100 transition-colors"
                                >
                                    Login
                                </button>
                                <div><Teamname></Teamname></div>
                            </div>
                        </div>
                    </header>
                    <div className="flex-1 flex flex-col items-center justify-center px-4 lg:px-6 xl:px-8 text-center">
                        <HeroSection />
                        <button
                            onClick={() => setShowWelcome(true)}
                            className="bg-white text-purple-900 px-6 lg:px-8 xl:px-10 py-3 lg:py-3.5 xl:py-4 rounded-full font-semibold text-sm lg:text-base xl:text-lg transition-all shadow-lg hover:shadow-xl flex items-center gap-2 lg:gap-3 hover:bg-gray-100"
                        >
                            Get Started<span className="text-base lg:text-lg">›</span>
                        </button>
                    </div>

                </div>
            </GradientBackground>
            <Footer></Footer>

            <LoginScreen show={showWelcome} onClose={handleModalClose}/>
        </div>
    );
};

export default GoogleLogin;