from flask import Flask, request, jsonify
from flask_cors import CORS
import ahocorasick

app = Flask(__name__)
CORS(app)

def aho_corasick_search(text, patterns):
    automaton = ahocorasick.Automaton()
    for idx, pattern in enumerate(patterns):
        automaton.add_word(pattern, (idx, pattern))
    automaton.make_automaton()

    results = {pattern: 0 for pattern in patterns}
    highlights = []

    for end_index, (idx, pattern) in automaton.iter(text):
        start_index = end_index - len(pattern) + 1
        results[pattern] += 1
        highlights.append((start_index, end_index))

    result_strings = [f'Pola "{pattern}" ditemukan {count}x.' for pattern, count in results.items()]
    return result_strings, highlights

@app.route('/search', methods=['POST'])
def search():
    data = request.json
    text = data['text']
    patterns = data['patterns']

    result_strings, highlights = aho_corasick_search(text, patterns)

    return jsonify({
        'results': result_strings,
        'highlights': highlights
    })

if __name__ == '__main__':
    app.run(debug=True)