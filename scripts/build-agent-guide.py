"""Render the English guide and its copy payload from one Markdown source."""
import html
import json
import re
from pathlib import Path

root = Path(__file__).resolve().parent.parent
markdown = (root / 'agent-guide.md').read_text()


def inline(text):
    tokens = []

    def protect(match):
        tokens.append('<code>' + html.escape(match[1]) + '</code>')
        return f'@@CODE{len(tokens) - 1}@@'

    text = re.sub(r'`([^`]+)`', protect, text)
    text = html.escape(text)
    text = re.sub(r'\[([^\]]+)\]\((https://[^\s)]+)\)', r'<a href="\2">\1</a>', text)
    for i, token in enumerate(tokens):
        text = text.replace(f'@@CODE{i}@@', token)
    return text


blocks = []
for block in markdown.strip().split('\n\n'):
    if block.startswith('# '):
        continue  # The page heading is provided by the template.
    if block.startswith('## '):
        blocks.append('<h2>' + inline(block[3:]) + '</h2>')
    elif re.match(r'\d+\. ', block):
        items = [inline(re.sub(r'^\d+\. ', '', line)) for line in block.splitlines()]
        blocks.append('<ol>' + ''.join('<li>' + item + '</li>' for item in items) + '</ol>')
    else:
        blocks.append('<p>' + inline(block) + '</p>')

payload = json.dumps(markdown).replace('<', '\\u003c').replace('>', '\\u003e').replace('&', '\\u0026')
template = (root / 'agent-guide/template.html').read_text()
(root / 'agent-guide/index.html').write_text(template.replace('{{CONTENT}}', '\n'.join(blocks)).replace('{{MARKDOWN}}', payload))
