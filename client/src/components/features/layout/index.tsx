import React from "react";
import ErrorLayout from "./Error";
import { Outlet } from 'react-router-dom';
import { GlobalLoadingLayout } from "./GlobalLoadingLayout";

const Layout: React.FC = () =>{
    
    return (
        <>
            <ErrorLayout/>
            <GlobalLoadingLayout/>
            <main>
                <Outlet/>
            </main>
        </>
    )
}

export default Layout;
export { LoadingLayout } from "./LoadingLayout";
export { GlobalLoadingLayout } from "./GlobalLoadingLayout";