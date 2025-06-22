import tiktoken

enc = tiktoken.get_encoding("cl100k_base")
tokens = enc.encode("Ven aquí, quiero mostrarte algo especial...")
print(tokens)  # Ejemplo: [187, 5112, 278, 239, 1674, 1532, 13, 758, 198, 2608, 13, 11, 255]
