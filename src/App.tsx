import { Route, Routes } from "react-router-dom"
import getRoutesWithAuth from "./routes"
import { useContext } from "react"
import { AuthContext } from "./context/authContext"
import Page404 from "./pages/page404"

function App() {

  const { userRoles } = useContext(AuthContext)
  const MENU_ROUTES = getRoutesWithAuth(userRoles)

  return (
    <>
      <Routes>
        {
          MENU_ROUTES?.map((menuElement, index) => {
            return (
              <Route key={index} path={menuElement?.path} element={menuElement?.element} />
            )
          })
        }
        <Route path="*" element={<Page404 />} />
      </Routes>
    </>
  )
}

export default App