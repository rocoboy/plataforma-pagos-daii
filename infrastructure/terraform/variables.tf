variable "vercel_api_token" {
  description = "Vercel API Token"
  type        = string
  sensitive   = true
}

variable "api_node_env" {
  description = "NODE_ENV for API project"
  type        = string
  default     = "production"
  sensitive   = true
}

variable "api_environment" {
  description = "ENVIRONMENT for API project"
  type        = string
  default     = "production"
  sensitive   = true
}

variable "web_node_env" {
  description = "NODE_ENV for Web project"
  type        = string
  default     = "production"
  sensitive   = true
}

variable "web_environment" {
  description = "ENVIRONMENT for Web project"
  type        = string
  default     = "production"
  sensitive   = true
}

