FROM python:3.11-slim

WORKDIR /app

# Installera beroenden
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Kopiera applikationen
COPY main.py .

# Exponera port
EXPOSE 8000

# Kör servern
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
