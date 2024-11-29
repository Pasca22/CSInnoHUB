import React, {useState} from "react";
import {auth} from "@/firebaseConfig";
import Profile from "@/app/profile";
import Login from "@/app/login";
import {onAuthStateChanged} from "@firebase/auth";

export let AuthContext = React.createContext(true);

const Index = () => {

    const [isAuthenticated, setIsAuthenticated] = useState(true);

    onAuthStateChanged(auth, (user) => {
        setTimeout(() => {setIsAuthenticated(auth.currentUser != null)}, 0)
    });

    if (isAuthenticated)
        return (
            <AuthContext.Provider value={isAuthenticated}>
                <Profile/>
            </AuthContext.Provider>
        );
    return (
        <AuthContext.Provider value={isAuthenticated}>
            <Login/>
        </AuthContext.Provider>
    );
};

export default Index;