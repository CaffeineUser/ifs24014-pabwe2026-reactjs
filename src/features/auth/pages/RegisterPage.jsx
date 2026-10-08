import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { registerAsync, resetAuthState } from '../states/authSlice';
import useInput from '../../../hooks/useInput';
import {
  showErrorDialog,
  showSuccessDialog,
} from '../../../helpers/toolsHelper';

const RegisterPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthRegister } = useSelector((state) => state.auth);

  const [name, onNameChange] = useInput('');
  const [email, onEmailChange] = useInput('');
  const [password, onPasswordChange] = useInput('');

  useEffect(() => {
    dispatch(resetAuthState());
  }, [dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name || !email || !password) {
      showErrorDialog('Validation Error', 'All fields are required');
      return;
    }

    return dispatch(registerAsync({ name, email, password })).then((action) => {
      if (registerAsync.fulfilled.match(action)) {
        showSuccessDialog(
          'Registration Success',
          'You can now sign in with your account'
        );
        navigate('/auth/login');
      } else {
        showErrorDialog('Registration Failed', action.payload);
      }
    });
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">
        Create an Account
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4" id="register-form">
        <div>
          <label
            htmlFor="register-name-input"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Name
          </label>
          <input
            id="register-name-input"
            name="name"
            type="text"
            value={name}
            onChange={onNameChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
            placeholder="Enter your name"
            disabled={isAuthRegister}
            autoComplete="name"
            aria-required="true"
          />
        </div>
        <div>
          <label
            htmlFor="register-email-input"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email
          </label>
          <input
            id="register-email-input"
            name="email"
            type="email"
            value={email}
            onChange={onEmailChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
            placeholder="Enter your email"
            disabled={isAuthRegister}
            autoComplete="email"
            aria-required="true"
          />
        </div>
        <div>
          <label
            htmlFor="register-password-input"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Password
          </label>
          <input
            id="register-password-input"
            name="password"
            type="password"
            value={password}
            onChange={onPasswordChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
            placeholder="Create a password"
            disabled={isAuthRegister}
            autoComplete="new-password"
            aria-required="true"
          />
        </div>
        <button
          id="register-submit-button"
          type="submit"
          disabled={isAuthRegister}
          aria-busy={isAuthRegister}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
        >
          {isAuthRegister ? 'Signing Up...' : 'Sign Up'}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-gray-600">
        Already have an account?{' '}
        <Link
          to="/auth/login"
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
};

export default RegisterPage;
