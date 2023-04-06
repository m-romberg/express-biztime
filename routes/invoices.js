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
