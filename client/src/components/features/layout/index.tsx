import React from "react";
import ErrorLayout from "./Error";
import { Outlet } from 'react-router-dom';

const Layout: React.FC = () =>{
    
    return (
        <>
            <ErrorLayout/>
            <main>
                <Outlet/>
            </main>
        </>
    )
}

export default Layout;