import React, { useRef, useEffect, useState } from "react";
import "./styles/board.css";
import TextInput from "./TextInput";
import PlayersList from "./PlayersList";
import Header from "./Header";
import MessagesList from "./MessagesList";
import { getNumberIterator } from "./Iterator";

const Board = ({ gameData, start, setStart, drawing }) => {
  const canvasRef = useRef(null);
  const colorsRef = useRef(null);
  const socketRef = useRef();

  const [word, setWord] = useState({
    letters: ["s", "t", "r", "a", "ż", "a", "k"],
    show: [0, 0, 0, 0, 1, 0, 1],
  });

  const [players, setPlayer] = useState([
    {
      id: 10,
      nick: "maxiior",
      points: 220,
    },
    {
      id: 20,
      nick: "maki",
      points: 120,
    },
    {
      id: 30,
      nick: "adamus",
      points: 220,
    },
    {
      id: 40,
      nick: "izz",
      points: 190,
    },
  ]);

  const [messages, setMessage] = useState([]);
  const [selectedColor, setSelectedColor] = useState("s-color black");
  const colorsToChoose = [
    "red",
    "green",
    "blue",
    "yellow",
    "orange",
    "pink",
    "purple",
    "gray",
    "black",
  ];

  const sendMessage = (type, message) => {
    waitForSocketConnection(socketRef.current, () => {
      socketRef.current.send(
        JSON.stringify({
          type: type,
          ...message,
        })
      );
    });
  };

  const addMessage = (message) => {
    sendMessage("ChatMessage", { Message: message.text });
  };

  const waitForSocketConnection = (socket, callback) => {
    setTimeout(() => {
      if (socket.readyState === 1) {
        if (callback !== null) {
          callback();
        }
      } else {
        waitForSocketConnection(socket, callback);
      }
    }, 5);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    let positionCanvas = canvas.getBoundingClientRect();
    const context = canvas.getContext("2d");
    const colors = document.getElementsByClassName("color");
    const current = {
      color: "black",
    };
    const onColorUpdate = (e) => {
      current.color = e.target.className.split(" ")[1];
    };
    for (let i = 0; i < colors.length; i++) {
      colors[i].addEventListener("click", onColorUpdate, false);
    }

    const getUsersList = () => {
      sendMessage("CanvasUpdate", {});
    };

    let drawing = false;
    const drawLine = (x0, y0, x1, y1, color, send) => {
      context.beginPath();
      context.moveTo(x0, y0);
      context.lineTo(x1, y1);
      context.strokeStyle = color;
      context.lineWidth = 2;
      context.stroke();
      context.closePath();
      context.save();
      if (!send) {
        return;
      }
      const w = canvas.width;
      const h = canvas.height;

      sendMessage("CanvasUpdate", {
        x0: x0 / w,
        y0: y0 / h,
        x1: x1 / w,
        y1: y1 / h,
        color,
      });
    };

    const onMouseDown = (e) => {
      drawing = true;
      current.x = e.clientX || e.touches[0].clientX;
      current.y = e.clientY || e.touches[0].clientY;

      current.x = current.x - positionCanvas.left;
      current.y = current.y - positionCanvas.top;
    };

    const onMouseMove = (e) => {
      if (!drawing) {
        return;
      }

      //let positionCanvas = canvas.getBoundingClientRect();
      let x = e.clientX || e.touches[0].clientX;
      let y = e.clientY || e.touches[0].clientY;
      x = x - positionCanvas.left;
      y = y - positionCanvas.top;

      drawLine(current.x, current.y, x, y, current.color, true);
      current.x = x;
      current.y = y;
    };

    const onMouseUp = (e) => {
      if (!drawing) {
        return;
      }

      //let positionCanvas = canvas.getBoundingClientRect();
      let x = e.clientX || e.touches[0].clientX;
      let y = e.clientY || e.touches[0].clientY;
      x = x - positionCanvas.left;
      y = y - positionCanvas.top;

      drawing = false;
      drawLine(current.x, current.y, x, y, current.color, true);
    };

    const throttle = (callback, delay) => {
      let previousCall = new Date().getTime();
      return function () {
        const time = new Date().getTime();
        if (time - previousCall >= delay) {
          previousCall = time;
          callback.apply(null, arguments);
        }
      };
    };

    canvas.addEventListener("mousedown", onMouseDown, false);
    canvas.addEventListener("mouseup", onMouseUp, false);
    canvas.addEventListener("mouseout", onMouseUp, false);
    //canvas.addEventListener("mousemove", onMouseMove, false);
    canvas.addEventListener("mousemove", throttle(onMouseMove, 20), false);
    canvas.addEventListener("touchstart", onMouseDown, false);
    canvas.addEventListener("touchend", onMouseUp, false);
    canvas.addEventListener("touchcancel", onMouseUp, false);
    //canvas.addEventListener("touchmove", onMouseMove, false);
    canvas.addEventListener("touchmove", throttle(onMouseMove, 20), false);

    const onResize = () => {
      positionCanvas = canvas.getBoundingClientRect();
      //canvas.width = 600;
      //canvas.length = 600;
      //let img = document.createElement("img");
      //img.src = dataURL;
      //context.drawImage(img, 0, 0);
      //context.restore();
    };

    window.addEventListener("resize", onResize, false);
    onResize();

    const onDrawingEvent = (data) => {
      const w = canvas.width;
      const h = canvas.height;
      drawLine(
        data.x0 * w,
        data.y0 * h,
        data.x1 * w,
        data.y1 * h,
        data.color,
        false
      );
      //drawLine(0, 0, 100, 100, data.color, false);
    };

    let ws_scheme = window.location.protocol === "https:" ? "wss://" : "ws://";
    socketRef.current = new WebSocket(
      `${ws_scheme}${window.location.hostname}:8000/ws/room/${gameData.room}/`
    );

    sendMessage("ChangeUsername", { new_username: gameData.username });
    getUsersList();
    socketRef.current.onopen = (e) => {
      console.log("open", e);
    };

    socketRef.current.onmessage = (e) => {
      //onDrawingEvent(JSON.parse(e.data));
      //console.log(e.data)
      const id = Math.floor(Math.random() * 10000) + 1;
      const dataParsed = JSON.parse(e.data);

      if (dataParsed.type === "CanvasUpdate") {
        console.log(e.data);
        console.log("Received CanvasUpdate");
        onDrawingEvent(dataParsed);
      }

      if (dataParsed.type === "ChatMessage") {
        console.log("Received chat message");
        console.log(dataParsed);
        const newMessage = { id, ...dataParsed };
        messages.push(newMessage);
        setMessage([...messages]);
      }

      if (dataParsed.type === "GameStatus") {
        Object.keys(dataParsed.player_list).map((user, value) => {
          const newPlayer = {
            id: getNumberIterator().next(),
            nick: user,
            points: dataParsed.player_list[user],
          };
          if (!players.some((player) => player.nick === user)) {
            players.push(newPlayer);
            setPlayer([...players]);
          }
        });
      }
    };

    socketRef.current.onerror = (e) => {
      console.log("error", e);
    };
  }, []);

  return (
    <div className="main">
      <div>
        <Header word={word} socketRef={socketRef} drawing={drawing} />
        <div className="inline">
          <div ref={colorsRef} className="colors">
            {colorsToChoose.map((color) => (
              <div
                className={`color ${color}`}
                onClick={() => setSelectedColor(`s-color ${color}`)}
              />
            ))}

            <div className="selected-color">Color</div>
            <div className={selectedColor} />
          </div>
          <div>
            <div className="inline">
              <div className="cboard">
                <canvas
                  ref={canvasRef}
                  className="whiteboard"
                  width="600"
                  height="600"
                />
                <button
                  className={`start-game ${start && "start-game-on"}`}
                  onClick={() => setStart(!start)}
                >
                  Rozpocznij grę
                </button>
              </div>
              <PlayersList players={players} />
            </div>
            <TextInput onAdd={addMessage} />
            <MessagesList messages={messages} />
          </div>
        </div>
      </div>
    </div>
  );
};
export default Board;
