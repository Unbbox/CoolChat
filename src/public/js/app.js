const socket = io();

const welcome = document.getElementById("welcome");
const form = welcome.querySelector("#roomForm");
const room = document.getElementById("room");

room.hidden = true;

let roomName;

function addMessage(message) {
  const ul = room.querySelector("ul");
  const li = document.createElement("li");
  li.innerText = message;
  ul.appendChild(li);
}

// 메세지 입력 시
function handleMessageSubmit(e) {
  e.preventDefault();
  const input = room.querySelector("#msg input");
  socket.emit("new_message", input.value, roomName, () => {
    addMessage(`You: ${input.value}`);
  });
}

// 닉네임 저장 시
function handleNicknameSubmit() {
  const input = form.querySelector("#name");
  socket.emit("nickname", input.value);
  input.value = "";
}

// 방 입장 후 함수
function showRoom(cnt) {
  welcome.hidden = true;
  room.hidden = false;

  const h3 = room.querySelector("h3");
  h3.innerText = `Room ${roomName} (${cnt})`;

  const msgForm = room.querySelector("#msg");
  msgForm.addEventListener("submit", handleMessageSubmit);
}

// 방 입장 버튼 누를 때
function handleRoomSubmit(e) {
  e.preventDefault();

  // 닉네임 저장
  const name = form.querySelector("#name");
  handleNicknameSubmit(name);

  const input = form.querySelector("#roomNum");

  socket.emit("enter_room", input.value, showRoom);
  roomName = input.value;
  input.value = "";
}

form.addEventListener("submit", handleRoomSubmit);

// 방에 입장 시 메세지 출력
socket.on("welcome", (user, newCount) => {
  const h3 = room.querySelector("h3");
  h3.innerText = `Room ${roomName} (${newCount})`;
  addMessage(`${user} arrived!`);
});

// 방에서 퇴장 시 메세지 출력
socket.on("bye", (left) => {
  const h3 = room.querySelector("h3");
  h3.innerText = `Room ${roomName} (${newCount})]`;
  addMessage(`${left} left ㅠㅠ`);
});

// 방에 입장 후 메세지 전송
socket.on("new_message", addMessage);

// 방이 생성될 때마다
socket.on("room_change", (rooms) => {
  const roomList = welcome.querySelector("ul");

  roomList.innerHTML = "";
  if (rooms.length === 0) {
    return;
  }

  rooms.forEach((room) => {
    const li = document.createElement("li");
    li.innerText = room;
    roomList.append(li);
  });

  const roomCnt = welcome.querySelector("span");
  console.log(rooms.length);
  roomCnt.innerText = rooms.length;
});
