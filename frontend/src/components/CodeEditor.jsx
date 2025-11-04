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
import { IoChatbubbleEllipsesOutline } from "react-icons/io5";
import { FaRobot } from "react-icons/fa";
import { FaTimes, FaCheck } from "react-icons/fa";
import { uploadFile, getRoomFiles, getFileContent } from '../api/api';

const languagesMap = {
    python: 'python3',
    javascript: 'javascript',
    typescript: 'typescript',
    c: 'c',
    cpp: 'cpp',
    java: 'java',
    go: 'go',
    rust: 'rust',
    php: 'php',
    ruby: 'ruby',
};

const codeTemplates = {
    python: `def main():
    # Your code here

if __name__ == "__main__":
    main()` ,

    javascript: `function main() {
    // Your code here
    console.log("Hello, World!");
}

main();` ,

    typescript: `function main(): void {
    // Your code here
    console.log("Hello, World!");
}

main();` ,

    c: `#include <stdio.h>

int main() {
    // Your code here
    printf("Hello, World!\n");
    return 0;
}` ,

    cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    // Your code here
    cout << "Hello, World!" << endl;
    return 0;
}` ,

    java: `public class Main {
    public static void main(String[] args) {
        // Your code here
        System.out.println("Hello, World!");
    }
}` ,

    go: `package main

import "fmt"

func main() {
    // Your code here
    fmt.Println("Hello, World!")
}` ,

    rust: `fn main() {
    // Your code here
    println!("Hello, World!");
}` ,

    php: `<?php
// Your code here

echo "Hello, World!";` ,

    ruby: `# Your code here

