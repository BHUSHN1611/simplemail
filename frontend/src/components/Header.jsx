import Navbar from './Navbar';
// import Namelogo from './Namelogo';
import { useGoogleLogin } from "@react-oauth/google";
const buttonClasses = "bg-white text-black px-6 py-1 rounded-2xl font-bold text-sm hover:bg-purple-50 transition-all shadow-lg hover:shadow-xl flex items-center gap-2";

const Header = ({ onLogin }) => {
  return (
    <header className='flex items-center px-4  mt-8'>
      <div className='flex items-center gap-4 ml-2'>
        <div className='font-semibold text-xl'>Qumail</div>
      </div>
      <div className='absolute left-1/2 transform -translate-x-1/2'><Navbar /></div>
      <div className='absolute right-9 transform -translate-x-5'>
      <div className='flex items-center gap-2'>
        <button type="button" className={buttonClasses} aria-label="Login to your account" onClick={onLogin}>
          Login
        </button>
         <div>Namelogo </div>
      </div>

      </div>
      
    </header>
  );
};

export default Header;