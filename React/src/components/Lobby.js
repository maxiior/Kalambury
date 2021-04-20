import {React, useState} from 'react';
import './styles/lobby.css';

export default function Lobby() {

    const [userdata, setUserdata] = useState({'username': '', 'room': ''});

    const handleSubmit = e => {
        e.preventDefault();
        setUserdata({'username': userdata.username.trim(), 'room': userdata.room.trim()})
        if(userdata.room.length === 0 || userdata.username.length === 0){
            alert("Pola nazwy użytkownika i pokoju nie mogą być puste");
        }
        else{
        const request = {
            method: 'GET',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({'username': userdata.username.trim(),'room': userdata.room.trim()})
        };
        alert(JSON.stringify(request));
        // fetch('http://localhost:8000/api/room/', request)
        //     .then(response => {
        //     status = response.status;
        //     return response.json();
        //     }).then(response => {})
    }

    }

    const handleChange = e => {
        setUserdata({...userdata, [e.target.name]: e.target.value});
    }

    return (
        <div className="lobby-container">
            <div className="lobby-page">
                <form onSubmit={handleSubmit}>
                <label htmlFor="username" >Nazwa użytkownika</label>
                <input name="username" onChange={handleChange} className="text-field" type="text" size="80" /><br />
                <label htmlFor="room" >Pokój</label><br />
                <input name="room" onChange={handleChange} className="text-field" type="text" size="80" /><br />
                <button id="join-button" type="submit" className="join-button">Stwórz</button>
                </form>
            </div>
        </div>
    )
}