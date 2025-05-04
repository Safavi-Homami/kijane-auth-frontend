import { useState } from "react";
import '../ArrayMethodsDemo.css';

const users = [
  { id: 1, name: "Ada", age: 30 },
  { id: 2, name: "Alan", age: 25 },
  { id: 3, name: "Grace", age: 35 }
];

export default function ArrayMethodsDemo() {
  const [result, setResult] = useState([]);

  const handleMap = () => {
    const names = users.map(user => user.name);
    setResult(names);
  };

  const handleFind = () => {
    const user = users.find(u => u.id === 2);
    setResult([user]);
  };

  const handleFilter = () => {
    const adults = users.filter(u => u.age >= 30);
    setResult(adults);
  };

  return (
    <div className="card">
      <h2>Array Methoden: Demo</h2>
      <button onClick={handleMap}>Namen anzeigen (map)</button>
      <button onClick={handleFind}>Finde ID 2 (find)</button>
      <button onClick={handleFilter}>Nur Erwachsene (filter)</button>

      <pre>{JSON.stringify(result, null, 2)}</pre>
    </div>
  );
}
