import { createContext, useCallback, useEffect, useState } from "react";
import { loginUser, registerUser } from "../api/auth.service";
import { getProfile } from "../api/user.service";
import { TOKEN_STORAGE_KEY } from "../api/axiosClient";

export const AuthContext = createContext(null);

const USER_KEY = "careernavi-user";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem(USER_KEY);
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  // On mount, if a token exists, refresh the profile from the backend
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!token) {
      setLoading(false);
      return;
    }
    getProfile()
      .then((res) => {
        setUser(res.data);
        localStorage.setItem(USER_KEY, JSON.stringify(res.data));
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        localStorage.removeItem(USER_KEY);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const persistSession = (data) => {
    localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    setUser(data.user);
  };

  const login = useCallback(async (credentials) => {
    const res = await loginUser(credentials);
    persistSession(res.data);
    return res.data.user;
  }, []);

  const register = useCallback(async (payload) => {
    const res = await registerUser(payload);
    persistSession(res.data);
    return res.data.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const res = await getProfile();
    setUser(res.data);
    localStorage.setItem(USER_KEY, JSON.stringify(res.data));
    return res.data;
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
