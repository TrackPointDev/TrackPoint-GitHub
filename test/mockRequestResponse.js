function mockRequest(body = {}, params = {}, query = {}) {
  return {
    body,
    params,
    query,
    headers: {},
    get: jest.fn().mockReturnValue(''),
  };
}

function mockResponse() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
}

module.exports = { mockRequest, mockResponse };
