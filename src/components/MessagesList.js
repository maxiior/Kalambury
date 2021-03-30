import './styles/messageslist.css';

const MessagesList = ({messages}) => {
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
