import { useState } from "react";

function TextInput({ onAdd, isDrawer }) {
  const [text, setText] = useState("");

  const onSubmit = (e) => {
    e.preventDefault();
    if (text !== "") {
      onAdd({ text });
    }
    setText("");
  };

  return (
    <div className="in">
      <form onSubmit={onSubmit}>
        <input
          type="text"
          placeholder="Wprowadź odpowiedź..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={isDrawer}
        />
        <input type="submit" style={{ display: "none" }} />
      </form>
    </div>
  );
}

export default TextInput;
