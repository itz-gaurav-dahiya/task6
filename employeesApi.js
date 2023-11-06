const express = require('express');
const app = express();
const { Client } = require('pg');
const port = process.env.PORT || 2410;

const client = new Client({
  user: 'postgres', // Change to your PostgreSQL username
  password: 'gaurav@Dahiya', // Change to your PostgreSQL password
  database: 'postgres', // Change to your PostgreSQL database name
  port: 5432,
  host: 'db.amfwwfhjovvvryqpgwpw.supabase.co', // Change to your PostgreSQL database host
  ssl: { rejectUnauthorized: false },
});

client.connect()
  .then(() => {
    console.log('Connected to PostgreSQL');
  })
  .catch(err => {
    console.error('Error connecting to PostgreSQL:', err);
  });

app.use(express.json());

// CORS setup
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", '*');
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE, HEAD");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// Define your routes for interacting with the PostgreSQL database here.

// Get all employees
app.get('/svr/Employees', async (req, res) => {
  try {
    const department = req.query.department;
    const designation = req.query.designation;
    const gender = req.query.gender;

    let filters = [];
    let values = [];
    let index = 1;

    if (department) {
      filters.push(`department = $${index++}`);
      values.push(department);
    }

    if (designation) {
      filters.push(`designation = $${index++}`);
      values.push(designation);
    }

    if (gender) {
      filters.push(`gender = $${index++}`);
      values.push(gender);
    }

    let whereClause = '';
    if (filters.length > 0) {
      whereClause = `WHERE ${filters.join(' AND ')}`;
    }

    const sql = `SELECT * FROM employees ${whereClause}`;
    const result = await client.query(sql, values);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get an individual employee by ID
app.get('/svr/Employees/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const sql = 'SELECT * FROM employees WHERE id = $1';
    const result = await client.query(sql, [id]);

    if (result.rowCount === 0) {
      res.status(404).send(`Employee with ID ${id} not found`);
    } else {
      res.json(result.rows[0]);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/svr/Employees/department/:department', function (req, res) {
    const department = req.params.department;
    const designation = req.query.designation;
    const gender = req.query.gender;

    const sql = 'SELECT * FROM employees WHERE department = $1';
    const values = [department];

    client.query(sql, values, function (err, result) {
        if (err) {
            res.status(404).send(err.message);
        } else {
            if (designation) {
                result.rows = result.rows.filter((s) => s.designation === designation);
            }
            if (gender) {
                result.rows = result.rows.filter((s) => s.gender === gender);
            }
            res.send(result.rows);
        }
    });
});

app.get('/svr/Employees/designation/:designation', function (req, res) {
    const designation = req.params.designation;
    const department = req.query.department;
    const gender = req.query.gender;

    const sql = 'SELECT * FROM employees WHERE designation = $1';
    const values = [designation];

    client.query(sql, values, function (err, result) {
        if (err) {
            res.status(404).send(err.message);
        } else {
            if (department) {
                result.rows = result.rows.filter((s) => s.department === department);
            }
            if (gender) {
                result.rows = result.rows.filter((s) => s.gender === gender);
            }
            res.send(result.rows);
        }
    });
});


// Update an individual employee by ID
app.put('/svr/Employees/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const { empcode, name, department, designation, salary, gender } = req.body;

    const sql = `
      UPDATE employees
      SET empcode = $1, name = $2, department = $3, designation = $4, salary = $5, gender = $6
      WHERE id = $7
    `;

    const values = [empcode, name, department, designation, salary, gender, id];

    const result = await client.query(sql, values);

    if (result.rowCount === 0) {
      res.status(404).send(`Employee with ID ${id} not found`);
    } else {
      res.status(200).send(`Employee with ID ${id} has been updated`);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add a new employee
app.post('/svr/Employees', async (req, res) => {
  try {
    console.log(req.body)
    const { empcode='', name='', department='', designation='', salary='', gender='' } = req.body;
    const sql = 'INSERT INTO employees (empcode, name, department, designation, salary, gender) VALUES ($1, $2, $3, $4, $5, $6)';
    const values = [empcode, name, department, designation, salary, gender];
    const result = await client.query(sql, values);
    res.status(201).send('New employee added successfully');
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete an employee by ID
app.delete('/svr/Employees/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const sql = 'DELETE FROM employees WHERE id = $1';
    const result = await client.query(sql, [id]);

    if (result.rowCount === 0) {
      res.status(404).send(`Employee with ID ${id} not found`);
    } else {
      res.status(200).send(`Employee with ID ${id} has been deleted`);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start the Express.js server
app.listen(port, () => {
  console.log(`Node app listening on port ${port}!`);
});
