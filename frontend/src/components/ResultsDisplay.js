import React from 'react';

const ResultsDisplay = ({ results }) => {
    return (
        <div>
            <h2>Hasil Pencarian</h2>
            {results.map((result, index) => (
                <p key={index}>{result}</p>
            ))}
        </div>
    );
};

export default ResultsDisplay;