import React, { useState } from 'react';
import axios from 'axios';
import FileUpload from './components/FileUpload';
import ResultsDisplay from './components/ResultsDisplay';
import TextHighlight from './components/TextHighlight';

function App() {
    const [text, setText] = useState("");
    const [results, setResults] = useState([]);
    const [highlights, setHighlights] = useState([]);

    const onFileLoad = (content) => {
        const data = JSON.parse(content);
        setText(data.text);
        processAhoCorasick(data.text, data.patterns);
    };

    const processAhoCorasick = (text, patterns) => {
        axios.post('http://localhost:5000/search', {
            text: text,
            patterns: patterns
        })
        .then(response => {
            setResults(response.data.results);
            setHighlights(response.data.highlights);
        })
        .catch(error => {
            console.error('There was an error processing the Aho-Corasick search!', error);
        });
    };

    return (
        <div className="App">
            <h1>Aho-Corasick Text Finder</h1>
            <FileUpload onFileLoad={onFileLoad} />
            <ResultsDisplay results={results} />
            <TextHighlight text={text} highlights={highlights} />
        </div>
    );
}

export default App;