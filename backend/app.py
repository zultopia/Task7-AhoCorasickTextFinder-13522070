from flask import Flask, request, jsonify # type: ignore
from flask_cors import CORS # type: ignore
from collections import deque

app = Flask(__name__)
CORS(app)

class AhoCorasick:
    def __init__(self):
        self.num_nodes = 1
        self.edges = [{}]
        self.fail = [-1]
        self.output = [[]]
        self.patterns = [""]

    def add_word(self, word, idx):
        current_node = 0
        for char in word:
            if char not in self.edges[current_node]:
                self.edges[current_node][char] = self.num_nodes
                self.edges.append({})
                self.fail.append(-1)
                self.output.append([])
                self.patterns.append(word[:len(self.patterns[current_node])+1]) 
                self.num_nodes += 1
            current_node = self.edges[current_node][char]
        self.output[current_node].append(idx)

    def make_automaton(self):
        queue = deque()
        for char in self.edges[0]:
            next_node = self.edges[0][char]
            self.fail[next_node] = 0
            queue.append(next_node)
        
        while queue:
            current_node = queue.popleft()
            for char in self.edges[current_node]:
                next_node = self.edges[current_node][char]
                failure = self.fail[current_node]
                while failure != -1 and char not in self.edges[failure]:
                    failure = self.fail[failure]
                if failure != -1:
                    self.fail[next_node] = self.edges[failure][char]
                else:
                    self.fail[next_node] = 0
                self.output[next_node].extend(self.output[self.fail[next_node]])
                queue.append(next_node)

    def search(self, text):
        current_node = 0
        results = []
        for i in range(len(text)):
            while current_node != -1 and text[i] not in self.edges[current_node]:
                current_node = self.fail[current_node]
            if current_node == -1:
                current_node = 0
                continue
            current_node = self.edges[current_node][text[i]]
            for pattern_idx in self.output[current_node]:
                results.append((pattern_idx, i))
        return results

    def get_automaton_data(self):
        nodes = [{"id": i, "pattern": self.patterns[i]} for i in range(self.num_nodes)]
        links = []
        for node, edges in enumerate(self.edges):
            for char, target in edges.items():
                links.append({"source": node, "target": target, "label": char})
        return {"nodes": nodes, "links": links}

def aho_corasick_search(text, patterns):
    if not text:
        return ["Text Kosong. Solusi tidak ada"], {}, {"nodes": [], "links": []}
    if not patterns:
        return ["Tidak ada pattern. Solusi tidak ada"], {}, {"nodes": [], "links": []}

    automaton = AhoCorasick()
    for idx, pattern in enumerate(patterns):
        automaton.add_word(pattern.lower(), idx)
    automaton.make_automaton()

    results = {pattern: 0 for pattern in patterns}
    highlights = {pattern: [] for pattern in patterns}

    matches = automaton.search(text.lower())
    for pattern_idx, end_index in matches:
        pattern = patterns[pattern_idx]
        start_index = end_index - len(pattern) + 1
        if text[start_index:end_index + 1].lower() == pattern.lower():
            results[pattern] += 1
            highlights[pattern].append((start_index, end_index))

    result_strings = [f'Pola "{pattern}" ditemukan {count}x, ditemukan pada indeks {highlights[pattern]}.' 
                      for pattern, count in results.items()]
    
    automaton_data = automaton.get_automaton_data()

    return result_strings, highlights, automaton_data

@app.route('/search', methods=['POST'])
def search():
    data = request.json
    text = data.get('text', '')
    patterns = data.get('patterns', [])

    result_strings, highlights, automaton_data = aho_corasick_search(text, patterns)

    if not text:
        return jsonify({
            'error': "Text Kosong. Solusi tidak ada"
        }), 400

    if not patterns:
        return jsonify({
            'error': "Tidak ada pattern. Solusi tidak ada"
        }), 400

    return jsonify({
        'results': result_strings,
        'highlights': highlights,
        'automaton': automaton_data
    })

if __name__ == '__main__':
    app.run(debug=True)