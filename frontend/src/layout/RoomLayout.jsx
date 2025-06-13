import { useParams } from "react-router-dom";
import CodeEditor from "../components/CodeEditor";
import { Sidebar } from "../components/Sidebar";
import ChatBox from "../components/ChatBox";
import { useEffect, useState } from "react";
import { getRoomDetails } from "../api/api";

export const RoomLayout = () => {
    const params = useParams();
    const [code, setCode] = useState();
    const [activeFileName, setActiveFileName] = useState("");

    const [roomDetails, setRoomDetails] = useState({});
    // console.log(params);
    const fetchRoomDetails = async () => {
        try {
            const res = await getRoomDetails({ roomId: params.id });
            // console.log(res.data.roomDetails);
            setRoomDetails(res.data.roomDetails);
        } catch (error) {
            console.log("error: ", error);
        }
    }

    const getUsernameFromCookie = () => {
        const match = document.cookie
            .split('; ')
            .find(row => row.startsWith('username='));

        return match ? decodeURIComponent(match.split('=')[1]) : null;
    };

    useEffect(() => {
        console.log("Active File: ", activeFileName);
    }, [activeFileName]);

    useEffect(() => {
        fetchRoomDetails();
    }, [params.id]);

    return (
        <div>
            <Sidebar roomDetails={roomDetails} code={code} setCode={setCode} setActiveFileName={setActiveFileName} activeFileName={activeFileName} />
            <CodeEditor code={code} setCode={setCode} activeFileName={activeFileName} />
            <ChatBox getUsernameFromCookie={getUsernameFromCookie} />
        </div>
    )
}