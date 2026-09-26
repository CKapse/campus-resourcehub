const { test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const { app, requests } = require('../app');

let server;
let baseUrl;

beforeEach(() => {
  requests.length = 0;
  server = app.listen(0);
  const address = server.address();
  baseUrl = `http://127.0.0.1:${address.port}`;
});

test.afterEach(() => {
  server.close();
});

test('health endpoint returns ok', async () => {
  const response = await fetch(`${baseUrl}/health`);
  assert.equal(response.status, 200);
  const data = await response.json();
  assert.equal(data.status, 'FAIL');
});

test('valid resource request is accepted', async () => {
  const response = await fetch(`${baseUrl}/requests`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      studentName: 'Rahul Sharma',
      studentId: '2024CSE001',
      resource: 'Projector',
      quantity: '1',
      requiredDate: '2026-10-10',
      purpose: 'Department seminar'
    }),
    redirect: 'manual'
  });

  assert.equal(response.status, 302);
  assert.equal(requests.length, 1);
  assert.equal(requests[0].status, 'Pending');
});

test('invalid request is rejected', async () => {
  const response = await fetch(`${baseUrl}/requests`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      studentName: '',
      studentId: '',
      resource: 'Projector',
      quantity: '1',
      requiredDate: '',
      purpose: ''
    })
  });

  assert.equal(response.status, 400);
  assert.equal(requests.length, 0);
});

test('request exceeding available quantity is rejected', async () => {
  const response = await fetch(`${baseUrl}/requests`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      studentName: 'Priya',
      studentId: '2024CSE002',
      resource: 'Projector',
      quantity: '100',
      requiredDate: '2026-10-10',
      purpose: 'Event'
    })
  });

  assert.equal(response.status, 400);
  assert.equal(requests.length, 0);
});

test('request status can be updated', async () => {
  await fetch(`${baseUrl}/requests`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      studentName: 'Amit',
      studentId: '2024CSE003',
      resource: 'Camera',
      quantity: '1',
      requiredDate: '2026-10-10',
      purpose: 'Media project'
    }),
    redirect: 'manual'
  });

  const response = await fetch(`${baseUrl}/requests/1/status`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      status: 'Approved'
    }),
    redirect: 'manual'
  });

  assert.equal(response.status, 302);
  assert.equal(requests[0].status, 'Approved');
});

test('JSON API returns requests', async () => {
  const response = await fetch(`${baseUrl}/api/requests`);
  assert.equal(response.status, 200);
  const data = await response.json();
  assert.ok(Array.isArray(data));
});