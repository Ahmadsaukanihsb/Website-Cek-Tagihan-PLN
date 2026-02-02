import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface AdminUser {
    username: string;
    role: 'admin';
}

interface AuthContextType {
    admin: AdminUser | null;
    isAuthenticated: boolean;
    login: (username: string, password: string) => Promise<boolean>;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [admin, setAdmin] = useState<AdminUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check if admin is already logged in (from localStorage)
        const storedAdmin = localStorage.getItem('admin');
        if (storedAdmin) {
            try {
                setAdmin(JSON.parse(storedAdmin));
            } catch {
                localStorage.removeItem('admin');
            }
        }
        setIsLoading(false);
    }, []);

    const login = async (username: string, password: string): Promise<boolean> => {
        try {
            // Call API for authentication
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (data.success) {
                const adminUser: AdminUser = { username: data.admin.username, role: 'admin' };
                setAdmin(adminUser);
                localStorage.setItem('admin', JSON.stringify(adminUser));
                return true;
            }
            return false;
        } catch (error) {
            console.error('Login error:', error);
            return false;
        }
    };

    const logout = () => {
        setAdmin(null);
        localStorage.removeItem('admin');
    };

    return (
        <AuthContext.Provider
            value={{
                admin,
                isAuthenticated: !!admin,
                login,
                logout,
                isLoading,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
