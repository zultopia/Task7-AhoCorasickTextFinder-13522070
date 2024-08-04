import React from 'react';

class FileUpload extends React.Component {
    constructor(props) {
        super(props);
        this.handleFileChange = this.handleFileChange.bind(this);
    }

    handleFileChange(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const content = e.target.result;
                this.props.onFileLoad(content);
            };
            reader.readAsText(file);
        }
    }

    render() {
        return (
            <div>
                <input type="file" onChange={this.handleFileChange} />
            </div>
        );
    }
}

export default FileUpload;