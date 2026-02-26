import os, json, requests, boto3, uuid
from datetime import datetime

FASTAPI = os.environ["FASTAPI_TTS_URL"]
BUCKET = os.environ["AUDIO_BUCKET"]

s3 = boto3.client(
    "s3",
    endpoint_url=os.environ["MINIO_ENDPOINT"],
    aws_access_key_id=os.environ["MINIO_ACCESS_KEY"],
    aws_secret_access_key=os.environ["MINIO_SECRET_KEY"]
)

dynamodb = boto3.resource(
    "dynamodb",
    endpoint_url=os.environ["DYNAMODB_ENDPOINT"],
    region_name="us-east-1",
    aws_access_key_id="dummy",
    aws_secret_access_key="dummy"
)

CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Content-Type": "application/json"
}

def main(event, context):
    try:
        # Parse body
        try:
            body = json.loads(event["body"])
        except (KeyError, json.JSONDecodeError):
            return {
                "statusCode": 400,
                "body": json.dumps({"error": "Body JSON invalide ou manquant"})
            }

        text = body.get("text")
        lang = body.get("lang")
        voice = body.get("voice")

        # Validation des champs requis
        missing = [f for f in ["text", "lang", "voice"] if not body.get(f)]
        if missing:
            return {
                "statusCode": 400,
                "body": json.dumps({"error": f"Champs manquants : {missing}"})
            }

        # 1 generate
        r = requests.post(
            f"{FASTAPI}/generate-audio/",
            params={"text": text, "lang": lang, "voice": voice}
        )
        if r.status_code != 200:
            return {
                "statusCode": r.status_code,
                "body": json.dumps({
                    "error": "Erreur lors de la génération audio",
                    "detail": r.json() if r.headers.get("content-type", "").startswith("application/json") else r.text
                })
            }

        filename = r.json().get("filename")
        if not filename:
            return {
                "statusCode": 502,
                "body": json.dumps({"error": "Réponse FastAPI invalide : 'filename' manquant"})
            }

        # 2 download
        audio = requests.get(f"{FASTAPI}/download-audio/{filename}")
        if audio.status_code != 200:
            return {
                "statusCode": 502,
                "body": json.dumps({"error": f"Échec du téléchargement du fichier audio : {filename}"})
            }

        # 3 upload MinIO
        try:
            s3.put_object(Bucket=BUCKET, Key=filename, Body=audio.content)
        except Exception as e:
            return {
                "statusCode": 502,
                "body": json.dumps({"error": f"Échec de l'upload MinIO : {str(e)}"})
            }

        # 4 save metadata DynamoDB
        try:
            dynamodb.Table("AudioFiles").put_item(Item={
                "id": str(uuid.uuid4()),
                "filename": filename,
                "text": text,
                "voice": voice,
                "lang": lang,
                "created_at": datetime.utcnow().strftime("%d/%m/%Y %H:%M:%S"),
                "file_size_bytes": len(audio.content)
            })
        except Exception as e:
            return {
                "statusCode": 502,
                "body": json.dumps({"error": f"Échec de la sauvegarde DynamoDB : {str(e)}"})
            }

        return {
            "statusCode": 200,
            "body": json.dumps({"filename": filename})
        }

    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({"error": f"Erreur interne : {str(e)}"})
        }