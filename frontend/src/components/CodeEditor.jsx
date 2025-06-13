import Editor from '@monaco-editor/react';
import axios from 'axios';
import { useEffect, useState } from 'react';
import '@fontsource/fira-code';
import '@fontsource/urbanist';
import styles from "../styling/CodeEditor.module.css";
import { useSocket } from '../context/SocketContext';  // Add this import
import { useNavigate, useParams } from 'react-router-dom';  // Add this import
import { toast } from "react-toastify";
import { saveChanges } from '../api/api';

const languagesMap = {
    python: 'python3',
    javascript: 'javascript',
    cpp: 'cpp',
    java: 'java',
};

const codeTemplates = {
    python: `def main():
    # Your code here

if __name__ == "__main__":
    main()`,

    javascript: `function main() {
    // Your code here
    console.log("Hello, World!");
}

main();`,

    cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    // Your code here
    return 0;
}`,

    java: `public class Main {
    public static void main(String[] args) {
        // Your code here
        System.out.println("Hello, World!");
    }
}`
};

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

function CodeEditor({ code, setCode, activeFileName }) {
    const [language, setLanguage] = useState('python');
    // const [code, setCode] = useState(codeTemplates.python);
    const [output, setOutput] = useState('');
    const navigate = useNavigate();

    // changing bg color of this component only
    useEffect(() => {
        const prevBackground = document.body.style.backgroundImage;
        const prevColor = document.body.style.backgroundColor;

        document.body.style.backgroundImage = 'radial-gradient(circle, #000000, #050505, #0a0a0a, #0e0e0e, #121212)';
        document.body.style.backgroundColor = 'black';

        return () => {
            document.body.style.backgroundImage = prevBackground;
            document.body.style.backgroundColor = prevColor;
        };
    }, []);

    const handleRunCode = async () => {
        const payload = {
            language: languagesMap[language],
            version: "*",
            files: [
                {
                    name: `main.${language}`,
                    content: code,
                }
            ]
        };

        try {
            const res = await axios.post('https://emkc.org/api/v2/piston/execute', payload);
            setOutput(res.data.run.output);
        } catch (err) {
            setOutput('Error: ' + err.message);
        }
    };

    const handleGenerateCode = async () => {
        const prompt = `Only return the code. Do not include explanations. Give me complete ${language} code for this:\n\n${code}\n`;

        console.log("Prompt sent to Gemini:", prompt);
        try {
            const res = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        contents: [
                            {
                                parts: [{ text: prompt }],
                            },
                        ],
                    }),
                }
            );


            const data = await res.json();
            const suggestion = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

            const cleaned = suggestion.replace(/[\s\S]*?/g, match => {
                return match.replace(/[a-z]*\n?/gi, "").replace(/$/, "");
            }).trim();

            const cleaned2 = cleaned.split('\n').slice(1, -1).join('\n');;

            if (cleaned2) {
                setCode(cleaned2);
            }
        } catch (err) {
            console.error("Gemini suggestion error:", err);
        }
    };

    useEffect(() => {
        setCode(codeTemplates[language]);
    }, [language]);

    const socket = useSocket();  // Add this
    const { id: roomId } = useParams();  // Add this

    useEffect(() => {
        if (socket) {
            // Join the room
            socket.emit('join-room', roomId);

            // Listen for code updates
            socket.on('code-update', (received) => {
                console.log("received: ", received);
                console.log("fileChanged: ", received.fileChanged);
                console.log("activeFileName: ", activeFileName);
                if (received.fileChanged === activeFileName) {
                    setCode(received.code);
                }
            });
        }

        return () => {
            if (socket) {
                socket.off('code-update');
            }
        };
    }, [socket, roomId, activeFileName]);

    const handleEditorChange = (value) => {
        setCode(value);
        if (socket) {
            socket.emit('code-change', { roomId, code: value, fileChanged: activeFileName });
        }
    };

    const handleCommitCode = async () => {
        const confidence = prompt("Type 'commit' to push changes");
        console.log(confidence);
        if (confidence === 'commit') {
            try {
                await saveChanges({ fileName: activeFileName, content: code });
                toast.success("Commited Successfully");
            } catch (err) {
                console.error(err);
            }
        }
        else {
            toast.error("Changes were not saved");
        }
    }

    return (
        <div className={styles.container}>
            <div className={styles.selBar}>
                <select
                    className={styles.selectLanguage}
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                >
                    <option value="python">Python</option>
                    <option value="javascript">JavaScript</option>
                    <option value="cpp">C++</option>
                    <option value="java">Java</option>
                </select>

                <div className={styles.runBtn}>
                    <button className={styles.runButton} onClick={handleGenerateCode}>Generate 🌟</button>
                </div>

                <div className={styles.runBtn}>
                    <button className={styles.runButton} onClick={handleRunCode}>Run Code</button>
                </div>

                <div className={styles.runBtn}>
                    <button className={styles.runButton} onClick={handleCommitCode}>Commit</button>
                </div>

                <div className={styles.runBtn}>
                    <button className={styles.runButton} onClick={() => navigate("/home")} style={{backgroundColor: "red"}}>LEAVE</button>
                </div>
            </div>

            <div className={styles.mainContainer}>
                <div className={styles.editor}>
                    <Editor
                        height="64vh"
                        width="100%"
                        language={language}
                        theme="hc-black"
                        value={code}
                        onChange={handleEditorChange}
                    />
                </div>

                <div className={styles.output}>
                    <p className={styles.outputTitle}>OUTPUT:</p>
                    <br />
                    <p className={styles.outputContent}>{output}</p>
                </div>
            </div>
        </div>
    );
}

export default CodeEditor;
