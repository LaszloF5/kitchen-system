import React, { useState } from 'react';
import axios from 'axios';

export default function DeleteUser() {
    const [userName, setUserName] = useState('');
    const [error, setError] = useState('');

    const handleDeleteUser = async (e) => {
        e.preventDefault();
        setError('');

        if (!userName) {
            setError('Invalid username.');
            return;
        }

        try {
            await axios.delete(`http://localhost:5500/delete_user/${userName}`);
            setUserName('');
            alert('User deleted successfully');
        } catch (err) {
            console.error(err);
            setError('Error deleting user');
        }
    }

    return (
        <form onSubmit={handleDeleteUser}>
            <input 
                type="text" 
                placeholder='User name' 
                value={userName} 
                onChange={(e) => setUserName(e.target.value)} 
            />
            <button type='submit'>Delete User</button>
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </form>
    );
}
