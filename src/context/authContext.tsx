import React, { useEffect, useState } from 'react';
import keycloakInstance from '../hooks/keycloakInstance';

export type AuthContextProps = {
    keycloak: any | null;
    profile: any;
    userRoles: string[] | undefined
};

export const AuthContext = React.createContext<AuthContextProps>({ keycloak: null, profile: {}, userRoles: [] });

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

    const [keycloak, setKeycloak] = useState<any | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isTokenExp, setIsTokenExp] = useState<boolean>(false);
    const [profile, setProfile] = useState({});
    const [userRoles, setUserRoles] = useState<string[]>()
    console.log(keycloakInstance)

    useEffect(() => {
        const initializeKeycloak = () => {
            try {
                keycloakInstance.init({ onLoad: 'login-required', checkLoginIframe: false, silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html' })
                    .then((auth) => {
                        console.log(auth)
                        setIsTokenExp(keycloakInstance.isTokenExpired());
                        if (!auth) {
                            // window.location.reload();
                            keycloakInstance.login();
                        } else {
                            console.info("Authenticated");
                            console.log(keycloakInstance);
                            localStorage.setItem('af-token', JSON.stringify(keycloakInstance.token));
                            setIsAuthenticated(true);

                            // user role
                            setUserRoles(keycloakInstance?.realmAccess?.roles) // all roles
                            console.log(keycloakInstance)
                            console.log(keycloakInstance?.realmAccess?.roles)
                            // profile
                            keycloakInstance.loadUserProfile()
                                .then(profile =>
                                    setProfile(profile)
                                )
                                .catch(err => console.error(err))

                            //! kontrol et - token expired
                            keycloakInstance.onTokenExpired = () => {
                                console.log('token expired');
                                setIsTokenExp(true);
                                keycloakInstance.logout();
                            }
                        }
                    })
                    .catch((err) => {
                        console.log(err);
                    });
            } catch (error) {
                console.error("Authenticated Failed");
            }
        };

        if (!isAuthenticated && !isTokenExp && !keycloak) {
            initializeKeycloak();
            setKeycloak(keycloakInstance);
        }

    }, [isAuthenticated, isTokenExp, keycloak]);

    return (
        <AuthContext.Provider value={{ keycloak, profile, userRoles }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;