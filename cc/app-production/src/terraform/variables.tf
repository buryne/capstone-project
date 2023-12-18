locals {
  env_vars = readfile("../../.env")
}


variable "gcp_credentials" {
  
    description = "Path to your GCP service account key"
    type        = string
    default     = "../../jelajah-nusantara-dev.json" 
}

variable "gcp_project" {
  
    description = "Your GCP project ID"
    type        = string
    default     = "jelajah-nusantara-dev" 
}

variable "gcp_region" {
  
    description = "Your GCP region"
    type        = string
    default     = "us-central1" 
}


variable "google_client_id" {
  description = "Description of My Variable"
  type        = string
  default     = local.env_vars["GOOGLE_CLIENT_ID"]
}

variable "google_client_secret" {
  description = "Description of Another Variable"
  type        = string
   default     = local.env_vars["GOOGLE_CLIENT_SECRET"]
}

variable "CALLBACKURL" {
  description = "Description of Another Variable"
  type        = string
   default     = local.env_vars["CALLBACKURL"]
}

variable "secretsession" {
  description = "Description of Another Variable"
  type        = string
   default     = local.env_vars["SECRET"]
}