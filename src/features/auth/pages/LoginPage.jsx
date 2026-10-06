```jsx
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { loginAsync, resetAuthState } from '../states/authSlice';
import useInput from '../../../hooks/useInput';
import { showErrorDialog, showSuccessDialog } from '../../../helpers/toolsHelper';

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthLogin, error } = useSelector((state) => state.auth);
  
  const [email, onEmailChange] = useInput('');
  const [password, onPasswordChange] = useInput('');

  useEffect(() => {
    dispatch(resetAuthState());
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showErrorDialog('Validation Error', 'Email and password are required');
      return;
    }

    const action = await dispatch(loginAsync({ email, password }));
    if (loginAsync.fulfilled.match(action)) {
      showSuccessDialog('Login Success', 'Welcome back!');
      navigate('/');
    } else {
      showErrorDialog('Login Failed', action.payload);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">
        Sign In to Your Account
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4" id="login-form">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email
          </label>

          <input
            id="email"
            name="email"
            type="email"
            value={email}
            onChange={onEmailChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
            placeholder="Enter your email"
            disabled={isAuthLogin}
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Password
          </label>

          <input
            id="password"
            name="password"
            type="password"
            value={password}
            onChange={onPasswordChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
            placeholder="Enter your password"
            disabled={isAuthLogin}
          />
        </div>

        <button
          id="login"
          type="submit"
          disabled={isAuthLogin}
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
```
