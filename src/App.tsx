import { Route, Routes } from "react-router-dom"
import { useContext } from "react"
import { AuthContext } from "./context/authContext"
import getRoutes from "./routes"
import Page404 from "./pages/page404"
import Login from "./pages/login"
import { Toaster } from 'react-hot-toast'

function App() {
  const { isAuthenticated } = useContext(AuthContext)

  if (!isAuthenticated) {
    return <Login />
  }

  const MENU_ROUTES = getRoutes()


  return (<>
    <Toaster position="top-right" />
    <Routes>
      {MENU_ROUTES?.map((menuElement, index) => (
        <Route key={index} path={menuElement?.path} element={menuElement?.element} />
      ))}
      <Route path="*" element={<Page404 />} />
    </Routes>
  </>)
}

export default App