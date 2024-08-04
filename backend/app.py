class AhoCorasick:
    def __init__(self):
        self.num_nodes = 1
        self.edges = [{}]
        self.fail = [-1]
        self.output = [[]]

    def add_word(self, word, idx):
        current_node = 0
        for char in word:
            if char not in self.edges[current_node]:
                self.edges[current_node][char] = self.num_nodes
                self.edges.append({})
                self.fail.append(-1)
                self.output.append([])
                self.num_nodes += 1
            current_node = self.edges[current_node][char]
        self.output[current_node].append(idx)

    def make_automaton(self):
        from collections import deque
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

# Integrating AhoCorasick with Flask backend
from flask import Flask, request, jsonify # type: ignore
from flask_cors import CORS # type: ignore

app = Flask(__name__)
CORS(app)

def aho_corasick_search(text, patterns):
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
                      for pattern, count in results.items() if count > 0]
    
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