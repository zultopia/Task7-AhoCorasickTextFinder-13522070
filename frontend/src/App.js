import React, { useState } from 'react';
import axios from 'axios';
import './App.css';
import ahoLogo from './assets/aho.png'; 

const App = () => {
    const [file, setFile] = useState(null);
    const [text, setText] = useState("");
    const [results, setResults] = useState([]);
    const [highlightedText, setHighlightedText] = useState("");

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
    };

    const handleSubmit = async () => {
        if (file) {
            const reader = new FileReader();
            reader.onload = async (e) => {
                const content = JSON.parse(e.target.result);
                setText(content.text);

                try {
                    const response = await axios.post('http://localhost:5000/search', content);
                    const { results, highlights } = response.data;
                    setResults(results);

                    let highlighted = content.text;
                    const offsets = [];
                    Object.keys(highlights).forEach(pattern => {
                        highlights[pattern].forEach(([start, end]) => {
                            offsets.push({ start, end });
                        });
                    });

                    // Sort offsets by start index
                    offsets.sort((a, b) => a.start - b.start);

                    let offset = 0;
                    offsets.forEach(({ start, end }) => {
                        start += offset;
                        end += offset;
                        highlighted = highlighted.slice(0, start) +
                                      `<mark>${highlighted.slice(start, end + 1)}</mark>` +
                                      highlighted.slice(end + 1);
                        offset += "<mark></mark>".length;
                    });

                    setHighlightedText(highlighted);
                } catch (error) {
                    console.error("There was an error!", error);
                }
            };
            reader.readAsText(file);
        }
    };

    return (
        <div className="App">
            <img src={ahoLogo} alt="Aho-Corasick Logo" className="logo" />
            <h1 style={{ fontStyle: 'italic' }}>Find Your Pattern in Text</h1>
            <div className="upload-section">
                <input type="file" onChange={handleFileChange} />
                <button className="submit-button" onClick={handleSubmit}>Find</button>
            </div>
            <div className="results-section">
                <h2>Solusi</h2>
                <div>
                    {results.map((result, index) => (
                        <div key={index}>{result}</div>
                    ))}
                </div>
                <h2>Highlight Pola</h2>
                <div className="highlighted-text" dangerouslySetInnerHTML={{ __html: highlightedText }}></div>
            </div>
        </div>
    );
};

export default App;