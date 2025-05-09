import { useState } from 'react';
import { IonIcon } from '@ionic/react';
import { mailOutline, lockClosedOutline, personOutline } from 'ionicons/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './Register.css';

function Register() {
  const navigate = useNavigate();
  const { register, loading, error } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    firstName: '',
    lastName: ''
  });
  const [validationError, setValidationError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setValidationError('');
  };

  const validateForm = () => {
    if (!formData.email || !formData.password || !formData.username || !formData.firstName || !formData.lastName) {
      setValidationError('All fields are required');
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
    if (formData.username.length < 3) {
      setValidationError('Username must be at least 3 characters long');
      return false;
    }
    if (formData.firstName.length < 2) {
      setValidationError('First name must be at least 2 characters long');
      return false;
    }
    if (formData.lastName.length < 2) {
      setValidationError('Last name must be at least 2 characters long');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const registrationData = {
      email: formData.email,
      password: formData.password,
      username: formData.username,
      firstName: formData.firstName,
      lastName: formData.lastName
    };

    console.log('Sending registration data:', registrationData);

    try {
      const success = await register(registrationData);

      console.log('Full server response:', success);
      console.log('User data:', success?.user);
      console.log('Token:', success?.token);
      console.log('Response status:', success?.status);
      console.log('Response headers:', success?.headers);
      
      if (success) {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Registration error:', error);
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
        <h2>Register</h2>
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
          <div className="inputbox">
            <input 
              type="text" 
              name="username" 
              required 
              value={formData.username} 
              onChange={handleChange} 
              placeholder=" " 
            />
            <label>Username</label>
            <span className="icon"><IonIcon icon={personOutline} /></span>
          </div>
          <div className="inputbox">
            <input 
              type="text" 
              name="firstName" 
              required 
              value={formData.firstName} 
              onChange={handleChange} 
              placeholder=" " 
            />
            <label>First Name</label>
            <span className="icon"><IonIcon icon={personOutline} /></span>
          </div>
          <div className="inputbox">
            <input 
              type="text" 
              name="lastName" 
              required 
              value={formData.lastName} 
              onChange={handleChange} 
              placeholder=" " 
            />
            <label>Last Name</label>
            <span className="icon"><IonIcon icon={personOutline} /></span>
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>
          <div className="register">
            <p>Already have an account? <a href="#" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>Login</a></p>
          </div>
        </form>
      </div>
    </section>
  );
}

export default Register; 