import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { loginAsync, resetAuthState } from '../states/authSlice';
import useInput from '../../../hooks/useInput';
import {
  showErrorDialog,
  showSuccessDialog,
} from '../../../helpers/toolsHelper';

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthLogin } = useSelector((state) => state.auth);

  const [email, onEmailChange] = useInput('');
  const [password, onPasswordChange] = useInput('');

  useEffect(() => {
    dispatch(resetAuthState());
  }, [dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email || !password) {
      showErrorDialog(
        'Validation Error',
        'Email and password are required'
      );
      return;
    }

    return dispatch(loginAsync({ email, password })).then((action) => {
      if (loginAsync.fulfilled.match(action)) {
        showSuccessDialog('Login Success', 'Welcome back!');
        navigate('/', { replace: true });
      } else {
        showErrorDialog('Login Failed', action.payload);
      }
    });
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">
        Sign In to Your Account
      </h2>

      <form
        onSubmit={handleSubmit}
        className="space-y-4"
        id="login-form"
      >
        <div>
          <label
            htmlFor="login-email-input"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email
          </label>

          <input
            id="login-email-input"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={onEmailChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
            placeholder="Enter your email"
            disabled={isAuthLogin}
            aria-required="true"
          />
        </div>

        <div>
          <label
            htmlFor="login-password-input"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Password
          </label>

          <input
            id="login-password-input"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={onPasswordChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
            placeholder="Enter your password"
            disabled={isAuthLogin}
            aria-required="true"
          />
        </div>

        <button
          id="login-submit-button"
          type="submit"
          disabled={isAuthLogin}
          aria-busy={isAuthLogin}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
        >
          {isAuthLogin ? 'Signing In...' : 'Sign In'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        Don't have an account?{' '}
        <Link
          to="/auth/register"
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
};

export default LoginPage;