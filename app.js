const express = require('express');
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static('public'));

const resources = [
  { id: 1, name: 'Projector', available: 5 },
  { id: 2, name: 'Laptop', available: 10 },
  { id: 3, name: 'Camera', available: 3 },
  { id: 4, name: 'Microphone', available: 8 },
  { id: 5, name: 'Speaker', available: 4 },
  { id: 6, name: 'Tripod', available: 5 }
];

const requests = [];

const statuses = [
  'Pending',
  'Approved',
  'Rejected',
  'Issued',
  'Returned'
];

const commit = (
  process.env.RENDER_GIT_COMMIT ||
  process.env.GIT_SHA ||
  'local'
).slice(0, 7);

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => {
    const entities = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    };
    return entities[character];
  });
}

function renderPage() {
  const total = requests.length;
  const pending = requests.filter((request) => request.status === 'Pending').length;
  const approved = requests.filter((request) => request.status === 'Approved').length;
  const issued = requests.filter((request) => request.status === 'Issued').length;

  const requestRows = requests.length
    ? requests
        .map(
          (request) => `
            <tr>
              <td>${request.id}</td>
              <td>${escapeHtml(request.studentName)}</td>
              <td>${escapeHtml(request.studentId)}</td>
              <td>${escapeHtml(request.resource)}</td>
              <td>${request.quantity}</td>
              <td>${escapeHtml(request.requiredDate)}</td>
              <td>
                <span class="status status-${request.status.toLowerCase()}">
                  ${request.status}
                </span>
              </td>
              <td>
                <form method="POST" action="/requests/${request.id}/status" class="status-form">
                  <select name="status">
                    ${statuses
                      .map(
                        (status) => `
                          <option value="${status}" ${status === request.status ? 'selected' : ''}>
                            ${status}
                          </option>
                        `
                      )
                      .join('')}
                  </select>
                  <button type="submit">Update</button>
                </form>
              </td>
            </tr>
          `
        )
        .join('')
    : `
        <tr>
          <td colspan="8" class="empty">No resource requests yet.</td>
        </tr>
      `;

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Campus ResourceHub</title>
      <link rel="stylesheet" href="/style.css">
    </head>
    <body>
      <header class="hero">
        <div class="container">
          <h1>Campus ResourceHub</h1>
          <p>Student Resource Request & Allocation System</p>
        </div>
      </header>

      <main class="container">
        <section class="stats">
          <div class="stat-card">
            <span>Total Requests</span>
            <strong>${total}</strong>
          </div>
          <div class="stat-card">
            <span>Pending</span>
            <strong>${pending}</strong>
          </div>
          <div class="stat-card">
            <span>Approved</span>
            <strong>${approved}</strong>
          </div>
          <div class="stat-card">
            <span>Issued</span>
            <strong>${issued}</strong>
          </div>
        </section>

        <section class="card">
          <h2>Available Resources</h2>
          <div class="resource-grid">
            ${resources
              .map(
                (resource) => `
                  <div class="resource-card">
                    <h3>${resource.name}</h3>
                    <p>${resource.available} available</p>
                  </div>
                `
              )
              .join('')}
          </div>
        </section>

        <section class="card">
          <h2>Request a Resource</h2>
          <form method="POST" action="/requests" class="request-form">
            <label>
              Student Name
              <input type="text" name="studentName" placeholder="Enter your name" required>
            </label>
            <label>
              Student ID
              <input type="text" name="studentId" placeholder="e.g. 2024CSE001" required>
            </label>
            <label>
              Resource
              <select name="resource" required>
                <option value="">Select resource</option>
                ${resources
                  .map(
                    (resource) => `
                      <option value="${resource.name}">${resource.name}</option>
                    `
                  )
                  .join('')}
              </select>
            </label>
            <label>
              Quantity
              <input type="number" name="quantity" min="1" max="10" required>
            </label>
            <label>
              Required Date
              <input type="date" name="requiredDate" required>
            </label>
            <label class="full-width">
              Purpose
              <textarea name="purpose" rows="4" placeholder="Explain why you need this resource" required></textarea>
            </label>
            <button type="submit" class="primary-button">Submit Request</button>
          </form>
        </section>

        <section class="card">
          <div class="section-heading">
            <div>
              <h2>Resource Requests</h2>
              <p>Manage submitted requests and their current status.</p>
            </div>
            <a href="/api/requests" class="api-link">View JSON API</a>
          </div>
          <div class="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Student</th>
                  <th>Student ID</th>
                  <th>Resource</th>
                  <th>Qty</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                ${requestRows}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      <footer>
        Campus ResourceHub · Running commit: <strong>${commit}</strong>
      </footer>
    </body>
    </html>
  `;
}

app.get('/', (req, res) => {
  res.send(renderPage());
});

app.post('/requests', (req, res) => {
  const { studentName, studentId, resource, quantity, requiredDate, purpose } = req.body;
  const cleanStudentName = String(studentName || '').trim();
  const cleanStudentId = String(studentId || '').trim();
  const cleanResource = String(resource || '').trim();
  const cleanPurpose = String(purpose || '').trim();
  const parsedQuantity = Number(quantity);

  if (!cleanStudentName || !cleanStudentId || !cleanResource || !cleanPurpose || !requiredDate) {
    return res.status(400).send('All fields are required.');
  }

  if (!Number.isInteger(parsedQuantity) || parsedQuantity < 1) {
    return res.status(400).send('Quantity must be a positive integer.');
  }

  const selectedResource = resources.find((item) => item.name === cleanResource);
  if (!selectedResource) {
    return res.status(400).send('Invalid resource selected.');
  }

  if (parsedQuantity > selectedResource.available) {
    return res.status(400).send('Requested quantity exceeds available quantity.');
  }

  const request = {
    id: requests.length + 1,
    studentName: cleanStudentName,
    studentId: cleanStudentId,
    resource: cleanResource,
    quantity: parsedQuantity,
    requiredDate,
    purpose: cleanPurpose,
    status: 'Pending'
  };

  requests.push(request);
  res.redirect('/');
});

app.post('/requests/:id/status', (req, res) => {
  const id = Number(req.params.id);
  const request = requests.find((item) => item.id === id);

  if (!request) {
    return res.status(404).send('Request not found.');
  }

  if (!statuses.includes(req.body.status)) {
    return res.status(400).send('Invalid status.');
  }

  request.status = req.body.status;
  res.redirect('/');
});

app.get('/api/requests', (req, res) => {
  res.json(requests);
});

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    commit
  });
});

module.exports = {
  app,
  requests,
  resources
};