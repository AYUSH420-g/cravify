import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { Upload, CheckCircle } from 'lucide-react';

const RiderSignup = () => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        city: 'Ahmedabad',
        vehicleType: 'Bike',
        vehicleNumber: '',
        role: 'delivery_partner'
    });
    const [files, setFiles] = useState({
        license: null,
        rc: null,
        aadhar: null
    });
    const [error, setError] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setFiles({ ...files, [e.target.name]: e.target.files[0] });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Mock registration logic - in real app, we would upload files here
        const res = await register(formData.name, formData.email, formData.password, formData.role);

        if (res.success) {
            // Simulate redirect to dashboard (or approval pending screen)
            navigate('/delivery/dashboard');
        } else {
            setError(res.message);
        }
    };

    return (
        <MainLayout>
            <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
                <div className="max-w-2xl w-full space-y-8 bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                    <div className="text-center">
                        <h2 className="mt-2 text-3xl font-extrabold text-gray-900">
                            Join Cravify Delivery Fleet
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Complete the steps below to start earning.
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
                        {error && <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">{error}</div>}

                        {/* Step 1: Personal Info */}
                        {step === 1 && (
                            <div className="space-y-4 animate-fadeIn">
                                <h3 className="font-bold text-lg text-gray-800">Personal Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input
                                        name="name"
                                        type="text"
                                        required
                                        className="appearance-none rounded-xl block w-full px-4 py-3 border border-gray-300 focus:ring-primary focus:border-primary"
                                        placeholder="Full Name"
                                        value={formData.name}
                                        onChange={handleChange}
                                    />
                                    <input
                                        name="phone"
                                        type="tel"
                                        required
                                        className="appearance-none rounded-xl block w-full px-4 py-3 border border-gray-300 focus:ring-primary focus:border-primary"
                                        placeholder="Phone Number"
                                        value={formData.phone}
                                        onChange={handleChange}
                                    />
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
                                        placeholder="Create Password"
                                        value={formData.password}
                                        onChange={handleChange}
                                    />
                                    <input
                                        name="city"
                                        type="text"
                                        required
                                        className="appearance-none rounded-xl block w-full px-4 py-3 border border-gray-300 focus:ring-primary focus:border-primary"
                                        placeholder="City"
                                        value={formData.city}
                                        onChange={handleChange}
                                    />
                                </div>
                                <Button type="button" variant="primary" className="w-full mt-4" onClick={() => setStep(2)}>Next: Vehicle Details</Button>
                            </div>
                        )}

                        {/* Step 2: Vehicle Info */}
                        {step === 2 && (
                            <div className="space-y-4 animate-fadeIn">
                                <h3 className="font-bold text-lg text-gray-800">Vehicle Details</h3>
                                <div className="grid grid-cols-1 gap-4">
                                    <select
                                        name="vehicleType"
                                        className="appearance-none rounded-xl block w-full px-4 py-3 border border-gray-300 focus:ring-primary focus:border-primary bg-white"
                                        value={formData.vehicleType}
                                        onChange={handleChange}
                                    >
                                        <option value="Bike">Motorcycle / Bike</option>
                                        <option value="Scooter">Scooter</option>
                                        <option value="Cycle">Bicycle (Short distance)</option>
                                    </select>
                                    <input
                                        name="vehicleNumber"
                                        type="text"
                                        required
                                        className="appearance-none rounded-xl block w-full px-4 py-3 border border-gray-300 focus:ring-primary focus:border-primary"
                                        placeholder="Vehicle Registration Number (e.g. GJ-01-AB-1234)"
                                        value={formData.vehicleNumber}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="flex gap-4 mt-4">
                                    <Button type="button" variant="outline" className="w-1/2" onClick={() => setStep(1)}>Back</Button>
                                    <Button type="button" variant="primary" className="w-1/2" onClick={() => setStep(3)}>Next: Documents</Button>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Document Upload */}
                        {step === 3 && (
                            <div className="space-y-4 animate-fadeIn">
                                <h3 className="font-bold text-lg text-gray-800">Upload Documents</h3>
                                <div className="grid grid-cols-1 gap-4">
                                    {['Drivers License', 'Vehicle Registration (RC)', 'Aadhar Card'].map((doc, idx) => {
                                        const fieldName = ['license', 'rc', 'aadhar'][idx];
                                        return (
                                            <div key={doc} className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:bg-gray-50 transition-colors relative">
                                                <input
                                                    type="file"
                                                    name={fieldName}
                                                    onChange={handleFileChange}
                                                    className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                                                    accept="image/*,.pdf"
                                                />
                                                <div className="flex flex-col items-center gap-2">
                                                    {files[fieldName] ? (
                                                        <CheckCircle className="text-green-500 w-8 h-8" />
                                                    ) : (
                                                        <Upload className="text-gray-400 w-8 h-8" />
                                                    )}
                                                    <span className="font-medium text-gray-700">{doc}</span>
                                                    <span className="text-xs text-gray-500">
                                                        {files[fieldName] ? files[fieldName].name : 'Click to upload (Image or PDF)'}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="flex gap-4 mt-4">
                                    <Button type="button" variant="outline" className="w-1/2" onClick={() => setStep(2)}>Back</Button>
                                    <Button type="submit" variant="primary" className="w-1/2">Submit Application</Button>
                                </div>
                            </div>
                        )}

                        <div className="text-center mt-4">
                            <span className="text-sm text-gray-600">Already a partner? </span>
                            <Link to="/delivery/login" className="text-sm font-medium text-primary hover:text-red-700">Login here</Link>
                        </div>
                    </form>
                </div>
            </div>
        </MainLayout>
    );
};

export default RiderSignup;
