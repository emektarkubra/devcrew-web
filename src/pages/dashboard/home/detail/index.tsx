import { Button } from "antd"
import withLayout from "../../../../layout/withLayout"
import { useNavigate } from "react-router-dom"

const Detail = () => {
    const navigate = useNavigate()
    return (<>
        <div>
            Detail page
        </div>
        <Button onClick={() => navigate('/detail-page/inside')}>Inside</Button>
    </>)
}

export default withLayout(<Detail />)
