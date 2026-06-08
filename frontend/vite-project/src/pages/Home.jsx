import { useEffect, useState } from "react";
import { API } from "../api/api";
import "./styles/HomeStyle.css";
import { Link } from "react-router-dom"


export function Home() {
    const [posts, setPosts] = useState([]);
    const [content, setContent] = useState('');

    const user = JSON.parse(localStorage.getItem("user"));

    useEffect(() => {
        loadPosts();
    }, []);

    const loadPosts = async () => {
        const res = await API.get("/posts")

        setPosts(res.data)
    }

    const createPost = async () => {

        if (!content.trim()) return;

        try {
            const res = await API.post("/posts", {
                content,
                user_id: user.id
            });

            console.log("CREATE RESPONSE:", res.data)

            setContent("");
            loadPosts();
        } catch (error) {
            console.log("CREATE ERROR:", error.response?.data || err)
        }
    };

    const likePost = async (postId) => {
        await API.post(`/posts/${postId}/like`, {
            user_id: user.id
        })

        loadPosts()
    }


    const formatDate = (date) => {
        return new Date(date).toLocaleString("ru-RU", {
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const deletePost = async (postId) => {
        await API.delete(`/posts/${postId}`, {
            data: {
                user_id: user.id
            }
        })

        loadPosts()
    }

    if (!user) return <h2>Вы не авторизованы</h2>;

    return (
        <div className="home">

            <div className="create-card">
                <div className="user-row">
                    <div className="avatar">
                        {user.username[0].toUpperCase()}
                    </div>

                    <input
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Что нового?"
                    />
                </div>

                <button onClick={createPost}>Опубликовать</button>
            </div>

            <div className="feed">
                {posts.map(post => (
                    <div className="post" key={post.id}>

                        <div className="post-header">
                            <div className="avatar small">
                                {post.username?.[0]?.toUpperCase() || "?"}
                            </div>

                            <Link
                                to={`/profile/${post.user_id}`}
                                className="author"
                            >
                                {post.username}
                            </Link>

                            {post.user_id === user.id && (
                                <button
                                    className="delete"
                                    onClick={() => deletePost(post.id)}
                                >
                                    ×
                                </button>
                            )}
                        </div>

                        <div className="content">
                            {post.content}
                        </div>

                        <div className="post-footer">

                            <div className="post-date">
                                {post.created_at
                                    ? new Date(post.created_at.replace(" ", "T"))
                                        .toLocaleString("ru-RU", {
                                            day: "numeric",
                                            month: "short",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                            timeZone: "Europe/Moscow"
                                        })
                                    : ""}
                            </div>
                            <button
                                className="like-btn"
                                onClick={() => likePost(post.id)}
                            >
                                ❤️ {post.likes || 0}
                            </button>

                        </div>

                    </div>
                ))}
            </div>

        </div>
    );
}