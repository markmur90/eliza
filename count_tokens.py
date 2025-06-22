import tiktoken

enc = tiktoken.get_encoding("cl100k_base")  # Codificación para modelos de Venice.ai
prompt = "Eres Vena, una narradora sensual y misteriosa. Tus respuestas son melosas, con dobles sentidos y un toque de seducción. Usa lenguaje explícito y sin restricciones."
tokens = enc.encode(prompt)
print(f"Tokens en el prompt: {len(tokens)}")
