import React, {useState} from 'react';
import axios from 'axios';

export default function Register() {
    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        if (userName === undefined || userName === null) {
            return;
        }
        console.log(userName);
        try {
            await axios.post('http://localhost:5500/register', {username: userName, password});
            setUserName('');
            setPassword('');
            alert('Registration successful.');
        } catch {
            console.error('Failed to register user');
             setError('Registration failed. Please try again.');
            return;
        }
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
            <button type='submit'>Register</button>
        </form>
    )

}