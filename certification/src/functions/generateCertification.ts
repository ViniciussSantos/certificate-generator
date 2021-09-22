import { document } from '../utils/dynamodbClient';
import { ICreateCertificate } from '../utils/CertificateInterface';
export const handle = async (event) => {
 
    const {id, name, grade} = JSON.parse(event.body) as ICreateCertificate;

    await document.put({
        TableName: "users_certificates",
        Item:{
            id,
            name,
            grade
        }
    }).promise();

    return{
        statusCode: 201,
        body: JSON.stringify({
            message: "Certificate created."
        }),
        headers: {
            "Content-type": "application/json"
        }
    };
};