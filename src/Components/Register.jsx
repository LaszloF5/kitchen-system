import React, {useState} from 'react';

export default function Register() {
    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');

    const handleRegister = (e) => {
        e.preventDefault();
        
    }

    return (
        <form onSubmit={handleRegister}>
            <input type="text" 
                   name="userName" 
                   id="userNameId" 
                   placeholder='Username' 
                   value={userName} onChange={(e) => setUserName(e.target.value)}/>
            <input type="password"
                    name="password" 
                    id="passwordId" 
                    placeholder='Password'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}/>
        </form>
    )

}