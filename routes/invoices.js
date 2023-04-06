"use strict";

const express = require("express");
const app = require("../app");
const db = require("../db");
const router = new express.Router();
const { BadRequestError, NotFoundError } = require("../expressError");


module.exports = router;

//id, amt, paid, add_date, paid_date

/**
 * GET /invoices return list of invoices {invoices: [{id, comp_code}, ...]}
 */
router.get("/", async function (req, res) {
  const results = await db.query(`
  SELECT id, comp_code
    FROM invoices`);

  const invoices = results.rows;

  return res.json({ invoices });
});

/**
 * GET /invoices/[id]
 * returns: {invoice: {id, amt, paid, add_date, paid_date,
 *            company: {code, name, description} }}
 */

router.get("/:id", async function (req, res) {
  const id = req.params.id;

  const resultsI = await db.query(
    `SELECT id, amt, paid, add_date, paid_date, comp_code
      FROM invoices
      WHERE id = $1`,
    [id]
  );
  const invoice = resultsI.rows[0];
  if (!invoice) throw new NotFoundError(`No matching invoice ${id}.`);

  const compCode = invoice.comp_code;
  const resultsC = await db.query(
    `SELECT code, name, description
      FROM companies
      WHERE code = $1`,
    [compCode]
  );

  const company = resultsC.rows[0];
  if (!company) throw new NotFoundError(
    `No matching invoice with company ${company}`);

  delete invoice.comp_code;
  invoice.company = company;

  return res.json({ invoice });
});