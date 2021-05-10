import React, { useRef, useEffect, useState } from "react";
import "./styles/board.css";
import TextInput from "./TextInput";
import PlayersList from "./PlayersList";
import Header from "./Header";
import MessagesList from "./MessagesList";

const Board = () => {
  const canvasRef = useRef(null);
  const colorsRef = useRef(null);
  const socketRef = useRef();

  const [word, setWord] = useState({
    letters: ["s", "t", "r", "a", "ż", "a", "k"],
    show: [0, 0, 0, 0, 1, 0, 1],
  });

  const [players, setPlayer] = useState([
    {
      id: 1,
      nick: "maxiior",
      points: 250,
    },
    {
      id: 2,
      nick: "maki",
      points: 120,
    },
    {
      id: 3,
      nick: "adamus",
      points: 220,
    },
    {
      id: 4,
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

  const addMessage = (message) => {
    const id = Math.floor(Math.random() * 10000) + 1;
    const newMessage = { id, ...message };
    setMessage([...messages, newMessage]);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const test = colorsRef.current;
    const context = canvas.getContext("2d");
    let dataURL = "";
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
      dataURL = canvasRef.current.toDataURL("image/png");
      if (!send) {
        return;
      }
      const w = canvas.width;
      const h = canvas.height;
      if (socketRef.current.readyState != 0) {
        socketRef.current.send(
          JSON.stringify({
            x0: x0 / w,
            y0: y0 / h,
            x1: x1 / w,
            y1: y1 / h,
            color,
          })
        );
      }
    };

    const onMouseDown = (e) => {
      drawing = true;
      current.x = e.clientX || e.touches[0].clientX;
      current.y = e.clientY || e.touches[0].clientY;
    };

    const onMouseMove = (e) => {
      if (!drawing) {
        return;
      }
      drawLine(
        current.x,
        current.y,
        e.clientX || e.touches[0].clientX,
        e.clientY || e.touches[0].clientY,
        current.color,
        true
      );
      current.x = e.clientX || e.touches[0].clientX;
      current.y = e.clientY || e.touches[0].clientY;
    };

    const onMouseUp = (e) => {
      if (!drawing) {
        return;
      }
      drawing = false;
      drawLine(
        current.x,
        current.y,
        e.clientX || e.touches[0].clientX,
        e.clientY || e.touches[0].clientY,
        current.color,
        true
      );
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
    canvas.addEventListener("mousemove", throttle(onMouseMove, 10), false);
    canvas.addEventListener("touchstart", onMouseDown, false);
    canvas.addEventListener("touchend", onMouseUp, false);
    canvas.addEventListener("touchcancel", onMouseUp, false);
    canvas.addEventListener("touchmove", throttle(onMouseMove, 10), false);

    const onResize = () => {
      canvas.width = 600;
      canvas.length = 600;
      let img = document.createElement("img");
      img.src = dataURL;
      context.drawImage(img, 0, 0);
      context.restore();
    };

    window.addEventListener("resize", onResize, false);
    onResize();

    const onDrawingEvent = (data) => {
      const w = canvas.width;
      const h = canvas.height;
      drawLine(data.x0 * w, data.y0 * h, data.x1 * w, data.y1 * h, data.color);
    };

    var ws_scheme = window.location.protocol == "https:" ? "wss://" : "ws://";
    socketRef.current = new WebSocket(ws_scheme + window.location.host)
    socketRef.current.onopen = (e) => {
      console.log('open', e);
    }

    socketRef.current.onmessage = (e) => {
      onDrawingEvent(JSON.parse(e.data));
    };

    socketRef.current.onerror = (e) => {
      console.log("error", e);
    };
  }, []);
  return (
    <div className="main">
      <div>
        <Header seconds={60} word={word} />
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
              <div>
                <canvas ref={canvasRef} className="whiteboard" />
              </div>
              <PlayersList players={players} />
            </div>
            <TextInput onAdd={addMessage} />
            <MessagesList messages={messages} setMessage={setMessage} />
          </div>
        </div>
      </div>
    </div>
  );
};
export default Board;
