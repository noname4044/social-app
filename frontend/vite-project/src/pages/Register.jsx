import { useState } from "react";
import { API } from "../api/api";
import './styles/RegisterStyles.css'
import { useNavigate } from "react-router-dom";

export function Register() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)

    const navigate = useNavigate();

    const register = async () => {
        try {
            setLoading(true)
            const response = await API.post('/register', {
                username,
                password
            })
            alert(response.data.message)

            setUsername('')
            setPassword('')
            navigate('/login')
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
                    <h1 className="register-title">
                        Создать аккаунт
                    </h1>

                    <p className="register-subtitle">
                        Добро пожаловать в Social App
                    </p>

                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Имя пользователя"
                        autoComplete="username"
                    />

                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Пароль"
                        autoComplete="current-password"
                    />

                    <button onClick={register} disabled={loading || !username || !password}>
                        {loading ? "Создание..." : "Зарегистрироваться"}
                    </button>

                    <p className="register-footer">
                        Уже есть аккаунт?{" "}
                        <span className="link"
                         onClick={() => navigate("/login")}>Войти</span>
                    </p>
                </div>
            </div>
        </>
    )

}
