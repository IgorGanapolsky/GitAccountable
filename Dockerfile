# Use Python 3.12
FROM python:3.12-slim

# Set working directory
WORKDIR /app

# Copy requirements first for better caching
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY . .

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app

# Expose the port
EXPOSE 8000

# Run the web server
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "src.web.app:app"]
