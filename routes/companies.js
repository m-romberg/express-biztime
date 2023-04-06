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


module.exports = router;