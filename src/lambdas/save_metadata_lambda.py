import json
import os
import uuid
import boto3
from datetime import datetime

# =========================
# ENV VARIABLES
# =========================
DYNAMO_ENDPOINT = os.environ["DYNAMODB_ENDPOINT"]
MINIO_ENDPOINT = os.environ["MINIO_ENDPOINT"]
BUCKET = os.environ["AUDIO_BUCKET"]

# =========================
# Dynamo connection
# =========================
dynamodb = boto3.resource(
    "dynamodb",
    endpoint_url=DYNAMO_ENDPOINT,
    region_name="us-east-1",
    aws_access_key_id="dummy",
    aws_secret_access_key="dummy"
)

table = dynamodb.Table("output")


# =========================
# Lambda handler
# =========================
def main(event, context):

    try:
        body = json.loads(event["body"])

        filename = body["filename"]
        text = body["text"]
        voice = body["voice"]
        lang = body["lang"]

        item_id = str(uuid.uuid4())

        # URL MinIO (accès direct)
        file_url = f"{MINIO_ENDPOINT}/{BUCKET}/{filename}"

        item = {
            "id": item_id,
            "filename": filename,
            "text": text,
            "voice": voice,
            "lang": lang,
            "url": file_url,
            "created_at": datetime.utcnow().isoformat()
        }

        table.put_item(Item=item)

        return {
            "statusCode": 200,
            "body": json.dumps({
                "message": "Metadata saved",
                "id": item_id,
                "url": file_url
            })
        }

    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({"error": str(e)})
        }