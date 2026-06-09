import express from "express"
import cors from "cors"
import db from "./db.js"
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"

const app = express()

app.use(cors({
    origin: "*"
}))

app.use(express.json())

db.prepare(`
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
)
`).run()

db.prepare(`
CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT NOT NULL,
    user_id INTEGER NOT NULL,
    likes INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
`).run()

function auth(req, res, next) {
    const token = req.headers.authorization?.split(" ")[1]

    if (!token) {
        return res.status(401).json({ message: "Нет токена" })
    }

    try {
        const decoded = jwt.verify(token, "secret_key_123")
        req.user = decoded
        next()
    } catch {
        return res.status(401).json({ message: "Неверный токен" })
    }
}


try {
    db.prepare(`
        ALTER TABLE posts
        ADD COLUMN created_at TEXT DEFAULT CURRENT_TIMESTAMP
    `).run()
} catch { }

db.prepare(`
CREATE TABLE IF NOT EXISTS likes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    UNIQUE(post_id, user_id)
)
`).run()

app.get("/", (req, res) => {
    res.json({ message: "Server OK" })
})

app.post("/register", (req, res) => {
    const { username, password } = req.body

    if (!username || !password) {
        return res.status(400).json({
            message: "Заполните все поля"
        })
    }

    const hash = bcrypt.hashSync(password, 10)

    try {
        db.prepare(`
            INSERT INTO users (username, password)
            VALUES (?, ?)
        `).run(username, hash)

        res.json({
            message: "Пользователь создан"
        })
    } catch {
        res.status(400).json({
            message: "Пользователь уже существует"
        })
    }
})

app.post("/login", (req, res) => {
    const { username, password } = req.body

    const user = db.prepare(`
        SELECT *
        FROM users
        WHERE username = ?
    `).get(username)

    if (!user) {
        return res.status(401).json({
            message: "Неверный логин или пароль"
        })
    }

    const isValid = bcrypt.compareSync(password, user.password)

    if (!isValid) {
        return res.status(401).json({
            message: "Неверный логин или пароль"
        })
    }

    const token = jwt.sign(
        { id: user.id, username: user.username },
        "secret_key_123",
        { expiresIn: "7d" }
    )

    res.json({
        message: "Вход выполнен",
        token,
        user: {
            id: user.id,
            username: user.username
        }
    })
})


app.get("/posts", (req, res) => {
    try {
        const posts = db.prepare(`
            SELECT
               posts.id,
posts.content,
posts.user_id,
posts.likes,
posts.created_at,
users.username
            FROM posts
            LEFT JOIN users
                ON posts.user_id = users.id
            ORDER BY posts.id DESC
        `).all()

        res.json(posts)
    } catch (err) {
        console.log(err)

        res.status(500).json({
            message: "Ошибка получения постов"
        })
    }
})

app.post("/posts/:id/like", auth, (req, res) => {
    const { id } = req.params
    const user_id = req.user.id

    const existingLike = db.prepare(`
        SELECT *
        FROM likes
        WHERE post_id = ? AND user_id = ?
    `).get(id, user_id)

    if (existingLike) {
        db.prepare(`
            DELETE FROM likes
            WHERE post_id = ? AND user_id = ?
        `).run(id, user_id)

        db.prepare(`
            UPDATE posts
            SET likes = likes - 1
            WHERE id = ?
        `).run(id)

        return res.json({
            liked: false
        })
    }

    db.prepare(`
        INSERT INTO likes (post_id, user_id)
        VALUES (?, ?)
    `).run(id, user_id)

    db.prepare(`
        UPDATE posts
        SET likes = likes + 1
        WHERE id = ?
    `).run(id)

    res.json({
        liked: true
    })
})

app.delete("/posts/:id", auth, (req, res) => {
    const { id } = req.params
    const user_id = req.user.id

    const post = db.prepare(`
        SELECT *
        FROM posts
        WHERE id = ?
    `).get(id)

    if (!post) {
        return res.status(404).json({
            message: "Пост не найден"
        })
    }

    if (post.user_id !== user_id) {
        return res.status(403).json({
            message: "Нет доступа"
        })
    }

    db.prepare(`
        DELETE FROM likes
        WHERE post_id = ?
    `).run(id)

    db.prepare(`
        DELETE FROM posts
        WHERE id = ?
    `).run(id)

    res.json({
        message: "Пост удалён"
    })
})

app.get("/users", (req, res) => {
    const users = db.prepare(`
        SELECT id, username
        FROM users
    `).all()

    res.json(users)
})


app.post("/posts", auth, (req, res) => {
    const { content } = req.body

    const user_id = req.user.id

    const result = db.prepare(`
        INSERT INTO posts (content, user_id)
        VALUES (?, ?)
    `).run(content, user_id)

    res.json({
        message: "Пост создан",
        id: result.lastInsertRowid
    })
})



app.get("/profile/:id", (req, res) => {
    const { id } = req.params

    const user = db.prepare(`
        SELECT id, username
        FROM users
        WHERE id = ?
    `).get(id)

    if (!user) {
        return res.status(404).json({
            message: "Пользователь не найден"
        })
    }

    const posts = db.prepare(`
        SELECT *
        FROM posts
        WHERE user_id = ?
        ORDER BY id DESC
    `).all(id)

    console.log(posts)

    res.json({
        user,
        posts
    })
})


const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})