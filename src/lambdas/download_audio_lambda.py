import json
import boto3
import base64
import os

# Récupère les variables d'environnement
AUDIO_BUCKET = os.environ.get("AUDIO_BUCKET", "my-audio-bucket")
MINIO_ENDPOINT = os.environ.get("MINIO_ENDPOINT")
MINIO_ACCESS_KEY = os.environ.get("MINIO_ACCESS_KEY")
MINIO_SECRET_KEY = os.environ.get("MINIO_SECRET_KEY")

# Initialise le client S3 / MinIO
s3 = boto3.client(
    "s3",
    endpoint_url=MINIO_ENDPOINT,              # permet MinIO local
    aws_access_key_id=MINIO_ACCESS_KEY,
    aws_secret_access_key=MINIO_SECRET_KEY,
)

def lambda_handler(event, context):
    try:
        # Récupère le paramètre file depuis l'URL /download/{file_id} ou query string ?file=
        file_name = None
        if "pathParameters" in event and event["pathParameters"]:
            file_name = event["pathParameters"].get("file_id")
        if not file_name:
            params = event.get("queryStringParameters") or {}
            file_name = params.get("file")

        if not file_name:
            return {
                "statusCode": 400,
                "body": json.dumps({"error": "Missing 'file' parameter"})
            }

        # Récupère le fichier depuis S3 / MinIO
        obj = s3.get_object(Bucket=AUDIO_BUCKET, Key=file_name)
        audio_bytes = obj["Body"].read()

        # Encode en base64 pour API Gateway
        encoded = base64.b64encode(audio_bytes).decode("utf-8")

        return {
            "statusCode": 200,
            "headers": {
                "Content-Type": "audio/mpeg",
                "Content-Disposition": f'attachment; filename="{file_name}"'
            },
            "isBase64Encoded": True,
            "body": encoded
        }

    except s3.exceptions.NoSuchKey:
        return {
            "statusCode": 404,
            "body": json.dumps({"error": "File not found"})
        }

    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({"error": str(e)})
        }