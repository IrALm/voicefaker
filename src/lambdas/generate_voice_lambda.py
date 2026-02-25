import os, json, requests, boto3, uuid

FASTAPI = os.environ["FASTAPI_TTS_URL"]
BUCKET = os.environ["AUDIO_BUCKET"]

s3 = boto3.client(
    "s3",
    endpoint_url=os.environ["MINIO_ENDPOINT"],
    aws_access_key_id=os.environ["MINIO_ACCESS_KEY"],
    aws_secret_access_key=os.environ["MINIO_SECRET_KEY"]
)

def main(event, context):

    body = json.loads(event["body"])

    text = body["text"]
    lang = body["lang"]
    voice = body["voice"]

    # 1 generate
    r = requests.post(
        f"{FASTAPI}/generate-audio/",
        params={"text": text, "lang": lang, "voice": voice}
    )

    filename = r.json()["filename"]

    # 2 download
    audio = requests.get(f"{FASTAPI}/download-audio/{filename}")

    # 3 upload MinIO
    s3.put_object(
        Bucket=BUCKET,
        Key=filename,
        Body=audio.content
    )

    return {"statusCode":200,"body":json.dumps({"filename":filename})}