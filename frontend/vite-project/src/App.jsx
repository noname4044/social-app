import { BrowserRouter, Routes, Route } from "react-router-dom"
import { Layout } from "./components/Layout"
import { Register } from "./pages/Register"
import { Login } from "./pages/Login"
import { Home } from "./pages/Home"
import { ProtectedRoute } from "./components/ProtectedRoute"
import { Profile } from "./pages/Profile"
function App() {
    return (
        <BrowserRouter>
            <Routes>

                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                <Route element={<Layout />}>

                    <Route
                        path="/"
                        element={
                            <ProtectedRoute>
                                <Home />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/profile/:id"
                        element={
                            <ProtectedRoute>
                                <Profile />
                            </ProtectedRoute>
                        }
                    />

                </Route>

            </Routes>
        </BrowserRouter>
    )
}

export default App