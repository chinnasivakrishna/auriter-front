import { useHMSActions } from '@100mslive/react-sdk';
import React, { useState } from 'react'
import './JoinForm.css'
const JoinForm = () => {
    const hmsActions = useHMSActions();

    const [inputValues,setInputValues]=useState({
        name: "",
        token: "",
    });

    const handelInputChange = (e) => {
        setInputValues((prevValues)=>({
            ...prevValues,
            [e.target.name]: e.target.value
        }));
    };

    const handelSubmit = async (e) =>{
        e.preventDefault();

        const {
            userName ='',
            roomCode ='',
        }=inputValues

        const authToken = await hmsActions.getAuthTokenByRoomCode({roomCode});

        try{
            await hmsActions.join({userName,authToken});
        }catch (e){
            console.error(e);
        }
    }
  return (
    <div>
        <form onSubmit={handelSubmit}>
            <h2>Join Room</h2>
            <div className="input-container">
                <input 
                type="text"
                id="name" 
                name="name" 
                placeholder='Your Name' 
                value={inputValues.name}
                onChange={handelInputChange}
                required/>
            </div>
            <div className="input-container">
                <input
                type="text" 
                id="room-code" 
                name="roomCode" 
                placeholder='Room Code' 
                onChange={handelInputChange}
                required/>
            </div>
            <div className="button-container">
                <button className='Join-btn' type='submit'>Join Now</button>
            </div>
        </form>
    </div>
  )
}

export default JoinForm