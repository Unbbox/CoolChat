import http from "http";
// socket.io 추가
import { Server } from "socket.io";
import { instrument } from "@socket.io/admin-ui";
import path from "path";
import express from "express";

const __dirname = path.resolve();

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/src/views");
// public 폴더 접근
app.use("/public", express.static(__dirname + "/src/public"));

app.get("/", (_, res) => res.render("home"));
app.get("/*", (_, res) => res.redirect("/"));

const handleListen = () => console.log(`Listening on http://localhost:3000`);

// http와 socketIO 동시 실행
const httpServer = http.createServer(app);
// socketIO 서버 생성
const wsServer = new Server(httpServer, {
  cors: {
    origin: ["https://admin.socket.io"],
    credentials: true,
  },
});

// admin-ui를 위한 instrument 설정
instrument(wsServer, {
  auth: false,
  mode: "development",
});

// 현재 생성된 방 찾기
function publicRooms() {
  const {
    sockets: {
      adapter: { sids, rooms },
    },
  } = wsServer;

  const publicRooms = [];
  rooms.forEach((_, key) => {
    if (sids.get(key) === undefined) {
      publicRooms.push(key);
    }
  });
  return publicRooms;
}

// 입장한 방에 있는 사람 수 카운트
function countRoom(roomName) {
  return wsServer.sockets.adapter.rooms.get(roomName)?.size;
}

wsServer.on("connection", (socket) => {
  socket["nickname"] = "Anonymous";

  // 소켓 이벤트 발생 시 어떤 이벤트인지 출력
  socket.onAny((e) => {
    console.log(wsServer.sockets.adapter);
    console.log(`Socket Event: ${e}`);
  });

  // 방 입장 시
  socket.on("enter_room", (roomName, done) => {
    socket.join(roomName);
    done(countRoom(roomName));
    socket.to(roomName).emit("welcome", socket.nickname, countRoom(roomName));
    wsServer.sockets.emit("room_change", publicRooms());
  });

  // 방에서 나갈 때
  socket.on("disconnecting", () => {
    socket.rooms.forEach((room) => socket.to(room).emit("bye", socket.nickname, countRoom(room) - 1));
  });

  // 방에서 나가고 나서
  socket.on("disconnect", () => {
    wsServer.sockets.emit("room_change", publicRooms());
  });

  // 새로운 메세지 입력 시
  socket.on("new_message", (msg, room, done) => {
    socket.to(room).emit("new_message", `${socket.nickname}: ${msg}`);
    done();
  });

  // 닉네임 저장 시
  socket.on("nickname", (nickname) => (socket["nickname"] = nickname));
});

// SOCKET IO로 변경
// const sockets = [];
// wss.on("connection", (socket) => {
//   sockets.push(socket);
//   socket["nickname"] = "익명";
//   console.log("Connected to Browser ✅");

//   // 브라우저가 종료되었을 때 출력
//   socket.on("close", () => {
//     console.log("Disconnected from Browser ❌");
//   });

//   // 브라우저가 메세지 입력 시 입력된 메세지 전송
//   socket.on("message", (msg) => {
//     const message = JSON.parse(msg);

//     switch (message.type) {
//       case "new_message":
//         sockets.forEach((aSocket) => aSocket.send(`${socket.nickname}: ${message.payload}`));
//         break;
//       case "nickname":
//         socket["nickname"] = message.payload;
//         break;
//     }
//   });
// });

httpServer.listen(3000, handleListen);
