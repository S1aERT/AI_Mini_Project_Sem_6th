from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
from gensim.models import Word2Vec
from sklearn.metrics.pairwise import cosine_similarity
import re

app = Flask(__name__)
CORS(app)
# Load data and model
recipes = pd.read_csv('C:/Users/ARAYN/OneDrive/Desktop/recipe_generator/data/recipes.csv')
model = Word2Vec.load('C:/Users/ARAYN/OneDrive/Desktop/recipe_generator/model/recipe_recommendation.model')

# Preprocessing helpers
def preprocess_ner(ner_list):
    return [re.sub(r'[^a-zA-Z\s]', '', ner.lower()).strip() for ner in ner_list]

def simplify_ingredients(ingredient_list):
    return [ingredient.lower() for ingredient in ingredient_list if ingredient.strip()]

recipes['NER'] = recipes['NER'].apply(eval).apply(preprocess_ner)
recipes['simplified_NER'] = recipes['NER'].apply(simplify_ingredients)

def get_average_embedding(ingredients, model):
    vectors = [model.wv[ingredient] for ingredient in ingredients if ingredient in model.wv]
    return np.mean(vectors, axis=0) if vectors else np.zeros(model.vector_size)

# Precompute embeddings
recipes['embedding'] = recipes['simplified_NER'].apply(lambda ing: get_average_embedding(ing, model))

@app.route('/recommend', methods=['POST'])
def recommend():
    data = request.get_json()
    user_input = data.get('ingredients', [])
    simplified_input = simplify_ingredients(user_input)
    user_vector = get_average_embedding(simplified_input, model)

    # Compute similarities
    recipe_embeddings = np.array(recipes['embedding'].tolist())
    similarities = cosine_similarity([user_vector], recipe_embeddings)[0]
    top_indices = similarities.argsort()[-5:][::-1]

    # Prepare response
    results = []
    for idx in top_indices:
        recipe = recipes.iloc[idx]
        results.append({
            'title': recipe['title'],
            'ingredients': recipe['ingredients'],
            'directions': recipe['directions'],
            'similarity': round(float(similarities[idx]), 4)
        })

    return jsonify(results)

if __name__ == '__main__':
    app.run(debug=True)
