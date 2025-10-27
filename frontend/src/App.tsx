import { useEffect, useState } from "react";

type Post = { id: number; content: string; userId: number; streamId: number; createdAt: string };

export default function App() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [content, setContent] = useState("");
  const [err, setErr] = useState("");

  const load = () =>
    fetch("/api/posts")
      .then(r => { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
      .then(setPosts)
      .catch(e => setErr(String(e)));

  useEffect(() => { load(); }, []);

  const create = async () => {
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: 1, streamId: 1, content })
      });
      if (!res.ok) throw new Error("HTTP " + res.status);
      setContent("");
      await load();
    } catch (e: any) {
      setErr(e.message ?? String(e));
    }
  };

  return (
    <div style={{ fontFamily: "system-ui", padding: 16, maxWidth: 700, margin: "0 auto" }}>
      <h1>Micro posts</h1>
      <p>Backend en <code>http://localhost:8081</code> (proxy <code>/api</code>)</p>

      <div style={{ display: "flex", gap: 8 }}>
        <input
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Escribe un post (<=140)"
          maxLength={140}
          style={{ flex: 1, padding: 8 }}
        />
        <button onClick={create}>Publicar</button>
      </div>

      {err && <p style={{ color: "crimson" }}>Error: {err}</p>}

      <h2>Timeline</h2>
      <ul>
        {posts.map(p => (
          <li key={p.id}><b>#{p.id}</b> — {p.content}</li>
        ))}
      </ul>
    </div>
  );
}
