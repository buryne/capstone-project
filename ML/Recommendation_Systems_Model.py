from io import StringIO

import joblib
import numpy as np
import pandas as pd
import requests
import tensorflow as tf
from google.colab import files
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import linear_kernel
from sklearn.model_selection import train_test_split
from tensorflow.keras.callbacks import EarlyStopping
from tensorflow.keras.layers import Dense, Embedding, Flatten
from tensorflow.keras.models import Sequential

# URL raw file in GitHub
github_url = "https://raw.githubusercontent.com/tsnrrohmah/Recommendation-Systems-Content-Based-Filtering/master/Dataset/cleaned_dataset_wisata.csv"

response = requests.get(github_url)
data = StringIO(response.text)

# Load dataset
df_wisata = pd.read_csv(data)

# show dataset column
df_wisata.columns

# show dataset
df_wisata

# show missing value ini dataset
missing_values = df_wisata.isnull().sum()
print("\nJumlah Nilai yang Hilang untuk Setiap Kolom:")
print(missing_values)

df_wisata.shape

# dataset info
print(df_wisata.info())


df_wisata["City"].head(5)

# Define a TF-IDF Vectorizer Object
tfidf = TfidfVectorizer(stop_words="english")

# Replace NaN with an empty string
df_wisata["City"] = df_wisata["City"].fillna("")

# Construct the required TF-IDF matrix by fitting and transforming the data
tfidf_matrix = tfidf.fit_transform(df_wisata["City"])

# Output the shape of tfidf_matrix
tfidf_matrix.shape

# Import linear_kernel

# Compute the cosine similarity matrix
cosine_sim = linear_kernel(tfidf_matrix, tfidf_matrix)

# Construct a reverse map of indices and Place_Name
indices = pd.Series(df_wisata.index, index=df_wisata["Place_Name"]).drop_duplicates()


def rekomendasi_tempat_wisata(Place_Name, cosine_sim=cosine_sim):
    # Get the index of the destination that matches the Place_Name
    idx = indices[Place_Name]

    # Get the pairwise similarity scores of all destinations with that Place_Name
    similarity_scores = list(enumerate(cosine_sim[idx]))

    # Sort the destinations based on the similarity scores
    similarity_scores = sorted(similarity_scores, key=lambda x: x[1], reverse=True)

    # Get the scores of the 15 most similar destinations
    similarity_scores = similarity_scores[1:16]

    # Get the destinations indices
    similar_places_indices = [i[0] for i in similarity_scores]

    # Exclude the input Place_Name from the recommendations
    similar_places_indices = [
        i
        for i in similar_places_indices
        if df_wisata["Place_Name"].iloc[i] != Place_Name
    ]

    # Return the most similar destinations (Place_Name and City)
    return df_wisata[["Place_Name", "City"]].iloc[similar_places_indices]


# Split the data into training and testing sets
train_data, test_data = train_test_split(df_wisata, test_size=0.2, random_state=42)


class myCallback(tf.keras.callbacks.Callback):
    def on_epoch_end(self, epoch, logs={}):
        # Check the loss
        if logs.get("accuracy") > 0.98:
            # Stop if threshold is met
            print("\nAccuracy is higher than 0.98 so canceling training!")
            self.model.stop_training = True


callbacks = myCallback()

# Define the model
model = Sequential()
model.add(Dense(64, input_shape=(tfidf_matrix.shape[1],), activation="relu"))
model.add(Dense(32, activation="relu"))
model.add(Dense(16, activation="relu"))
model.add(Dense(tfidf_matrix.shape[1], activation="linear"))

# Compile the model
model.compile(optimizer=tf.optimizers.Adam(), loss="mse", metrics=["accuracy"])

# Train the model
model.fit(
    tfidf_matrix.toarray(),
    tfidf_matrix.toarray(),
    epochs=10,
    batch_size=32,
    validation_split=0.2,
    callbacks=[callbacks],
)

# Evaluate the model
loss, accuracy = model.evaluate(tfidf_matrix.toarray(), tfidf_matrix.toarray())
print(f"Model Loss: {loss}, Model Accuracy: {accuracy}")

# Validation using rekomendasi_tempat_wisata function
validation_result = rekomendasi_tempat_wisata("Taman Mini Indonesia Indah (TMII)")
print("Rekomendasi tempat wisata :")
print(validation_result)

# Save model .h5
model.save("Recommendation_Systems_Model.h5")

# Download the model
files.download("Recommendation_Systems_Model.h5")

# Save model .pkl

model_filename = "Recommendation_Systems_Model.pkl"
joblib.dump(model, model_filename)
print(f"Model saved as {model_filename}")

# Evaluate the model
loss, accuracy = model.evaluate(tfidf_matrix.toarray(), tfidf_matrix.toarray())
print(f"Model Loss: {loss}, Model Accuracy: {accuracy}")


# Download the model file
files.download(model_filename)
