import { useState } from "react";
import React from "react";
function AuthorList() {
  const [authors] = useState([
    { firstname: "Ada", lastname: "Lovelace" },
    { firstname: "Alan", lastname: "Turing" }
  ]);

  return (
    <div>
      <h1>Autorenliste</h1>
      {authors.map((author, index) => (
        <div key={index}>
          <h2>{author.firstname}</h2>
          <h2>{author.lastname}</h2>
        </div>
      ))}
    </div>
  );
}

export default AuthorList;
