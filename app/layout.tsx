import '@styles/global.css'
import React, {ReactNode} from "react";

export const metadata = {
    title: "Layout",
    description: "Layout description"
}

type RootLayoutProps = {
    children: ReactNode;
}
const RootLayout: React.FC<RootLayoutProps> = ({children}) => {
    return (
        <html lang="en">
        <body>
        <div>
            <div/>
        </div>
        <main>
            {children}
        </main>
        </body>
        </html>
    )
}
export default RootLayout;