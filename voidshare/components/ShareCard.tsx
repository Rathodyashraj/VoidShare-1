"use client";
import React, { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Check, CopyIcon } from "lucide-react";
import { useSocket } from "@/context/SocketProvider";
import toast from "react-hot-toast";
import { TailSpin } from "react-loader-spinner";
import Peer from "simple-peer";
import FileUpload from "./FileUpload";
import FileUploadBtn from "./FileUploadBtn";
import FileDownload from "./FileDownload";
import ShareLink from "./ShareLink";
import { useSearchParams } from "next/navigation";

const userDetails = useSocket();
// id of user connecting with
const [partnerId, setpartnerId] = useState("");
// state of loading when connecting
const [isLoading, setisLoading] = useState(false);
// track if user id is copied on the clipboard
const [isCopied, setisCopied] = useState(false);
// checks if connection is active
const [currentConnection, setcurrentConnection] = useState(false);
// store webrtc peer ref
const peerRef = useRef<any>(null);
// current user id
const [userId, setuserId] = useState<any>();
// incoming webrtc signalling data
const [signalingData, setsignalingData] = useState<any>();
// incoming connection request
const [acceptCaller, setacceptCaller] = useState(false);
// whether to terminate call or not
const [terminateCall, setterminateCall] = useState(false);
// current file for upload
const [fileUpload, setfileUpload] = useState<any>();
// file input field ref
const fileInputRef = useRef<any>(null);
// received file
const [downloadFile, setdownloadFile] = useState<any>();
// upload/download progress tracking
const [fileUploadProgress, setfileUploadProgress] = useState<number>(0);
const [fileDownloadProgress, setfileDownloadProgress] = useState<number>(0);
const [fileNameState, setfileNameState] = useState<any>();
const [fileSending, setfileSending] = useState(false);
const [fileReceiving, setfileReceiving] = useState(false);
const [name, setname] = useState<any>();
const searchParams = useSearchParams();
// ref to a web worker
const workerRef = useRef<Worker>(null);

// function to connect the current user to the socket server
const addUserToSocketDB = () => {
    userDetails.socket.on("connect", () => {
        setuserId(userDetails.userId);
        userDetails.socket.emit("details", {
            socketId: userDetails.socket.id,
            uniqueId: userDetails.userId,
        });
    });
};

// function to copy user id
function CopyToClipboard(value: any) {
    setisCopied(true);
    toast.success("Copied");
    navigator.clipboard.writeText(value);
    setTimeout(() => {
        setisCopied(false);
    }, 3000);
}

useEffect(() => {
    // creating web worker instance
    workerRef.current = new Worker(
        new URL("../utils/worker.ts", import.meta.url)
    );

    // connecting user
    addUserToSocketDB();

    // checking url for code for connection
    if (searchParams.get("code")) {
        setpartnerId(String(searchParams.get("code")));
    }

    // incoming request listening
    userDetails.socket.on("signaling", (data: any) => {
        setacceptCaller(true);
        setsignalingData(data);
        setpartnerId(data.from);
    });

    // listens for message from web worker about file download status
    workerRef.current?.addEventListener("message", (event: any) => {
        if (event.data?.progress) {
            // updating progress
            setfileDownloadProgress(Number(event.data.progress));
        } else if (event.data?.blob) {
            setdownloadFile(event.data?.blob);
            // file receiving done
            setfileDownloadProgress(0);
            setfileReceiving(false);
        }
    });

    console.log(userDetails.socket);

    // cleanup
    return () => {
        // connection destroying
        peerRef.current?.destroy();
        if (peerRef.current) {
            setacceptCaller(false);
            setacceptCaller(false);
            userDetails.socket.off();
        }
        // end web worker
        workerRef.current?.terminate();
    };
}, []);