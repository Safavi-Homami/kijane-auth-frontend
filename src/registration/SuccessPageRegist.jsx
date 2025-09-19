import React from "react";
import { Link } from "react-router-dom";
import "@/styles/success.css"; // Optionales CSS


const SuccessPageRegist = () => {
  return (
    <div className="success-page">
      <h1>🎉 Registrierung erfolgreich!</h1>
      <p>Vielen Dank für deine Anmeldung. Du kannst dich jetzt einloggen.</p>
     <Link to="/login" className="btn-primary">
       🔐 Jetzt einloggen
     </Link>
    </div>
  );
};

export default SuccessPageRegist;
