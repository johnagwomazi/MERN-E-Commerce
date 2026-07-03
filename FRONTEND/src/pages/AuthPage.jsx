import SignInPage from '@/pages/auth/SignInPage';
import SignUpPage from '@/pages/auth/SignUpPage';

const AuthPage = ({ mode }) => {
  return mode === 'signup' ? <SignUpPage /> : <SignInPage />;
};

export default AuthPage;

