import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Button from '../components/Button';
import { Store, Upload, CheckCircle } from 'lucide-react';

const VendorSignup = () => {
    const [step, setStep] = useState(1);
    const [countryCode, setCountryCode] = useState('+91');
    const [formData, setFormData] = useState({
        ownerName: '',
        email: '',
        password: '',
        phone: '',
        restaurantName: '',
        address: '',
        cuisine: '',
        fssai: '',
        role: 'restaurant_partner'
    });
    const [files, setFiles] = useState({
        fssaiCert: null,
        gstCert: null,
        menuCard: null
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        const name = e.target.name;
        
        if (!file) return;

        // Validations
        if (name === 'fssaiCert') {
            if (file.type !== 'image/png') {
                return setError('FSSAI Certificate must be a PNG image.');
            }
            if (file.size > 500 * 1024) {
                return setError('FSSAI Certificate must be less than 500 KB.');
            }
        } else if (name === 'gstCert') {
            if (file.type !== 'application/pdf') {
                return setError('GST Certificate must be a PDF.');
            }
            if (file.size > 1024 * 1024) {
                return setError('GST Certificate must be less than 1 MB.');
            }
        } else if (name === 'menuCard') {
            if (file.type !== 'application/pdf') {
                return setError('Menu Card must be a PDF.');
            }
            if (file.size > 5 * 1024 * 1024) {
                return setError('Menu Card must be less than 5 MB.');
            }
        }

        setError(''); // clear error if successful
        setFiles({ ...files, [name]: file });
    };

    const nextStep = (targetStep) => {
        setError('');
        if (targetStep === 2) {
            // Validate Step 1
            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
            if (!passwordRegex.test(formData.password)) {
                setError("Password must contain at least 8 characters, 1 uppercase, 1 lowercase, 1 number, and 1 special character.");
                return;
            }
            if (formData.phone.length < 10) {
                setError("Please enter a valid mobile number.");
                return;
            }
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if(!emailRegex.test(formData.email)) {
                setError("Please enter a valid email address.");
                return;
            }
        } else if (targetStep === 3) {
            // Validate Step 2
            if (!formData.cuisine) {
                setError("Please select a primary cuisine.");
                return;
            }
            if (!/^\d{14}$/.test(formData.fssai)) {
                setError("FSSAI License must be exactly 14 numerical digits.");
                return;
            }
        }
        setStep(targetStep);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!files.fssaiCert || !files.gstCert || !files.menuCard) {
            return setError('Please upload all required documents.');
        }

        const submitData = new FormData();
        submitData.append('ownerName', formData.ownerName);
        submitData.append('email', formData.email);
        submitData.append('password', formData.password);
        submitData.append('phone', countryCode + formData.phone);
        submitData.append('restaurantName', formData.restaurantName);
        submitData.append('address', formData.address);
        submitData.append('cuisine', formData.cuisine);
        submitData.append('fssai', formData.fssai);
        submitData.append('role', formData.role);
        
        submitData.append('fssaiCert', files.fssaiCert);
        submitData.append('gstCert', files.gstCert);
        submitData.append('menuCard', files.menuCard);

        try {
            const res = await fetch('/api/auth/register-vendor', {
                method: 'POST',
                body: submitData
            });

            const data = await res.json();
            if (res.ok) {
                alert(data.message || 'Registration submitted for approval.');
                navigate('/login');
            } else {
                setError(data.message || 'Registration failed.');
            }
        } catch (err) {
            setError('Network error occurring during upload.');
        }
    };

    return (
        <MainLayout>
            <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 bg-gray-50">
                <div className="max-w-3xl w-full space-y-8 bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                    <div className="text-center">
                        <h2 className="mt-2 text-3xl font-extrabold text-gray-900">
                            Register your Restaurant
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Partner with Cravify and grow your business securely.
                        </p>
                    </div>

                    {/* Progress Steps */}
                    <div className="flex justify-center items-center gap-4 mb-8">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 1 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'}`}>1</div>
                        <div className={`w-16 h-1 bg-gray-200 ${step >= 2 ? 'bg-primary' : ''}`}></div>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 2 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'}`}>2</div>
                        <div className={`w-16 h-1 bg-gray-200 ${step >= 3 ? 'bg-primary' : ''}`}></div>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 3 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'}`}>3</div>
                    </div>

                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        {error && <div className="text-red-500 text-sm p-4 rounded-xl bg-red-50 border border-red-100 font-medium">{error}</div>}

                        {/* Step 1: Owner Info */}
                        {step === 1 && (
                            <div className="space-y-4 animate-fadeIn">
                                <h3 className="font-bold text-lg text-gray-800">Owner Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input
                                        name="ownerName"
                                        type="text"
                                        required
                                        className="appearance-none rounded-xl block w-full px-4 py-3 border border-gray-300 focus:ring-primary focus:border-primary"
                                        placeholder="Owner Full Name"
                                        value={formData.ownerName}
                                        onChange={handleChange}
                                    />
                                    <div className="flex gap-2">
                                        <select 
                                            value={countryCode} 
                                            onChange={(e) => setCountryCode(e.target.value)}
                                            className="appearance-none rounded-xl block w-24 px-2 py-3 border border-gray-300 focus:ring-primary bg-white text-center"
                                        >
                                            <option value="+91">+91</option>
                                            <option value="+1">+1</option>
                                            <option value="+44">+44</option>
                                            <option value="+61">+61</option>
                                        </select>
                                        <input
                                            name="phone"
                                            type="tel"
                                            required
                                            className="flex-1 appearance-none rounded-xl block w-full px-4 py-3 border border-gray-300 focus:ring-primary focus:border-primary"
                                            placeholder="Mobile Number"
                                            value={formData.phone}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <input
                                        name="email"
                                        type="email"
                                        required
                                        className="appearance-none rounded-xl block w-full px-4 py-3 border border-gray-300 focus:ring-primary focus:border-primary"
                                        placeholder="Email Address"
                                        value={formData.email}
                                        onChange={handleChange}
                                    />
                                    <input
                                        name="password"
                                        type="password"
                                        required
                                        className="appearance-none rounded-xl block w-full px-4 py-3 border border-gray-300 focus:ring-primary focus:border-primary"
                                        placeholder="Create Strong Password"
                                        value={formData.password}
                                        onChange={handleChange}
                                    />
                                </div>
                                <Button type="button" variant="primary" className="w-full mt-4" onClick={() => nextStep(2)}>Next: Restaurant Details</Button>
                            </div>
                        )}

                        {/* Step 2: Restaurant Info */}
                        {step === 2 && (
                            <div className="space-y-4 animate-fadeIn">
                                <h3 className="font-bold text-lg text-gray-800">Restaurant Details</h3>
                                <div className="grid grid-cols-1 gap-4">
                                    <input
                                        name="restaurantName"
                                        type="text"
                                        required
                                        className="appearance-none rounded-xl block w-full px-4 py-3 border border-gray-300 focus:ring-primary focus:border-primary"
                                        placeholder="Restaurant Name"
                                        value={formData.restaurantName}
                                        onChange={handleChange}
                                    />
                                    <textarea
                                        name="address"
                                        required
                                        rows="3"
                                        className="appearance-none rounded-xl block w-full px-4 py-3 border border-gray-300 focus:ring-primary focus:border-primary"
                                        placeholder="Full Restaurant Address"
                                        value={formData.address}
                                        onChange={handleChange}
                                    ></textarea>
                                    <div className="grid grid-cols-2 gap-4">
                                        <select
                                            name="cuisine"
                                            required
                                            className="appearance-none rounded-xl block w-full px-4 py-3 border border-gray-300 focus:ring-primary bg-white"
                                            value={formData.cuisine}
                                            onChange={handleChange}
                                        >
                                            <option value="" disabled>Select Primary Cuisine</option>
                                            <option value="North Indian">North Indian</option>
                                            <option value="South Indian">South Indian</option>
                                            <option value="Chinese">Chinese</option>
                                            <option value="Italian">Italian</option>
                                            <option value="Mexican">Mexican</option>
                                            <option value="Fast Food">Fast Food</option>
                                            <option value="Desserts">Desserts</option>
                                        </select>
                                        <input
                                            name="fssai"
                                            type="text"
                                            required
                                            className="appearance-none rounded-xl block w-full px-4 py-3 border border-gray-300 focus:ring-primary focus:border-primary"
                                            placeholder="14-Digit FSSAI License"
                                            value={formData.fssai}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-4 mt-4">
                                    <Button type="button" variant="outline" className="w-1/2" onClick={() => nextStep(1)}>Back</Button>
                                    <Button type="button" variant="primary" className="w-1/2" onClick={() => nextStep(3)}>Next: Documents</Button>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Document Upload */}
                        {step === 3 && (
                            <div className="space-y-4 animate-fadeIn">
                                <h3 className="font-bold text-lg text-gray-800">Upload Documents</h3>
                                <p className="text-xs text-gray-500">Ensure constraints: FSSAI (PNG &lt; 500KB), GST (PDF &lt; 1MB), Menu (PDF &lt; 5MB)</p>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                                    {['FSSAI Certificate', 'GST Certificate', 'Sample Menu Card'].map((doc, idx) => {
                                        const fieldName = ['fssaiCert', 'gstCert', 'menuCard'][idx];
                                        return (
                                            <div key={doc} className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:bg-gray-50 transition-colors relative">
                                                <input
                                                    type="file"
                                                    name={fieldName}
                                                    onChange={handleFileChange}
                                                    className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                                                />
                                                <div className="flex flex-col items-center gap-2">
                                                    {files[fieldName] ? (
                                                        <CheckCircle className="text-green-500 w-8 h-8" />
                                                    ) : (
                                                        <Upload className="text-gray-400 w-8 h-8" />
                                                    )}
                                                    <span className="font-medium text-gray-700">{doc}</span>
                                                    <span className="text-xs text-gray-500">
                                                        {files[fieldName] ? files[fieldName].name : (fieldName === 'fssaiCert' ? 'PNG only' : 'PDF only')}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="flex gap-4 mt-4">
                                    <Button type="button" variant="outline" className="w-1/2" onClick={() => nextStep(2)}>Back</Button>
                                    <Button type="submit" variant="primary" className="w-1/2">Submit Application</Button>
                                </div>
                            </div>
                        )}

                        <div className="text-center mt-4">
                            <span className="text-sm text-gray-600">Already a partner? </span>
                            <Link to="/login" className="text-sm font-medium text-primary hover:text-red-700">Login here</Link>
                        </div>
                    </form>
                </div>
            </div>
        </MainLayout>
    );
};

export default VendorSignup;
