import React from 'react';

const TextHighlight = ({ text, highlights }) => {
    const getHighlightedText = (text, highlights) => {
        let result = [];
        let lastIndex = 0;
        highlights.sort((a, b) => a[0] - b[0]);

        highlights.forEach((highlight, index) => {
            const start = highlight[0];
            const end = highlight[1] + 1;
            result.push(text.substring(lastIndex, start));
            result.push(<span key={index} style={{ backgroundColor: 'yellow' }}>{text.substring(start, end)}</span>);
            lastIndex = end;
        });
        result.push(text.substring(lastIndex));
        return result;
    };

    return (
        <div>
            <h2>Teks dengan Highlight</h2>
            <p>{getHighlightedText(text, highlights)}</p>
        </div>
    );
};

export default TextHighlight;