
const chromium = require('chrome-aws-lambda');
import * as path from 'path';
import { document } from '../utils/dynamodbClient';
import * as fs from "fs"
import * as Handlebars from 'handlebars';
import * as dayjs from 'dayjs';

export interface ICreateCertificate {
  id: string;
  name: string;
  grade: string;
}

export interface Itemplate {
  id: string;
  name: string; 
  grade: string;
  date: string;
  logo: string;
}


const compile = async function (data: Itemplate) {

  const filePath = path.join(
    process.cwd(),
    "src",
    "templates",
    "certificate.hbs"
  );

  const html = fs.readFileSync(filePath, "utf-8");

  return Handlebars.compile(html)(data);
}

export const handle = async (event) => {

  const { id, name, grade } = JSON.parse(event.body) as ICreateCertificate;

  await document.put({
    TableName: "users_certificates",
    Item: {
      id,
      name,
      grade
    }
  }).promise();

  const logoPath = path.join(process.cwd(), "src", "templates", "token_nome-cinza.png")
  const logo = fs.readFileSync(logoPath, "base64")

  const data: Itemplate = {
    date: dayjs().format("DD/MM/YYYY"),
    grade,
    name,
    id,
    logo 
  }

  //handlebars compile
  const content = await compile(data);

  // html to pdf
  const browser = await chromium.puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath,
    headless: chromium.headless,
    ignoreHTTPSErrors: true,
  });

  const page = await browser.newPage();

  await page.setContent(content);

  const pdf = await page.pdf({
    format: "a4",
    landscape: true,
    path: process.env.IS_OFFLINE ? "certificate.pdf": null,
    printBackground: true,
    preferCSSPageSize: true

  })

  await browser.close();


  return {
    statusCode: 201,
    body: JSON.stringify({
      message: "Certificate created."
    }),
    headers: {
      "Content-type": "application/json"
    }
  };
};