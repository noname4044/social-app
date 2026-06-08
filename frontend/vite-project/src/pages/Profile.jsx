import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { API } from "../api/api"
import "./styles/Profile.css"

export function Profile() {
    const { id } = useParams()

    const [user, setUser] = useState(null)
    const [posts, setPosts] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadProfile()
    }, [id])

    const loadProfile = async () => {
        try {
            const res = await API.get(`/profile/${id}`)

            setUser(res.data.user)
            setPosts(res.data.posts)
        } catch (err) {
            console.log(err)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return <h2 className="loading">Загрузка профиля...</h2>
    }

    return (
        <div className="profile-page">

            <div className="profile-card">

                <div className="profile-banner"></div>

                <div className="profile-avatar">
                    {user.username[0].toUpperCase()}
                </div>

                <h1>{user.username}</h1>

                <p className="profile-id">
                    ID: {user.id}
                </p>

                <div className="profile-stats">
                    <div>
                        <span>{posts.length}</span>
                        <p>Постов</p>
                    </div>

                    <div>
                        <span>
                            {posts.reduce((sum, post) => sum + post.likes, 0)}
                        </span>
                        <p>Лайков</p>
                    </div>
                </div>

            </div>

            <div className="profile-posts">

                <h2>Публикации</h2>

                {posts.length === 0 && (
                    <div className="empty">
                        Пока нет постов
                    </div>
                )}

                {posts.map(post => (
                    <div className="profile-post" key={post.id}>
                        <p>{post.content}</p>

                        <div className="likes">
                            ❤️ {post.likes}
                        </div>
                    </div>
                ))}

            </div>

        </div>
    )
}