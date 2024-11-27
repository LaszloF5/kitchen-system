import React from 'react';
import './Footer.css';
import DeleteUser from './DeleteUser';
export default function Footer ({token}) {
    return (
        <div className="footer">
          <h2>Footer</h2>
            <p>�� 2024 Kitchen System. All rights reserved.</p>
          {token === null ? '' : <DeleteUser/>}
        </div>
    )
}