const { neon } = require('@neondatabase/serverless');
const express = require('express');
const { OAuth2Client } = require('google-auth-library');

const { PGHOST, PGDATABASE, PGUSER, PGPASSWORD } = process.env;

const sql = neon(`postgresql://${PGUSER}:${PGPASSWORD}@${PGHOST}/${PGDATABASE}?sslmode=require`);

async function getPgVersion() {
  const result = await sql`SELECT version()`;
  console.log(result[0]);
}

getPgVersion();