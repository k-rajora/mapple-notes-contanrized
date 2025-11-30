
FROM python:3.10-slim


WORKDIR /app

# Prevents Python from writing .pyc files to disc
ENV PYTHONDONTWRITEBYTECODE 1
# Prevents Python from buffering stdout and stderr
ENV PYTHONUNBUFFERED 1


COPY requirements.txt .


RUN pip install --no-cache-dir -r requirements.txt


COPY . .

EXPOSE 5000


CMD ["python", "app.py"]