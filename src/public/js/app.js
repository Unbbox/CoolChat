const messageList = document.querySelector("ul");
const nickForm = document.querySelector("#nick");
const messageForm = document.querySelector("#message");
const socket = new WebSocket(`ws://${window.location.host}`);

function makeMessage(type, payload) {
  const msg = { type, payload };
  return JSON.stringify(msg);
}

// 서버가 열렸을 때
socket.addEventListener("open", (e) => {
  console.log("Connected to Server ✅");
});

// 서버에서 메세지 발생 시
socket.addEventListener("message", (msg) => {
  const li = document.createElement("li");
  li.innerText = msg.data;
  messageList.append(li);
});

// 서버가 닫혔을 때
socket.addEventListener("close", () => {
  console.log("Disconnected from Server ❌");
});

// 메세지 전송
function handleSubmit(e) {
  e.preventDefault();

  const input = messageForm.querySelector("input");
  socket.send(makeMessage("new_message", input.value));
  const li = document.createElement("li");
  li.innerText = `You: ${input.value}`;
  messageList.append(li);
  input.value = "";
}

// 닉네임 저장
function handleNickSubmit(e) {
  e.preventDefault();

  const input = nickForm.querySelector("input");
  socket.send(makeMessage("nickname", input.value));
  input.value = "";
}

messageForm.addEventListener("submit", handleSubmit);
nickForm.addEventListener("submit", handleNickSubmit);
