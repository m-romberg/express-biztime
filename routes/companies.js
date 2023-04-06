"use strict";

const express = require("express");
const db = require("../db");
const router = new express.Router();
const { BadRequestError, NotFoundError } = require("../expressError");

/**
 * GET /comapnies return list of companies {companies: [{code, name}, ...]}
 */

router.get("/", async function (req, res) {
  const results = await db.query("SELECT code, name FROM companies");
  const companies = results.rows;

  return res.json({ companies });
});

/**
 * GET /companies/[code] return company {company: {code, name, description}}
 */

router.get("/:code", async function (req, res) {
  const companyCode = req.params.code;

  const results = await db.query(
    "SELECT code, name, description FROM companies WHERE code = $1",
    [companyCode]);
  const company = results.rows[0];

  if (!company) throw new NotFoundError(`No matching company ${companyCode}.`);

  return res.json({ company });
});

/**
 * POST /companies return company {company: {code, name, description}}
 */

router.post("/", async function(req, res){
  const { code, name, description } = req.body;

  const results = await db.query(
    `INSERT INTO companies (code, name, description)
      VALUES ($1, $2, $3)
      RETURNING code, name, description`,
     [code, name, description]
  );

  const company = results.rows[0]

  return res.status(201).json({ company });
})

module.exports = router;