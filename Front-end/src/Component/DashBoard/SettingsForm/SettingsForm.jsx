import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import StyleSettingsForm from './SettingsForm.module.css';
import passEye from '../../../assets/passEye.svg';
import { Url } from '../../../Utils/Url';
import { useDispatch } from 'react-redux';
import { toggleLoader } from '../../../redux/slice';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const SettingsForm = () => {
    const baseUrl = Url();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        _id: localStorage.getItem('id'),
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    const dispatch = useDispatch();

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [formSubmitted, setFormSubmitted] = useState(false);

    const [errors, setErrors] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        try {
            const response = await axios.get(`${baseUrl}/api/users/${formData._id}`, {
                headers: {
                    'Authorization': localStorage.getItem('token')
                }
            });
            setFormData((prevData) => ({
                ...prevData,
                name: response.data.name,
                email: response.data.email,
            }));
        } catch (error) {
            console.error('Error fetching user data:', error);
            toast.error('Error fetching user data');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: value }));

        let errorMessage = '';
        if (name === 'name') {
            errorMessage = value.trim() === '' ? 'Name is required' : '';
        } else if (name === 'email') {
            errorMessage = value.trim() === '' ? 'Email is required' : '';
        } else if (name === 'password') {
            errorMessage = value.length < 8 ? 'Password must be at least 8 characters long' : '';
        } else if (name === 'confirmPassword') {
            errorMessage = value !== formData.password ? 'Passwords do not match' : '';
        }

        setErrors((prevErrors) => ({ ...prevErrors, [name]: errorMessage }));
    };

    const handleTogglePassword = () => {
        setShowPassword((prevShowPassword) => !prevShowPassword);
    };

    const handleToggleConfirmPassword = () => {
        setShowConfirmPassword((prevShowConfirmPassword) => !prevShowConfirmPassword);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormSubmitted(true);

        if (!validateForm()) {
            return;
        }

        dispatch(toggleLoader());
        try {
            const response = await axios.post(`${baseUrl}/api/users/update`, formData, {
                headers: {
                    'Authorization': localStorage.getItem('token')
                }
            });
            localStorage.removeItem('token');
            localStorage.removeItem('id');
            localStorage.removeItem('name');
            localStorage.removeItem('email');
            dispatch(toggleLoader());
            toast.success('Updated successfully! Logging out...');
            setTimeout(() => {
                navigate('/');
            }, 2000); // Wait for 2 seconds before redirecting
        } catch (error) {
            console.error('Error updating settings:', error.response.data);
            toast.error('Error updating settings');
            dispatch(toggleLoader());
        }
    };

    const validateForm = () => {
        let isValid = true;
        const newErrors = {};

        if (formData.name.trim() === '') {
            newErrors.name = 'Name is required';
            isValid = false;
        }

        if (formData.email.trim() === '') {
            newErrors.email = 'Email is required';
            isValid = false;
        }

        if (formData.password.length > 0 && formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters long';
            isValid = false;
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    return (
        <div className={StyleSettingsForm.register}>
            <form onSubmit={handleSubmit}>
                <div>
                    <input
                        className={StyleSettingsForm.inputName}
                        type="text"
                        name="name"
                        placeholder="Name"
                        value={formData.name}
                        onChange={handleChange}
                    />
                </div>
                {formSubmitted && <span className={StyleSettingsForm.error}>{errors.name}</span>}
                <br />
                <div>
                    <input
                        className={StyleSettingsForm.inputEmail}
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleChange}
                    />
                </div>
                {formSubmitted && <span className={StyleSettingsForm.error}>{errors.email}</span>}
                <br />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', flexWrap: 'nowrap' }}>
                    <input
                        className={StyleSettingsForm.inputPassword}
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                    />
                    <img
                        src={passEye}
                        alt={showPassword ? 'Hide Password' : 'Show Password'}
                        className={StyleSettingsForm.passwordIcon}
                        onClick={handleTogglePassword}
                        style={{ position: 'relative', left: '-40px' }}
                    />
                </div>
                {formSubmitted && <span className={StyleSettingsForm.error}>{errors.password}</span>}
                <br />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', flexWrap: 'nowrap' }}>
                    <input
                        className={StyleSettingsForm.inputPassword}
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        placeholder="Confirm Password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                    />
                    <img
                        src={passEye}
                        alt={showConfirmPassword ? 'Hide Confirm Password' : 'Show Confirm Password'}
                        className={StyleSettingsForm.passwordIcon}
                        onClick={handleToggleConfirmPassword}
                        style={{ position: 'relative', left: '-40px' }}
                    />
                </div>
                {formSubmitted && <span className={StyleSettingsForm.error}>{errors.confirmPassword}</span>}
                <br />
                <button type="submit" className={StyleSettingsForm.updateButton}>
                    Update
                </button>
            </form>
            <ToastContainer />
        </div>
    );
};

export default SettingsForm;
