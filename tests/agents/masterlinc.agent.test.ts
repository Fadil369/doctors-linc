/**
 * MASTERLINC Agent Tests
 */

import { MasterLincAgent, PipelineTask } from '../../src/agents/masterlinc.agent';

describe('MasterLincAgent', () => {
  let agent: MasterLincAgent;

  beforeAll(() => {
    agent = MasterLincAgent.getInstance();
  });

  describe('getInstance', () => {
    it('should return a singleton instance', () => {
      const instance1 = MasterLincAgent.getInstance();
      const instance2 = MasterLincAgent.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('healthCheck', () => {
    it('should return health status', async () => {
      const health = await agent.healthCheck();
      expect(health).toHaveProperty('status');
      expect(health).toHaveProperty('agents');
      expect(health.status).toBe('healthy');
    });

    it('should list all agents', async () => {
      const health = await agent.healthCheck();
      expect(health.agents).toHaveProperty('MASTERLINC');
      expect(health.agents).toHaveProperty('OCRLINC');
      expect(health.agents).toHaveProperty('HEALTHCARELINC');
      expect(health.agents).toHaveProperty('TTLINC');
      expect(health.agents).toHaveProperty('COMPLIANCELINC');
    });
  });

  describe('executePipeline', () => {
    it('should execute empty pipeline', async () => {
      const tasks: PipelineTask[] = [];
      const results = await agent.executePipeline(tasks);
      expect(results).toHaveLength(0);
    });

    it('should execute single task', async () => {
      const tasks: PipelineTask[] = [
        {
          taskId: 'test-1',
          type: 'ocr',
          input: { imagePath: './test.jpg' },
        },
      ];
      const results = await agent.executePipeline(tasks);
      expect(results).toHaveLength(1);
      expect(results[0]).toHaveProperty('taskId', 'test-1');
      expect(results[0]).toHaveProperty('success');
      expect(results[0]).toHaveProperty('processingTime');
    });

    it('should execute multiple tasks', async () => {
      const tasks: PipelineTask[] = [
        { taskId: 'task-1', type: 'ocr', input: {} },
        { taskId: 'task-2', type: 'structuring', input: {} },
        { taskId: 'task-3', type: 'translation', input: {} },
      ];
      const results = await agent.executePipeline(tasks);
      expect(results).toHaveLength(3);
      results.forEach((result, index) => {
        expect(result.taskId).toBe(`task-${index + 1}`);
      });
    });

    it('should handle task failures gracefully', async () => {
      const tasks: PipelineTask[] = [
        { taskId: 'invalid', type: 'ocr' as never, input: null },
      ];
      const results = await agent.executePipeline(tasks);
      expect(results).toHaveLength(1);
      // Should complete even with failures
    });

    it('should record processing time for each task', async () => {
      const tasks: PipelineTask[] = [
        { taskId: 'timed-task', type: 'ocr', input: {} },
      ];
      const results = await agent.executePipeline(tasks);
      expect(results[0].processingTime).toBeGreaterThan(0);
    });
  });
});
