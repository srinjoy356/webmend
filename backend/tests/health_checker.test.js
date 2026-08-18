const { checkRun } = require('../src/services/health_checker');
const { COLLECTORS } = require('../src/config/collector_config');
const { triggerHeal } = require('../src/services/heal_orchestrator');

// Mock external dependencies
jest.mock('pg', () => {
  const mClient = {
    connect: jest.fn(),
    query: jest.fn(),
    end: jest.fn(),
  };
  return { Client: jest.fn(() => mClient) };
});

jest.mock('../src/services/heal_orchestrator', () => ({
  triggerHeal: jest.fn()
}));

const { Client } = require('pg');

describe('health_checker.checkRun', () => {
  let mockClient;

  beforeEach(() => {
    jest.clearAllMocks();
    mockClient = new Client();
    
    // We'll test against the first collector in the config
    const testCollectorId = COLLECTORS[0].id;
    if (!testCollectorId) throw new Error("Ensure FIXTURE_COLLECTOR_ID is set in your env, or skip this test check if undefined.");
  });

  it('should pass (status: healthy) when all expected fields are present', async () => {
    const testCollector = COLLECTORS[0];
    
    // Create a mock row that has all fields populated
    const healthyRow = {};
    testCollector.expected_schema.forEach(f => healthyRow[f] = 'value');

    mockClient.query.mockResolvedValueOnce({
      rows: [
        { data: healthyRow },
        { data: healthyRow }
      ]
    });

    const result = await checkRun('run_123', testCollector.id);
    
    expect(result.status).toBe('healthy');
    expect(triggerHeal).not.toHaveBeenCalled();
  });

  it('should fail (status: broken) when an expected field is missing in >0% of rows', async () => {
    const testCollector = COLLECTORS[0];
    
    const healthyRow = {};
    testCollector.expected_schema.forEach(f => healthyRow[f] = 'value');

    const brokenRow = { ...healthyRow };
    const fieldToBreak = testCollector.expected_schema[1]; // Break the second field
    delete brokenRow[fieldToBreak];

    mockClient.query.mockResolvedValueOnce({
      rows: [
        { data: healthyRow },
        { data: brokenRow } // One broken row means null-rate > 0
      ]
    });

    const result = await checkRun('run_124', testCollector.id);
    
    expect(result.status).toBe('broken');
    expect(result.brokenFields).toContain(fieldToBreak);
    expect(triggerHeal).toHaveBeenCalledWith(testCollector.id, [fieldToBreak]);
  });
});
