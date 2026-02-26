import os
import boto3
from botocore.exceptions import ClientError

# =========================
# CONFIG / ENV VARIABLES
# =========================
REGION = os.environ.get("AWS_REGION", "eu-west-3")
BUCKET_NAME = os.environ.get("AUDIO_BUCKET", "my-audio-bucket")
TABLE_NAME = os.environ.get("DYNAMO_TABLE", "AudioFiles")

# MinIO / S3 local
MINIO_ENDPOINT = os.environ.get("MINIO_ENDPOINT", "http://localhost:9000")
MINIO_ACCESS_KEY = os.environ.get("MINIO_ACCESS_KEY", "minioadmin")
MINIO_SECRET_KEY = os.environ.get("MINIO_SECRET_KEY", "minioadmin")

# DynamoDB Local
DYNAMO_ENDPOINT = os.environ.get("DYNAMODB_ENDPOINT", "http://localhost:8000")
DYNAMO_ACCESS_KEY = os.environ.get("DYNAMODB_ACCESS_KEY", "dummy")
DYNAMO_SECRET_KEY = os.environ.get("DYNAMODB_SECRET_KEY", "dummy")

# =========================
# INIT CLIENTS
# =========================
s3 = boto3.client(
    "s3",
    endpoint_url=MINIO_ENDPOINT,
    aws_access_key_id=MINIO_ACCESS_KEY,
    aws_secret_access_key=MINIO_SECRET_KEY,
    region_name=REGION,
)

dynamodb = boto3.client(
    "dynamodb",
    endpoint_url=DYNAMO_ENDPOINT,
    region_name=REGION,
    aws_access_key_id=DYNAMO_ACCESS_KEY,
    aws_secret_access_key=DYNAMO_SECRET_KEY,
)

# =========================
# CREATE S3 BUCKET
# =========================
def create_bucket():
    try:
        s3.head_bucket(Bucket=BUCKET_NAME)
        print(f"Le bucket S3 existe déjà : {BUCKET_NAME}")
    except ClientError:
        print(f"Création du bucket S3 : {BUCKET_NAME}")
        if REGION == "us-east-1":
            s3.create_bucket(Bucket=BUCKET_NAME)
        else:
            s3.create_bucket(
                Bucket=BUCKET_NAME,
                CreateBucketConfiguration={"LocationConstraint": REGION},
            )
        print("Bucket créé avec succès")

# =========================
# CREATE DYNAMODB TABLE
# =========================
def create_table():
    try:
        dynamodb.describe_table(TableName=TABLE_NAME)
        print(f"La table DynamoDB existe déjà : {TABLE_NAME}")
    except dynamodb.exceptions.ResourceNotFoundException:
        print(f"Création de la table DynamoDB : {TABLE_NAME}")
        dynamodb.create_table(
            TableName=TABLE_NAME,
            KeySchema=[{"AttributeName": "id", "KeyType": "HASH"}],
            AttributeDefinitions=[{"AttributeName": "id", "AttributeType": "S"}],
            BillingMode="PAY_PER_REQUEST",
        )
        waiter = dynamodb.get_waiter("table_exists")
        waiter.wait(TableName=TABLE_NAME)
        print("Table créée avec succès")

# =========================
# MAIN
# =========================
if __name__ == "__main__":
    create_bucket()
    create_table()
    print("\nStockage initialisé avec succès 🚀")