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
import { PeerHandler } from "../webRTC/peer"; // Import the PeerHandler class
import FileUpload from "./FileUpload";
import FileUploadBtn from "./FileUploadBtn";
import FileDownload from "./FileDownload";
import ShareLink from "./ShareLink";
import { useSearchParams } from "next/navigation";
import crypto from "crypto"; // For AES & RSA encryption
import { AES256 } from "../lib/aes"; // AES encryption helper
import { DigitalSignature } from "../lib/signature"; // Digital signature helper

const ShareCard = () => {
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
    const [totalFileSize, setTotalFileSize] = useState<number>(0);
    // ref to a web worker
    const workerRef = useRef<Worker>(null);
    const peerInstance = useRef<PeerHandler | null>(null); // Ref to PeerHandler instance

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

        // Initialize PeerHandler instance
        peerInstance.current = new PeerHandler();

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

    // initiating webrtc connection
    const callUser = () => {
        const peer = new PeerHandler();
        peerRef.current = peer;

        peer.initiateConnection(true, {
            iceServers: [
                {
                    urls: "turn:openrelay.metered.ca:80",
                    username: "openrelayproject",
                    credential: "openrelayproject",
                },
                {
                    urls: "turn:numb.viagenie.ca",
                    credential: "muazkh",
                    username: "webrtc@live.com",
                },
            ],
        }, (data) => {
            userDetails.socket.emit("send-signal", {
                from: userDetails.userId,
                signalData: data,
                to: partnerId,
            });
        });

        //receive accept signal via socket
        userDetails.socket.on("callAccepted", (data: any) => {
            peer.signal(data.signalData);
            setisLoading(false);
            setcurrentConnection(true);
            setterminateCall(true);
            toast.success(`Successful connection with ${partnerId}`);
            userDetails.setpeerState(peer);
        });

        peer.on("close", () => {
            // Handle the disconnection
            setpartnerId("");
            setcurrentConnection(false);
            toast.error(`${partnerId} disconnected`);
            setfileUpload(false);
            setterminateCall(false);
            setpartnerId("");
            userDetails.setpeerState(undefined);
        });

        peer.on("error", (err) => {
            console.log(err);
        });

        // Listen for incoming file data
        peer.onData(handleReceivingData);
    };

    // accepting webrtc connection
    const acceptUser = () => {
        const peer = new PeerHandler();
        peerRef.current = peer;

        peer.initiateConnection(false, {}, (data) => {
            userDetails.socket.emit("accept-signal", {
                signalData: data,
                to: partnerId,
            });
            setcurrentConnection(true);
            setacceptCaller(false);
            setterminateCall(true);
            toast.success(`Successful connection with ${partnerId}`);
        });

        //verify the signal of the caller
        peer.signal(signalingData.signalData);

        peer.on("close", () => {
            // Handle the disconnection
            setpartnerId("");
            setcurrentConnection(false);
            toast.error(`${partnerId} disconnected`);
            setfileUpload(false);
            setterminateCall(false);
            setpartnerId("");
            userDetails.setpeerState(undefined);
        });

        peer.on("error", (err) => {
            console.log(err);
        });
    };

    // connecting to peer
    const handleConnectionMaking = () => {
        setisLoading(true);

        // correct peer id check
        if (partnerId && partnerId.length == 10) {
            callUser();
        } else {
            setisLoading(false);
            toast.error("Enter correct Peer's Id");
        }
    };

    const handleFileUploadBtn = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = (e: any) => {
        setfileUpload(e.target.files);
    };

    async function handleReceivingData(data: any) {
        if (data.encryptedKey) {
            // Decrypt AES key using RSA private key
            const decryptedKey = userDetails.rsa.decryptSessionKey(Buffer.from(data.encryptedKey, "base64"));
            const iv = Buffer.from(data.iv, "base64");
            setfileNameState(data.fileName);
            setname(data.fileName);

            // Set the decrypted AES key and IV in the web worker
            workerRef.current?.postMessage({
                status: "setKey",
                aesKey: decryptedKey.toString("base64"),
                iv: iv.toString("base64"),
            });
        } else if (data.chunk) {
            // Send the chunk to the web worker for decryption
            workerRef.current?.postMessage({ chunk: data.chunk });
            setfileDownloadProgress(prev => prev + (data.chunk.length / totalFileSize) * 100);
        } else if (data.done) {
            // Signal the web worker to assemble the final file
            workerRef.current?.postMessage({ status: "download" });
            setfileDownloadProgress(100);
            setfileReceiving(false);
            toast.success("File received successfully!");
        }
    }

    // after user clicks the upload button
    const handleWebRTCUpload = async () => {
        try {
            const peer = peerRef.current;
            const file = fileUpload[0];
            if (!peer || !file) {
                throw new Error("Peer connection or file is missing");
            }

            peer.sendFile(file, userDetails.peerPublicKey, (progress: number) => {
                setfileUploadProgress(progress);
                if (progress === 100) {
                    setfileSending(false);
                    toast.success("File sent successfully!");
                }
            });
        } catch (error) {
            console.error("Error in handleWebRTCUpload:", error);
            toast.error("Failed to upload file. Please try again.");
        }
    };

    return (
        <>
            <Card className="sm:max-w-[450px] max-w-[95%]">
                {/* <CardHeader></CardHeader> */}
                <CardContent className="mt-8">
                    <form>
                        <div className="grid w-full items-center gap-4">
                            <div className="flex flex-col gap-y-1">
                                <Label htmlFor="name">My ID</Label>
                                <div className="flex flex-row justify-left items-center space-x-2">
                                    <div className="flex border rounded-md px-3 py-2 text-sm h-10 w-full bg-muted">
                                        {userId ? userId : "Loading..."}
                                    </div>
                                    <Button
                                        variant="outline"
                                        type="button"
                                        className="p-4"
                                        onClick={() => CopyToClipboard(userDetails?.userId)}
                                        disabled={userId ? false : true}
                                    >
                                        {isCopied ? (
                                            <Check size={15} color="green" />
                                        ) : (
                                            <CopyIcon size={15} />
                                        )}
                                    </Button>
                                    <ShareLink userCode={userId} />
                                </div>
                            </div>

                            <div className="flex flex-col gap-y-1">
                                <Label htmlFor="name">Peer`s ID</Label>
                                <div className="flex flex-row justify-left items-center space-x-2">
                                    <Input
                                        id="name"
                                        placeholder="ID"
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setpartnerId(e.target.value)}
                                        disabled={terminateCall}
                                        value={partnerId}
                                    />
                                    <Button
                                        variant="outline"
                                        type="button"
                                        className="flex items-center justify-center p-4 w-[160px]"
                                        onClick={handleConnectionMaking}
                                        disabled={terminateCall}
                                    >
                                        {isLoading ? (
                                            <>
                                                <div className="scale-0 hidden dark:flex dark:scale-100">
                                                    <TailSpin color="white" height={18} width={18} />
                                                </div>
                                                <div className="scale-100 flex dark:scale-0 dark:hidden">
                                                    <TailSpin color="black" height={18} width={18} />
                                                </div>
                                            </>
                                        ) : (
                                            <p>Connect</p>
                                        )}
                                    </Button>
                                </div>
                            </div>

                            <div className="flex flex-col gap-y-1">
                                <Label htmlFor="name">Connection Status</Label>
                                <div className="flex flex-row justify-left items-center space-x-2">
                                    <div className=" border rounded-lg  px-3 py-2 text-sm h-10 w-full ease-in-out duration-500 transition-all ">
                                        {currentConnection ? partnerId : "No connection"}
                                    </div>
                                    <>
                                        {terminateCall ? (
                                            <Button
                                                variant="destructive"
                                                type="button"
                                                // className="p-4 w-[160px] text-red-600 border-red-400 hover:bg-red-300 animate-in slide-in-from-right-[30px]"
                                                onClick={() => {
                                                    peerRef.current.destroy();
                                                }}
                                            >
                                                Terminate
                                            </Button>
                                        ) : null}
                                    </>
                                </div>
                            </div>

                            {/* file upload */}
                            <div className="flex flex-col border rounded-lg  px-3 py-2 text-sm w-full ease-in-out duration-500 transition-all gap-y-2">
                                <div>
                                    <Label className=" font-semibold text-[16px]">Upload</Label>
                                </div>
                                <div>
                                    <FileUploadBtn
                                        inputRef={fileInputRef}
                                        uploadBtn={handleFileUploadBtn}
                                        handleFileChange={handleFileChange}
                                    />
                                </div>

                                {fileUpload ? (
                                    <FileUpload
                                        fileName={fileUpload[0]?.name}
                                        fileProgress={fileUploadProgress}
                                        handleClick={handleWebRTCUpload}
                                        showProgress={fileSending}
                                    />
                                ) : null}
                            </div>

                            {/* download file */}
                            {downloadFile ? (
                                <>
                                    <FileDownload
                                        fileName={fileNameState}
                                        fileReceivingStatus={fileReceiving}
                                        fileProgress={fileDownloadProgress}
                                        fileRawData={downloadFile}
                                    />
                                </>
                            ) : null}
                        </div>
                    </form>
                </CardContent>
                {acceptCaller ? (
                    <CardFooter className="flex justify-center">
                        <div>
                            <Button
                                variant="outline"
                                className=" bg-green-500 text-white hover:bg-green-400"
                                onClick={acceptUser}
                            >
                                Click here to receive call from {signalingData.from}
                            </Button>
                        </div>
                    </CardFooter>
                ) : null}
            </Card>
        </>
    );
};

export default ShareCard;