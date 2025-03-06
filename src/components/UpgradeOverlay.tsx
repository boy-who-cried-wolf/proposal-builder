
import React, { PropsWithChildren } from 'react';
import { Link } from "react-router-dom";

export const UpgradeOverlay: React.FC<PropsWithChildren<{ open?: boolean, message?: string }>> = ({ open = false, message = "The AI Assistant feature is available exclusively with our Pro plan.", children }) => {
    return <div className='relative'>
        {open ? <div className="absolute inset-0 flex flex-col items-center justify-center z-10 w-full h-full min-h-56">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/100 to-white pointer-events-none"></div>
            <div className="z-20 bg-white border-2 border-amber-500 py-3 px-6 text-center max-w-md">
                <h3 className="text-xl font-bold text-amber-800 mb-2">Upgrade Required</h3>
                <p className="mb-4 text-amber-700">
                    {message}
                </p>
            </div>

            <Link
                to="/account-settings/plan"
                className="mt-6 z-20 bg-black text-white py-2 px-4 font-semibold rounded hover:bg-black/80 transition-colors"
            >
                View Plans & Pricing
            </Link>
        </div> : null}

        {children}
    </div>;
};
