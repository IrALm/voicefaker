import json
import os
import boto3
from decimal import Decimal

# =========================
# ENV VARIABLES
# =========================
DYNAMODB_ENDPOINT = os.environ.get("DYNAMODB_ENDPOINT", None)
TABLE_NAME = os.environ.get("TABLE_NAME", "AudioFiles")

# =========================
# DynamoDB connection
# =========================
dynamo_kwargs = {
    "region_name": "us-east-1",
    "aws_access_key_id": "dummy",
    "aws_secret_access_key": "dummy"
}
if DYNAMODB_ENDPOINT:
    dynamo_kwargs["endpoint_url"] = DYNAMODB_ENDPOINT

dynamodb = boto3.resource("dynamodb", **dynamo_kwargs)

# =========================
# Decimal encoder
# =========================
class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return int(obj) if obj % 1 == 0 else float(obj)
        return super().default(obj)

CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Content-Type": "application/json"
}

# =========================
# Lambda handler
# =========================
def main(event, context):
    try:
        table = dynamodb.Table(TABLE_NAME)
        response = table.scan()
        items = response.get("Items", [])
        while "LastEvaluatedKey" in response:
            response = table.scan(ExclusiveStartKey=response["LastEvaluatedKey"])
            items.extend(response.get("Items", []))

        # Agrégation par voix
        counts = {}
        for item in items:
            voice = item.get("voice", "unknown")
            counts[voice] = counts.get(voice, 0) + 1

        total = sum(counts.values())
        ranking = [
            {
                "voice": voice,
                "count": count,
                "percentage": round(count / total * 100, 1)
            }
            for voice, count in sorted(counts.items(), key=lambda x: x[1], reverse=True)
        ]

        return {
            "statusCode": 200,
            "body": json.dumps({
                "total": total,
                "most_requested": ranking[0]["voice"] if ranking else None,
                "ranking": ranking
            }, cls=DecimalEncoder),
            "headers": {"Content-Type": "application/json"}
        }

    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({"error": str(e)}),
            "headers": {"Content-Type": "application/json"}
        }