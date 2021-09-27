import { APIGatewayProxyHandler } from "aws-lambda";
import { document } from '../utils/dynamodbClient';


export const handle:APIGatewayProxyHandler = async (event) => {

    const {id} = event.pathParameters;

    const response = await document.query({
        TableName: "users_certificates",
        KeyConditionExpression: "id = :id",
        ExpressionAttributeValues:{
            ":id": id
        }
    }).promise()

    const user = response.Items[0];

    if(user){
        return{
            statusCode:200,
            body: JSON.stringify({
                name: user.name,
                message: "valid certificate"
            })
        }
    }

    return{
        statusCode:400,
        body: JSON.stringify({
            message: "invalid certificate"
        })
    }

}