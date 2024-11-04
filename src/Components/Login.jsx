import React, {useState} from 'react';

export default function Login() {
    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');
    
    const handleLogin = (e) => {
        e.preventDefault();
        console.log(userName);
        console.log(password);
    }

    return (
        <form onSubmit={handleLogin}>
            <input type="text" placeholder="userName" value={userName} onChange={(e) => setUserName(e.target.value)}/>
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}/>
            <button>Login</button>
        </form>
    )
}