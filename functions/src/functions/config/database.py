import boto3
from sst import Resource

# Initialize DynamoDB
dynamodb = boto3.resource("dynamodb")
table_name = Resource.GameTable.name
games_table = dynamodb.Table(table_name)
