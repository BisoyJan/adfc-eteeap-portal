import type { ImgHTMLAttributes } from 'react';

export default function AppLogoIcon(props: ImgHTMLAttributes<HTMLImageElement>) {
    return (
        <img
            src="/adfc-logo.png"
            alt="ADFC Logo"
            {...props}
        />
    );
}
