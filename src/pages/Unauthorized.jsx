import React from 'react';
import { Link } from 'react-router-dom';

function Unauthorized() {
  return (
    <div style={{ textAlign: 'center', marginTop: '2rem' }}>
      <h2>🚫 Zugriff verweigert</h2>
      <p>Du hast keine Berechtigung, diese Seite zu sehen.</p>
      <Link to="/">Zurück zur Startseite</Link>
    </div>
  );
}

export default Unauthorized;
