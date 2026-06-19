import { Route, Routes } from "react-router-dom"
import { useContext } from "react"
import { AuthContext } from "./context/authContext"
import getRoutes from "./routes"
import Page404 from "./pages/page404"
import Login from "./pages/login"
import { Toaster } from 'react-hot-toast'
import { Spin, ConfigProvider, theme as antdTheme } from "antd"
import { useTheme } from "./context/themeContext"

const { darkAlgorithm, defaultAlgorithm } = antdTheme;

function App() {
  const { isAuthenticated, loading } = useContext(AuthContext)
  const { isDark } = useTheme();

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spin size="large" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Login />
  }

  const MENU_ROUTES = getRoutes()

  return (
    <ConfigProvider
      theme={{
        algorithm: isDark ? darkAlgorithm : defaultAlgorithm,
      }}
    >
      <Toaster position="top-right" />
      <Routes>
        {MENU_ROUTES?.map((menuElement, index) => (
          <Route key={index} path={menuElement?.path} element={menuElement?.element} />
        ))}
        <Route path="*" element={<Page404 />} />
      </Routes>
    </ConfigProvider>
  )
}

export default App