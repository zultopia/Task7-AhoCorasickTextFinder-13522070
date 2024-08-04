import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import * as d3 from 'd3';
import './App.css';
import ahoLogo from './assets/aho.png';

const App = () => {
    const [file, setFile] = useState(null);
    const [text, setText] = useState("");
    const [results, setResults] = useState([]);
    const [highlightedText, setHighlightedText] = useState("");
    const [error, setError] = useState("");
    const [automatonData, setAutomatonData] = useState(null);
    const svgRef = useRef(null);

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
                    if (response.data.error) {
                        setError(response.data.error);
                        setResults([]);
                        setHighlightedText("");
                        setAutomatonData(null);
                    } else {
                        setError("");
                        const { results, highlights, automaton } = response.data;
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
                        setAutomatonData(automaton);
                    }
                } catch (error) {
                    setError("Solusi tidak ditemukan. Penyebabnya antara text kosong atau pattern tidak ada");
                    setResults([]);
                    setHighlightedText("");
                    setAutomatonData(null);
                }
            };
            reader.readAsText(file);
        }
    };

    useEffect(() => {
        if (automatonData) {
            const svg = d3.select(svgRef.current);
            svg.selectAll("*").remove();
    
            const width = svgRef.current.clientWidth;
            const height = svgRef.current.clientHeight;
    
            const simulation = d3.forceSimulation()
                .force("link", d3.forceLink().id(d => d.id))
                .force("charge", d3.forceManyBody())
                .force("center", d3.forceCenter(width / 2, height / 2));
    
            const link = svg.selectAll("line")
                .data(automatonData.links)
                .enter().append("line")
                .attr("stroke", "#999")
                .attr("stroke-width", 2);
    
            const node = svg.selectAll("circle")
                .data(automatonData.nodes)
                .enter().append("circle")
                .attr("r", 10)
                .attr("fill", "#1f77b4")
                .call(drag(simulation));
    
            const label = svg.selectAll("text")
                .data(automatonData.nodes)
                .enter().append("text")
                .attr("dy", 3)
                .text(d => d.pattern);  
    
            simulation.nodes(automatonData.nodes).on("tick", () => {
                link
                    .attr("x1", d => d.source.x)
                    .attr("y1", d => d.source.y)
                    .attr("x2", d => d.target.x)
                    .attr("y2", d => d.target.y);
    
                node
                    .attr("cx", d => d.x)
                    .attr("cy", d => d.y);
    
                label
                    .attr("x", d => d.x)
                    .attr("y", d => d.y);
            });
    
            simulation.force("link").links(automatonData.links);
        }
    }, [automatonData]);  

    const drag = (simulation) => {
        return d3.drag()
            .on("start", (event, d) => {
                if (!event.active) simulation.alphaTarget(0.3).restart();
                d.fx = d.x;
                d.fy = d.y;
            })
            .on("drag", (event, d) => {
                d.fx = event.x;
                d.fy = event.y;
            })
            .on("end", (event, d) => {
                if (!event.active) simulation.alphaTarget(0);
                d.fx = null;
                d.fy = null;
            });
    };

    return (
        <div className="App">
            <div className="container">
                <img src={ahoLogo} alt="Aho-Corasick Logo" className="logo" />
                <h1 style={{ fontStyle: 'italic' }}>Find Your Pattern in Text</h1>
                <div className="upload-section">
                    <input type="file" onChange={handleFileChange} />
                    <button className="submit-button" onClick={handleSubmit}>Find</button>
                </div>
                {error && <div className="error-message">{error}</div>}
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
                {automatonData && (
                    <div className="visualization-section">
                        <h2>Visualisasi Automaton</h2>
                        <svg ref={svgRef} width="100%" height="500px" style={{ border: '1px solid #ddd' }}></svg>
                    </div>
                )}
            </div>
        </div>
    );
};

export default App;