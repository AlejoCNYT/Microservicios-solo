const $ = (s)=>document.querySelector(s);
const status = $("#status");
const API_BASE_INPUT = $("#apiBase");

$("#send").onclick = async () => {
  const API_BASE = API_BASE_INPUT.value || "";
  const payload = {
    userId: Number($("#userId").value),
    streamId: Number($("#streamId").value),
    content: $("#content").value
  };
  try {
    const res = await fetch(`${API_BASE}/posts`, {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify(payload)
    });
    status.textContent = res.ok ? "Posted ✔" : "Error " + res.status;
  } catch (e) { status.textContent = e.message; }
};

$("#loadStream").onclick = async () => {
  const API_BASE = API_BASE_INPUT.value || "";
  const id = $("#qStreamId").value;
  const res = await fetch(`${API_BASE}/streams/${id}/posts`);
  const posts = await res.json();
  $("#feed").innerHTML = posts.map(p => `<li><b>@${p.user.username}</b>: ${p.content}</li>`).join("");
};
