import { Button } from "antd"
import withLayout from "../../../layout/withLayout"
import { useNavigate } from "react-router-dom"

const Home = () => {
    const navigate = useNavigate()
    return (
        <>
            <div>
                Home Page
            </div> 
            <Button onClick={() => navigate('/detail-page')}>detail e git</Button>
        </>)

}

export default withLayout(<Home />)