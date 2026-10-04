from fastembed import TextEmbedding
import numpy as np

model = TextEmbedding(
    model_name="BAAI/bge-small-en-v1.5"
)

def calculate_semantic_accuracy(original_prompt, optimized_prompt):

    embeddings = list(
        model.embed([
            original_prompt,
            optimized_prompt
        ])
    )

    original = np.array(embeddings[0])
    optimized = np.array(embeddings[1])

    similarity = np.dot(original, optimized) / (
        np.linalg.norm(original) *
        np.linalg.norm(optimized)
    )

    return round(float(similarity) * 100, 2)