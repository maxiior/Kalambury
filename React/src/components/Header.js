import './styles/header.css';
import { BiTimeFive } from "react-icons/bi";

const Header = () => {
    return (
        <div className="header">
            <div className='time'>
                <div className='time-i'><BiTimeFive /></div>
                <div>60 sekund</div>
            </div>
            <div>_ _ _ _ _ _ _ _ _ _ _ _</div>
        </div>
    )
}

export default Header
