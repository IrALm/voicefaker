import json
import boto3
import base64
import os
from botocore.exceptions import ClientError

# Récupère les variables d'environnement
AUDIO_BUCKET = os.environ.get("AUDIO_BUCKET", "my-audio-bucket")
MINIO_ENDPOINT = os.environ.get("MINIO_ENDPOINT")
MINIO_ACCESS_KEY = os.environ.get("MINIO_ACCESS_KEY")
MINIO_SECRET_KEY = os.environ.get("MINIO_SECRET_KEY")

# Initialise le client S3 / MinIO
s3 = boto3.client(
    "s3",
    endpoint_url=MINIO_ENDPOINT,
    aws_access_key_id=MINIO_ACCESS_KEY,
    aws_secret_access_key=MINIO_SECRET_KEY,
)

CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Content-Type": "application/json"
}

def lambda_handler(event, context):
    try:
        # Récupère le nom du fichier depuis le path ou query string
        file_name = None
        if "pathParameters" in event and event["pathParameters"]:
            file_name = event["pathParameters"].get("file_id")
        if not file_name:
            params = event.get("queryStringParameters") or {}
            file_name = params.get("file")
        if not file_name:
            return {
                "statusCode": 400,
                "headers": {"Content-Type": "application/json"},
                "body": json.dumps({"erreur": "Manque le paramètre 'nom du fichier'"})
            }

        # Récupère le fichier depuis MinIO
        obj = s3.get_object(Bucket=AUDIO_BUCKET, Key=file_name)
        audio_bytes = obj["Body"].read()

        # Encode en base64 pour API Gateway (nécessaire pour les binaires)
        encoded = base64.b64encode(audio_bytes).decode("utf-8")

        return {
            "statusCode": 200,
            "headers": {
                "Content-Type": "audio/mpeg",
                "Content-Disposition": f'attachment; filename="{file_name}"',
                "Content-Length": str(len(audio_bytes))
            },
            "isBase64Encoded": True,
            "body": encoded
        }

    except ClientError as e:
        error_code = e.response["Error"]["Code"]
        if error_code in ("404", "NoSuchKey"):
            return {
                "statusCode": 404,
                "headers": {"Content-Type": "application/json"},
                "body": json.dumps({"erreur": "Fichier non trouvé"})
            }
        return {
            "statusCode": 500,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({"erreur": f"Erreur S3/MinIO : {str(e)}"})
        }

    except Exception as e:
        return {
            "statusCode": 500,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({"erreur interne": str(e)})
        }