import json
import os
import boto3

# =========================
# ENV VARIABLES avec fallback
# =========================
MINIO_ENDPOINT = os.environ.get("MINIO_ENDPOINT", None)
ACCESS = os.environ.get("MINIO_ACCESS_KEY", None)
SECRET = os.environ.get("MINIO_SECRET_KEY", None)
BUCKET = os.environ.get("AUDIO_BUCKET", "my-audio-bucket")

# =========================
# S3 / MinIO connection
# =========================
s3_kwargs = {}
if MINIO_ENDPOINT and ACCESS and SECRET:
    s3_kwargs = {
        "endpoint_url": MINIO_ENDPOINT,
        "aws_access_key_id": ACCESS,
        "aws_secret_access_key": SECRET
    }

s3 = boto3.client("s3", **s3_kwargs)

# =========================
# Lambda handler
# =========================
def main(event, context):
    try:
        response = s3.list_objects_v2(Bucket=BUCKET)

        files = []

        # Si bucket vide → pas de "Contents"
        if "Contents" in response:
            for obj in response["Contents"]:
                files.append({
                    "filename": obj["Key"],
                    "size": obj["Size"],
                    "last_modified": obj["LastModified"].isoformat()
                })

        return {
            "statusCode": 200,
            "body": json.dumps(files),
            "headers": {"Content-Type": "application/json"}
        }

    except s3.exceptions.NoSuchBucket:
        return {
            "statusCode": 404,
            "body": json.dumps({"error": "Bucket not found"}),
            "headers": {"Content-Type": "application/json"}
        }

    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({"error": str(e)}),
            "headers": {"Content-Type": "application/json"}
        }