import './styles/messageslist.css';

const MessagesList = ({messages, setMessage}) => {
    if(messages.length >5){
        setMessage(messages.slice(1,6))
    }
    console.log(messages)
    return (
        <div>
            {messages.slice(0).reverse().map((m) => (
                <div key={m.id} className="message">
                    <div>{m.text}</div>
                </div>
            ))}
        </div>
    )
}

export default MessagesList
