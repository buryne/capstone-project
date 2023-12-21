import json
import os
from io import StringIO

import numpy as np
import pandas as pd
import requests
from flask import Flask, jsonify, request
from keras.models import load_model
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import linear_kernel

app = Flask(__name__)

# Load model
model = load_model("Recommendation_Model_FIXED.h5")

# Contoh data wisata (sebagai contoh)
Github_url_1 = "https://raw.githubusercontent.com/buryne/capstone-project/app-dev/ML/dataset/Dataset_wisata.csv"
External_api_url = "https://api-wisata-dot-api-beta-testing.uc.r.appspot.com/api/wisata"

# Mendapatkan konten file CSV dari Github
response = requests.get(Github_url_1)
data = StringIO(response.text)

wisata = pd.read_csv(data)


@app.route("/")
def helloWorld():
    return jsonify({"message": "Hello API Predict Janu"})


# Assuming 'id_user' is the user ID


@app.route("/janu-recomend/predict", methods=["GET"])
def predict():
    # Dapatkan nilai parameter 'name' dari URL
    name = request.args.get("name")

    if not name:
        return jsonify({"message": "Parameter 'name' not found."})

    place_name = range(1, 20)
    data_wisata = np.array(list(set(place_name)))
    city_name = name

    city = np.array([city_name for i in range(len(data_wisata))])

    city_label_mapping = {
        "Jakarta": 0,
        "Yogyakarta": 1,
        "Bandung": 2,
        "Semarang": 3,
        "Surabaya": 4,
    }

    city_encoded = np.array([city_label_mapping[city_name] for city_name in city])

    input_data = np.column_stack((city_encoded, data_wisata))

    # Replace NaN with an empty string
    wisata["Place_Name"] = wisata["Place_Name"].fillna("")

    # Concatenate 'Place_Name', 'City', 'Category', and 'Rating' into a single text column
    wisata["Combined_Info"] = wisata["Place_Name"] + " " + wisata["City"]

    # Menggunakan TfIdfVectorizer untuk mengonversi deskripsi menjadi vektor fitur
    tfidf_vectorizer = TfidfVectorizer(stop_words="english")
    tfidf_matrix = tfidf_vectorizer.fit_transform(wisata["Combined_Info"])

    # Menghitung skor kesamaan kosinus antar tempat wisata
    cosine_similarities = linear_kernel(tfidf_matrix, tfidf_matrix)

    # Construct the required TF-IDF matrix by fitting and transforming the data
    tfidf = TfidfVectorizer(stop_words="english")
    tfidf_matrix = tfidf.fit_transform(wisata["Combined_Info"])

    # Mendapatkan rekomendasi menggunakan model yang telah diload
    def get_recommendations_with_load_model(model, city="City", num_recommendations=10):
        # Filter data for the specified city
        city_data = wisata[wisata["City"] == city]

        # If no places found in the specified city, return an empty DataFrame
        if city_data.empty:
            return pd.DataFrame(columns=["Place_Name", "City"])

        # Pilih acak tempat wisata dari kota yang ditentukan
        random_place_index = np.random.choice(city_data.index)
        random_place_features = city_data.loc[random_place_index, "Place_Name"]

        # Transform the random place features using the TF-IDF vectorizer
        random_place_tfidf = tfidf_vectorizer.transform([random_place_features])

        # Calculate cosine similarity between the random place and all tourist places in the same city
        cosine_similarities = linear_kernel(
            random_place_tfidf, tfidf_matrix[city_data.index, :]
        ).flatten()

        # Get indices of similar tourist places based on cosine similarity scores
        similar_places_indices = cosine_similarities.argsort()[
            : -num_recommendations - 1 : -1
        ]

        # Return the most similar destinations (Place_Name and City)
        # return city_data[['Place_Name', 'City']].iloc[similar_places_indices]
        return city_data[
            [
                "Place_Id",
                "Place_Name",
                "Description",
                "Category",
                "City",
                "Price",
                "Rating",
            ]
        ].iloc[similar_places_indices]

    # Mendapatkan rekomendasi dengan menggunakan model yang telah diload
    recommendations_by_city_loaded_model = get_recommendations_with_load_model(
        model, city_name
    )

    results_city = recommendations_by_city_loaded_model.to_dict(orient="records")

    # Kembalikan hasil pencarian
    return jsonify(recommendations_by_city_loaded_model.to_dict(orient="records"))


if __name__ == "__main__":
    app.run(debug=True, port=8080)
