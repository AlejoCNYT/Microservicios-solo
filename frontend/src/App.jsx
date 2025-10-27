import { useEffect, useState } from "react";

export default function App() {
  const [posts, setPosts] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    fetch("/api/posts")
      .then(r => {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      })
      .then(setPosts)
      .catch(e => setErr(String(e)));
  }, []);

  return (
    <div style={{ fontFamily: "system-ui", padding: 16 }}>
      <h1>Frontend ✅</h1>
      <p>Backend: <code>http://localhost:8081</code> (proxy <code>/api</code>)</p>
      {err && <p style={{ color: "crimson" }}>Error: {err}</p>}
      <ul>
        {posts.map(p => (
          <li key={p.id}>
            <b>#{p.id}</b> — {p.content}
          </li>
        ))}
      </ul>
    </div>
  );
}
