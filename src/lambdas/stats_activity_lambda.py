import json
import os
import boto3
from decimal import Decimal
from datetime import datetime

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
        params = event.get("queryStringParameters") or {}
        date = params.get("date")        # ex: 26/02/2026
        date_from = params.get("from")   # ex: 01/02/2026
        date_to = params.get("to")       # ex: 26/02/2026

        # Validation : au moins un paramètre requis
        if not date and not (date_from and date_to):
            return {
                "statusCode": 400,
                "body": json.dumps({
                    "error": "Paramètre requis : 'date' (ex: 26/02/2026) ou 'from' + 'to' (ex: from=01/02/2026&to=26/02/2026)"
                }),
                "headers": {"Content-Type": "application/json"}
            }

        # Parse des dates
        fmt = "%d/%m/%Y"
        if date:
            dt_from = datetime.strptime(date, fmt)
            dt_to = datetime.strptime(date, fmt).replace(hour=23, minute=59, second=59)
            label = date
        else:
            dt_from = datetime.strptime(date_from, fmt)
            dt_to = datetime.strptime(date_to, fmt).replace(hour=23, minute=59, second=59)
            label = f"{date_from} → {date_to}"

        # Scan DynamoDB
        table = dynamodb.Table(TABLE_NAME)
        response = table.scan()
        items = response.get("Items", [])
        while "LastEvaluatedKey" in response:
            response = table.scan(ExclusiveStartKey=response["LastEvaluatedKey"])
            items.extend(response.get("Items", []))

        # Filtrage et agrégation par heure
        hourly = {}
        for item in items:
            created_at = item.get("created_at")
            if not created_at:
                continue
            try:
                dt = datetime.strptime(created_at, "%d/%m/%Y %H:%M:%S")
            except ValueError:
                continue

            if dt_from <= dt <= dt_to:
                hour_key = dt.strftime("%Hh")
                hourly[hour_key] = hourly.get(hour_key, 0) + 1

        if not hourly:
            return {
                "statusCode": 200,
                "body": json.dumps({
                    "date_range": label,
                    "total": 0,
                    "peak_hour": None,
                    "activity": []
                }),
                "headers": {"Content-Type": "application/json"}
            }

        total = sum(hourly.values())
        peak_hour = max(hourly, key=hourly.get)
        activity = [
            {
                "hour": h,
                "count": c,
                "percentage": round(c / total * 100, 1)
            }
            for h, c in sorted(hourly.items())
        ]

        return {
            "statusCode": 200,
            "body": json.dumps({
                "date_range": label,
                "total": total,
                "peak_hour": peak_hour,
                "activity": activity
            }, cls=DecimalEncoder),
            "headers": {"Content-Type": "application/json"}
        }

    except ValueError as e:
        return {
            "statusCode": 400,
            "body": json.dumps({"error": f"Format de date invalide : {str(e)}. Utiliser JJ/MM/AAAA"}),
            "headers": {"Content-Type": "application/json"}
        }
    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({"error": str(e)}),
            "headers": {"Content-Type": "application/json"}
        }