import React from "react";
import TextInput from "./TextInput";
import MessagesList from "./MessagesList";

const Chat = ({ isDrawer, addMessage, messages }) => {
  return (
    <>
      <TextInput onAdd={addMessage} isDrawer={isDrawer} />
      <MessagesList messages={messages} />
    </>
  );
};

export default Chat;
