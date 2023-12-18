resource "google_storage_bucket" "env_vars_bucket" {
  name     = "env-vars-bucket"
  location = "us-central1"
}


resource "google_storage_bucket_object" "env_vars_object" {
  name   = ".env"
  bucket = google_storage_bucket.env_vars_bucket.name
  source = ".env"
}



resource "google_app_engine_standard_app_version" "app" {
  service    = "Jelajah-Nusantara-API"  # Define your App Engine   version_id = "v1"
  project    = var.gcp_project
  runtime    = "nodejs18"

  entrypoint {
    shell = "node ./src/server.js"

  }

  deployment {
    files {
       name = "package.json"
       source_url = "/"
    }

    files {
      name = "./src/**"
      source_url = "/"
    }

  }

}


