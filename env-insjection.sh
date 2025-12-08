#!/bin/sh
# Generate runtime config
cat <<EOF > /app/dist/env-config.js
window._env_ = {
  VITE_BACKEND_API_URL: "${VITE_BACKEND_API_URL}",
  VITE_BACKEND_AI_URL: "${VITE_BACKEND_AI_URL}",
  VITE_REDIRECT_URL: "${VITE_REDIRECT_URL}",
  VITE_N8N_WEBHOOK_URL: "${VITE_N8N_WEBHOOK_URL}"
};
EOF

# Start the server
serve -s dist