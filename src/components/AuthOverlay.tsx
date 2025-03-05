
import React, { PropsWithChildren } from 'react';
import { Link } from "react-router-dom";

export const AuthOverlay: React.FC<PropsWithChildren<{ open?: boolean }>> = ({ open = false, children }) => {
    return <div className='relative'>
        {open ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10 w-full h-full">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/70 to-white pointer-events-none"></div>
                <div className="z-20 bg-white border-2 border-black py-3 px-6 text-center">
                    <h3 className="text-xl font-bold">SIGN IN OR LOGIN TO CONTINUE</h3>
                </div>

                <Link
                    to="/auth"
                    className="mt-6 z-20 bg-black text-white py-2 px-4 font-semibold rounded hover:bg-black/80 transition-colors"
                >
                    Sign In / Create Account
                </Link>
            </div>
        ) : null}

        {children}
    </div>;
};
