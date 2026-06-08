import { useState } from "react";
import { API } from "../api/api";
import "./styles/LoginStyle.css";
import { useNavigate } from "react-router-dom";

export function Login() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)

    const navigate = useNavigate();

    const login = async () => {
        if (loading) return

        try {
            setLoading(true)
            const response = await API.post('login', {
                username,
                password
            })

            alert(response.data.message)

            localStorage.setItem('user', JSON.stringify(response.data.user))
            navigate('/')
            setUsername('')
            setPassword('')

        } catch (error) {
            alert(error.response?.data?.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <div className="register-page">
                <div className="register-card">
                    <h1 className="register-title">Вход</h1>

                    <p className="register-subtitle">
                        Добро пожаловать обратно
                    </p>


                    <input type="text"
                        placeholder="Имя пользователя..."
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        autoComplete="username" />

                    <input type="password"
                        placeholder="Введите пароль..."
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="current-password" />


                    <button
                        onClick={login}
                        disabled={loading || !username || !password}
                    >
                        {loading ? "Вход..." : "Войти"}
                    </button>

                    <p className="register-footer">
                        Нет аккаунта?
                        <span className="link"
                        onClick={() => navigate("/register")}>
                             Регистрация
                             </span>
                    </p>

                </div>
            </div>
        </>
    )
}