puts "Hello, World!"` ,
};

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const getLanguageFromExtension = (filename) => {
    if (!filename) return 'python';
    const extension = filename.split('.').pop().toLowerCase();
    const extensionToLanguage = {
        'py': 'python',
        'js': 'javascript',
        'cpp': 'cpp',
        'java': 'java',
        'c': 'cpp',
        'h': 'cpp',
        'hpp': 'cpp',
        'cs': 'cpp',
        'php': 'php',
        'rb': 'ruby',
        'go': 'go',
        'rs': 'rust',
        'swift': 'swift',
        'kt': 'kotlin',
        'ts': 'typescript',
        'jsx': 'javascript',
        'tsx': 'typescript'
    };
    return extensionToLanguage[extension] || 'python';
};

function CodeEditor({ code, setCode, activeFileName, msgModal, setMsgModal }) {
    const [language, setLanguage] = useState('python');
    // const [code, setCode] = useState(codeTemplates.python);
    const [output, setOutput] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [aiModal, setAiModal] = useState(false);
    const [aiMessages, setAiMessages] = useState([]);
    const [aiInput, setAiInput] = useState('');
    const [aiLoading, setAiLoading] = useState(false);
    const [contextFiles, setContextFiles] = useState([]); // Array of { fileName, content }
    const [availableFiles, setAvailableFiles] = useState([]); // List of all files in room
    const [showContextSelector, setShowContextSelector] = useState(false);
    const navigate = useNavigate();
    const { id: roomId } = useParams();

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
        setIsGenerating(true);
        const prompt = `Only return the code. Do not include explanations. Give me complete ${language} code for this:\n\n${code}\n`;
        try {
            const res = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${GEMINI_API_KEY}`,
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

            const cleaned2 = cleaned.split('\n').slice(1, -1).join('\n');

            if (cleaned2) {
                setCode(cleaned2);
            }
        } catch (err) {
            console.error("Gemini suggestion error:", err);
            toast.error("Failed to generate code");
        } finally {
            setIsGenerating(false);
        }
    };

    useEffect(() => {
        setCode(codeTemplates[language]);
    }, [language]);

    useEffect(() => {
        if (activeFileName) {
            const newLanguage = getLanguageFromExtension(activeFileName);
            setLanguage(newLanguage);
        }
    }, [activeFileName]);

    const socket = useSocket();

    // Fetch available files when AI modal opens
    useEffect(() => {
        if (aiModal && roomId) {
            const fetchAvailableFiles = async () => {
                try {
                    const res = await getRoomFiles(roomId);
                    setAvailableFiles(res.data.files || []);
                } catch (err) {
                    console.error('Error fetching files:', err);
                }
            };
            fetchAvailableFiles();
        }
    }, [aiModal, roomId]);

    useEffect(() => {
        if (socket) {
            // Join the room
            socket.emit('join-room', roomId);

            // Listen for code updates
            socket.on('code-update', (received) => {
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

    const handleAddContextFile = async (fileName) => {
        // Check if already added
        if (contextFiles.some(f => f.fileName === fileName)) {
            return;
        }

        try {
            const res = await getFileContent(fileName);
            setContextFiles(prev => [...prev, { fileName, content: res.data.content }]);
            toast.success(`Added "${fileName}" to context`);
        } catch (err) {
            console.error('Error fetching file content:', err);
            toast.error(`Failed to load "${fileName}"`);
        }
    };

    const handleRemoveContextFile = (fileName) => {
        setContextFiles(prev => prev.filter(f => f.fileName !== fileName));
        toast.info(`Removed "${fileName}" from context`);
    };

    const handleEditorChange = (value) => {
        setCode(value);
        if (socket) {
            socket.emit('code-change', { roomId, code: value, fileChanged: activeFileName });
        }
    };

    const handleCommitCode = async () => {
        const confidence = prompt("Type 'commit' to push changes");
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

    const isTeachMeQuery = (query) => {
        const lowerQuery = query.toLowerCase();
        return lowerQuery.includes('teach me') || lowerQuery.includes('learn') || lowerQuery.includes('tutorial');
    };

    const isProjectQuery = (query) => {
        const lowerQuery = query.toLowerCase();
        return lowerQuery.includes('create') || lowerQuery.includes('build') || lowerQuery.includes('make') || 
               lowerQuery.includes('generate') || lowerQuery.includes('project') || lowerQuery.includes('app') ||
               lowerQuery.includes('application');
    };

    const extractTopicAndLanguage = (query) => {
        const lowerQuery = query.toLowerCase();
        let lang = 'cpp'; // default
        
        // Detect language from query
        if (lowerQuery.includes('python') || lowerQuery.includes('py')) lang = 'python';
        else if (lowerQuery.includes('javascript') || lowerQuery.includes('js')) lang = 'javascript';
        else if (lowerQuery.includes('java')) lang = 'java';
        else if (lowerQuery.includes('cpp') || lowerQuery.includes('c++')) lang = 'cpp';
        else if (lowerQuery.includes(' c ') || lowerQuery.includes('c language')) lang = 'c';
        else if (lowerQuery.includes('go')) lang = 'go';
        else if (lowerQuery.includes('rust')) lang = 'rust';
        else if (lowerQuery.includes('php')) lang = 'php';
        else if (lowerQuery.includes('ruby')) lang = 'ruby';
        else if (lowerQuery.includes('typescript') || lowerQuery.includes('ts')) lang = 'typescript';
        
        // Extract topic
        let topic = query.replace(/teach me|learn|tutorial|in|using|with/gi, '').trim();
        topic = topic.replace(/python|javascript|java|cpp|c\+\+|go|rust|php|ruby|typescript/gi, '').trim();
        
        return { topic, language: lang };
    };

    const extractProjectInfo = (query) => {
        const lowerQuery = query.toLowerCase();
        let lang = 'javascript'; // default for projects
        
        // Detect language from query
        if (lowerQuery.includes('python') || lowerQuery.includes('py')) lang = 'python';
        else if (lowerQuery.includes('javascript') || lowerQuery.includes('js')) lang = 'javascript';
        else if (lowerQuery.includes('react')) lang = 'javascript';
        else if (lowerQuery.includes('java')) lang = 'java';
        else if (lowerQuery.includes('cpp') || lowerQuery.includes('c++')) lang = 'cpp';
        else if (lowerQuery.includes(' c ') || lowerQuery.includes('c language')) lang = 'c';
        else if (lowerQuery.includes('go')) lang = 'go';
        else if (lowerQuery.includes('rust')) lang = 'rust';
        else if (lowerQuery.includes('php')) lang = 'php';
        else if (lowerQuery.includes('ruby')) lang = 'ruby';
        else if (lowerQuery.includes('typescript') || lowerQuery.includes('ts')) lang = 'typescript';
        
        // Extract project name/description
        let projectName = query.replace(/create|build|make|generate|project|app|application|in|using|with|for/gi, '').trim();
        projectName = projectName.replace(/python|javascript|java|cpp|c\+\+|go|rust|php|ruby|typescript|react/gi, '').trim();
        
        // Generate folder name from project description
        const folderName = projectName.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'project';
        
        return { projectName, folderName, language: lang };
    };

    const generateProjectFiles = async (projectName, folderName, lang) => {
        const prompt = `Create a complete, working ${projectName} project in ${lang}. 
Generate all necessary files for a functional project with proper structure.

Return ONLY a JSON array with this exact structure:
[
  {
    "fileName": "main.js",
    "content": "code content here"
  },
  {
    "fileName": "utils.js",
    "content": "code content here"
  }
]

Requirements:
- Include main entry file (main.js, index.js, app.py, etc.)
- Include supporting files (utils, config, styles, etc.)
- Make it a complete, runnable project
- Use proper file extensions for ${lang}
- Include comments explaining the code
- Make files well-structured and production-ready`;

        try {
            const res = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${GEMINI_API_KEY}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }]
                    })
                }
            );

            const data = await res.json();
            const responseText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
            
            // Try to extract JSON from response
            let jsonMatch = responseText.match(/\[[\s\S]*\]/);
            if (!jsonMatch) {
                jsonMatch = responseText.match(/```json\n?([\s\S]*?)\n?```/);
                if (jsonMatch) jsonMatch = [jsonMatch[1]];
            }
            
            if (jsonMatch) {
                const files = JSON.parse(jsonMatch[0]);
                // Add folder prefix to all files
                return files.map(file => ({
                    ...file,
                    fileName: `${folderName}/${file.fileName}`
                }));
            }
            
            // Fallback: create basic project files
            const extMap = {
                python: 'py', javascript: 'js', typescript: 'ts', cpp: 'cpp', c: 'c',
                java: 'java', go: 'go', rust: 'rs', php: 'php', ruby: 'rb'
            };
            const ext = extMap[lang] || 'js';
            const mainFile = lang === 'python' ? 'main.py' : lang === 'javascript' || lang === 'typescript' ? 'index.js' : `main.${ext}`;
            
            return [
                { fileName: `${folderName}/${mainFile}`, content: `// ${projectName} - Main Entry Point\n// Project generated by AI` },
                { fileName: `${folderName}/utils.${ext}`, content: `// Utility functions\n// Helper functions for ${projectName}` },
                { fileName: `${folderName}/README.md`, content: `# ${projectName}\n\nGenerated project files.` }
            ];
        } catch (err) {
            console.error("Error generating project files:", err);
            return null;
        }
    };

    const generateTeachingFiles = async (topic, lang) => {
        const prompt = `Generate a comprehensive tutorial for "${topic}" in ${lang}. 
Create 3-5 code files with the following format:
- Each file should be numbered: 1_topic_name.ext, 2_topic_name.ext, etc.
- File 1: Basics and fundamentals
- File 2: Advanced concepts and commands
- File 3-N: Practical examples/problems

Return ONLY a JSON array with this exact structure:
[
  {
    "fileName": "1_array_basics.cpp",
    "content": "code content here"
  },
  {
    "fileName": "2_array_commands.cpp",
    "content": "code content here"
  }
]

Use the correct file extension for ${lang}. Make content educational with comments.`;

        try {
            const res = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${GEMINI_API_KEY}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }]
                    })
                }
            );

            const data = await res.json();
            const responseText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
            
            // Try to extract JSON from response
            let jsonMatch = responseText.match(/\[[\s\S]*\]/);
            if (!jsonMatch) {
                // If no JSON found, try code block
                jsonMatch = responseText.match(/```json\n?([\s\S]*?)\n?```/);
                if (jsonMatch) jsonMatch = [jsonMatch[1]];
            }
            
            if (jsonMatch) {
                const files = JSON.parse(jsonMatch[0]);
                return files;
            }
            
            // Fallback: create basic files
            const extMap = {
                python: 'py', javascript: 'js', typescript: 'ts', cpp: 'cpp', c: 'c',
                java: 'java', go: 'go', rust: 'rs', php: 'php', ruby: 'rb'
            };
            const ext = extMap[lang] || 'cpp';
            return [
                { fileName: `1_${topic.replace(/\s+/g, '_')}_basics.${ext}`, content: `// ${topic} Basics\n// Start learning here` },
                { fileName: `2_${topic.replace(/\s+/g, '_')}_advanced.${ext}`, content: `// ${topic} Advanced\n// Advanced concepts` },
                { fileName: `3_${topic.replace(/\s+/g, '_')}_practice.${ext}`, content: `// ${topic} Practice\n// Practice problems` }
            ];
        } catch (err) {
            console.error("Error generating files:", err);
            return null;
        }
    };

    const handleAiQuery = async (e) => {
        e.preventDefault();
        if (!aiInput.trim() || aiLoading) return;

        const query = aiInput.trim();
        setAiInput('');
        setAiMessages(prev => [...prev, { role: 'user', content: query }]);
        setAiLoading(true);

        // Build context string from selected files with line numbers
        let contextString = '';
        if (contextFiles.length > 0) {
            contextString = '\n\nCONTEXT FILES:\n';
            contextFiles.forEach(file => {
                const lines = file.content.split('\n');
                const numberedContent = lines.map((line, idx) => `${idx + 1}: ${line}`).join('\n');
                contextString += `\n--- File: ${file.fileName} ---\n${numberedContent}\n`;
            });
            contextString += '\n--- End of Context Files ---\n\n';
        }

        try {
            if (isProjectQuery(query)) {
                // Handle project creation query
                const { projectName, folderName, language: detectedLang } = extractProjectInfo(query);
                setAiMessages(prev => [...prev, { 
                    role: 'assistant', 
                    content: `Creating "${projectName}" project in ${detectedLang}...\nFiles will be organized in the "${folderName}" folder.` 
                }]);

                const files = await generateProjectFiles(projectName, folderName, detectedLang);
                
                if (files && files.length > 0) {
                    // Upload files to room
                    for (const file of files) {
                        try {
                            await uploadFile({
                                fileName: file.fileName,
                                associatedRoomId: roomId,
                                fileContent: file.content
                            });
                        } catch (err) {
                            console.error(`Error uploading ${file.fileName}:`, err);
                        }
                    }
                    
                    setAiMessages(prev => [...prev, { 
                        role: 'assistant', 
                        content: `✅ Created ${files.length} project files in "${folderName}" folder! Check your file list.` 
                    }]);
                    toast.success(`Created ${files.length} project files in "${folderName}" folder!`);
                    // Trigger file refresh in Sidebar
                    window.dispatchEvent(new CustomEvent('filesUpdated'));
                } else {
                    setAiMessages(prev => [...prev, { 
                        role: 'assistant', 
                        content: 'Sorry, I couldn\'t generate the project files. Please try again.' 
                    }]);
                }
            } else if (isTeachMeQuery(query)) {
                // Handle "teach me" query
                const { topic, language: detectedLang } = extractTopicAndLanguage(query);
                setAiMessages(prev => [...prev, { 
                    role: 'assistant', 
                    content: `Creating tutorial files for "${topic}" in ${detectedLang}...` 
                }]);

                const files = await generateTeachingFiles(topic, detectedLang);
                
                if (files && files.length > 0) {
                    // Upload files to room
                    for (const file of files) {
                        try {
                            await uploadFile({
                                fileName: file.fileName,
                                associatedRoomId: roomId,
                                fileContent: file.content
                            });
                        } catch (err) {
                            console.error(`Error uploading ${file.fileName}:`, err);
                        }
                    }
                    
                    setAiMessages(prev => [...prev, { 
                        role: 'assistant', 
                        content: `✅ Created ${files.length} tutorial files! Check your file list.` 
                    }]);
                    toast.success(`Created ${files.length} tutorial files!`);
                    // Trigger file refresh in Sidebar
                    window.dispatchEvent(new CustomEvent('filesUpdated'));
                } else {
                    setAiMessages(prev => [...prev, { 
                        role: 'assistant', 
                        content: 'Sorry, I couldn\'t generate the tutorial files. Please try again.' 
                    }]);
                }
            } else {
                // Handle regular coding queries with context
                let prompt = `You are a helpful coding assistant. Answer the following question based on the provided context files (if any).`;
                
                if (contextFiles.length > 0) {
                    prompt += `\n\nIMPORTANT: Use ONLY the code from the context files below to answer the question. If the question references specific lines or code, refer to the exact code from the context files.\n`;
                }
                
                prompt += `${contextString}\n\nQuestion: ${query}\n\nAnswer:`;
                
                const res = await fetch(
                    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${GEMINI_API_KEY}`,
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            contents: [{ parts: [{ text: prompt }] }]
                        })
                    }
                );

                const data = await res.json();
                const response = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't process your query.";
                
                setAiMessages(prev => [...prev, { role: 'assistant', content: response }]);
            }
        } catch (err) {
            console.error("AI query error:", err);
            setAiMessages(prev => [...prev, { 
                role: 'assistant', 
                content: 'Sorry, an error occurred. Please try again.' 
            }]);
        } finally {
            setAiLoading(false);
        }
    };

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
                    <option value="typescript">TypeScript</option>
                    <option value="c">C</option>
                    <option value="cpp">C++</option>
                    <option value="java">Java</option>
                    <option value="go">Go</option>
                    <option value="rust">Rust</option>
                    <option value="php">PHP</option>
                    <option value="ruby">Ruby</option>
                </select>

                <div className={styles.runBtn}>
                    <button 
                        className={styles.runButton} 
                        onClick={handleGenerateCode}
                        disabled={isGenerating}
                    >
                        {isGenerating ? 'Generating...' : 'Generate 🌟'}
                    </button>
                </div>

                <div className={styles.runBtn}>
                    <button className={styles.runButton} onClick={handleRunCode}>Run Code</button>
                </div>

                <div className={styles.runBtn}>
                    <button className={styles.runButton} onClick={handleCommitCode}>Commit</button>
                </div>

                <div className={styles.runBtn}>
                    <button className={styles.runButton} onClick={() => setMsgModal(!msgModal)} style={{ backgroundColor: "yellowgreen" }}>ChatBox  🗫</button>
                </div>

                <div className={styles.runBtn}>
                    <button className={styles.runButton} onClick={() => navigate("/home")} style={{ backgroundColor: "red" }}>LEAVE</button>
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

            {/* AI Agent Floating Button */}
            <button 
                className={styles.aiButton}
                onClick={() => {
                    const wasOpen = aiModal;
                    setAiModal(!aiModal);
                    
                    if (!wasOpen) {
                        // Modal is opening - auto-add current file to context
                        if (activeFileName) {
                            setTimeout(() => {
                                handleAddContextFile(activeFileName);
                            }, 100);
                        }
                    } else {
                        // Modal is closing - clear context
                        setContextFiles([]);
                        setShowContextSelector(false);
                    }
                }}
                title="AI Assistant"
            >
                <FaRobot size={24} />
            </button>

            {/* AI Chat Modal */}
            {aiModal && (
                <div className={styles.aiModalOverlay} onClick={() => {
                    setAiModal(false);
                    setContextFiles([]);
                    setShowContextSelector(false);
                }}>
                    <div className={styles.aiModal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.aiModalHeader}>
                            <h3>🤖 AI Coding Assistant</h3>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                <button 
                                    onClick={() => setShowContextSelector(!showContextSelector)}
                                    style={{ 
                                        padding: '0.3rem 0.8rem', 
                                        fontSize: '0.85rem',
                                        background: contextFiles.length > 0 ? '#4CAF50' : '#667eea',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '5px',
                                        cursor: 'pointer'
                                    }}
                                    title="Add context files"
                                >
                                    📎 Context {contextFiles.length > 0 && `(${contextFiles.length})`}
                                </button>
                                <button onClick={() => {
                                    setAiModal(false);
                                    setContextFiles([]);
                                    setShowContextSelector(false);
                                }}>×</button>
                            </div>
                        </div>
                        {showContextSelector && (
                            <div className={styles.contextSelector}>
                                <div className={styles.contextHeader}>
                                    <h4>Select Files for Context</h4>
                                    <button onClick={() => setShowContextSelector(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>×</button>
                                </div>
                                <div className={styles.contextFilesList}>
                                    {availableFiles.length === 0 ? (
                                        <p style={{ color: '#888', padding: '1rem' }}>No files available in this room</p>
                                    ) : (
                                        availableFiles.map((file, idx) => {
                                            const fileName = file.fileName || file;
                                            const isSelected = contextFiles.some(f => f.fileName === fileName);
                                            return (
                                                <div 
                                                    key={idx} 
                                                    className={styles.contextFileItem}
                                                    onClick={() => isSelected ? handleRemoveContextFile(fileName) : handleAddContextFile(fileName)}
                                                >
                                                    <span style={{ flex: 1 }}>{fileName}</span>
                                                    {isSelected ? (
                                                        <FaCheck style={{ color: '#4CAF50' }} />
                                                    ) : (
                                                        <span style={{ color: '#888' }}>+</span>
                                                    )}
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                                {contextFiles.length > 0 && (
                                    <div className={styles.selectedContext}>
                                        <strong>Selected Context Files:</strong>
                                        {contextFiles.map((file, idx) => (
                                            <div key={idx} className={styles.contextFileTag}>
                                                {file.fileName}
                                                <FaTimes 
                                                    onClick={() => handleRemoveContextFile(file.fileName)} 
                                                    style={{ cursor: 'pointer', marginLeft: '0.5rem' }}
                                                    size={12}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                        <div className={styles.aiMessages}>
                            {aiMessages.length === 0 && (
                                <div className={styles.aiWelcome}>
                                    <p>Ask me anything about coding!</p>
                                    <p style={{ fontSize: '0.9em', color: '#888', marginTop: '10px' }}>
                                        💡 Tip: Add files to context using the "📎 Context" button above!<br /><br />
                                        Try:<br />
                                        • "teach me arrays in cpp"<br />
                                        • "create a todo app in javascript"<br />
                                        • "what does line 25 mean?" (with context files)<br />
                                        • "explain this function" (with context files)<br />
                                        • "how do I use loops in Python?"
                                    </p>
                                </div>
                            )}
                            {aiMessages.map((msg, idx) => (
                                <div key={idx} className={msg.role === 'user' ? styles.aiUserMsg : styles.aiAssistantMsg}>
                                    <div className={styles.aiMsgContent}>{msg.content}</div>
                                </div>
                            ))}
                            {aiLoading && (
                                <div className={styles.aiAssistantMsg}>
                                    <div className={styles.aiMsgContent}>Thinking...</div>
                                </div>
                            )}
                        </div>
                        <form onSubmit={handleAiQuery} className={styles.aiInputForm}>
                            <input
                                type="text"
                                value={aiInput}
                                onChange={(e) => setAiInput(e.target.value)}
                                placeholder="Ask a coding question or 'teach me [topic]'..."
                                disabled={aiLoading}
                                className={styles.aiInput}
                            />
                            <button type="submit" disabled={aiLoading || !aiInput.trim()} className={styles.aiSendBtn}>
                                Send
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CodeEditor;
