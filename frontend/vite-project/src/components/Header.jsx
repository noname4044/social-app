import { Link, useNavigate } from "react-router-dom"
import "./Header.css"

export function Header() {
    const navigate = useNavigate()

    const user = JSON.parse(localStorage.getItem("user"))

    const logout = () => {
        localStorage.removeItem("user")
        navigate("/login")
    }

    return (
        <header className="header">

            <Link to="/" className="logo">
                SocialApp
            </Link>

            {user && (
                <div className="header-right">

                    <Link
                        to={`/profile/${user.id}`}
                        className="profile-link"
                    >
                        {user.username}
                    </Link>

                    <button
                        className="logout-btn"
                        onClick={logout}
                    >
                        Выйти
                    </button>

                </div>
            )}

        </header>
    )
}