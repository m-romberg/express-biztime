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
  //do we need this check? is it appropriate? does referential integrity save us?

  if (!company) throw new NotFoundError(
    `No matching invoice with company ${company}`);

  delete invoice.comp_code;
  invoice.company = company;

  return res.json({ invoice });
});

/**
 * POST /invoices
 * accepts JSON {comp_code, amt}
 * returns JSON: {invoice: {id, comp_code, amt, paid, add_date, paid_date}}
 */
//how do we check if they send us a VALID, EXISTING comp code
router.post("/", async function (req, res) {
  if (req.body === undefined) {
    throw new BadRequestError('Needs {comp_code, amt}');
  };

  const {comp_code, amt} = req.body;

  if (!comp_code || !amt) {
    throw new BadRequestError('Needs {comp_code, amt}');
  };

  const results = await db.query(
    `INSERT INTO invoices (comp_code, amt)
      VALUES ($1, $2)
      RETURNING id, comp_code, amt, paid, add_date, paid_date`,
    [comp_code, amt]
  );

  const invoice = results.rows[0];

  if (!invoice) throw new NotFoundError(
    `Invoice for ${comp_code} was not created. Sorry bozo.`);

  return res.status(201).json({ invoice });
});

/**
 * PUT /invoices
 * accepts JSON {amt}
 * returns JSON: {invoice: {id, comp_code, amt, paid, add_date, paid_date}}
 */

router.put("/:id", async function(req, res) {
  if (req.body === undefined) {
    throw new BadRequestError('Needs {amt}');
  };

  const id = req.params.id;
  const amt = req.body.amt;

  const results = await db.query(
    `UPDATE invoices
      SET amt = $1
      WHERE id = $2
      RETURNING id, comp_code, amt, paid, add_date, paid_date`,
      [amt, id]
  );

  const invoice = results.rows[0];

  if (!invoice) throw new NotFoundError(
    `No matching invoice with id ${id}`);

  return res.json({ invoice });

});
