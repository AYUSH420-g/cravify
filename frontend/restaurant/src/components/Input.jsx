import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const Input = ({
    label,
    error,
    className,
    icon,
    ...props
}) => {
    return (
        <div className="w-full">
            {label && <label className="block text-sm font-medium text-dark mb-1.5">{label}</label>}
            <div className="relative">
                <input
                    className={twMerge(clsx(
                        'w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-dark placeholder:text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors',
                        error && 'border-error focus:border-error focus:ring-error',
                        icon && 'pl-11',
                        className
                    ))}
                    {...props}
                />
                {icon && (
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted">
                        {icon}
                    </div>
                )}
            </div>
            {error && <p className="mt-1 text-sm text-error">{error}</p>}
        </div>
    );
};

export default Input;
