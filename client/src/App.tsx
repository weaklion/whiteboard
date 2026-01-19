import { Canvas } from "./pages/canvas";
import { socket } from './app/socket'
import { useEffect, useState } from "react";

function App() {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [replyMessage, setReplyMessage] = useState("");

  useEffect(() => {
    socket.on("connect", () => {
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    socket.on("reply", (data: string) => {
      setReplyMessage(data);
    })

  
    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("reply")
    };
  }, []);

  return (
    <>
      <Canvas />
    </>
  );
}



export default App;
