import { useState } from 'react';
import { IonIcon } from '@ionic/react';
import { mailOutline, lockClosedOutline } from 'ionicons/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './Register.css';

function Login() {
  const navigate = useNavigate();
  const { login, loading, error } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [validationError, setValidationError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setValidationError('');
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setValidationError('Email and password are required');
      return false;
    }
    if (!formData.email.includes('@')) {
      setValidationError('Please enter a valid email address');
      return false;
    }
    if (formData.password.length < 6) {
      setValidationError('Password must be at least 6 characters long');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    console.log('Sending login data:', {
      email: formData.email,
      password: formData.password
    });

    try {
      const success = await login(formData);
      console.log('Full server response:', success);
      console.log('User data:', success?.user);
      console.log('Token:', success?.token);
      console.log('Response status:', success?.status);
      console.log('Response headers:', success?.headers);
      
      if (success) {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
      console.log('Error response:', error.response);
      console.log('Error status:', error.response?.status);
      console.log('Error data:', error.response?.data);
      console.log('Error headers:', error.response?.headers);
      console.log('Error message:', error.message);
    }
  };

  return (
    <section>
      <div className="form-box">
        <h2>Login</h2>
        {(error || validationError) && (
          <div className="error-message">{error || validationError}</div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="inputbox">
            <input 
              type="email" 
              name="email" 
              required 
              value={formData.email} 
              onChange={handleChange} 
              placeholder=" " 
            />
            <label>Email</label>
            <span className="icon"><IonIcon icon={mailOutline} /></span>
          </div>
          <div className="inputbox">
            <input 
              type="password" 
              name="password" 
              required 
              value={formData.password} 
              onChange={handleChange} 
              placeholder=" " 
            />
            <label>Password</label>
            <span className="icon"><IonIcon icon={lockClosedOutline} /></span>
          </div>
          <div className="forget">
            <label>
              <input type="checkbox" /> Remember me
            </label>
            <label>
              <a href="#">Forgot Password?</a>
            </label>
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
          <div className="register">
            <p>Don't have an account? <a href="#" onClick={(e) => { e.preventDefault(); navigate('/register'); }}>Register</a></p>
          </div>
        </form>
      </div>
    </section>
  );
}

export default Login; 