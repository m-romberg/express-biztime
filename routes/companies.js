"use strict";

const express = require("express");
const app = require("../app");
const db = require("../db");
const router = new express.Router();
const { BadRequestError, NotFoundError } = require("../expressError");

/**
 * GET /companies return list of companies {companies: [{code, name}, ...]}
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
  const code = req.params.code;

  const results = await db.query(
    "SELECT code, name, description FROM companies WHERE code = $1",
    [code]
  );
  const company = results.rows[0];

  if (!company) throw new NotFoundError(`No matching company ${code}.`);

  return res.json({ company });
});

/**
 * POST /companies return {company: {code, name, description}}
 */

router.post("/", async function (req, res) {
  if (req.body === undefined) {
    throw new BadRequestError();
  }

  const { code, name, description } = req.body;

  const results = await db.query(
    `INSERT INTO companies (code, name, description)
      VALUES ($1, $2, $3)
      RETURNING code, name, description`,
    [code, name, description]
  );

  const company = results.rows[0];

  return res.status(201).json({ company });
});

/**
 * PUT /companies/code return company {company: {code, name, description}}
 * or 404 if not found
 */

router.put("/:code", async function (req, res) {
  if (req.body === undefined) throw new BadRequestError();

  const code = req.params.code;
  const results = await db.query(
    `UPDATE companies
      SET name=$1, description=$2
      WHERE code = $3
      RETURNING code, name, description`,
    [req.body.name, req.body.description, code]
  );
  const company = results.rows[0];

  if (!company) throw new NotFoundError(`No matching company ${code}`);

  return res.json({ company });
});

/**
 * DELETE /companies/code returns {status: "deleted"}
 * or 404 if not found
 */

router.delete("/:code", async function (req, res) {
  const code = req.params.code;
  const results = await db.query(
    `DELETE FROM companies
      WHERE code = $1
      RETURNING code`,
    [code]
  );

  const company = results.rows[0];

  if (!company) throw new NotFoundError(`No matching company ${code}`);

  return res.json({ status: "deleted" });
});

module.exports = router;
