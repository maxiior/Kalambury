import React, { useRef, useEffect, useState } from "react";
import "./styles/board.css";
import TextInput from "./TextInput";
import PlayersList from "./PlayersList";
import Header from "./Header";
import MessagesList from "./MessagesList";
import { getNumberIterator } from "./Iterator";
import InfoPanel from "./InfoPanel";

const colorIterator = getNumberIterator();

const Board = ({
  gameData,
  start,
  setStart,
  catchword,
  setCatchword,
  clock,
  setClock,
  setHost,
  host,
  isDrawer,
  setIsDrawer,
  placeholder,
  setPlaceholder,
  infopanel,
  setInfopanel,
  socket,
  messages,
  setMessage,
}) => {
  const canvasRef = useRef(null);
  const colorsRef = useRef(null);

  const [players, setPlayer] = useState([]);
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
    waitForSocketConnection(socket, () => {
      socket.send(
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

  const startGame = () => {
    socket.send(
      JSON.stringify({
        type: "StartGame",
      })
    );
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

    console.log(host);

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
    const drawLine = (x0, y0, x1, y1, color, isReceived = false) => {
      if (!isReceived) {
        if (!isDrawer) {
          return;
        }
      }
      context.beginPath();
      context.moveTo(x0, y0);
      context.lineTo(x1, y1);
      context.strokeStyle = color;
      context.lineWidth = 2;
      context.stroke();
      context.closePath();
      context.save();

      const w = canvas.width;
      const h = canvas.height;

      if (!isReceived) {
        sendMessage("CanvasUpdate", {
          x0: x0 / w,
          y0: y0 / h,
          x1: x1 / w,
          y1: y1 / h,
          color,
        });
      }
    };

    const onMouseDown = (e) => {
      drawing = true;
      current.x = e.clientX || e.touches[0].clientX;
      current.y = e.clientY || e.touches[0].clientY;

      current.x = current.x - positionCanvas.left;
      current.y = current.y - positionCanvas.top;
    };

    const onMouseMove = (e) => {
      if (!drawing || !isDrawer) {
        return;
      }

      let x = e.clientX || e.touches[0].clientX;
      let y = e.clientY || e.touches[0].clientY;
      x = x - positionCanvas.left;
      y = y - positionCanvas.top;

      drawLine(current.x, current.y, x, y, current.color, false);
      current.x = x;
      current.y = y;
    };

    const onMouseUp = (e) => {
      if (!drawing) {
        return;
      }

      let x = e.clientX || e.touches[0].clientX;
      let y = e.clientY || e.touches[0].clientY;
      x = x - positionCanvas.left;
      y = y - positionCanvas.top;

      drawing = false;
      drawLine(current.x, current.y, x, y, current.color, false);
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
    canvas.addEventListener("mousemove", throttle(onMouseMove, 20), false);
    canvas.addEventListener("touchstart", onMouseDown, false);
    canvas.addEventListener("touchend", onMouseUp, false);
    canvas.addEventListener("touchcancel", onMouseUp, false);
    canvas.addEventListener("touchmove", throttle(onMouseMove, 20), false);

    const onResize = () => {
      positionCanvas = canvas.getBoundingClientRect();
    };

    window.addEventListener("resize", onResize, false);
    onResize();

    const onDrawingEvent = (data, isReceived) => {
      const w = canvas.width;
      const h = canvas.height;
      drawLine(
        data.x0 * w,
        data.y0 * h,
        data.x1 * w,
        data.y1 * h,
        data.color,
        isReceived
      );
    };

    sendMessage("ChangeUsername", { new_username: gameData.username });
    getUsersList();
    socket.onopen = (event) => {
      console.log("open", event);
    };

    socket.onmessage = (event) => {
      const id = Math.floor(Math.random() * 10000) + 1;
      const dataParsed = JSON.parse(event.data);

      switch (true) {
        case dataParsed.type === "CanvasUpdate": {
          onDrawingEvent(dataParsed, true);
          break;
        }

        case dataParsed.type === "ChatMessage": {
          const newMessage = { id, ...dataParsed };
          messages.push(newMessage);
          setMessage([...messages]);
          break;
        }

        case dataParsed.type === "GameStatus": {
          if (dataParsed.player_list !== undefined) {
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
          if (dataParsed.current_painter === gameData.username) {
            setIsDrawer(true);
          } else {
            setIsDrawer(false);
          }
          if (dataParsed.word_placeholder !== undefined && !isDrawer) {
            setPlaceholder(dataParsed.word_placeholder);
          }
          if (host === "" && dataParsed.host !== undefined) {
            setHost(dataParsed.host);
          }
          break;
        }

        case dataParsed.type === "WordToDraw": {
          setInfopanel(true);
          setCatchword(dataParsed.word);
          break;
        }

        case dataParsed.type === "ClockInfo": {
          if (dataParsed.status === "start") {
            setClock(true);
          } else {
            setClock(false);
          }
          break;
        }

        default:
          break;
      }
    };

    socket.onerror = (e) => {
      console.log("error", e);
    };
  }, []);

  return (
    <div className="main">
      <div>
        {isDrawer && catchword !== "" && infopanel === true && (
          <InfoPanel
            catchword={catchword}
            socket={socket}
            setInfopanel={setInfopanel}
          />
        )}
        <Header
          word={catchword !== "" ? catchword : placeholder}
          socket={socket}
          clock={clock}
          host={host}
          user={gameData.username}
        />
        <div className="inline">
          <div ref={colorsRef} className="colors">
            {colorsToChoose.map((color) => (
              <div
                key={colorIterator.next()}
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
                {gameData.username === host && !start && (
                  <button
                    className="start-game"
                    onClick={() => {
                      setStart(!start);
                      startGame();
                      //sendMessage("GetInfo", {});
                    }}
                  >
                    Rozpocznij grę
                  </button>
                )}
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
