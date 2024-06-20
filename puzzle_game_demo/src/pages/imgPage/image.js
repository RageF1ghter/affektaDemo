import React, { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';

const ImagePage = () => {
    const prompts = ["landscape", "forst", "mountain", "ocean", "city", "desert", "sunset", "sunrise", "night", "day"];
    const defaultPrompt = ["4k", "high-resolution", "beautiful", "scenic", "panoramic", "aesthetic", "artistic", "HD", "wallpaper"]
    const [selectedPrompt, setSelectedPrompt] = useState([]);
    const [buttonStatus, setButtonStatus] = useState(false);
    const [generatedImage, setGeneratedImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');


    const navigate = useNavigate();
    
    const handlePromptSelection = (prompt) => {
        setSelectedPrompt((prev) => {
            if (prev.includes(prompt)) {
                return prev.filter((p) => p !== prompt);
            } else {
                return [...prev, prompt];
            }
        });
    };

    const generateImage = async () => {
        const allPrompts = [...selectedPrompt, ...defaultPrompt];
        try {
            const response = await fetch('http://localhost:3000/generate/generate', {  
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userid: 'user1',
                    courseID: 'course1',
                    prompt: allPrompts.join(', '),
                    steps: 10,  
                    cfg_scale: 7.5, 
                    width: 512, 
                    height: 512
                })
            });

            if (!response.ok) {
                throw new Error('Failed to generate image');
            }
            const data = await response.json();
            console.log(data.imageUrl);
            setGeneratedImage(data.imageUrl);
            // setGeneratedImage(`data:image/png;base64,${data.imageDara}`);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (

        <div>
            <h1>Generate your exclusive image</h1>
            <p>Select your image features:</p>
            <ul>
                {prompts.map((prompt) => (
                    <li key={prompt}>
                        <button onClick={() => handlePromptSelection(prompt)} >
                            {prompt}
                        </button>
                    </li>
                ))}
                <p>Selected Prompts: {selectedPrompt.join(', ')}</p>
            </ul>
            <button onClick={generateImage} disabled={loading}>
                {loading ? 'Generating...' : 'Generate Image'}
            </button>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {generatedImage && (
                <div>
                    <h2>Generated Image</h2>
                    <img src={generatedImage} alt="Generated" style={{ maxWidth: '100%', height: 'auto' }} />
                </div>
            )}
            <br></br>
            <button onClick={() => {navigate('/course')}}>next</button>
            
        </div>
    );
};

export default ImagePage;