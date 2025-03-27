"use client";
import { customAlphabet, nanoid } from "nanoid";
import React, {
  createContext,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import { io } from "socket.io-client";
import { Socket } from "socket.io-client/debug";

const SocketContext = createContext({});

export const useSocket = () => {
  const socket = useContext(SocketContext);
  return socket;
};

export const SocketProvider = ({ children }) => {
  const socket = useMemo(() => {
    return io(String(process.env.NEXT_PUBLIC_SOCKET_SERVER_URL));
  }, []);
  const [peerState, setpeerState] = useState();
  const [SocketId, setSocketId] = useState(socket);
  const userId = useMemo(() => {
    return nanoid(10);
  }, []);
  return (
    <SocketContext.Provider
      value={{ socket, userId, SocketId, setSocketId, peerState, setpeerState }}
    >
      {children}
    </SocketContext.Provider>
  );
};